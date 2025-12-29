<script setup lang="ts">
import { computed } from "vue";
import { Bar } from "vue-chartjs";
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from "chart.js";
import type { ArrivalTourismReport } from "../interface/arrival-tourism.interface";

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

interface Props {
  report: ArrivalTourismReport;
}

const props = defineProps<Props>();

// Chart data for total arrivals
const totalArrivalsData = computed(() => ({
  labels: ["ມື້ນີ້", "ເດືອນນີ້", "1 ປີ", "ທັງໝົດ"],
  datasets: [
    {
      label: "ການເຂົ້າເມືອງທັງໝົດ",
      data: [
        props.report.total_arrival_today,
        props.report.total_arrival_month_days,
        props.report.total_arrival_one_year,
        props.report.total_arrival_all,
      ],
      backgroundColor: [
        "rgba(37, 99, 235, 0.8)",   // blue-600
        "rgba(34, 197, 94, 0.8)",   // green-500
        "rgba(59, 130, 246, 0.8)",  // blue-500
        "rgba(147, 51, 234, 0.8)",  // purple-600
      ],
      borderColor: [
        "rgba(37, 99, 235, 1)",
        "rgba(34, 197, 94, 1)",
        "rgba(59, 130, 246, 1)",
        "rgba(147, 51, 234, 1)",
      ],
      borderWidth: 2,
    },
  ],
}));

// Chart data for tourism arrivals
const tourismArrivalsData = computed(() => ({
  labels: ["ມື້ນີ້", "ເດືອນນີ້", "1 ປີ", "ທັງໝົດ"],
  datasets: [
    {
      label: "ການເຂົ້າເມືອງດ້ານການທ່ອງທ່ຽວ",
      data: [
        props.report.total_arrival_tourism_today,
        props.report.total_arrival_tourism_month_days,
        props.report.total_arrival_tourism_one_year,
        props.report.total_arrival_tourism_all,
      ],
      backgroundColor: [
        "rgba(234, 179, 8, 0.8)",   // yellow-500
        "rgba(16, 185, 129, 0.8)",  // emerald-500
        "rgba(6, 182, 212, 0.8)",   // cyan-500
        "rgba(168, 85, 247, 0.8)",  // purple-500
      ],
      borderColor: [
        "rgba(234, 179, 8, 1)",
        "rgba(16, 185, 129, 1)",
        "rgba(6, 182, 212, 1)",
        "rgba(168, 85, 247, 1)",
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
    <!-- Total Arrivals Chart -->
    <div>
      <h3 class="text-lg font-semibold mb-4 dark:text-white">ການເຂົ້າເມືອງທັງໝົດ</h3>
      <div class="h-80">
        <Bar :data="totalArrivalsData" :options="chartOptions" />
      </div>
    </div>

    <!-- Tourism Arrivals Chart -->
    <div>
      <h3 class="text-lg font-semibold mb-4 dark:text-white">ການເຂົ້າເມືອງດ້ານການທ່ອງທ່ຽວ</h3>
      <div class="h-80">
        <Bar :data="tourismArrivalsData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>
