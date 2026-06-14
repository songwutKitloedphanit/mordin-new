import { Result } from "../entities/result.entity";

declare module "../entities/result.entity" {
  interface Result {
    removedBy?: number;
  }
}
