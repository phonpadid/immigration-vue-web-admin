<script setup lang="ts">
import { computed } from "vue";
import { Bar } from "vue-chartjs";
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from "chart.js";
import type { DepartureTourismReport } from "../interface/departure-tourism.interface";

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

interface Props {
  report: DepartureTourismReport;
}

const props = defineProps<Props>();

// Chart data for total departures
const totalDeparturesData = computed(() => ({
  labels: ["ມື້ນີ້", "ເດືອນນີ້", "1 ປີ", "ທັງໝົດ"],
  datasets: [
    {
      label: "ການອອກຈາກປະເທດທັງໝົດ",
      data: [
        props.report.total_departure_today,
        props.report.total_departure_month_days,
        props.report.total_departure_one_year,
        props.report.total_departure_all,
      ],
      backgroundColor: [
        "rgba(249, 115, 22, 0.8)",  // orange-500
        "rgba(234, 88, 12, 0.8)",   // orange-600
        "rgba(251, 146, 60, 0.8)",  // orange-400
        "rgba(154, 52, 18, 0.8)",   // orange-800
      ],
      borderColor: [
        "rgba(249, 115, 22, 1)",
        "rgba(234, 88, 12, 1)",
        "rgba(251, 146, 60, 1)",
        "rgba(154, 52, 18, 1)",
      ],
      borderWidth: 2,
    },
  ],
}));

// Chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: "top" as const,
      labels: {
        color: "#374151",
        font: {
          family: "'Noto Serif Lao', 'noto serif lao', serif",
          size: 14,
        },
      },
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      padding: 12,
      titleFont: {
        family: "'Noto Serif Lao', 'noto serif lao', serif",
        size: 14,
      },
      bodyFont: {
        family: "'Noto Serif Lao', 'noto serif lao', serif",
        size: 13,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        color: "#6B7280",
        font: {
          family: "'Noto Serif Lao', 'noto serif lao', serif",
          size: 12,
        },
      },
      grid: {
        color: "rgba(107, 114, 128, 0.1)",
      },
    },
    x: {
      ticks: {
        color: "#6B7280",
        font: {
          family: "'Noto Serif Lao', 'noto serif lao', serif",
          size: 12,
        },
      },
      grid: {
        display: false,
      },
    },
  },
};
</script>

<template>
  <div class="space-y-8">
    <!-- Total Departures Chart -->
    <div>
      <h3 class="text-lg font-semibold mb-4 dark:text-white">ການອອກຈາກປະເທດທັງໝົດ</h3>
      <div class="h-80">
        <Bar :data="totalDeparturesData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>
