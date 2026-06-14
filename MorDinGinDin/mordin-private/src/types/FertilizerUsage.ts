// D:\mitrpol\mordin-private\src\types\FertilizerUsage.ts

export interface FertilizerUsage {
  fertilizerUsageId: number;
  plantCategory: 'Rice' | 'Sugarcane';
  plantType: 'Sugarcane-planting' | 'Sugarcane-stump';
  fertilizerType: '' | 'Base' | 'Top' | 'Yield-enhancing';
  recommendFertilizerId: number | null;
  dirtGrade: string;
  createdAt: number;
  updatedAt?: number;
}

export interface FertilizerUsageCreateInput {
  plantCategory: 'Rice' | 'Sugarcane';
  plantType: 'Sugarcane-planting' | 'Sugarcane-stump';
  fertilizerType: '' | 'Base' | 'Top' | 'Yield-enhancing';
  recommendFertilizerId: number | null;
  dirtGrade: string;
}

export interface FertilizerUsageUpdateInput extends FertilizerUsageCreateInput {
  fertilizer_usage_id: number;
}

export interface FertilizerUsageSearchInput {
  plant_category?: string;
  plant_type?: string;
  dirt_grade?: string;
}
