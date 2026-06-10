import { Laboratory } from '../Laboratory';

export interface ServiceLaboratory {
  serviceTypeId: number;
  laboratoryId: number;
  isDisplay: boolean;
}

export interface ServiceLaboratoryInfo extends ServiceLaboratory {
  laboratories: Laboratory;
}

export interface ServiceLaboratoryInput {
  laboratoryId: number;
  isDisplay: boolean;
}
