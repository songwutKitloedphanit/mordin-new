import { FertilizerMajorLandScore } from "../entities/fertilizer-major-land-score.entity";

declare module "../entities/fertilizer-major-land-score.entity" {
  interface FertilizerMajorLandScore {
    removedBy?: number;
  }
}
