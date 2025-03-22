import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { api } from "@/lib/axios";
import type { ContactResponse } from "../interface/contacts.interface";

export const usecontactStore = defineStore("contact", () => {
  const isLoading = ref(false);
  const dataFeedbackDetails = ref<ContactResponse | null>(null);
  const contacts = reactive<{ data: ContactResponse[]; total: number }>({
    data: [],
    total: 0,
  });

  const getAllContacts = async (offset = 0, limit = 10) => {
    try {
      isLoading.value = true;
      let url = `/contact?offset=${offset}&limit=${limit}`;

      const { data } = await api.get(url);

      if (data?.data && Array.isArray(data.data)) {
        contacts.data = data.data;
      }
    } catch (error) {
      console.error("❌ Failed to fetch contacts:", error);
    } finally {
      isLoading.value = false;
    }
  };
  const getDetails = async (id: number) => {
    try {
      isLoading.value = true;
      const { data } = await api.get(`/contact/${id}`);

      if (data) {
        dataFeedbackDetails.value = data;
        return data;
      }
    } catch (error) {
      console.error("❌ Failed to fetch user by ID:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteContacts = async (id: number) => {
    try {
      isLoading.value = true;
      const res = await api.delete(`/contact/${id}`);
      if (res) {
        await getAllContacts();
      }
    } catch (error) {
      console.log(error);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    contacts,
    getAllContacts,
    deleteContacts,
    getDetails,
  };
});
