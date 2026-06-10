import { Land } from "../entities/land.entity";

declare module "../entities/land.entity" {
  interface Land {
    removedBy?: number;
  }
}
