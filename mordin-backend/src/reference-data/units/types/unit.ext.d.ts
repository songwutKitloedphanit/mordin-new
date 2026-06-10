import { Unit } from "../entities/unit.entity";

declare module "../entities/unit.entity" {
  interface Unit {
    removedBy?: number;
  }
}
