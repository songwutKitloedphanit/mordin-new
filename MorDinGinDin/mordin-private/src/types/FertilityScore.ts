// D:\mitrpol\mordin-private\src\types\FertilityScore.ts

export interface FertilityScore {
  fertilityScoreId: number;
  plantCategory: string;
  parameter: string;
  parameterUnit: string;
  minValue: number;
  maxValue: number;
  createdAt: number;
  updatedAt?: number;
}

export interface FertilityScoreCreateInput {
  plantCategory: string;
  parameter: string;
  parameterUnit: string;
  minValue: number;
  maxValue: number;
}

export interface FertilityScoreUpdateInput extends FertilityScoreCreateInput {
  fertilityScoreId: number;
}
