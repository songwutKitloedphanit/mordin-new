import { SampleBlank } from "../entities/sample-blank.entity";

declare module "../entities/sample-blank.entity" {
  interface SampleBlank {
    removedBy?: number;
  }
}
