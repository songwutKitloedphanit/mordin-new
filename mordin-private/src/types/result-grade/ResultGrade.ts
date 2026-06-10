import { Laboratory } from '../Laboratory';
import { ServiceType } from '../service-type/ServiceTypes';

import { ResultGradeLevel, ResultGradeLevelInput } from './ResultGradeLevel';

export interface ResultGradeInterface {
  resultGradeId: number;
  serviceTypeId: number;
  laboratoryId: number;
  updatedUid: number;
  updatedAt: Date;
}

export interface ResultGradeInfo extends ResultGradeInterface {
  serviceType: ServiceType;
  laboratory: Laboratory;
  resultGradeLevels: ResultGradeLevel[];
}

export interface ResultGradeUpdate {
  resultGradeLevels: ResultGradeLevelInput[];
}
