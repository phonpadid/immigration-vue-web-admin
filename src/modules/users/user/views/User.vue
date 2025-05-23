<script setup lang="ts">
import { onMounted, ref } from "vue";
import { columns } from "../interface/column";
import { useUserStore } from "../store/user.store";
import { useRouter } from "vue-router";
import { formatDateTime } from "@/utils/FormatDataTime";
import { getImageUrl } from "@/utils/ConfigPathImage";
import { Icon } from "@iconify/vue";
import Table from "@/components/table/Table.vue";
import UiButton from "@/components/button/UiButton.vue";
import UibuttonDropdown from "@/components/button/UibuttonDropdown.vue";
import Dropdown from "@/components/Dropdown/Dropdown.vue";
import LoadingSpinner from "@/components/loading/LoadingSpinner.vue";

const { getAlluser, user, isLoading, deleteUser } = useUserStore();
const { push } = useRouter();

const menuOptions = ref([
  { key: "1", label: "ລາຍລະອຽດ" },
  { key: "2", label: "ແກ້ໄຂ" },
  { key: "3", label: "ລຶບ" },
]);

const addUser = () => {
  push({ name: "users_add" });
};

const handleSelect = (key: string, record: any) => {
  console.log("Selected:", key, "for record:", record);
  // Add logic to handle different actions based on key
  if (key === "1") {
    // View details
    push({ name: "users_details", params: { id: record.id } });
  } else if (key === "2") {
    // Edit
    push({ name: "users_edit", params: { id: record.id } });
  } else if (key === "3") {
    // Delete - perhaps show confirmation dialog
    const confirmDelete = confirm("Are you sure you want to delete this user?");
    if (confirmDelete) {
      deleteUser(record.id); // Call deleteUser with the id of the user to delete
    }
  }
};

onMounted(async () => {
  try {
    await getAlluser();
  } catch (error) {
    console.error("Failed to load users:", error);
    // Add error handling here
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
      ຜູ້ໃຊ້ທັງຫມົດ
    </h2>
    <UiButton
      type="primary"
      size="large"
      colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center"
      icon="ant-design:plus-outlined"
      @click="addUser"
      >ເພີ່ມຜູ້ໃຊ້</UiButton
    >
  </div>

  <div class="relative">
    <Table
      :columns="columns"
      :dataSource="user.data || []"
      class="dark:bg-gray-800 dark:text-white dark:border-gray-700"
    >
      <template #profile="{ record }">
        <div class="flex items-center space-x-3">
          <a-avatar
            v-if="record.profile && record.profile.image"
            :src="getImageUrl(record.profile.image)"
            alt="Avatar"
          />
          <a-avatar v-else class="bg-gray-300">
            <Icon icon="ic:baseline-person" class="text-gray-500 text-4xl" />
          </a-avatar>
          <span>
            {{ record.profile ? record.profile.first_name : "N/A" }}
            {{ record.profile ? record.profile.last_name : "" }}
          </span>
        </div>
      </template>

      <template #created_at="{ record }">
        {{ formatDateTime(record.created_at) }}
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
