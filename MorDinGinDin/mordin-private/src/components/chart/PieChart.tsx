import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels, { Context } from 'chartjs-plugin-datalabels';
import React from 'react';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

export interface PieChartDataItem {
  label: string;
  value: number;
}

interface PieChartProps {
  title?: string;
  dataItems?: PieChartDataItem[];
}

const defaultItems: PieChartDataItem[] = [
  { label: 'Red', value: 12 },
  { label: 'Blue', value: 19 },
  { label: 'Yellow', value: 3 },
  { label: 'Green', value: 5 },
  { label: 'Purple', value: 2 },
  { label: 'Orange', value: 3 },
];

const defaultColors = [
  '#1b4332', // เขียวเข้มคล้ายป่า
  '#6a4c93', // ม่วงกรม
  '#f3722c', // ส้มเข้ม
  '#277da1', // น้ำเงินมั่นคง
  '#f94144', // แดงสดแบบสุภาพ
  '#577590', // เทาน้ำเงินแบบ business
  '#74c69d', // เขียวอ่อนแบบสุขุม
];

const defaultBorderColors = defaultColors.map(color =>
  color.replace('0.2', '1')
);

const PieChart: React.FC<PieChartProps> = ({
  title = 'สรุปผลรวม',
  dataItems = defaultItems,
}) => {
  const labels = dataItems.map(item => item.label);
  const values = dataItems.map(item => item.value);

  const chartData = {
    labels,
    datasets: [
      {
        // label: '# of Votes',
        data: values,
        backgroundColor: defaultColors,
        borderColor: defaultBorderColors,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        color: '#fff',
        formatter: (_value: number, context: Context) => {
          return context.chart.data.labels![context.dataIndex] as string;
        },
        anchor: 'center' as const,
        align: 'center' as const,
        font: {
          weight: 'bold' as const,
        },
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 18,
        },
      },
    },
  };

  return <Pie data={chartData} options={options} />;
};

export default PieChart;
