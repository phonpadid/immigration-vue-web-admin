<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useCheckpointStore } from "../store/checkpoint.store";
import { useCheckpointProvinceStore } from "@/modules/checkpoints/province/store/province.store";
import { useCheckpointcategoriesStore } from "@/modules/checkpoints/category/store/checkpoint.categories.store";
import { columns } from "../interface/column";
import { useRouter } from "vue-router";
import { Modal } from "ant-design-vue";
import { getFileUrl } from "@/utils/ConfigPathImage";
import UiButton from "@/components/button/UiButton.vue";
import Table from "@/components/table/Table.vue";
import InputSelect from "@/components/Input/InputSelect.vue";
import Dropdown from "@/components/Dropdown/Dropdown.vue";

// Stores
const checkpointStore = useCheckpointStore();
const provinceStore = useCheckpointProvinceStore();
const categoryStore = useCheckpointcategoriesStore();
const { push } = useRouter();

// Local states
const selectedProvinceId = ref<string | number | undefined>(undefined);
const selectedCategoryId = ref<string | number | undefined>(undefined);
const selectedLanguage = ref<string>("lo"); // Default language: Lao
const currentPage = ref(1);
const pageSize = ref(10);
const menuOptions = ref([
  { key: "1", label: "ລາຍລະອຽດ" },
  { key: "2", label: "ແກ້ໄຂ" },
  { key: "3", label: "ລຶບ" },
]);
// Computed properties
const totalCheckpoints = computed(() => checkpointStore.checkpoints.total);
// Helper function to extract `translates` by language
const mapTranslatesToOptions = (
  data: any[],
  lang: string,
  key: string = "title"
): { label: string; value: string | number }[] => {
  return data.map((item) => {
    const translate = item.translates.find((t: any) => t.lang === lang);
    return {
      label: translate?.[key] || "Unknown",
      value: item.id,
    };
  });
};

const handleSelect = (key: string, record: any) => {
  //   console.log("Selected:", key, "for record:", record);
  if (key === "1") {
    // View details
    push({ name: "checkpoint_details", params: { id: record.id } });
  }
  if (key === "2") {
    // View details
    push({ name: "checkpoint_edit", params: { id: record.id } });
  } else if (key === "3") {
    Modal.confirm({
      title: "ຢືນຢັນການລົບ",
      content: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບລາຍການນີ້??",
      okText: "ແມ່ນແລ້ວ,ຂ້ອຍແນ່ໃຈ",
      cancelText: "ບໍ່,ຍົກເລີກ",
      okType: "danger",
      onOk: async () => {
        try {
          checkpointStore.isLoading = true;
          await checkpointStore.deleteCheckpoint(record.id);
          alert("ລົບຂໍ້ມູນສຳເລັດ");
        } catch (err) {
          console.error("Error:", err);
        } finally {
          checkpointStore.isLoading = false;
        }
      },
    });
  }
};

const addCheckpoint = () => {
  push({ name: "checkpoint_add" });
};

const fetchData = async () => {
  await checkpointStore.getAllCheckpoints(
    (currentPage.value - 1) * pageSize.value,
    pageSize.value,
    typeof selectedCategoryId.value === "string"
      ? parseInt(selectedCategoryId.value, 10)
      : selectedCategoryId.value,
    typeof selectedProvinceId.value === "string"
      ? parseInt(selectedProvinceId.value, 10)
      : selectedProvinceId.value
  );
};

const fetchProvinces = async () => {
  await provinceStore.getAllCheckpointProvine(1, 100); // ดึงข้อมูลทั้งหมด
};

const fetchCategories = async () => {
  await categoryStore.getAllCheckpointCategories();
};

onMounted(async () => {
  await Promise.all([fetchData(), fetchProvinces(), fetchCategories()]);
});

watch(
  [selectedProvinceId, selectedCategoryId, currentPage, selectedLanguage],
  fetchData
);
</script>

<template>
  <div>
    <!-- Header Section -->
    <div
      class="flex flex-col items-start justify-between border-b dark:border-gray-600 p-4 sm:flex-row sm:items-center mt-12"
    >
      <h2 class="text-lg font-semibold mb-2 sm:mb-0 dark:text-white">
        ຕາຕະລາງຂໍ້ມູນດ່ານ
      </h2>

      <div
        class="flex items-center justify-end flex-col sm:flex-row gap-2 w-full sm:w-fit"
      >
        <!-- Province Select -->
        <InputSelect
          v-model="selectedProvinceId"
          placeholder="ເລືອກແຂວງ"
          size="large"
          :options="
            mapTranslatesToOptions(
              provinceStore.checkpointProvince.data,
              selectedLanguage,
              'name'
            )
          "
        />

        <!-- Category Select -->
        <InputSelect
          v-model="selectedCategoryId"
          size="large"
          placeholder="ເລືອກປະເພດດ່ານ"
          :options="
            mapTranslatesToOptions(
              categoryStore.checkpointCategories.data,
              selectedLanguage,
              'title'
            )
          "
        />
        <UiButton
          type="primary"
          size="large"
          colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center"
          icon="ant-design:plus-outlined"
          @click="addCheckpoint"
          >ເພີ່ມຂໍ້ມູນ</UiButton
        >
      </div>
    </div>

    <!-- Table Section -->

    <Table :columns="columns" :dataSource="checkpointStore.checkpoints.data">
      <template #image="{ record }">
        <div class="flex items-center">
          <img
            v-if="record.image"
            :src="getFileUrl(record.image)"
            alt="Image"
            class="min-w-32 w-60 object-contain h-32 rounded-md"
          />
          <span v-else>ບໍ່ມີຮູບ</span>
        </div>
      </template>
      <template #translates="{ record }">
        <span>
          {{
            record.translates.find((t: any) => t.lang === selectedLanguage)
              ?.name || "N/A"
          }}
        </span>
      </template>
      <template #action="{ record }">
        <Dropdown
          :options="menuOptions"
          @select="(key) => handleSelect(key, record)"
        >
          <UiButton
            type="primary"
            size="small"
            colorClass="!bg-white text-gray-900 flex items-center hover:!bg-gray-200 hover:!text-gray-900 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white"
            icon="ic:baseline-more-horiz"
          ></UiButton>
        </Dropdown>
      </template>
    </Table>
  </div>
</template>

<style scoped>
:deep(.ant-select-dropdown) {
  max-width: 500px; /* กำหนดความกว้างสูงสุด */
}

:deep(.ant-select-item-option-content) {
  white-space: nowrap; /* ไม่ให้ข้อความยืดเกิน */
  overflow: hidden; /* ซ่อนข้อความที่ยาวเกิน */
  text-overflow: ellipsis; /* เพิ่ม ... เมื่อข้อความยาวเกิน */
}

:deep(.ant-select-item-option-content:hover) {
  white-space: normal; /* เมื่อ hover ให้แสดงข้อความเต็ม */
  word-break: break-word; /* ตัดข้อความเมื่อเกิน */
}
</style>
