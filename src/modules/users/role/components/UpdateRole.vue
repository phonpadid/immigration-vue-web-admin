<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { rules } from "../validation/role.validation";
import { usePermissionStore } from "../../permission/store/permission.store";
import type { PermissionResponse } from "../../permission/interface/permission.interface";
import { useRolesStore } from "../store/role.store";
import type { RoleFrom } from "../interface/role.interface";
import { useRouter, useRoute } from "vue-router";
import UiInput from "@/components/Input/UiInput.vue";
import Textarea from "@/components/Input/Textarea.vue";
import CheckboxGroup from "@/components/Input/CheckboxGroup.vue";
import UiForm from "@/components/Form/UiForm.vue";
import UiFormItem from "@/components/Form/UiFormItem.vue";
import LoadingSpinner from "@/components/loading/LoadingSpinner.vue";

const permissionStore = usePermissionStore();
const roleStore = useRolesStore();
const isLoading = ref(true);
const formRef = ref<InstanceType<typeof UiForm>>();
const { push } = useRouter();
const route = useRoute();
const roleId = Number(route.params.id);

const formState = reactive<RoleFrom>({
  id: 0,
  name: "",
  description: "",
  permission_ids: [] as number[],
});

const loadRole = async () => {
  try {
    isLoading.value = true;

    // Load permissions
    await permissionStore.getPermission();

    // Load role data
    const roleData = await roleStore.getRoleById(roleId);
    console.log("Raw role data:", roleData);

    if (roleData) {
      formState.id = roleData.id;
      formState.name = roleData.name;
      formState.description = roleData.description;

      if (Array.isArray(roleData.permissions)) {
        formState.permission_ids = roleData.permissions.map((permission: any) =>
          Number(permission.id)
        );
      } else {
        formState.permission_ids = [];
      }
    }
  } catch (error) {
    console.error("Failed to load role:", error);
  } finally {
    isLoading.value = false;
  }
};

const handleSubmit = async () => {
  try {
    if (!formRef.value) {
      console.error("Form reference is missing");
      return;
    }
    isLoading.value = true;

    const result = await formRef.value.submitForm();
    if (result) {
      const updateResponse = await roleStore.updateRole(roleId, {
        name: formState.name,
        description: formState.description,
        permission_ids: formState.permission_ids,
      });

      push({ name: "roles" });
    }
  } catch (error) {
    console.error("Error updating role:", error);
  } finally {
    isLoading.value = false;
  }
};
onMounted(async () => {
  await loadRole();
});

watch(
  () => route.params.id,
  async (newId, oldId) => {
    if (newId !== oldId) {
      await loadRole();
    }
  }
);

const groupedPermissions = computed(() => {
  const groups: Record<string, PermissionResponse[]> = {};
  const permissions = permissionStore.permissions || [];

  if (permissions.length > 0) {
    permissions.forEach((permission) => {
      const groupName = permission.group_name || "Other";
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(permission);
    });
  }
  return groups;
});
</script>

<template>
  <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white mt-10">
    ອັບເດດບົດບາດ
  </h2>

  <div class="grid gap-4 mb-4">
    <LoadingSpinner v-if="isLoading" class="h-[50vh]" />
    <UiForm
      v-else
      ref="formRef"
      :rules="rules"
      :model="formState"
      @submit="handleSubmit"
    >
      <UiFormItem label="ຊື່" name="name">
        <UiInput
          v-model="formState.name"
          placeholder="ຊື່"
          allowClear
          size="large"
        />
      </UiFormItem>

      <UiFormItem label="ຄຳອະທິບາຍ" name="description">
        <Textarea
          v-model="formState.description"
          placeholder="ຂຽນຄຳອະທິບາຍ..."
        />
      </UiFormItem>

      <UiFormItem label="ການອະນຸຍາດ" name="permission_ids">
        <a-form-item-rest>
          <CheckboxGroup
            :options="
              Object.entries(groupedPermissions).flatMap(
                ([groupName, permissions]) =>
                  permissions.map((p) => ({
                    label: p.name,
                    value: Number(p.id),
                    group: groupName,
                  }))
              )
            "
            groupBy="group"
            v-model="formState.permission_ids"
          />
        </a-form-item-rest>
      </UiFormItem>

      <div class="mt-4">
        <button
          type="submit"
          class="px-4 py-2 bg-primary-700 text-white rounded hover:bg-primary-900"
          :disabled="isLoading"
          @click="handleSubmit"
        >
          ອັບເດດບົດບາດ
        </button>
      </div>
    </UiForm>
  </div>
</template>
