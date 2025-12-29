<script setup lang="ts">
import { onMounted } from "vue";
import { useArrivalTourismStore } from "../store/arrival-tourism.store";
import ArrivalTourismChart from "../components/ArrivalTourismChart.vue";

const arrivalTourismStore = useArrivalTourismStore();

onMounted(async () => {
  await arrivalTourismStore.fetchReport();
});
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6 border-b dark:border-gray-600 pb-4">
      <h1 class="text-2xl font-bold dark:text-white">
        ລາຍງານການເຂົ້າເມືອງດ້ານການທ່ອງທ່ຽວ
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">
        ສະຫຼຸບຂໍ້ມູນການເຂົ້າເມືອງຂອງນັກທ່ອງທ່ຽວ
      </p>
    </div>

    <!-- Loading State -->
    <div
      v-if="arrivalTourismStore.isLoading"
      class="flex justify-center items-center py-12"
    >
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <!-- Content -->
    <div v-else-if="arrivalTourismStore.report">
      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 class="text-sm text-gray-600 dark:text-gray-400 mb-2">
            ເຂົ້າເມືອງມື້ນີ້
          </h3>
          <p class="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {{ arrivalTourismStore.report.total_arrival_today }}
          </p>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 class="text-sm text-gray-600 dark:text-gray-400 mb-2">
            ເຂົ້າເມືອງນີ້
          </h3>
          <p class="text-2xl font-bold text-green-600 dark:text-green-400">
            {{ arrivalTourismStore.report.total_arrival_month_days }}
          </p>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 class="text-sm text-gray-600 dark:text-gray-400 mb-2">
            ເຂົ້າເມືອງ 1 ປີ
          </h3>
          <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {{ arrivalTourismStore.report.total_arrival_one_year }}
          </p>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 class="text-sm text-gray-600 dark:text-gray-400 mb-2">
            ເຂົ້າເມືອງທັງໝົດ
          </h3>
          <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {{ arrivalTourismStore.report.total_arrival_all }}
          </p>
        </div>
      </div>

      <!-- Tourism Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg shadow p-4 text-white">
          <h3 class="text-sm opacity-90 mb-2">ນັກທ່ອງທ່ຽວມື້ນີ້</h3>
          <p class="text-3xl font-bold">
            {{ arrivalTourismStore.report.total_arrival_tourism_today }}
          </p>
        </div>

        <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-4 text-white">
          <h3 class="text-sm opacity-90 mb-2">ນັກທ່ອງທ່ຽວເດືອນນີ້</h3>
          <p class="text-3xl font-bold">
            {{ arrivalTourismStore.report.total_arrival_tourism_month_days }}
          </p>
        </div>

        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-4 text-white">
          <h3 class="text-sm opacity-90 mb-2">ນັກທ່ອງທ່ຽວ 1 ປີ</h3>
          <p class="text-3xl font-bold">
            {{ arrivalTourismStore.report.total_arrival_tourism_one_year }}
          </p>
        </div>

        <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-4 text-white">
          <h3 class="text-sm opacity-90 mb-2">ນັກທ່ອງທ່ຽວທັງໝົດ</h3>
          <p class="text-3xl font-bold">
            {{ arrivalTourismStore.report.total_arrival_tourism_all }}
          </p>
        </div>
      </div>

      <!-- Chart Section -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4 dark:text-white">ກຣາຟສະຫຼຸບການເຂົ້າເມືອງ</h2>
        <ArrivalTourismChart :report="arrivalTourismStore.report" />
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
