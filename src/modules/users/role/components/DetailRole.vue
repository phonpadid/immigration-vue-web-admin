<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useRolesStore } from "../store/role.store";
import type { RoleResponse } from "../interface/role.interface";
import { getBadgeColor } from "@/utils/BadgeColor";
import UiButton from "@/components/button/UiButton.vue";
import LoadingSpinner from "@/components/loading/LoadingSpinner.vue";

const { push } = useRouter();
const route = useRoute();
const roleStore = useRolesStore();
const roleId = Number(route.params.id);

// Data references
const isLoading = ref(true);
const roleData = ref<RoleResponse>();

// Fetch role data
const fetchRoleData = async () => {
  try {
    isLoading.value = true;
    const data = await roleStore.getRoleById(roleId);

    if (data) {
      roleData.value = data;
    }
  } catch (error) {
    console.error("Failed to load role data:", error);
  } finally {
    isLoading.value = false;
  }
};

// Navigate to edit page
const editRole = () => {
  push({ name: "roles_edit", params: { id: roleId } });
};

onMounted(() => {
  fetchRoleData();
});
</script>

<template>
  <div v-if="isLoading" class="flex justify-center items-center h-[50vh]">
    <LoadingSpinner />
  </div>

  <div v-else-if="roleData">
    <div class="px-4 grid gap-4 grid-cols-1 sm:grid-cols-2 sm:gap-6">
      <dl>
        <dt
          class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
        >
          ຊື່
        </dt>
        <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
          {{ roleData.name }}
        </dd>

        <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
          ຄຳອະທິບາຍ
        </dt>
        <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
          {{ roleData.description || "ບໍ່ມີຄຳອະທິບາຍ" }}
        </dd>

        <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
          ເພີ່ມເມື່ອ
        </dt>
        <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
          {{ roleData.created_at }}
        </dd>

        <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
          ອັບເດດລ່າສຸດເມື່ອ
        </dt>
        <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
          {{ roleData.updated_at }}
        </dd>
      </dl>

      <dl>
        <dt
          class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
        >
          ການອະນຸຍາດ
        </dt>
        <dd class="flex gap-x-1 gap-y-2 flex-wrap">
          <span v-for="permission in roleData.permissions" :key="permission.id">
            <a-tag :class="getBadgeColor(permission.name)">
              <span class="font-medium text-gray-300 dark:text-white">
                {{ permission.name }}
              </span>
            </a-tag>
          </span>
          <span
            v-if="!roleData.permissions || roleData.permissions.length === 0"
            class="text-gray-500 dark:text-gray-400"
          >
            ບໍ່ມີການອະນຸຍາດ
          </span>
        </dd>
      </dl>
    </div>

    <div class="p-4 flex items-center gap-4">
      <UiButton
        type="primary"
        size="large"
        colorClass="!bg-primary-700 hover:!bg-primary-900 text-white"
        icon="material-symbols-light:edit-square"
        class="flex items-center"
        @click="editRole"
      >
        ແກ້ໄຂ
      </UiButton>

      <UiButton
        type="primary"
        size="large"
        colorClass="!bg-red-700 hover:!bg-red-900 text-white"
        icon="material-symbols-light:delete"
        class="flex items-center"
      >
        ລືບ
      </UiButton>
    </div>
  </div>
  <div v-else class="p-4 text-center text-gray-500 dark:text-gray-400">
    ບໍ່ພົບຂໍ້ມູນບົດບາດ
  </div>
</template>
