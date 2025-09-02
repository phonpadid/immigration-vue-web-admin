<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useCheckpointProvinceStore } from "../store/province.store";
import { useRoute } from "vue-router";
import type { ProvinceResponse } from "../interface/province.interface";
import { formatDateTime } from "@/utils/FormatDataTime";
import Tab from "@/components/Tab/Tab.vue";
import UiButton from "@/components/button/UiButton.vue";
/******************************************************* */
const { getCheckpointProvinceById } = useCheckpointProvinceStore();
const activeTab = ref("1");
const tabsConfig = [
  { key: "1", label: "ພາສາລາວ", slotName: "tab1" },
  { key: "2", label: "ພາສາອັງກິດ", slotName: "tab2" },
  { key: "3", label: "ພາສາຈີນ", slotName: "tab3" },
];

const provinceData = ref<ProvinceResponse>();
const route = useRoute();
/************** ****************************************** */

const fetchProvinceData = async () => {
  const provinceId = Number(route.params.id);
  if (!provinceId) return;

  try {
    const response = await getCheckpointProvinceById(provinceId);
    provinceData.value = response;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};
/************** ****************************************** */
onMounted(fetchProvinceData);
/************** ****************************************** */
/************** ****************************************** */
</script>

<template>
  <h2 class="text-xl font-bold text-gray-900 dark:text-white ">
    ລາຍລະອຽດແຂວງ
  </h2>
  <div class="relative">
    <Tab v-model="activeTab" :tabs="tabsConfig">
      <template #tab1>
        <div class="grid gap-4 mb-4 sm:mb-8 md:grid-cols-2 md:gap-6 my-4">
          <dl>
            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ຊາຍແດນຕິດກັບປະທດ:
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              {{ provinceData?.countries.map((c) => c.country).join(", ") }}
            </dd>
            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ຊືແຂວງ:
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              {{ provinceData?.translates[0].name }}
            </dd>
            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ເວລາສ້າງ:
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              {{ formatDateTime(provinceData?.created_at) }}
            </dd>
            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ເວລາອັບເດດ:
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              {{ formatDateTime(provinceData?.updated_at) }}
            </dd>
          </dl>
        </div>
      </template>
      <template #tab2
        ><div class="grid gap-4 mb-4 sm:mb-8 md:grid-cols-2 md:gap-6 my-4">
          <dl>
            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ຊາຍແດນຕິດກັບປະທດ:
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              {{ provinceData?.countries.map((c) => c.country).join(", ") }}
            </dd>
            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ຊືແຂວງ:
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              {{ provinceData?.translates[1].name }}
            </dd>
            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ເວລາສ້າງ:
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              {{ formatDateTime(provinceData?.created_at) }}
            </dd>
            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ເວລາອັບເດດ:
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              {{ formatDateTime(provinceData?.updated_at) }}
            </dd>
          </dl>
        </div></template
      >
      <template #tab3
        ><div class="grid gap-4 mb-4 sm:mb-8 md:grid-cols-2 md:gap-6 my-4">
          <dl>
            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ຊາຍແດນຕິດກັບປະທດ:
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              {{ provinceData?.countries.map((c) => c.country).join(", ") }}
            </dd>
            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ຊືແຂວງ:
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              {{ provinceData?.translates[2].name }}
            </dd>
            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ເວລາສ້າງ:
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              {{ formatDateTime(provinceData?.created_at) }}
            </dd>
            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ເວລາອັບເດດ:
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              {{ formatDateTime(provinceData?.updated_at) }}
            </dd>
          </dl>
        </div>
      </template>
    </Tab>
    <div class="flex items-center gap-4">
      <UiButton
        type="button"
        size="large"
        colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center"
        icon="material-symbols-light:edit-square"
        >ແກ້ໄຂ</UiButton
      >
      <UiButton
        type="button"
        size="large"
        colorClass="!bg-red-700 hover:!bg-red-900 text-white flex items-center"
        icon="material-symbols-light:edit-square"
        >ລຶບ</UiButton
      >
    </div>
  </div>
</template>
