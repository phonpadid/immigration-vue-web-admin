<script setup lang="ts">
import { onMounted } from "vue";
import { useDepartureTourismStore } from "../store/departure-tourism.store";
import DepartureTourismChart from "../components/DepartureTourismChart.vue";

const departureTourismStore = useDepartureTourismStore();

onMounted(async () => {
  await departureTourismStore.fetchReport();
});
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6 border-b dark:border-gray-600 pb-4">
      <h1 class="text-2xl font-bold dark:text-white">
        ລາຍງານການອອກຈາກປະເທດ
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">
        ສະຫຼຸບຂໍ້ມູນການອອກຈາກປະເທດ
      </p>
    </div>

    <!-- Loading State -->
    <div
      v-if="departureTourismStore.isLoading"
      class="flex justify-center items-center py-12"
    >
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <!-- Content -->
    <div v-else-if="departureTourismStore.report">
      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 class="text-sm text-gray-600 dark:text-gray-400 mb-2">
            ອອກຈາກປະເທດມື້ນີ້
          </h3>
          <p class="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {{ departureTourismStore.report.total_departure_today }}
          </p>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 class="text-sm text-gray-600 dark:text-gray-400 mb-2">
            ອອກຈາກປະເທດເດືອນນີ້
          </h3>
          <p class="text-2xl font-bold text-green-600 dark:text-green-400">
            {{ departureTourismStore.report.total_departure_month_days }}
          </p>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 class="text-sm text-gray-600 dark:text-gray-400 mb-2">
            ອອກຈາກປະເທດ 1 ປີ
          </h3>
          <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {{ departureTourismStore.report.total_departure_one_year }}
          </p>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 class="text-sm text-gray-600 dark:text-gray-400 mb-2">
            ອອກຈາກປະເທດທັງໝົດ
          </h3>
          <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {{ departureTourismStore.report.total_departure_all }}
          </p>
        </div>
      </div>

      <!-- Chart Section -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4 dark:text-white">ກຣາຟສະຫຼຸບການອອກຈາກປະເທດ</h2>
        <DepartureTourismChart :report="departureTourismStore.report" />
      </div>
    </div>

    <!-- No Data State -->
    <div
      v-else
      class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow"
    >
      <svg
        class="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <p class="mt-2 text-gray-600 dark:text-gray-400">ບໍ່ພົບຂໍ້ມູນ</p>
    </div>
  </div>
</template>
