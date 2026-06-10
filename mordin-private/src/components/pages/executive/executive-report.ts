import type {
  PieChartData,
  PrepareData,
} from '@/types/fertilizer/FertilizerMajorLandScore';

export interface SoilInsight {
  element: string;
  grade: string;
  pct: number;
}

export interface FertilizerInsight {
  formula: string;
  count: number;
  useRate: number;
  hasCount: boolean;
}

export interface DashboardReportBarItem {
  label: string;
  value: number;
}

export interface DashboardReportData {
  title: string;
  generatedAt: Date;
  filters: { label: string; value: string }[];
  soilInsight: SoilInsight | null;
  fertilizerInsight: FertilizerInsight | null;
  improveInsight: PrepareData | null;
  graphData: {
    elementName: string;
    BarChartDataItem: DashboardReportBarItem[];
  }[];
  pieChartData: PieChartData[];
  prepareData: PrepareData[];
}

export interface DashboardReportSoilSummary {
  topLabel: string;
  topPct: number;
  total: number;
  breakdown: string;
}

const SOIL_GRADE_LABELS: Record<string, string> = {
  'very high': 'สูงมาก',
  high: 'สูง',
  moderate: 'ปานกลาง',
  medium: 'ปานกลาง',
  low: 'ต่ำ',
  'very low': 'ต่ำมาก',
};

export const formatSoilGrade = (grade: string) => {
  const normalized = grade.trim().toLocaleLowerCase('en-US');
  return SOIL_GRADE_LABELS[normalized] ?? grade;
};

export const formatReportNumber = (value: number) =>
  Number.isFinite(value) ? value.toLocaleString('th-TH') : '-';

export const summariseReportElement = (
  bars: DashboardReportBarItem[]
): DashboardReportSoilSummary => {
  const total = bars.reduce((sum, bar) => sum + bar.value, 0);
  if (total === 0) {
    return { topLabel: '-', topPct: 0, total: 0, breakdown: '-' };
  }

  const sorted = [...bars]
    .filter(bar => bar.value > 0)
    .sort((a, b) => b.value - a.value);
  const top = sorted[0];

  return {
    topLabel: formatSoilGrade(top.label),
    topPct: (top.value / total) * 100,
    total,
    breakdown: sorted
      .map(
        bar =>
          `${formatSoilGrade(bar.label)} ${((bar.value / total) * 100).toFixed(1)}% (${formatReportNumber(bar.value)})`
      )
      .join(' • '),
  };
};

export const buildExecutiveReportViewModel = (data: DashboardReportData) => {
  const fertilizerGroups = data.pieChartData
    .map(category => ({
      name: category.serviceCategoryName,
      usages: category.summary
        .map(type => ({
          usageTypeName: type.usageTypeName,
          rows: type.PieChartItemDto.map(item => ({
            formula: item.formula || '-',
            count: Number(item.count) || 0,
            useRate: Number(item.useRate) || 0,
          }))
            .filter(row => row.useRate > 0)
            .sort((a, b) => b.count - a.count || b.useRate - a.useRate),
        }))
        .filter(type => type.rows.length > 0),
    }))
    .filter(category => category.usages.length > 0);
  const soilRows = data.graphData
    .filter(element => element.BarChartDataItem.some(item => item.value > 0))
    .map(element => ({
      elementName: element.elementName,
      summary: summariseReportElement(element.BarChartDataItem),
    }));
  const improvementRows = [...data.prepareData]
    .filter(item => Number(item.useRatePercent) > 0)
    .sort((a, b) => Number(b.useRatePercent) - Number(a.useRatePercent));

  const hasSummary = Boolean(
    data.soilInsight || data.fertilizerInsight || data.improveInsight
  );
  let sectionNumber = 1;

  return {
    formattedDate: new Intl.DateTimeFormat('th-TH', {
      dateStyle: 'long',
    }).format(data.generatedAt),
    filterText:
      data.filters.length > 0
        ? data.filters
            .map(filter => `${filter.label}: ${filter.value}`)
            .join(' • ')
        : 'ข้อมูลทั้งหมด',
    fertilizerGroups,
    soilRows,
    improvementRows,
    hasAnyData:
      hasSummary ||
      soilRows.length > 0 ||
      fertilizerGroups.length > 0 ||
      improvementRows.length > 0,
    sectionNumbers: {
      summary: hasSummary ? String(sectionNumber++) : null,
      soil: soilRows.length > 0 ? String(sectionNumber++) : null,
      fertilizer: fertilizerGroups.length > 0 ? String(sectionNumber++) : null,
      improvement: improvementRows.length > 0 ? String(sectionNumber++) : null,
    },
  };
};
