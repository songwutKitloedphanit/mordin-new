import type { DashboardReportData } from '@/components/pages/executive/executive-report';

const generatedAt = new Date('2026-06-04T00:00:00+07:00');

export const THAI_REPORT_REGRESSION_TERMS = [
  'คำแนะนำการใช้ปุ๋ย',
  'สรุปประเด็นสำคัญ',
  'ผลการวิเคราะห์ดิน',
  'ศูนย์นวัตกรรมและวิจัยมิตรผล',
  'พื้นที่แนะนำ',
  'จำนวนแปลง',
] as const;

export const FULL_EXECUTIVE_REPORT_FIXTURE: DashboardReportData = {
  title: 'รายงานภาพรวมผลการวิเคราะห์ดินและคำแนะนำการปรับปรุงดิน',
  generatedAt,
  filters: [
    { label: 'ประเภทบริการ', value: 'อ้อย' },
    { label: 'ปี', value: 'ทุกปี' },
  ],
  soilInsight: { element: 'OM', grade: 'Low', pct: 73 },
  fertilizerInsight: {
    formula: '15-7-18',
    count: 13,
    useRate: 50,
    hasCount: true,
  },
  improveInsight: {
    fertilizerMinorName: 'วีเนส',
    unitName: 'กิโลกรัม',
    useRatePerRai: 1076.92,
    totalUsage: 100,
    useRatePercent: 28.25,
  },
  graphData: [
    {
      elementName: 'OM',
      BarChartDataItem: [
        { label: 'Low', value: 8 },
        { label: 'Moderate', value: 3 },
      ],
    },
    {
      elementName: 'K',
      BarChartDataItem: [
        { label: 'ต่ำ', value: 5 },
        { label: 'High', value: 5 },
      ],
    },
  ],
  pieChartData: [
    {
      serviceCategoryName: 'อ้อยตอ',
      summary: [
        {
          usageTypeName: 'ปุ๋ยรองพื้น',
          PieChartItemDto: [
            { formula: '15-7-18', count: 13, useRate: 50 },
            { formula: '25-0-0', count: 3, useRate: 20 },
          ],
        },
      ],
    },
  ],
  prepareData: [
    {
      fertilizerMinorName: 'วีเนส',
      unitName: 'กิโลกรัม',
      useRatePerRai: 1076.92,
      totalUsage: 100,
      useRatePercent: 28.25,
    },
  ],
};

export const SOIL_ONLY_REPORT_FIXTURE: DashboardReportData = {
  ...FULL_EXECUTIVE_REPORT_FIXTURE,
  title: 'รายงานการกระจายตัวผลการวิเคราะห์ดิน',
  fertilizerInsight: null,
  improveInsight: null,
  pieChartData: [],
  prepareData: [],
};
