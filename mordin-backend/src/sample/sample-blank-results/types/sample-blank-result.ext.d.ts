import { SampleBlankResult } from "../entities/sample-blank-result.entity";

declare module "../entities/sample-blank-result.entity" {
  interface SampleBlankResult {
    removedBy?: number;
  }
}
