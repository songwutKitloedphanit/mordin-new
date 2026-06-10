import { User } from '../User';

import { FactoryInterface } from './Factories';

export interface ServiceAreaInterface {
  serviceAreaId: number;
  factoryId: number;
  name: string;
  code: string;
  noted?: string;
  note?: string;
  updateUid?: number;
  updatedAt?: number;
  isActive?: boolean;
  isUsed?: boolean;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  supersededByServiceAreaId?: number | null;
}

export interface ServiceAreaInfo extends ServiceAreaInterface {
  factory: FactoryInterface;
  updateUser: User;
}

export interface ServiceAreaInputInterface {
  serviceAreaId?: number;
  code: string;
  name: string;
  note?: string;
  clientKey?: string;
  isActive?: boolean;
  isUsed?: boolean;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  supersededByServiceAreaId?: number | null;
}

export interface SupersedeServiceAreaInput {
  targetFactoryId: number;
  effectiveFrom: string;
  code?: string;
  name?: string;
  note?: string;
}
