// D:\mitrpol\mordin-private\src\types\FertilityScoreRange.ts
export interface FertilityScoreRange {
  fertility_score_range_id: number;
  fertility_score_id: number; // FK
  score_level: 'ต่ำ' | 'กลาง' | 'สูง';
  min: number;
  max: number;
  createdAt: number;
  updatedAt?: number;
}

// เพิ่มข้อมูลใหม่
export interface FertilityScoreRangeCreateInput {
  fertility_score_id: number;
  score_level: 'ต่ำ' | 'กลาง' | 'สูง';
  min: number;
  max: number;
}

// แก้ไข
export interface FertilityScoreRangeUpdateInput
  extends FertilityScoreRangeCreateInput {
  fertility_score_range_id: number;
}

// ค้นหา
export interface FertilityScoreRangeSearchCriteria {
  fertility_score_id?: number;
  score_level?: 'ต่ำ' | 'กลาง' | 'สูง';
}
