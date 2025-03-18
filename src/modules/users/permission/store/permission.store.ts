import { defineStore } from "pinia";
import { ref } from "vue";
import { api } from "@/lib/axios";
import type { PermissionResponse } from "../interface/permission.interface";

export const usePermissionStore = defineStore("permissions", () => {
  const isLoading = ref(false);
  const permissions = ref<PermissionResponse[]>([]); // ✅ ต้องเป็น ref

  async function getPermission() {
    try {
      isLoading.value = true;
      const res = await api.get(`/permissions`);

      if (res?.data) {
        permissions.value = res.data; // ✅ อัปเดตค่า permissions
        localStorage.setItem("permissions", JSON.stringify(res.data));
      }
    } catch (error) {
      console.error("❌ Profile Error:", error);
    } finally {
      isLoading.value = false;
    }
  }

  function loadPermissionsFromStorage() {
    const storedPermissions = localStorage.getItem("permissions");
    if (storedPermissions) {
      permissions.value = JSON.parse(storedPermissions);
    }
  }

  return { isLoading, permissions, getPermission, loadPermissionsFromStorage };
});
