"use client";
import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import styles from "./VulnerabilitiesPieChart.module.scss";
import { VulnerabilitiesData } from "@/types/dashboard.dto";
import VulnerabilitiesBlock from "../VulnerabilitiesBlock/VulnerabilitiesBlock";

ChartJS.register(ArcElement, Tooltip, Legend);

type VulnerabilitiesPieChartProps = {
  labels: string[];
  data: number[];
  vulnerabilities: VulnerabilitiesData;
};

const COLORS = ["#dc3545", "#ffc107", "#28a745"];

const VulnerabilitiesPieChart: React.FC<VulnerabilitiesPieChartProps> = ({
  labels,
  data,
  vulnerabilities,
}) => {
  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: COLORS,
        borderWidth: 1,
        borderColor: "#fff",
        hoverOffset: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: { label: string; parsed: number }) {
            return `${context.label}: ${context.parsed}`;
          },
        },
      },
    },
  };

  const centerTextPlugin = {
    id: "centerText",
    beforeDraw: (chart: { width: number; height: number; ctx: CanvasRenderingContext2D }) => {
      const { width } = chart;
      const { height } = chart;
      const ctx = chart.ctx;
      ctx.restore();
      const fontSize = 2;
      ctx.font = `${fontSize}em sans-serif`;
      ctx.textBaseline = "middle";

      const total = data.reduce((acc, val) => acc + val, 0);
      const text = total.toString();
      const textX = Math.round((width - ctx.measureText(text).width) / 2);
      const textY = height / 2 - 10;

      ctx.fillText(text, textX, textY);
      ctx.fillText("всего", textX - 20, textY + 20);
      ctx.save();
    },
  };

  return (
    <div className={styles.card}>
      <h2>Уязвимости</h2>
      <div className={styles.content}>
        <div className={styles.chartContainer}>
          <Doughnut
            data={chartData}
            options={options}
            plugins={[centerTextPlugin]}
          />
        </div>
        <VulnerabilitiesBlock
          vulnerabilities={vulnerabilities as VulnerabilitiesData}
        />
      </div>
    </div>
  );
};

export default VulnerabilitiesPieChart;
