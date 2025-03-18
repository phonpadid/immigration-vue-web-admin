<script setup lang="ts">
import { onMounted, ref } from "vue";
import { columns } from "../interface/columns";
import { useRolesStore } from "../store/role.store";
import { useRouter } from "vue-router";
import Table from "@/components/table/Table.vue";
import UiButton from "@/components/button/UiButton.vue";
import Dropdown from "@/components/Dropdown/Dropdown.vue";
import LoadingSpinner from "@/components/loading/LoadingSpinner.vue";

const { getAllRole, roles, isLoading } = useRolesStore();
const { push } = useRouter();

const menuOptions = ref([
  { key: "1", label: "ລາຍລະອຽດ" },
  { key: "2", label: "ແກ້ໄຂ" },
  { key: "3", label: "ລຶບ" },
]);

const addRole = () => {
  push({ name: "roles_add" });
};

const handleSelect = (key: string, record: any) => {
  console.log("Selected:", key, "for record:", record);
  // Add logic to handle different actions based on key
  if (key === "1") {
    // View details
    push({ name: "roles_deatils", params: { id: record.id } });
  } else if (key === "2") {
    // Edit
    push({ name: "roles_edit", params: { id: record.id } });
  } else if (key === "3") {
    // Delete - perhaps show confirmation dialog
    // Implement delete logic
  }
};

onMounted(async () => {
  try {
    await getAllRole();
  } catch (error) {
    console.error("Failed to load roles:", error);
    // Add error handling here
  }
});
</script>

<template>
  <div
    class="flex flex-col items-start justify-between p-4 sm:flex-row sm:items-center mt-4"
  >
    <h2 class="text-lg font-semibold mb-2 sm:mb-0 dark:text-white">
      ບົດບາດທັງຫມົດ
    </h2>
    <UiButton
      type="primary"
      size="large"
      colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center"
      icon="ant-design:plus-outlined"
      @click="addRole"
      >ເພີ່ມບົດບາດ</UiButton
    >
  </div>

  <div class="relative">
    <LoadingSpinner
      v-if="isLoading"
      class="absolute inset-0 flex items-center justify-center z-10"
    />
    <Table
      :columns="columns"
      :dataSource="roles.data || []"
      :loading="isLoading"
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
