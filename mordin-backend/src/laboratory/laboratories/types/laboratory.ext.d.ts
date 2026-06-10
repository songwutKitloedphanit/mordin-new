import { Laboratory } from "../entities/laboratory.entity";

declare module "../entities/laboratory.entity" {
  interface Laboratory {
    removedBy?: number;
  }
}
