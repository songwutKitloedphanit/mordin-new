import { FertilizerMajor } from "../entities/fertilizer-major.entity";

declare module '../entities/fertilizer-major.entity.ts' {
    interface FertilizerMajor {
        removedBy?: number;
    }
}