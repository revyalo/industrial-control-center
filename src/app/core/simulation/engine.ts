import {
  ALERT_LIMIT,
  DEFAULT_CONFIG,
  FleetState,
  HISTORY_LIMIT,
  IndustrialMachine,
  MachineAlert,
  MachineCommand,
  MAX_RPM,
  Reading,
  SimulationConfig,
  TICK_MS,
} from '../../models/industrial';

/** No framework, timers or browser APIs: identical seeds + commands yield identical readings. */
export class SimulationEngine {
  private seed: number;
  private alertSequence = 0;
  constructor(seed = 42) {
    this.seed = seed >>> 0;
  }
  private random(): number {
    this.seed = (Math.imul(1664525, this.seed) + 1013904223) >>> 0;
    return this.seed / 4294967296;
  }
  createFleet(now: number, config = DEFAULT_CONFIG): FleetState {
    const definitions = [
      ['M-01', 'VectorDrive', 'Induction motor', 'Assembly line A'],
      ['M-02', 'FlowSync', 'Coolant pump', 'Cooling circuit B'],
      ['M-03', 'HydraPress', 'Hydraulic press', 'Forming station C'],
      ['M-04', 'LineMotion', 'Belt conveyor', 'Packaging line D'],
    ];
    const start = now - 180000;
    let state: FleetState = {
      timestamp: start,
      alerts: [],
      machines: definitions.map((d, index) => ({
        id: d[0]!,
        name: d[1]!,
        type: d[2]!,
        location: d[3]!,
        status: index < 3 ? 'RUNNING' : 'STOPPED',
        temperature: config.ambientTemperature,
        rpm: 0,
        targetRpm: [1800, 1250, 900, 1400][index]!,
        power: 0,
        timestamp: start,
        runtimeSeconds: 0,
        fault: 'none',
        recovering: false,
        history: [],
      })),
    };
    // Explicitly seeded demo warm-up, not claimed physical sensor history.
    for (let i = 1; i <= 90; i++) state = this.step(state, start + i * TICK_MS, config);
    return state;
  }
  step(state: FleetState, timestamp: number, config: SimulationConfig): FleetState {
    const alerts: MachineAlert[] = [];
    const elapsed = Math.max(0, Math.min(10, (timestamp - state.timestamp) / 1000));
    const machines = state.machines.map((machine) => {
      let m = machine;
      if (m.status === 'STOPPED' && !m.recovering) return m;
      let temperature = m.temperature;
      let rpm = m.rpm;
      let status = m.status;
      if (m.status === 'ERROR' || m.recovering) {
        rpm = 0;
        temperature = Math.max(config.ambientTemperature, temperature - elapsed * 2.5);
        if (m.recovering && temperature < config.warningTemperature - 8) {
          status = 'STOPPED';
          m = { ...m, recovering: false, fault: 'none' };
          alerts.push(
            this.alert(
              m,
              timestamp,
              'info',
              'Recovery complete',
              'Temperature is safe. The machine can be started manually.',
            ),
          );
        }
      } else {
        const noise = (this.random() - 0.5) * 30 * config.fluctuation;
        const delta = Math.max(
          -config.rampRate * elapsed,
          Math.min(config.rampRate * elapsed, m.targetRpm - rpm),
        );
        rpm = Math.round(Math.max(0, Math.min(MAX_RPM, rpm + delta + noise)));
        const equilibrium = config.ambientTemperature + 20 + (rpm / MAX_RPM) * 32;
        temperature +=
          (equilibrium - temperature) * 0.06 + (this.random() - 0.5) * config.fluctuation;
        if (m.fault === 'overheat') temperature += 4;
        if (m.fault === 'mechanical' || temperature >= config.shutdownTemperature) {
          status = 'ERROR';
          rpm = 0;
        } else status = temperature > config.warningTemperature ? 'WARNING' : 'RUNNING';
      }
      temperature = Math.round(temperature * 10) / 10;
      if (status !== machine.status && (status === 'WARNING' || status === 'ERROR')) {
        alerts.push(
          this.alert(
            m,
            timestamp,
            status === 'ERROR' ? 'error' : 'warning',
            status === 'ERROR' ? 'Safety shutdown' : 'High temperature',
            status === 'ERROR'
              ? 'The motor has stopped. Reset to begin controlled recovery.'
              : `Temperature exceeded ${config.warningTemperature} °C. Inspect the machine or reset the simulation.`,
          ),
        );
      }
      const power = rpm === 0 ? 0 : Math.round((0.3 + (rpm / MAX_RPM) ** 2 * 7.2) * 100) / 100;
      const reading: Reading = { temperature, rpm, power, timestamp, status };
      return {
        ...m,
        ...reading,
        runtimeSeconds: m.runtimeSeconds + (rpm > 0 ? elapsed : 0),
        history: [...m.history, reading].slice(-HISTORY_LIMIT),
      };
    });
    return { machines, timestamp, alerts: [...alerts, ...state.alerts].slice(0, ALERT_LIMIT) };
  }
  command(
    state: FleetState,
    id: string,
    command: MachineCommand,
    config: SimulationConfig,
  ): FleetState {
    const machine = state.machines.find((m) => m.id === id);
    if (!machine) return state;
    let patch: Partial<IndustrialMachine>;
    let title: string;
    switch (command.type) {
      case 'start':
        if (
          machine.status !== 'STOPPED' ||
          machine.recovering ||
          machine.temperature >= config.warningTemperature
        )
          return state;
        patch = { status: 'RUNNING' };
        title = 'Machine started';
        break;
      case 'stop':
        if (machine.status !== 'RUNNING' && machine.status !== 'WARNING') return state;
        patch = {
          status: 'STOPPED',
          rpm: 0,
          power: 0,
          fault: 'none',
          recovering: machine.temperature >= config.warningTemperature - 8,
        };
        title = 'Machine stopped';
        break;
      case 'reset':
        patch = {
          status: 'STOPPED',
          rpm: 0,
          power: 0,
          fault: 'none',
          recovering: machine.temperature >= config.warningTemperature - 8,
        };
        title = 'Reset requested';
        break;
      case 'target':
        if (!Number.isFinite(command.rpm) || command.rpm < 300 || command.rpm > MAX_RPM)
          return state;
        return {
          ...state,
          machines: state.machines.map((m) =>
            m.id === id ? { ...m, targetRpm: Math.round(command.rpm) } : m,
          ),
        };
      case 'fault':
        if (machine.status !== 'RUNNING' && machine.status !== 'WARNING') return state;
        patch =
          command.fault === 'mechanical'
            ? { fault: 'mechanical', status: 'ERROR', rpm: 0, power: 0 }
            : {
                fault: 'overheat',
                status: 'WARNING',
                temperature: Math.max(machine.temperature, config.warningTemperature + 2),
              };
        title =
          command.fault === 'overheat' ? 'Overheating simulated' : 'Mechanical fault simulated';
        break;
    }
    const updated = { ...machine, ...patch };
    const reading: Reading = {
      timestamp: state.timestamp,
      temperature: updated.temperature,
      rpm: updated.rpm,
      power: updated.power,
      status: updated.status,
    };
    const result = { ...updated, history: [...updated.history, reading].slice(-HISTORY_LIMIT) };
    const severity =
      command.type === 'fault' ? (command.fault === 'mechanical' ? 'error' : 'warning') : 'info';
    return {
      ...state,
      machines: state.machines.map((m) => (m.id === id ? result : m)),
      alerts: [
        this.alert(
          result,
          state.timestamp,
          severity,
          title,
          command.type === 'reset' && result.recovering
            ? 'Cooling in progress. Start is locked until a safe temperature is reached.'
            : 'Operator action in the browser simulation.',
        ),
        ...state.alerts,
      ].slice(0, ALERT_LIMIT),
    };
  }
  private alert(
    m: IndustrialMachine,
    timestamp: number,
    severity: MachineAlert['severity'],
    title: string,
    message: string,
  ): MachineAlert {
    return {
      id: `event-${++this.alertSequence}`,
      machineId: m.id,
      machineName: m.name,
      timestamp,
      severity,
      title,
      message,
      acknowledged: false,
    };
  }
}
export function validateConfig(config: SimulationConfig): string | null {
  if (!Object.values(config).every(Number.isFinite))
    return 'All parameters must be finite numbers.';
  if (config.ambientTemperature < 10 || config.ambientTemperature > 40)
    return 'Ambient temperature must be between 10 and 40 °C.';
  if (config.warningTemperature < 60 || config.warningTemperature > 90)
    return 'Warning threshold must be between 60 and 90 °C.';
  if (
    config.shutdownTemperature < config.warningTemperature + 10 ||
    config.shutdownTemperature > 120
  )
    return 'Shutdown must be at least 10 °C above warning and at most 120 °C.';
  if (config.rampRate < 100 || config.rampRate > 600)
    return 'Ramp rate must be between 100 and 600 RPM/s.';
  if (config.fluctuation < 0 || config.fluctuation > 3)
    return 'Fluctuation must be between 0 and 3.';
  return null;
}
