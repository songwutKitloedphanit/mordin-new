import { User } from '../User';

import { SoilGradeInterface } from './SoilGrades';

export interface SoilGradeLevelInterface {
  soilGradeLevelId: number;
  soilGradeId: number;
  level: number;
  cutoffValue: number;
  cutoffText: string;
  score: number;
  scoreName: string;
  updateUid: number;
  updatedAt: number;
}

export interface SoilGradeLevelInfo extends SoilGradeLevelInterface {
  soilGrade: SoilGradeInterface;
  updateUser: User;
}

export interface SoilGradeLevelInput {
  level: number | null;
  cutoffValue: number | null;
  cutoffText: string | null;
  score: number | null;
  scoreName: string | null;
}

export interface SoilGradeLevelUpdateInput {
  soilGradeLevelId: number;
  level: number | null;
  cutoffValue: number | null;
  cutoffText: string | null;
  score: number | null;
  scoreName: string | null;
}
