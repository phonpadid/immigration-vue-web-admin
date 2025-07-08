<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { columns } from "../interface/column";
import { useCheckpointProvinceStore } from "../store/province.store";
import { useRouter } from "vue-router";
import { formatDateTime } from "@/utils/FormatDataTime";
import { Modal } from "ant-design-vue";
import Table from "@/components/table/Table.vue";
import UiButton from "@/components/button/UiButton.vue";
import UibuttonDropdown from "@/components/button/UibuttonDropdown.vue";
import Dropdown from "@/components/Dropdown/Dropdown.vue";
import LoadingSpinner from "@/components/loading/LoadingSpinner.vue";

/********************************************************************************* */
const {
  getAllCheckpointProvine,
  checkpointProvince,
  isLoading,
  deleteCheckpointProvinces,
} = useCheckpointProvinceStore();
const { push } = useRouter();
const menuOptions = ref([
  { key: "1", label: "ລາຍລະອຽດ" },
  { key: "2", label: "ແກ້ໄຂ" },
  { key: "3", label: "ລຶບ" },
]);
const localLoading = ref(false);
const addCheckpointProvince = () => {
  push({ name: "provinces_add" });
};

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["10", "20", "50", "100"],
  showTotal: (total: number) => `ທັງໝົດ ${total} ລາຍການ`,
});

/********************************************************************************* */
const getCategoryNameByLang = (record: any, lang: string) => {
  if (!record.translates || !Array.isArray(record.translates)) {
    return "";
  }

  const translate = record.translates.find((t: any) => t.lang === lang);
  return translate ? translate.name : "";
};
/********************************************************************************** */
// lo
const getLaoName = (record: any) => {
  return getCategoryNameByLang(record, "lo");
};

// en
const getEnglishName = (record: any) => {
  return getCategoryNameByLang(record, "en");
};

// zh_cn
const getChineseName = (record: any) => {
  return getCategoryNameByLang(record, "zh_cn");
};
/********************************************************************************** */

const handleSelect = (key: string, record: any) => {
  if (key === "1") {
    // View details
    push({ name: "provinces_details", params: { id: record.id } });
  } else if (key === "2") {
    // Edit
    push({ name: "provinces_edit", params: { id: record.id } });
  } else if (key === "3") {
    // Delete with confirmation
    Modal.confirm({
      title: "ຢືນຢັນການລົບ",
      content: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບລາຍການນີ້??",
      okText: "ແມ່ນແລ້ວ,ຂ້ອຍແນ່ໃຈ",
      cancelText: "ບໍ່,ຍົກເລີກ",
      okType: "danger",
      onOk: async () => {
        try {
          localLoading.value = true;
          await deleteCheckpointProvinces(
            record.id,
            pagination.current,
            pagination.pageSize
          );
          Modal.success({
            title: "ສຳເລັດ",
            content: "ລົບຂໍ້ມູນສຳເລັດ",
          });
        } catch (err) {
          console.error("Error:", err);
          Modal.error({
            title: "ຜິດພາດ",
            content: "ເກີດຂໍ້ຜິດພາດໃນການລົບຂໍ້ມູນ",
          });
        } finally {
          localLoading.value = false;
        }
      },
    });
  }
};

/********************************************************************************* */

const loadCheckpointProvinces = async () => {
  try {
    await getAllCheckpointProvine(pagination.current, pagination.pageSize);
    pagination.total = checkpointProvince.total;
  } catch (error) {
    console.error("Failed to load provinces:", error);
    Modal.error({
      title: "ຜິດພາດ",
      content: "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນແຂວງໄດ້",
    });
  }
};

// จัดการกับการเปลี่ยนแปลงของตาราง รวมถึง pagination
const handleTableChange = (pag: any, filters: any, sorter: any) => {
  // อัพเดต pagination state
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;

  // โหลดข้อมูลใหม่ตามค่า pagination ที่เปลี่ยนไป
  loadCheckpointProvinces();
};

/********************************************************************************* */

onMounted(() => {
  loadCheckpointProvinces();
});
</script>

<template>
  <LoadingSpinner
    v-if="isLoading || localLoading"
    class="absolute inset-0 flex items-center justify-center z-10"
  />

  <div
    class="flex flex-col items-start justify-between p-4 sm:flex-row sm:items-center mt-4"
  >
    <h2 class="text-lg font-semibold mb-2 sm:mb-0 dark:text-white">
      ຕາຕະລາງແຂວງ
    </h2>
    <UiButton
      type="primary"
      size="large"
      colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center"
      icon="ant-design:plus-outlined"
      @click="addCheckpointProvince"
      >ເພີ່ມຂໍ້ມູນ</UiButton
    >
  </div>

  <div class="relative">
    <Table
      :columns="columns"
      :dataSource="checkpointProvince.data || []"
      :pagination="pagination"
      :loading="isLoading"
      class="dark:bg-gray-800 dark:text-white dark:border-gray-700"
      @change="handleTableChange"
    >
      <template #name_lo="{ record }">
        {{ getLaoName(record) }}
      </template>
      <template #name_en="{ record }">
        {{ getEnglishName(record) }}
      </template>
      <template #name_zh_cn="{ record }">
        {{ getChineseName(record) }}
      </template>
      <template #created_at="{ record }">
        {{ formatDateTime(record.created_at) }}
      </template>
      <template #updated_at="{ record }">
        {{ formatDateTime(record.updated_at) }}
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
