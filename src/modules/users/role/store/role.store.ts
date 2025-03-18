import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { api } from "@/lib/axios";
import type { RoleFrom } from "../interface/role.interface";

export const useRolesStore = defineStore("roles", () => {
  const isLoading = ref(false);
  const roles = reactive<any>({
    data: [],
  });

  // ฟังก์ชันดึงข้อมูลจาก API
  async function getAllRole() {
    try {
      isLoading.value = true;
      const res = await api.get(`/roles`);

      if (res?.data?.data && Array.isArray(res.data.data)) {
        roles.data = res.data.data;
      }
    } catch (error) {
      console.error("❌ Error fetching roles:", error);
    } finally {
      isLoading.value = false;
    }
  }

  async function createRole(role: RoleFrom) {
    try {
      isLoading.value = true;
      const res = await api.post("/roles", role);

      if (res?.data) {
        await getAllRole();
        return res.data;
      }
    } catch (error) {
      console.error("❌ Error creating role:", error);
    } finally {
      isLoading.value = false;
    }
  }

  return { isLoading, roles, getAllRole, createRole };
});
