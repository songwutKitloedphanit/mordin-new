export interface ResultGradeLevel {
  resultGradeId: number;
  level: number;
  color: string;
  cutoffValue: number;
  cutoffText: string;
  scoreName: string;
  updatedUid: number;
  updatedAt: Date;
}

export interface ResultGradeLevelInput {
  level: number;
  color: string;
  cutoffValue: number;
  cutoffText: string;
  scoreName: string;
}
