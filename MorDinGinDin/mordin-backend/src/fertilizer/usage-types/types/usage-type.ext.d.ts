import { UsageType } from "../entities/usage-type.entity";

declare module "../entities/usage-type.entity" {
  interface UsageType {
    removedBy?: number;
  }
}
