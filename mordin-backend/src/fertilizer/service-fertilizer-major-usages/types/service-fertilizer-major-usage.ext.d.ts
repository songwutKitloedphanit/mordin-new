import { ServiceFertilizerMajorUsage } from "../entities/service-fertilizer-major-usage.entity";

declare module '../entities/service-fertilizer-major-usage.entity.ts' {
    interface ServiceFertilizerMajorUsage {
        removedBy?: number;
    }
}