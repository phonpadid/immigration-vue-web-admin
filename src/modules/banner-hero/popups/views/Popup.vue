<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { columns } from "../interface/column";
import { popupsStore } from "../store/popup.store";
import { useRouter } from "vue-router";
import { Modal } from "ant-design-vue";
import { getImageUrl } from "@/utils/ConfigPathImage";
import { formatDateTime } from "../../../../utils/FormatDataTime";
import InputSelect from "@/components/Input/InputSelect.vue";
import Switch from "@/components/Switch/Switch.vue";
import Table from "@/components/table/Table.vue";
import UiButton from "@/components/button/UiButton.vue";
import UibuttonDropdown from "@/components/button/UibuttonDropdown.vue";
import Dropdown from "@/components/Dropdown/Dropdown.vue";
import LoadingSpinner from "@/components/loading/LoadingSpinner.vue";

/********************************************************************* */

const {
  getAllPopups,
  deletePopup,
  isLoading,
  popups,
  changeStatus,
  filters,
  setFilters,
  isExpired,
} = popupsStore();

/********************************************************************* */
const { push } = useRouter();
const menuOptions = ref([
  { key: "1", label: "ລາຍລະອຽດ" },
  { key: "2", label: "ແກ້ໄຂ" },
  { key: "3", label: "ລຶບ" },
]);
const Loading = ref(false);

// ตัวเลือกสำหรับ InputSelect
const statusOptions = [
  { value: "", label: "ເລືອກສະຖານະ" },
  { value: "0", label: "ສະແດງຢູ່" },
  { value: "1", label: "ບໍ່ໄດ້ໃຊ້ງານ" },
];

const visibilityOptions = [
  { value: "", label: "ການເຜີຍແຜ່" },
  { value: "0", label: "ສາທາລະນະ" },
  { value: "1", label: "ສ່ວນຕົວ" },
];

// สำหรับเก็บค่าจาก InputSelect ชั่วคราว
const visibilityFilter = ref(filters.visibility);
const statusFilter = ref(filters.status);

// ติดตามการเปลี่ยนแปลงของตัวกรองและอัปเดต store
watch(visibilityFilter, (newValue) => {
  setFilters({ visibility: newValue });
  getAllPopups(0, 10, newValue, statusFilter.value);
});

watch(statusFilter, (newValue) => {
  setFilters({ status: newValue });
  getAllPopups(0, 10, visibilityFilter.value, newValue);
});

/********************************************************************* */
const toggleStatus = async (record: any, value: boolean) => {
  console.log("Current record:", record.is_private);
  console.log("New value from switch:", value);
  console.log("Value to be sent to API:", !value);
  try {
    Loading.value = true;
    await changeStatus(record.id, value);
  } catch (error) {
    console.error("❌ Failed to update status:", error);
  } finally {
    Loading.value = false;
  }
};
/********************************************************************* */

const handleSelect = (key: string, record: any) => {
  if (key === "1") {
    push({ name: "popups_details", params: { id: record.id } });
  }
  if (key === "2") {
    push({ name: "popups_edit", params: { id: record.id } });
  } else if (key === "3") {
    Modal.confirm({
      title: "ຢືນຢັນການລົບ",
      content: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບລາຍການນີ້??",
      okText: "ແມ່ນແລ້ວ,ຂ້ອຍແນ່ໃຈ",
      cancelText: "ບໍ່,ຍົກເລີກ",
      okType: "danger",
      onOk: async () => {
        try {
          Loading.value = true;
          await deletePopup(record.id);
          alert("ລົບຂໍ້ມູນສຳເລັດ");
        } catch (err) {
          console.error("Error:", err);
        } finally {
          Loading.value = false;
        }
      },
    });
  }
};

// เพิ่มฟังก์ชันไปยังหน้าสร้างใหม่
const handleAddNew = () => {
  push({ name: "popups_add" });
};

/********************************************************************* */

onMounted(async () => {
  try {
    // โหลดข้อมูลเริ่มต้นโดยใช้ตัวกรองที่มีอยู่
    await getAllPopups(0, 10, visibilityFilter.value, statusFilter.value);
  } catch (error) {
    console.error("Failed to load banners:", error);
  }
});
/********************************************************************* */
</script>

<template>
  <LoadingSpinner
    v-if="isLoading"
    class="absolute inset-0 flex items-center justify-center z-10"
  />

  <div
    class="flex flex-col items-start justify-between border-b dark:border-gray-600 p-4 sm:flex-row sm:items-center"
  >
    <h2 class="text-lg font-semibold mb-2 sm:mb-0 dark:text-white">
      ຕາຕະລາງເກັບຮັກສາຂໍ້ມູນກ່ຽວກັບປ໊ອບອັບ
    </h2>

    <div
      class="flex items-center justify-end flex-col sm:flex-row gap-2 w-full sm:w-fit"
    >
      <!-- ການເຜີຍແຜ່ InputSelect -->
      <InputSelect
        v-model="visibilityFilter"
        :options="visibilityOptions"
        size="large"
      />

      <!-- ເລືອກສະຖານະ InputSelect -->
      <InputSelect
        v-model="statusFilter"
        :options="statusOptions"
        size="large"
      />

      <UiButton
        type="primary"
        size="large"
        colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center"
        icon="ant-design:plus-outlined"
        @click="handleAddNew"
        >ເພີ່ມຂໍ້ມູນ</UiButton
      >
    </div>
  </div>

  <div class="relative">
    <Table
      :columns="columns"
      :dataSource="popups.data || []"
      class="dark:bg-gray-800 dark:text-white dark:border-gray-700"
    >
      <template #image="{ record }">
        <img
          :src="getImageUrl(record.image)"
          alt="Country"
          style="max-width: 160px; max-height: 120px; width: auto; height: auto"
        />
      </template>
      <template #link="{ record }">
        <a
          :href="record.link"
          target="_blank"
          class="text-primary-500 hover:text-primary-700 hover:underline"
          >{{ record.link }}</a
        >
      </template>
      <template #start_date_end_date="{ record }">
        <span
          v-if="isExpired(record.end_time)"
          class="text-nowrap bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300"
        >
          ບໍ່ໄດ້ໃຊ້ງານ
        </span>
        <span
          v-else
          class="text-nowrap bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300"
        >
          ດຳເນີນການຢູ່
        </span>
      </template>
      <template #is_private="{ record }">
        <Switch
          :model-value="record.is_private ?? false"
          @update:model-value="(value) => toggleStatus(record, value)"
          :loading="Loading"
        />
      </template>
      <template #created_at="{ record }">
        <span>{{ formatDateTime(record.created_at) }}</span>
      </template>
      <template #updated_at="{ record }">
        <span>{{ formatDateTime(record.updated_at) }}</span>
      </template>

      <template #action="{ record }">
        <Dropdown
          :options="menuOptions"
          @select="(key) => handleSelect(key, record)"
        >
          <UibuttonDropdown
            type="primary"
            size="small"
            colorClass="!bg-white text-gray-900 flex items-center hover:!bg-gray-200 hover:!text-gray-900 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white"
            icon="ic:baseline-more-horiz"
          ></UibuttonDropdown>
        </Dropdown>
      </template>
    </Table>
  </div>
</template>
<style></style>
