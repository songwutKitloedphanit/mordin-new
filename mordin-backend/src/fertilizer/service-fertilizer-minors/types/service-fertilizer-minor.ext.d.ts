import { ServiceFertilizerMinor } from "../entities/service-fertilizer-minor.entity";

declare module "../entities/service-fertilizer-minor.entity" {
  interface ServiceFertilizerMinor {
    removedBy?: number;
  }
}
