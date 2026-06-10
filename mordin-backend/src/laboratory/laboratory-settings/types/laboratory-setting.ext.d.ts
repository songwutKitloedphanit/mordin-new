import { LaboratorySetting } from "../entities/laboratory-setting.entity";

declare module "../entities/laboratory-setting.entity" {
  interface LaboratorySetting {
    removedBy?: number;
  }
}
