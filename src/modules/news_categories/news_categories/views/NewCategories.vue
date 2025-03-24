<script setup lang="ts">
import { onMounted, ref } from "vue";
import { columns } from "../interface/column";
import { useNewscategoriesStore } from "../store/new.categories.store";
import { useRouter } from "vue-router";
import { formatDateTime } from "@/utils/FormatDataTime";
import { Modal } from "ant-design-vue";
import Table from "@/components/table/Table.vue";
import UiButton from "@/components/button/UiButton.vue";
import Dropdown from "@/components/Dropdown/Dropdown.vue";
import LoadingSpinner from "@/components/loading/LoadingSpinner.vue";

/********************************************************************************* */
const { getAllNewsCategories, newsCategories, isLoading, deleteCategories } =
  useNewscategoriesStore();
const { push } = useRouter();
const menuOptions = ref([
  { key: "1", label: "ແກ້ໄຂ" },
  { key: "2", label: "ລຶບ" },
]);
const Loading = ref(false);
const addNewsCategoires = () => {
  push({ name: "newsCategoriess_add" });
};
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
  //   console.log("Selected:", key, "for record:", record);
  if (key === "1") {
    // View details
    push({ name: "newsCategoriess_edit", params: { id: record.id } });
  } else if (key === "2") {
    Modal.confirm({
      title: "ຢືນຢັນການລົບ",
      content: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບລາຍການນີ້??",
      okText: "ແມ່ນແລ້ວ,ຂ້ອຍແນ່ໃຈ",
      cancelText: "ບໍ່,ຍົກເລີກ",
      okType: "danger",
      onOk: async () => {
        try {
          Loading.value = true;
          await deleteCategories(record.id);
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

/********************************************************************************* */

onMounted(async () => {
  try {
    await getAllNewsCategories();
  } catch (error) {
    console.error("Failed to load laws:", error);
  }
});
</script>

<template>
  <LoadingSpinner
    v-if="isLoading"
    class="absolute inset-0 flex items-center justify-center z-10"
  />

  <div
    class="flex flex-col items-start justify-between p-4 sm:flex-row sm:items-center mt-4"
  >
    <h2 class="text-lg font-semibold mb-2 sm:mb-0 dark:text-white">
      ຕາຕະລາງປະເພດຂ່າວ
    </h2>
    <UiButton
      type="primary"
      size="large"
      colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center"
      icon="ant-design:plus-outlined"
      @click="addNewsCategoires"
      >ເພີ່ມຂໍ້ມູນ</UiButton
    >
  </div>

  <div class="relative">
    <Table
      :columns="columns"
      :dataSource="newsCategories.data || []"
      class="dark:bg-gray-800 dark:text-white dark:border-gray-700"
    >
      <!-- เพิ่ม template สำหรับแสดงชื่อในแต่ละภาษา -->
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
<style></style>
