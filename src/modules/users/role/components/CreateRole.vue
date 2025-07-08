<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { rules } from "../validation/role.validation";
import { usePermissionStore } from "../../permission/store/permission.store";
import type { PermissionResponse } from "../../permission/interface/permission.interface";
import { useRolesStore } from "../store/role.store";
import type { RoleFrom } from "../interface/role.interface";
import { useRouter } from "vue-router";
import UiInput from "@/components/Input/UiInput.vue";
import Textarea from "@/components/Input/Textarea.vue";
import CheckboxGroup from "@/components/Input/CheckboxGroup.vue";
import UiForm from "@/components/Form/UiForm.vue";
import UiFormItem from "@/components/Form/UiFormItem.vue";
import LoadingSpinner from "@/components/loading/LoadingSpinner.vue";

// Access store for permissions
const permissionStore = usePermissionStore();
const roleStore = useRolesStore();
const isLoading = ref(true);
const formRef = ref();
const { push } = useRouter();

const formState = reactive<RoleFrom>({
  id: 0,
  name: "",
  description: "",
  permission_ids: [] as number[],
});

const handleSubmit = async () => {
  if (formRef.value) {
    try {
      const validationResult = await formRef.value.submitForm();

      if (!validationResult) {
        console.log("Validation failed, please check your inputs");
        return;
      }
      isLoading.value = true;

      if (!Array.isArray(formState.permission_ids)) {
        console.error(
          "permissions_ids is not an array",
          formState.permission_ids
        );
        return;
      }

      const permissionIds = formState.permission_ids.map((id) => Number(id));

      await roleStore.createRole({
        ...formState,
        permission_ids: permissionIds,
      });
      push({ name: "roles" });
    } catch (error) {
      console.error("Error creating role:", error);
    } finally {
      isLoading.value = false;
    }
  }
};

const loadPermissions = async () => {
  try {
    isLoading.value = true;

    // Check if permissions exist in store
    if (
      !permissionStore.permissions ||
      permissionStore.permissions.length === 0
    ) {
      await permissionStore.getPermission(); // Fetch permission data
    }
  } catch (error) {
    console.error("Failed to load permissions:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await loadPermissions();
});

// Save form state to localStorage whenever it changes
watch(
  formState,
  (newValue) => {
    localStorage.setItem("roleFormState", JSON.stringify(newValue));
  },
  { deep: true }
);

// Group permissions by group_name
const groupedPermissions = computed(() => {
  const groups: Record<string, PermissionResponse[]> = {};
  const permissions = permissionStore.permissions || [];

  // Check if permissions array exists and has items
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
    ເພີ່ມບົດບາດໃຫມ່
  </h2>

  <div class="grid gap-4 mb-4">
    <UiForm
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
        <LoadingSpinner v-if="isLoading" class="h-[50vh]" />
        <a-form-item-rest>
          <CheckboxGroup
            :options="
              Object.entries(groupedPermissions).flatMap(
                ([groupName, permissions]) =>
                  permissions.map((p) => ({
                    label: p.name,
                    value: p.id,
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
        >
          ເພີ່ມບົດບາດ
        </button>
      </div>
    </UiForm>
  </div>
</template>
