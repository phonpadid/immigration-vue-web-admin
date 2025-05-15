<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { columns } from "../interface/column";
import { usefeedbackStore } from "../store/feedback.store";
import { useRouter } from "vue-router";
import { Modal } from "ant-design-vue";
import Switch from "@/components/Switch/Switch.vue";
import InputSelect from "@/components/Input/InputSelect.vue";
import Table from "@/components/table/Table.vue";
import UiButton from "@/components/button/UiButton.vue";
import UibuttonDropdown from "@/components/button/UibuttonDropdown.vue";
import Dropdown from "@/components/Dropdown/Dropdown.vue";
import LoadingSpinner from "@/components/loading/LoadingSpinner.vue";

/********************************************************************* */

const {
  getAllfeedback,
  feedback,
  isLoading,
  deleteFeedback,
  changeStatusFeedback,
} = usefeedbackStore();
/********************************************************************* */
const { push } = useRouter();
const menuOptions = ref([
  { key: "1", label: "ລາຍລະອຽດ" },
  { key: "2", label: "ລຶບ" },
]);
const Loading = ref(false);

/********************************************************************* */

const selectedValue = ref("");
const options = [
  { value: "", label: "ການເຜີຍແຜ່" },
  { value: "1", label: "ສາທາລະນະ" },
  { value: "0", label: "ສ່ວນຕົວ" },
];
/********************************************************************* */

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
          Loading.value = true;
          await deleteFeedback(record.id);
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
/********************************************************************* */

const handlePublishChange = async (value: boolean, record: any) => {
  try {
    await changeStatusFeedback(record.id, value);
  } catch (error) {
    console.error("Failed to update publish status:", error);
    // Revert the UI if update failed
    record.is_published = !value;
  }
};

/********************************************************************* */

onMounted(async () => {
  try {
    await getAllfeedback();
  } catch (error) {
    console.error("Failed to load feedback:", error);
  }
});
/********************************************************************* */

watch(selectedValue, async (newValue) => {
  try {
    await getAllfeedback(0, 10, newValue);
  } catch (error) {
    console.error("Failed to filter feedback:", error);
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
