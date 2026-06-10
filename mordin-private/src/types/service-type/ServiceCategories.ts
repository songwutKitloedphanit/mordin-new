import { ServiceFertilizerMajorUsageInfo } from '../fertilizer/ServiceFertilizerMajor';

import { ServiceType } from './ServiceTypes';

export interface ServiceCategory {
  serviceCategoryId: number;
  name: string;
  serviceTypeId: number;
  isDisplay: boolean;
}

export interface ServiceCategoryInfo extends ServiceCategory {
  serviceType: ServiceType;
  serviceFertilizerMajorUsages: ServiceFertilizerMajorUsageInfo[];
}

export interface ServiceCategoryInput {
  serviceCategoryId?: number;
  name: string;
  serviceTypeId?: number;
  isDisplay: boolean;
}
