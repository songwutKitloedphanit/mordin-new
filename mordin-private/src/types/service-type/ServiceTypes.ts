import { ServiceFertilizerMinorInfo } from '../fertilizer/ServiceFertilizerMinor';
import { ResultGradeInfo } from '../result-grade/ResultGrade';
import { SoilGradeInfo } from '../soil-grade/SoilGrades';
import { User } from '../User';

import {
  ServiceCategory,
  ServiceCategoryInfo,
  ServiceCategoryInput,
} from './ServiceCategories';
import {
  ServiceLaboratoryInfo,
  ServiceLaboratoryInput,
} from './ServiceLaboratories';

export enum ServiceTypeColor {
  Success = 'success',
  Primary = 'primary',
  Secondary = 'secondary',
  Info = 'info',
  Warning = 'warning',
  Danger = 'danger',
}

export interface ServiceType {
  serviceTypeId: number;
  name: string;
  price: number;
  unitDetail: string;
  isDisplay: boolean;
  color: ServiceTypeColor;
  updateUid: number;
  updatedAt: number;
}

export interface ServiceTypeInfo extends ServiceType {
  updateUser: User;
  serviceCategories: ServiceCategory[];
  serviceLaboratories: ServiceLaboratoryInfo[];
}

//Use In fertilizer-usage page
export interface ServiceTypeWithAllInfo extends ServiceType {
  updateUser: User;
  serviceCategories: ServiceCategoryInfo[];
  serviceLaboratories: ServiceLaboratoryInfo[];
  serviceFertilizerMinors: ServiceFertilizerMinorInfo[];
  soilGrades: SoilGradeInfo[];
  resultGrades: ResultGradeInfo[];
}

export interface ServiceTypeInput {
  name: string;
  price: number;
  unitDetail: string;
  isDisplay: boolean;
  color: ServiceTypeColor;
  serviceCategories: ServiceCategoryInput[];
  serviceLaboratories: ServiceLaboratoryInput[];
}
export interface ServiceTypeSummary {
  totalServiceTypes: number;
  totalServiceLaboratories: number;
}
