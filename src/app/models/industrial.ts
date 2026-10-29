export type MachineStatus = 'STOPPED' | 'RUNNING' | 'WARNING' | 'ERROR';
export type Fault = 'none' | 'overheat' | 'mechanical';
export interface Reading {
  readonly timestamp: number;
  readonly temperature: number;
  readonly rpm: number;
  readonly power: number;
  readonly status: MachineStatus;
}
export interface IndustrialMachine extends Reading {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly location: string;
  readonly targetRpm: number;
  readonly runtimeSeconds: number;
  readonly fault: Fault;
  readonly recovering: boolean;
  readonly history: readonly Reading[];
}
export interface MachineAlert {
  readonly id: string;
  readonly machineId: string;
  readonly machineName: string;
  readonly timestamp: number;
  readonly severity: 'warning' | 'error' | 'info';
  readonly title: string;
  readonly message: string;
  readonly acknowledged: boolean;
}
export interface FleetState {
  readonly machines: readonly IndustrialMachine[];
  readonly alerts: readonly MachineAlert[];
  readonly timestamp: number;
}
export interface SimulationConfig {
  readonly ambientTemperature: number;
  readonly warningTemperature: number;
  readonly shutdownTemperature: number;
  readonly rampRate: number;
  readonly fluctuation: number;
}
export const DEFAULT_CONFIG: SimulationConfig = {
  ambientTemperature: 24,
  warningTemperature: 80,
  shutdownTemperature: 100,
  rampRate: 260,
  fluctuation: 1,
};
export const HISTORY_LIMIT = 300;
export const ALERT_LIMIT = 100;
export const TICK_MS = 2000;
export const MAX_RPM = 3000;
export type MachineCommand =
  | { type: 'start' | 'stop' | 'reset' }
  | { type: 'target'; rpm: number }
  | { type: 'fault'; fault: Exclude<Fault, 'none'> };
