import { ResultGrade } from "../entities/result-grade.entity";

declare module "../entities/result-grade.entity" {
  interface ResultGrade {
    removedBy?: number;
  }
}
