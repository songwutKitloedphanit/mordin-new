import { Laboratory } from '../Laboratory';
import { ServiceType } from '../service-type/ServiceTypes';
import { User } from '../User';

import {
  SoilGradeLevelInput,
  SoilGradeLevelInterface,
  SoilGradeLevelUpdateInput,
} from './SoilGradeLevels';

export interface SoilGradeInterface {
  soilGradeId: number;
  serviceTypeId: number;
  laboratoryId: number;
  parameter: string;
  updateUid: number;
  updatedAt: number;
}

export interface SoilGradeInfo extends SoilGradeInterface {
  soilGradeLevels: SoilGradeLevelInterface[];
  laboratory: Laboratory;
  updateUser: User;
  serviceType?: ServiceType;
}

export interface SoilGradeInput {
  serviceTypeId: number | null;
  laboratoryId: number | null;
  parameter: string;
  soilGradeLevels: SoilGradeLevelInput[];
}

export interface SoilGradeUpdateInput {
  soilGradeId: number;
  serviceTypeId: number | null;
  laboratoryId: number | null;
  parameter: string;
  soilGradeLevels: SoilGradeLevelUpdateInput[];
}

export interface ResultGradeInfo {
  resultGradeId: number;
  level: number;
  color: string;
  cutoffValue: number;
  cutoffText: string;
}
