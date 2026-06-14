import { ServiceFertilizerMinorUsage } from "../entities/service-fertilizer-minor-usage.entity";

declare module '../entities/service-fertilizer-minor-usage.entity.ts' {
    interface ServiceFertilizerMinorUsage {
        removedBy?: number
    }
}