<script setup lang="ts">
import { onMounted, ref } from "vue";
import { columns } from "../interface/column";
import { useCountryStore } from "../store/country.store";
import { useRouter } from "vue-router";
import { formatDateTime } from "@/utils/FormatDataTime";
import { Modal } from "ant-design-vue";
import { getImageUrl } from "@/utils/ConfigPathImage";
import InputSelect from "@/components/Input/InputSelect.vue";

import Table from "@/components/table/Table.vue";
import UiButton from "@/components/button/UiButton.vue";
import Dropdown from "@/components/Dropdown/Dropdown.vue";
import LoadingSpinner from "@/components/loading/LoadingSpinner.vue";

/********************************************************************************* */
const { isLoading, getAllCountry, deleteCountry, country } = useCountryStore();
const { push } = useRouter();
const menuOptions = ref([
  { key: "1", label: "ລາຍລະອຽດ" },
  { key: "2", label: "ແກ້ໄຂ" },
  { key: "3", label: "ລຶບ" },
]);
const Loading = ref(false);
const addCountry = () => {
  push({ name: "countries_add" });
};

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
});
/********************************************************************* */

const selectedValue = ref("");
const options = [
  { value: "", label: "ເລືອກປະເທດທີຍົກເວັ້ນວິຊາ" },
  { value: "0", label: "ຕ້ອງການວິຊາ" },
  { value: "1", label: "ຍົກເວັ້ນວິຊາ" },
];
/********************************************************************* */

/********************************************************************************* */
const getCountryNameByLang = (record: any, lang: string) => {
  if (!record.translates || !Array.isArray(record.translates)) {
    return "";
  }

  const translate = record.translates.find((t: any) => t.lang === lang);
  return translate ? translate.name : "";
};
/********************************************************************************** */
// lo
const getLaoName = (record: any) => {
  return getCountryNameByLang(record, "lo");
};

/********************************************************************************** */

const handleSelect = (key: string, record: any) => {
  //   console.log("Selected:", key, "for record:", record);
  if (key === "1") {
    // View details
    push({ name: "countries_details", params: { id: record.id } });
  }
  if (key === "2") {
    // View details
    push({ name: "countries_edit", params: { id: record.id } });
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
          await deleteCountry(record.id);
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

const loadCountry = async () => {
  try {
    await getAllCountry(pagination.value.current, pagination.value.pageSize);
    pagination.value.total = country.total;
  } catch (error) {
    console.error("Failed to load:", error);
  }
};

const handleTableChange = (newPagination: any) => {
  pagination.value = { ...pagination.value, ...newPagination };
  loadCountry();
};
/********************************************************************************* */

onMounted(() => {
  loadCountry();
});
</script>

<template>
  <LoadingSpinner
    v-if="isLoading"
    class="absolute inset-0 flex items-center justify-center z-10"
  />
  <div
    class="flex flex-col items-start justify-between border-b dark:border-gray-600 p-4 sm:flex-row sm:items-center mt-4"
  >
    <h2 class="text-lg font-semibold mb-2 sm:mb-0 dark:text-white">
      ຕາຕະລາງເກັບຮັກສາຂໍ້ມູນປະເທດ
    </h2>

    <div
      class="flex items-center justify-end flex-col sm:flex-row gap-2 w-full sm:w-fit"
    >
      <InputSelect
        v-model:value="selectedValue"
        :options="options"
        placeholder="ເລືອກສະຖານະ"
        size="large"
        width="130px"
      />
      <UiButton
        type="primary"
        size="large"
        colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center"
        icon="ant-design:plus-outlined"
        @click="addCountry"
        >ເພີ່ມຂໍ້ມູນ</UiButton
      >
    </div>
  </div>
  <div class="relative">
    <Table
      :columns="columns"
      :dataSource="country.data || []"
      class="dark:bg-gray-800 dark:text-white dark:border-gray-700"
      v-model:pagination="pagination"
      @update:pagination="handleTableChange"
    >
      <template #name="{ record }">
        {{ getLaoName(record) }}
      </template>
      <template #image="{ record }">
        <img
          :src="getImageUrl(record.image)"
          alt="Country"
          class="w-32 h-full object-cover rounded-full"
        />
      </template>
      <template #is_except_visa="{ record }">
        <span class="flex items-center gap-2">
          <span
            class="w-3 h-3 rounded-full"
            :class="record.is_except_visa ? 'bg-green-500' : 'bg-red-500'"
          ></span>
          {{ record.is_except_visa ? "ຍົກເວັ້ນວິຊາ" : "ຕ້ອງການວິຊາ" }}
        </span>
      </template>

      <template #created_at="{ record }">
        {{ formatDateTime(record.created_at) }}
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
