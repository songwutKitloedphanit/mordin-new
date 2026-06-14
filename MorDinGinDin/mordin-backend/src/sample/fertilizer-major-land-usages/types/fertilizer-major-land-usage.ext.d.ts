import { FertilizerMajorLandUsage } from "../entities/fertilizer-major-land-usage.entity";

declare module "../entities/fertilizer-major-land-usage.entity" {
  interface FertilizerMajorLandUsage {
    removedBy?: number;
  }
}
