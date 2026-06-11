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
}
