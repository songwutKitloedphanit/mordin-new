import { LaboratorySettingDetail } from "../entities/laboratory-setting-detail.entity";

declare module "../entities/laboratory-setting-detail.entity" {
  interface LaboratorySettingDetail {
    removedBy?: number;
  }
}
