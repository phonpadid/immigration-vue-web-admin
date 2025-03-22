<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { columns } from "../interface/column";
import { usecontactStore } from "../store/contacts.store";
import { useRouter } from "vue-router";
import { Modal } from "ant-design-vue";
import Table from "@/components/table/Table.vue";
import UiButton from "@/components/button/UiButton.vue";
import Dropdown from "@/components/Dropdown/Dropdown.vue";
import LoadingSpinner from "@/components/loading/LoadingSpinner.vue";

/********************************************************************* */

const { getAllContacts, deleteContacts, isLoading, contacts } =
  usecontactStore();
/********************************************************************* */
const { push } = useRouter();
const menuOptions = ref([
  { key: "1", label: "ລາຍລະອຽດ" },
  { key: "2", label: "ລຶບ" },
]);
const Loading = ref(false);

/********************************************************************* */
/********************************************************************* */

const handleSelect = (key: string, record: any) => {
  if (key === "1") {
    push({ name: "contacts_details", params: { id: record.id } });
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
          await deleteContacts(record.id);
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

onMounted(async () => {
  try {
    await getAllContacts();
  } catch (error) {
    console.error("Failed to load contacts:", error);
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
      ຕາຕະລາງຂໍ້ມູນຕິດຕໍ່
    </h2>
  </div>

  <div class="relative">
    <Table
      :columns="columns"
      :dataSource="contacts.data || []"
      class="dark:bg-gray-800 dark:text-white dark:border-gray-700"
    >
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
