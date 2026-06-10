// ScatterWithLine.tsx
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import React from 'react';
import { Scatter } from 'react-chartjs-2';

ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title
);

// 🔶 Props type
interface Props {
  slope: number | null;
  intercept: number | null;
  scatterPoints: { x: number; y: number }[];
}

const ScatterWithLine: React.FC<Props> = ({
  slope,
  intercept,
  scatterPoints,
}) => {
  const pointColor = 'blue'; // สีน้ำเงิน
  const lineColor = 'rgba(0, 0, 255, 0.25)'; // สีน้ำเงินโปร่งใส 50%

  const toFixSlope = slope != null ? Number(slope.toFixed(3)) : 0;

  const toFixIntercept = intercept != null ? Number(intercept.toFixed(3)) : 0;

  // ✅ คำนวณค่าจุดของเส้นตรง y = mx + c
  const minX = Math.min(...scatterPoints.map(p => p.x));
  const maxX = Math.max(...scatterPoints.map(p => p.x));

  const regressionLine = [
    { x: minX, y: toFixSlope * minX + toFixIntercept },
    { x: maxX, y: toFixSlope * maxX + toFixIntercept },
  ];

  const data = {
    datasets: [
      {
        label: 'Data Points',
        data: scatterPoints,
        backgroundColor: pointColor,
        showLine: false,
      },
      {
        label: `y = ${toFixSlope}x + ${toFixIntercept}`,
        data: regressionLine,
        borderColor: lineColor,
        borderWidth: 2,
        fill: false,
        showLine: true,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
        text: 'Working Standard',
      },
    },
    scales: {
      x: {
        type: 'linear' as const,
        position: 'bottom' as const,
        //  ticks: {
        //     stepSize: 0.05, // ปรับความละเอียดของ y-axis
        // },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 0.005,
        },
        max:
          Math.max(
            ...scatterPoints.map(p => p.y),
            toFixSlope * maxX + toFixIntercept
          ) + 0.01,
      },
    },
  };

  return <Scatter data={data} options={options} />;
};

export default ScatterWithLine;
