<script setup lang="ts">
import { ref, onMounted } from "vue";
import { popupsStore } from "../store/popup.store";
import { useRoute, useRouter } from "vue-router";
import { formatDatePicker } from "@/utils/FormatDataTime";

// ดึง router และ route parameters
const route = useRoute();
const router = useRouter();

// ดึง store
const { getPopupsId, deletePopup, isLoading } = popupsStore();

// สร้างตัวแปรสำหรับเก็บข้อมูล popup
const popupDetails = ref<any>(null);
const baseImageUrl = import.meta.env.VITE_IMG_URL || "";

// ดึงข้อมูล popup เมื่อ component ถูก mount
onMounted(async () => {
  try {
    // ดึง id จาก route params
    const id = Number(route.params.id);
    if (!id) return;

    const data = await getPopupsId(id);
    popupDetails.value = data; // getPopupsId คืนค่า data โดยตรง
  } catch (error) {
    console.error("Error fetching popup details:", error);
  }
});

// ฟังก์ชันสำหรับลบ popup
const handleDelete = async () => {
  if (!popupDetails.value?.id) return;

  if (confirm("ທ່ານຕ້ອງການລຶບ popup ນີ້ແທ້ບໍ?")) {
    try {
      await deletePopup(popupDetails.value.id);
      router.push("/popups"); // นำทางกลับไปยังหน้า popups หลังจากลบสำเร็จ
    } catch (error) {
      console.error("Error deleting popup:", error);
    }
  }
};
const handleEdit = () => {
  if (!popupDetails.value?.id) return;
  router.push(`/popups/edit/${popupDetails.value.id}`);
};
</script>

<template>
  <div class="relative mt-12">
    <div
      v-if="isLoading"
      class="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-gray-900/70 z-10"
    >
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"
      ></div>
    </div>
    <div
      v-if="popupDetails"
      class="mb-4 grid gap-4 sm:mb-5 sm:grid-cols-1 sm:gap-6 md:gap-12"
    >
      <dl>
        <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
          ຮູບພາບ
        </dt>
        <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
          <img
            :src="baseImageUrl + '/' + popupDetails.image"
            alt="Popup Image"
            class="w-full h-72 object-contain"
          />
        </dd>
      </dl>
    </div>

    <div v-if="popupDetails">
      <dl>
        <div class="grid gap-4 mb-4 sm:mb-8 md:grid-cols-2 md:gap-6">
          <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
            ເວລາເລີມຕົ້ນ:
          </dt>
          <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
            {{ formatDatePicker(popupDetails.start_time) }}
          </dd>

          <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
            ເວລາສິນສຸດ:
          </dt>
          <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
            {{ formatDatePicker(popupDetails.end_time) }}
          </dd>

          <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
            ລິ້ງ:
          </dt>
          <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
            <a
              v-if="popupDetails.link"
              :href="popupDetails.link"
              target="_blank"
              class="font-medium text-primary-600 dark:text-primary-500 hover:underline"
            >
              {{ popupDetails.link }}
            </a>
            <span v-else>-</span>
          </dd>
          <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
            ເວລາສ້າງ:
          </dt>
          <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
            {{ formatDatePicker(popupDetails.created_at) }}
          </dd>

          <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
            ເວລາອັບເດດ:
          </dt>
          <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
            {{ formatDatePicker(popupDetails.updated_at) }}
          </dd>
        </div>
      </dl>
    </div>

    <div
      v-else-if="!isLoading"
      class="text-gray-500 dark:text-gray-400 font-light"
    >
      <div class="flex flex-col items-center justify-center py-12">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-12 w-12 text-gray-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p class="text-gray-500 dark:text-gray-400 text-lg mb-4">
          ບໍ່ມີຂໍ້ມູນທີ່ຈະສະແດງ
        </p>
        <button
          @click="router.push('/popups')"
          class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 transition"
        >
          ກັບໄປຫນ້າລາຍການ
        </button>
      </div>
    </div>

    <div v-if="popupDetails" class="p-4 flex items-center">
      <button
        @click="handleEdit"
        class="mr-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        ແກ້ໄຂ
      </button>
      <button
        @click="handleDelete"
        class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
      >
        ລຶບ
      </button>
    </div>
  </div>
</template>
