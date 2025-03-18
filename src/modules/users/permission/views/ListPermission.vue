<script setup lang="ts">
import { computed, onMounted } from "vue";
import { usePermissionStore } from "../store/permission.store";
import { storeToRefs } from "pinia";
import { getBadgeColor } from "@/utils/BadgeColor";
import LoadingSpinner from "@/components/loading/LoadingSpinner.vue";

const permissionStore = usePermissionStore();
const { permissions, isLoading } = storeToRefs(permissionStore);
const { getPermission, loadPermissionsFromStorage } = permissionStore;

const groupedPermissions = computed(() => {
  if (!permissions.value || permissions.value.length === 0) return {};

  return permissions.value.reduce((acc, permission) => {
    if (!acc[permission.group_name]) {
      acc[permission.group_name] = [];
    }
    acc[permission.group_name].push(permission);
    return acc;
  }, {} as Record<string, typeof permissions.value>);
});

onMounted(() => {
  loadPermissionsFromStorage();
  getPermission();
});
</script>

<template>
  <div class="relative min-h-[90vh] p-4 mt-4">
    <h2 class="text-lg font-semibold mb-4 dark:text-white">ການອະນຸຍາດທັງໝົດ</h2>

    <LoadingSpinner v-if="isLoading" class="h-[80vh]" />

    <div
      v-else
      class="text-gray-500 list-decimal list-inside dark:text-gray-400 grid gap-4 sm:grid-cols-2 sm:gap-6"
    >
      <div
        v-for="(permissions, group) in groupedPermissions"
        :key="group"
        class="mb-6"
      >
        <h3 class="text-sm font-semibold text-gray-400 dark:text-white">
          {{ Object.keys(groupedPermissions).indexOf(group) + 1 }}.
          {{ group.toUpperCase() }}
        </h3>

        <ul class="mt-2 space-y-2">
          <li
            v-for="permission in permissions"
            :key="permission.id"
            class="flex items-center space-x-2"
          >
            <span class="text-gray-500 dark:text-gray-400">•</span>
            <a-tag :class="getBadgeColor(permission.name)">
              <span class="font-medium text-gray-300 dark:text-white">
                {{ permission.name }}
              </span>
            </a-tag>
            <span class="text-gray-600 dark:text-gray-300"
              >: {{ permission.description }}</span
            >
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
