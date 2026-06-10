export interface ConvertOmSetting {
  convertOmSettingId: number;
  slope: number;
  intercept: number;
  laboratorySettingId: number;
}

export interface ConvertOmSettingInput {
  slope: number;
  intercept: number;
}
