import { FertilizerMinor } from "../entities/fertilizer-minor.entity"; 

declare module '../entities/fertilizer-minor.entity.ts' {
    interface FertilizerMinor {
        removedBy?: number;
    }
}