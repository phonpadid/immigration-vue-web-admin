<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { columns } from "../interface/column";
import { usefeedbackStore } from "../store/feedback.store";
import { useRouter } from "vue-router";
import { Modal } from "ant-design-vue";
import Switch from "@/components/Switch/Switch.vue";
import InputSelect from "@/components/Input/InputSelect.vue";
import Table from "@/components/table/Table.vue";
import UibuttonDropdown from "@/components/button/UibuttonDropdown.vue";
import Dropdown from "@/components/Dropdown/Dropdown.vue";
import LoadingSpinner from "@/components/loading/LoadingSpinner.vue";

/********************************************************************* */
const { getAllfeedback, feedback, deleteFeedback, changeStatusFeedback } =
  usefeedbackStore();

// const isLoading = ref(false);
/********************************************************************* */
const { push } = useRouter();
const menuOptions = ref([
  { key: "1", label: "ລາຍລະອຽດ" },
  { key: "2", label: "ລຶບ" },
]);

// ลบ const Loading = ref(false); ออกไป

// เพิ่มตัวแปรสำหรับ Pagination
const currentPage = ref(1);
const pageSize = ref(10);
const totalItems = ref(0);

/********************************************************************* */
const selectedValue = ref("");
const options = [
  { value: "", label: "ການເຜີຍແຜ່" },
  { value: "1", label: "ສາທາລະນະ" },
  { value: "0", label: "ສ່ວນຕົວ" },
];

/********************************************************************* */
// สร้างฟังก์ชันหลักสำหรับโหลดข้อมูล โดยรับ offset และ limit
const fetchData = async (
  offset: number,
  limit: number,
  isPublished?: string
) => {
  try {
    // ไม่ต้องใช้ Loading.value = true/false; แล้ว เพราะ Pinia store จัดการให้
    await getAllfeedback(offset, limit, isPublished);
    // อัปเดตค่า totalItems จาก store
    totalItems.value = feedback.total;
  } catch (error) {
    console.error("Failed to fetch feedback:", error);
  }
};

/********************************************************************* */
const handleTableChange = (pagination: any) => {
  currentPage.value = pagination.current;
  pageSize.value = pagination.pageSize;
  const offset = (currentPage.value - 1) * pageSize.value;
  fetchData(offset, pageSize.value, selectedValue.value);
};

const handleSelect = (key: string, record: any) => {
  if (key === "1") {
    push({ name: "feedbacks_details", params: { id: record.id } });
  } else if (key === "2") {
    Modal.confirm({
      title: "ຢືນຢັນການລົບ",
      content: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບລາຍການນີ້??",
      okText: "ແມ່ນແລ້ວ,ຂ້ອຍແນ່ໃຈ",
      cancelText: "ບໍ່,ຍົກເລີກ",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteFeedback(record.id);
          alert("ລົບຂໍ້ມູນສຳເລັດ");
        } catch (err) {
          console.error("Error:", err);
        }
      },
    });
  }
};

/********************************************************************* */
const handlePublishChange = async (value: boolean, record: any) => {
  try {
    await changeStatusFeedback(record.id, value);
  } catch (error) {
    console.error("Failed to update publish status:", error);
    record.is_published = !value;
  }
};

/********************************************************************* */
onMounted(async () => {
  fetchData(0, pageSize.value, selectedValue.value);
});

/********************************************************************* */
watch(selectedValue, async (newValue) => {
  currentPage.value = 1; // เมื่อเปลี่ยน filter ให้กลับไปหน้าแรก
  fetchData(0, pageSize.value, newValue);
});
</script>

<template>
  <!-- <LoadingSpinner
    v-if="isLoading"
    class="absolute inset-0 flex items-center justify-center z-10"
  /> -->

  <div
    class="flex flex-col items-start justify-between p-4 sm:flex-row sm:items-center mt-4"
  >
    <h2 class="text-lg font-semibold mb-2 sm:mb-0 dark:text-white">
      ຕາຕະລາງລາຍລະອຽດຄຳຕິຊົມ
    </h2>
    <InputSelect
      v-model:value="selectedValue"
      :options="options"
      placeholder="ເລືອກສະຖານະ"
      size="large"
      width="130px"
    />
  </div>

  <div class="relative">
    <Table
      :columns="columns"
      :dataSource="feedback.data || []"
      :pagination="{
        current: currentPage,
        pageSize: pageSize,
        total: totalItems,
      }"
      @change="handleTableChange"
      class="dark:bg-gray-800 dark:text-white dark:border-gray-700"
    >
      <template #is_published="{ record }">
        <div class="flex items-center gap-2">
          <Switch
            v-model="record.is_published"
            @update:modelValue="
              (checked) => handlePublishChange(checked, record)
            "
          />
        </div>
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
