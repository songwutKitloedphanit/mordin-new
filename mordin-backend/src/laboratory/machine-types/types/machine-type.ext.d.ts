import { MachineType } from "../entities/machine-type.entity";

declare module "../entities/machine-type.entity" {
  interface MachineType {
    removedBy?: number;
  }
}
