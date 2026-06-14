import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import React from 'react';
import { Bar, Doughnut, Pie } from 'react-chartjs-2';

import { useChartColors } from './chart-colors';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

export type DataChartType = 'bar-h' | 'bar-v' | 'pie' | 'doughnut';

export interface DataChartItem {
  label: string;
  value: number;
  color?: string;
}

interface DataChartProps {
  type: DataChartType;
  title?: string;
  dataItems: DataChartItem[];
  // ความสูงของกล่องกราฟ — ตัวเลข (px) หรือ '100%' เพื่อยืดตามวิดเจ็ตบนกริด
  height?: number | string;
}

// พาเลตต์สำรองเมื่อรายการข้อมูลไม่ได้กำหนดสีมาเอง (ชุดเดียวกับ PieChart เดิม)
const FALLBACK_COLORS = [
  '#1b4332',
  '#6a4c93',
  '#f3722c',
  '#277da1',
  '#f94144',
  '#577590',
  '#74c69d',
];

// กราฟข้อมูลหมวดหมู่เดียวที่สลับชนิดได้ (แท่งนอน/แท่งตั้ง/วงกลม/โดนัท)
// ใช้คู่กับเมนูเลือกชนิดกราฟของวิดเจ็ต — ชุดข้อมูลเดิม เปลี่ยนเฉพาะวิธีแสดงผล
const DataChart: React.FC<DataChartProps> = ({
  type,
  title,
  dataItems,
  height = '100%',
}) => {
  const colors = useChartColors();

  const labels = dataItems.map(item => item.label);
  const values = dataItems.map(item => item.value);
  const total = values.reduce((sum, value) => sum + value, 0);
  const backgroundColors = dataItems.map(
    (item, index) =>
      item.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length]
  );

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors,
        borderWidth: 1,
      },
    ],
  };

  const titleOptions = {
    display: Boolean(title),
    text: title ?? '',
    color: colors.text,
    font: { size: 14, weight: 'bold' as const },
  };

  const percent = (value: number) =>
    total > 0 ? `${((value / total) * 100).toFixed(0)}%` : '0%';

  const barOptions = {
    indexAxis: (type === 'bar-h' ? 'y' : 'x') as 'x' | 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: titleOptions,
      datalabels: {
        anchor: 'end' as const,
        align: (type === 'bar-h' ? 'right' : 'top') as 'right' | 'top',
        color: colors.text,
        font: { weight: 'bold' as const, size: 11 },
        formatter: (value: number) =>
          `${value.toLocaleString()} (${percent(value)})`,
      },
    },
    scales: {
      [type === 'bar-h' ? 'x' : 'y']: {
        beginAtZero: true,
        // เผื่อพื้นที่ปลายแกนให้ป้ายตัวเลขไม่ถูกตัด
        suggestedMax: Math.max(...values, 0) * 1.2,
        ticks: { color: colors.muted },
        grid: { color: colors.grid },
      },
      [type === 'bar-h' ? 'y' : 'x']: {
        ticks: { color: colors.muted },
        grid: { display: false },
      },
    },
  };

  const circularOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: { color: colors.muted, boxWidth: 12, font: { size: 11 } },
      },
      title: titleOptions,
      datalabels: {
        color: '#fff',
        font: { weight: 'bold' as const, size: 11 },
        formatter: (value: number) => percent(value),
      },
    },
  };

  const boxHeight = typeof height === 'number' ? `${height}px` : height;

  return (
    <div style={{ position: 'relative', height: boxHeight, width: '100%' }}>
      {type === 'pie' ? (
        <Pie data={chartData} options={circularOptions} />
      ) : type === 'doughnut' ? (
        <Doughnut data={chartData} options={circularOptions} />
      ) : (
        <Bar data={chartData} options={barOptions} />
      )}
    </div>
  );
};

export default DataChart;
