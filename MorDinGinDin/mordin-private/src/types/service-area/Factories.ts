import { User } from '../User';

import {
  ServiceAreaInputInterface,
  ServiceAreaInterface,
} from './ServiceAreas';

export interface FactoryInterface {
  factoryId: number;
  name: string;
  initial: string;
  note?: string;
  updateUid: number;
  updatedAt: number;
}

export interface FactoryInfoInterface extends FactoryInterface {
  serviceAreas: ServiceAreaInterface[];
  serviceAreaCount: number;
  updateUser: User;
}

export interface FactoryCreateInterface {
  name: string;
  initial: string;
  note?: string;
  serviceAreas: ServiceAreaInputInterface[];
}

export interface FactoryUpdateInterface {
  name: string;
  initial: string;
  note?: string;
  serviceAreas: ServiceAreaInputInterface[];
  newServiceAreas?: ServiceAreaInputInterface[];
}

export interface FactorySummary {
  totalFactories: number;
  totalServiceAres: number;
}
