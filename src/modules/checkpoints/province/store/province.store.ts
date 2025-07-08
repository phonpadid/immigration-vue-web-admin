import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { api } from "@/lib/axios";
import type { ProvinceForm } from "../interface/province.interface";

export const useCheckpointProvinceStore = defineStore(
  "checkpointProvince",
  () => {
    const isLoading = ref(false);
    const checkpointProvince = reactive<{
      data: ProvinceForm[];
      total: number;
    }>({
      data: [],
      total: 0,
    });
    const currentCheckpointProvince = ref<ProvinceForm | null>(null);

    const getAllCheckpointProvine = async (page = 1, pageSize = 10) => {
      try {
        isLoading.value = true;
        const offset = (page - 1) * pageSize;
        const { data } = await api.get(
          `/provinces?offset=${offset}&limit=${pageSize}`
        );

        if (data?.data && Array.isArray(data.data)) {
          checkpointProvince.data = data.data;
          checkpointProvince.total = data.total || 0; // เก็บค่า total
        }
      } catch (error) {
        console.error("❌ Failed to fetch provinces:", error);
        throw error; // ส่ง error ต่อเพื่อให้สามารถจับได้ที่ component
      } finally {
        isLoading.value = false;
      }
    };

    const getCheckpointProvinceById = async (id: number) => {
      try {
        isLoading.value = true;
        const { data } = await api.get(`/provinces/${id}`);

        if (data) {
          currentCheckpointProvince.value = data;
          return data;
        }
      } catch (error) {
        console.error("❌ Failed to fetch province by ID:", error);
        throw error;
      } finally {
        isLoading.value = false;
      }
    };

    const createCheckpointProvince = async (provinceData: ProvinceForm) => {
      try {
        isLoading.value = true;
        const { data } = await api.post("/provinces", provinceData);

        if (data) {
          // โหลดข้อมูลใหม่หลังจากสร้างข้อมูลสำเร็จ
          await getAllCheckpointProvine();
          return data;
        }
      } catch (error) {
        console.error("❌ Failed to create province:", error);
        throw error;
      } finally {
        isLoading.value = false;
      }
    };

    const updateCheckpointProcines = async (
      id: number,
      updatedData: Partial<ProvinceForm>
    ) => {
      try {
        isLoading.value = true;
        const { data } = await api.put(`/provinces/${id}`, updatedData);

        if (data) {
          // โหลดข้อมูลใหม่หลังจากอัพเดทข้อมูลสำเร็จ
          await getAllCheckpointProvine();
          return data;
        }
      } catch (error) {
        console.error("❌ Failed to update province:", error);
        throw error;
      } finally {
        isLoading.value = false;
      }
    };

    // เพิ่มพารามิเตอร์ page และ pageSize เพื่อรักษาสถานะการแสดงผลหลังจากลบข้อมูล
    const deleteCheckpointProvinces = async (
      id: number,
      page = 1,
      pageSize = 10
    ) => {
      try {
        isLoading.value = true;
        const res = await api.delete(`/provinces/${id}`);
        if (res) {
          // โหลดข้อมูลใหม่โดยยังคงหน้าปัจจุบัน
          await getAllCheckpointProvine(page, pageSize);
          return res;
        }
      } catch (error) {
        console.error("❌ Failed to delete province:", error);
        throw error;
      } finally {
        isLoading.value = false;
      }
    };

    const getAllProvinces = async () => {
      try {
        isLoading.value = true;
        // ใช้ limit ที่มากพอสำหรับดึงข้อมูลทั้งหมด
        const { data } = await api.get("/provinces?offset=0&limit=1000");

        if (data?.data && Array.isArray(data.data)) {
          checkpointProvince.data = data.data;
          checkpointProvince.total = data.total || 0;
        }
      } catch (error) {
        console.error("❌ Failed to fetch all provinces:", error);
        throw error;
      } finally {
        isLoading.value = false;
      }
    };

    return {
      isLoading,
      checkpointProvince,
      currentCheckpointProvince,
      getAllCheckpointProvine,
      getCheckpointProvinceById,
      createCheckpointProvince,
      updateCheckpointProcines,
      deleteCheckpointProvinces,
      getAllProvinces,
    };
  }
);
