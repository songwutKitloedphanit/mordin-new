import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels, { Context } from 'chartjs-plugin-datalabels';
import React from 'react';
import { Pie } from 'react-chartjs-2';

import { useChartColors } from './chart-colors';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

export interface PieChartDataItem {
  label: string;
  value: number;
}

interface PieChartProps {
  title?: string;
  dataItems?: PieChartDataItem[];
}

const DEFAULT_ITEMS: PieChartDataItem[] = [];

const defaultColors = [
  '#1b4332',
  '#6a4c93',
  '#f3722c',
  '#277da1',
  '#f94144',
  '#577590',
  '#74c69d',
];

const defaultBorderColors = defaultColors.map(color =>
  color.replace('0.2', '1')
);

const PieChart: React.FC<PieChartProps> = ({
  title = 'สรุปผลรวม',
  dataItems = DEFAULT_ITEMS,
}) => {
  const titleColor = useChartColors().text;

  const labels = dataItems.map(item => item.label);
  const values = dataItems.map(item => item.value);

  const chartData = {
    labels,
    datasets: [
      {
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
        color: titleColor,
        font: {
          size: 18,
        },
      },
    },
  };

  return <Pie data={chartData} options={options} />;
};

export default PieChart;
