/** New implementation of the reference exercise's data contract. */
export interface MachineState {
  temperature: number;
  rpm: number;
  status: 'RUNNING' | 'STOPPED' | 'ERROR';
}
