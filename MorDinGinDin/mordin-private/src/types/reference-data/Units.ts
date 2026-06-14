import { User } from '../User';

export interface Unit {
  unitId: number;
  name: string;
  initial: string;
  updateUid: number | null;
  updatedAt: number;
}

export interface UnitInfo extends Unit {
  updateUser: User;
}
