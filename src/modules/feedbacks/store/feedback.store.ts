import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { api } from "@/lib/axios";
import type { FeedbackResponse } from "../interface/feedbacks.interface";

export const usefeedbackStore = defineStore("feedback", () => {
  const isLoading = ref(false);
  const dataFeedbackDetails = ref<FeedbackResponse | null>(null);
  const feedback = reactive<{ data: FeedbackResponse[]; total: number }>({
    data: [],
    total: 0,
  });

  const getAllfeedback = async (offset = 0, limit = 10, isPublished = "") => {
    try {
      isLoading.value = true;
      let url = `/feedback?offset=${offset}&limit=${limit}`;

      if (isPublished !== "") {
        url += `&is_published=${isPublished}`;
      }

      const { data } = await api.get(url);

      if (data?.data && Array.isArray(data.data)) {
        feedback.data = data.data;
      }
    } catch (error) {
      console.error("❌ Failed to fetch feedback:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const changeStatusFeedback = async (id: number, isPublished: boolean) => {
    try {
      isLoading.value = true;
      const res = await api.put(`/feedback/${id}`, {
        is_published: isPublished,
      });
      if (res) {
        const index = feedback.data.findIndex((item) => item.id === id);
        if (index !== -1) {
          feedback.data[index].is_published = isPublished;
        }
      }
      return res;
    } catch (error) {
      console.error("Failed to update publish status:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };
  const getDetails = async (id: number) => {
    try {
      isLoading.value = true;
      const { data } = await api.get(`/feedback/${id}`);

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

  const deleteFeedback = async (id: number) => {
    try {
      isLoading.value = true;
      const res = await api.delete(`/feedback/${id}`);
      if (res) {
        await getAllfeedback();
      }
    } catch (error) {
      console.log(error);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    feedback,
    getAllfeedback,
    deleteFeedback,
    changeStatusFeedback,
    getDetails,
  };
});
