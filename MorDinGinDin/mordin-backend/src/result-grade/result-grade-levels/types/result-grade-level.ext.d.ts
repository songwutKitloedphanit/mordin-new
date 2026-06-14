import { ResultGradeLevel } from "../entities/result-grade-level.entity";

declare module "../entities/result-grade-level.entity" {
  interface ResultGradeLevel {
    removedBy?: number;
  }
}
