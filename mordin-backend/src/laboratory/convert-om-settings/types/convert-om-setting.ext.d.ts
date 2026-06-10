import { ConvertOmSetting } from "../entities/convert-om-setting.entity";

declare module '../entities/convert-om-setting.entity.ts' {
    interface ConvertOmSetting {
        removeBy?: number;
    }
}