export interface BarChartItem {
  gradeName: string;
  color: string;
  count: number;
  percentage: string;
  order: number;
}

export interface MapItem {
  locationName: string;
  totalCount: number;
  data: {
    gradeName: string | null;
    color: string | null;
  };
}

export interface SoilAnalysisItem {
  elementName: string;
  ChoroplethMapData: MapItem[];
  HorizontalBarChartData: BarChartItem[];
}

export interface PieChartSummaryItem {
  formula: string;
  useRate: number; // อัตราการใส่ต่อไร่ (กก./ไร่)
  count?: number; // จำนวนแปลงที่แนะนำสูตรนี้
}

export interface PieChartData {
  serviceCategoryName: string; // เช่น "อ้อ»ลูก"
  summary: {
    usageTypeName: string;
    PieChartItemDto: PieChartSummaryItem[];
  }[];
}

export interface PrepareData {
  fertilizerMinorName: string; // เช่น "ปูนขาว"
  unitName: string;
  useRatePerRai: number;
  totalUsage: number;
  useRatePercent: number;
}

export interface FertilizerSummary {
  pieChartData: PieChartData[];
  prepareData: PrepareData[];
}

export interface DashboardResponse {
  soilAnalysis: SoilAnalysisItem[];
  fertilizerSummary: FertilizerSummary | null;
}

export interface GetGraphFilterParams {
  year?: number;
  factoryId?: number;
  serviceAreaId?: number;
  typeId?: number;
  geographyId?: number;
  provinceCode?: number;
  districtCode?: number;
  subdistrictCode?: number;
}
