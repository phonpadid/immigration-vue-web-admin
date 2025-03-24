import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { api } from "@/lib/axios";
import type { RoleFrom } from "../interface/role.interface";

export const useRolesStore = defineStore("roles", () => {
  const isLoading = ref(false);
  const roles = reactive<{ data: RoleFrom[]; total: number }>({
    data: [],
    total: 0,
  });
  const currentRole = ref<RoleFrom | null>(null);

  const getAllRoles = async (offset = 0, limit = 10) => {
    try {
      isLoading.value = true;
      const { data } = await api.get(`/roles?offset=${offset}&limit=${limit}`);

      if (data?.data && Array.isArray(data.data)) {
        roles.data = data.data;
      }
    } catch (error) {
      console.error("❌ Failed to fetch roles:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const getRoleById = async (id: number) => {
    try {
      isLoading.value = true;
      const { data } = await api.get(`/roles/${id}`);

      if (data) {
        currentRole.value = data;
        return data;
      }
    } catch (error) {
      console.error("❌ Failed to fetch role by ID:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const createRole = async (role: RoleFrom) => {
    try {
      isLoading.value = true;
      const { data } = await api.post("/roles", role);

      if (data) {
        await getAllRoles();
        return data;
      }
    } catch (error) {
      console.error("❌ Failed to create role:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const updateRole = async (id: number, updatedData: Partial<RoleFrom>) => {
    try {
      isLoading.value = true;
      const { data } = await api.put(`/roles/${id}`, updatedData);

      if (data) {
        await getAllRoles();
        return data;
      }
    } catch (error) {
      console.error("❌ Failed to update role:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const deleteRole = async (id: string) => {
    try {
      isLoading.value = true;
      const res = await api.delete(`/roles/${id}`);
      if (res) {
        await getAllRoles();
      }
    } catch (error) {
      console.log(error);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    roles,
    currentRole,
    getAllRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
  };
});
