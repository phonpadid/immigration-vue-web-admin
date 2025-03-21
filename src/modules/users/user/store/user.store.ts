import { buildFormData } from "./../../../../utils/FuntionFormData";
import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { api } from "@/lib/axios";
import type { UserResponse } from "../interface/user.interface";

export const useUserStore = defineStore("user", () => {
  const isLoading = ref(false);
  const user = reactive<{ data: UserResponse[]; total: number }>({
    data: [],
    total: 0,
  });
  const currentUser = ref<UserResponse | null>(null);

  const getAlluser = async (offset = 0, limit = 10) => {
    try {
      isLoading.value = true;
      const { data } = await api.get(`/users?offset=${offset}&limit=${limit}`);

      if (data?.data && Array.isArray(data.data)) {
        user.data = data.data;
        user.total = data.total ?? 0;
      }
    } catch (error) {
      console.error("❌ Failed to fetch user:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const getUserById = async (id: number) => {
    try {
      isLoading.value = true;
      const { data } = await api.get(`/users/${id}`);

      if (data) {
        currentUser.value = data;
        return data;
      }
    } catch (error) {
      console.error("❌ Failed to fetch user by ID:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const createUser = async (form: {
    firstName: string;
    lastName: string;
    image: File;
    email: string;
    password: string;
    roles: number[];
  }) => {
    try {
      isLoading.value = true;
      const formData = buildFormData({
        first_name: form.firstName,
        last_name: form.lastName,
        image: form.image,
        email: form.email,
        password: form.password,
        role_ids: form.roles,
      });

      const { data } = await api.post("/users", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data) {
        await getAlluser();
        return data;
      }
    } catch (error) {
      console.error("❌ Failed to create user:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const updateUser = async (
    id: number,
    form: Partial<{
      firstName: string;
      lastName: string;
      image: File;
      email: string;
      password: string;
      roles: number[];
    }>
  ) => {
    try {
      isLoading.value = true;
      const formData = buildFormData({
        first_name: form.firstName,
        last_name: form.lastName,
        image: form.image,
        email: form.email,
        password: form.password,
        role_ids: form.roles,
      });

      const { data } = await api.put(`/users/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data) {
        await getAlluser();
        return data;
      }
    } catch (error) {
      console.error("❌ Failed to update user:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      isLoading.value = true;
      const res = await api.delete(`/users/${id}`);
      if (res) {
        await getAlluser();
      }
    } catch (error) {
      console.log(error);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    user,
    currentUser,
    getAlluser,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
  };
});
