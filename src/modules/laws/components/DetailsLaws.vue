<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useLawStore } from "../store/laws.store";
import { useRoute } from "vue-router";
import type { LawResponse } from "../interface/laws.interface";
import { formatDateTime } from "@/utils/FormatDataTime";
import { getFileUrl } from "@/utils/ConfigPathImage";

/*********************************************** */

const { getDetailsLaw } = useLawStore();
const lawData = ref<LawResponse | null>(null);
const route = useRoute();
const lawsId = Number(route.params.id);

const getFileName = (filePath: string | undefined) => {
  if (!filePath) return "";
  return filePath.split("/").pop() || filePath;
};

const getLaws = async () => {
  try {
    const response = await getDetailsLaw(lawsId);
    if (response) {
      lawData.value = response;
    }
  } catch (error) {
    console.error("Error fetching law details:", error);
  }
};

onMounted(async () => {
  await getLaws();
});
</script>

<template>
  <div class="relative">
    <div v-if="lawData">
      <dl>
        <div class="grid gap-4 mb-4 sm:mb-8 md:grid-cols-2 md:gap-6 mt-12">
          <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
            ໄຟລ໌ເອກະສານ
          </dt>
          <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
            <a
              v-if="lawData.file"
              :href="getFileUrl(lawData.file)"
              class="font-medium text-primary-600 dark:text-primary-500 hover:underline"
              target="_blank"
            >
              {{ getFileName(lawData.file) }}
            </a>
            <span v-else>ບໍ່ມີຟາຍ</span>
          </dd>
          <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
            ຊື
          </dt>
          <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
            {{ lawData.name }}
          </dd>

          <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
            ເວລາສ້າງ:
          </dt>
          <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
            {{ formatDateTime(lawData.created_at) }}
          </dd>
          <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
            ເວລາອັບເດດ:
          </dt>
          <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
            {{ formatDateTime(lawData.updated_at) }}
          </dd>
        </div>
      </dl>
    </div>
    <div v-else class="p-4 flex items-center justify-center">
      ກຳລັງໂຫລດຂໍ້ມູນ...
    </div>
  </div>
</template>
