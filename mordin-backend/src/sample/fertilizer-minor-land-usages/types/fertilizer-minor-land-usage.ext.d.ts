import { FertilizerMinorLandUsage } from "../entities/fertilizer-minor-land-usage.entity";

declare module "../entities/fertilizer-minor-land-usage.entity" {
  interface FertilizerMinorLandUsage {
    removedBy?: number;
  }
}
