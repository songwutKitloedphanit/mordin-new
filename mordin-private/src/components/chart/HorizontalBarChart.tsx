import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels, { Context } from 'chartjs-plugin-datalabels';
import React from 'react';
import { Bar } from 'react-chartjs-2';

import { useChartColors } from './chart-colors';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

export interface BarChartDataItem {
  label: string;
  value: number;
  color: string;
}

interface HorizontalBarChartProps {
  title?: string;
  dataItems?: BarChartDataItem[];
}

const DEFAULT_ITEMS: BarChartDataItem[] = [];

const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  title = 'กราฟแท่งแนวนอน',
  dataItems = DEFAULT_ITEMS,
}) => {
  const colors = useChartColors();

  const labels = dataItems.map(item => item.label);
  const values = dataItems.map(item => item.value);
  const maxValue = values.length > 0 ? Math.max(...values) : 0;

  const backgroundColors = dataItems.map(
    item => item.color || 'rgba(54, 162, 235, 0.6)'
  );
  const borderColors = dataItems.map(
    item => item.color || 'rgba(54, 162, 235, 1)'
  );

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    plugins: {
      datalabels: {
        anchor: 'end' as const,
        align: 'right' as const,
        color: colors.text,
        formatter: (value: number, context: Context) => {
          const data = context.chart.data.datasets[0].data as number[];
          const total = data.reduce((sum, val) => sum + val, 0);
          const percentage =
            total > 0 ? ((value / total) * 100).toFixed(1) : '0';
          return `${value} (${percentage}%)`;
        },
        font: {
          weight: 'bold' as const,
        },
      },
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: title,
        color: colors.text,
        font: {
          size: 18,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: maxValue + 10,
        ticks: {
          color: colors.muted,
        },
        grid: {
          color: colors.grid,
        },
      },
      y: {
        ticks: {
          color: colors.muted,
        },
        grid: {
          color: colors.grid,
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default HorizontalBarChart;
