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
const errorMessage = ref("");

const formState = reactive<RoleFrom>({
  id: 0,
  name: "",
  description: "",
  permission_ids: [] as number[],
});

const handleSubmit = async () => {
  errorMessage.value = "";

  if (!formRef.value) {
    errorMessage.value = "ระบบฟอร์มยังไม่พร้อมใช้งาน โปรดลองใหม่อีกครั้ง";
    return;
  }

  try {
    // เพิ่ม debug message
    // console.log("Starting form submission");
    formRef.value.logFormState();

    // ตั้งค่า loading
    isLoading.value = true;

    // ใช้ข้อมูลจาก formState โดยตรงแทนการใช้ validated values
    // เนื่องจาก Ant Design Vue อาจมีปัญหากับ outOfDate validation
    const roleData = {
      id: formState.id || 0,
      name: formState.name,
      description: formState.description,
      permission_ids: Array.isArray(formState.permission_ids)
        ? formState.permission_ids.map((id) => Number(id))
        : [],
    };

    // ทำการตรวจสอบ validation ด้วยตนเอง (manual validation)
    if (!roleData.name || roleData.name.trim() === "") {
      errorMessage.value = "กรุณากรอกชื่อบทบาท";
      isLoading.value = false;
      return;
    }

    if (roleData.permission_ids.length === 0) {
      errorMessage.value = "กรุณาเลือกการอนุญาตอย่างน้อยหนึ่งรายการ";
      isLoading.value = false;
      return;
    }

    // console.log("Manual validation passed, sending data to API:", roleData);

    // ส่งข้อมูลไปยัง API
    await roleStore.createRole(roleData);

    localStorage.removeItem("roleFormState");

    // นำทางไปยังหน้ารายการบทบาท
    console.log("Submission successful, navigating to roles page");
    push({ name: "roles" });
  } catch (error) {
    console.error("Error in form submission process:", error);
    errorMessage.value = "เกิดข้อผิดพลาดในการสร้างบทบาท กรุณาลองอีกครั้ง";
  } finally {
    isLoading.value = false;
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

  // Try to load saved form state from localStorage if exists
  const savedFormState = localStorage.getItem("roleFormState");
  if (savedFormState) {
    try {
      const parsedState = JSON.parse(savedFormState);
      Object.assign(formState, parsedState);
    } catch (e) {
      console.error("Failed to parse saved form state:", e);
    }
  }
});

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
  <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white">
    ເພີ່ມບົດບາດໃຫມ່
  </h2>

  <div
    v-if="errorMessage"
    class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800"
  >
    {{ errorMessage }}
  </div>

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
        <a-form-item-rest v-else>
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
          :disabled="isLoading"
        >
          {{ isLoading ? "ກຳລັງປະມວນຜົນ..." : "ເພີ່ມບົດບາດ" }}
        </button>
      </div>
    </UiForm>
  </div>
</template>
