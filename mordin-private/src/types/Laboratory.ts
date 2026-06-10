import { User } from './User';

export interface Laboratory {
  laboratoryId: number;
  laboratoryCode: string;
  name: string;
  shortNameBefore: string;
  unitBefore: string;
  shortNameAfter: string;
  unitAfter: string;
  machineTypeId: number;
  machineType: MachineType;
  rangeMin: number;
  rangeMax: number;
  isMain: boolean;
  updatedAt: number;
  updateUid: number;
}

export interface LaboratoryInput {
  laboratoryCode: string;
  name: string;
  shortNameBefore: string;
  unitBefore: string;
  shortNameAfter: string;
  unitAfter: string;
  rangeMin: number;
  rangeMax: number;
  machineTypeId: number;
}

export interface LaboratoryInfoInterface extends Laboratory {
  updateUser: User;
  machineType: MachineType;
}

export interface MachineType {
  machineTypeId: number;
  name: string;
  type: MachineTypeTypes;
  updateUid: number;
  updatedAt: Date;
}

export enum MachineTypeTypes {
  RAW_VALUE = 'ค่าดิบ',
  REVERSE_LINEAR = 'สมการผกผันรูปแบบที่ 1 (สูตร OM)', //เก็บทุก field ใน lab setting
  P_COMPLEX = 'สมการผกผันรูปแบบที่ 2 (สูตร P)', //เก็บ dirtWeight, extractAmount, intercept, slope ใน lab setting
  EXTRACT_RATIO = 'สมการผกผันรูปแบบที่ 3 (สูตรทั่วไป)', // เก็บแค่ dirtWeight, extractAmount ใน lab setting
}
