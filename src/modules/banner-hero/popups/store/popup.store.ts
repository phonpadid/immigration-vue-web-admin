import { defineStore } from "pinia";
import { reactive, ref, computed } from "vue";
import { api } from "@/lib/axios";
import type { PopupForm } from "../interface/popup.interface";

export const popupsStore = defineStore("popups", () => {
  const isLoading = ref(false);
  const popups = reactive<{
    data: PopupForm[];
    total: number;
  }>({
    data: [],
    total: 0,
  });

  // เพิ่มตัวกรองสำหรับใช้ในการกรอง
  const filters = reactive({
    visibility: "", // ค่าว่าง = ทั้งหมด, '0' = สาธารณะ, '1' = ส่วนตัว
    status: "", // ค่าว่าง = ทั้งหมด, '0' = ใช้งานอยู่, '1' = ไม่ได้ใช้งาน
  });

  const currentPopups = ref<PopupForm | null>(null);

  // ฟังก์ชันตรวจสอบว่า banner หมดอายุหรือไม่
  const isExpired = (endTime: string) => {
    if (!endTime) return false; // ถ้าไม่มี end_time ถือว่ายังดำเนินการอยู่
    const now = new Date(); // วันที่ปัจจุบัน
    const endDate = new Date(endTime); // แปลง end_time เป็น Date object
    return now > endDate; // ถ้าวันที่ปัจจุบันเกิน end_time แสดงว่า "หมดอายุ"
  };

  const setFilters = (newFilters: { visibility?: string; status?: string }) => {
    if (newFilters.visibility !== undefined) {
      filters.visibility = newFilters.visibility;
    }
    if (newFilters.status !== undefined) {
      filters.status = newFilters.status;
    }
  };

  // ฟังก์ชันล้างตัวกรองทั้งหมด
  const clearFilters = () => {
    filters.visibility = "";
    filters.status = "";
  };

  const getAllPopups = async (
    offset = 0,
    limit = 10,
    is_private = "",
    is_inactive = ""
  ) => {
    try {
      isLoading.value = true;

      // สร้าง URL พร้อมพารามิเตอร์
      let url = `/popup?offset=${offset}&limit=${limit}`;

      // เพิ่มพารามิเตอร์ is_private ถ้ามีค่า
      if (is_private !== "") {
        url += `&is_private=${is_private}`;
      }

      // เพิ่มพารามิเตอร์ is_inactive ถ้ามีค่า
      if (is_inactive !== "") {
        url += `&is_inactive=${is_inactive}`;
      }

      const { data } = await api.get(url);

      if (data?.data && Array.isArray(data.data)) {
        popups.data = data.data;
        popups.total = data.total || data.data.length;
      }

      // อัปเดตค่าตัวกรองเพื่อให้ตรงกับข้อมูลที่โหลดมา
      if (is_private !== "") {
        filters.visibility = is_private;
      }

      if (is_inactive !== "") {
        filters.status = is_inactive;
      }
    } catch (error) {
      console.error("❌ Failed to fetch:", error);
    } finally {
      isLoading.value = false;
    }
  };

  // ฟังก์ชันโหลดข้อมูลใหม่โดยใช้ตัวกรองปัจจุบัน
  const refreshWithFilters = async (offset = 0, limit = 10) => {
    await getAllPopups(offset, limit, filters.visibility, filters.status);
  };

  const getPopupsId = async (id: number) => {
    try {
      isLoading.value = true;
      const { data } = await api.get(`/popup/${id}`);

      if (data) {
        currentPopups.value = data;
        return data;
      }
    } catch (error) {
      console.error("❌ Failed to fetch by ID:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const changeStatus = async (id: number, is_private: boolean) => {
    try {
      isLoading.value = true;
      const { data } = await api.put(`/popup/${id}/change-status`, {
        is_private: is_private,
      });

      if (data) {
        // อัปเดตข้อมูลใน local state ด้วย เพื่อไม่ต้อง reload ทั้งหมด
        const index = popups.data.findIndex((item) => item.id === id);
        if (index !== -1) {
          popups.data[index].is_private = data.is_private;
        }
        currentPopups.value = data;
        return data;
      }
    } catch (error) {
      console.error("❌ Failed to update status:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };
  //   const checkStatusPublic = async (id: number) => {
  //     try {
  //       isLoading.value = true;
  //       const { data } = await api.put(`/popup/${id}/public`);

  //       if (data) {
  //         // อัปเดตข้อมูลใน local state ด้วย เพื่อไม่ต้อง reload ทั้งหมด
  //         const index = banner.data.findIndex((item) => item.id === id);
  //         if (index !== -1) {
  //           banner.data[index].is_private = data.is_private;
  //         }
  //         currentBanners.value = data;
  //         return data;
  //       }
  //     } catch (error) {
  //       console.error("❌ Failed to update status:", error);
  //       throw error;
  //     } finally {
  //       isLoading.value = false;
  //     }
  //   };

  //   const checkStatusPrivate = async (id: number) => {
  //     try {
  //       isLoading.value = true;
  //       const { data } = await api.put(`/banner-hero/${id}/private`);

  //       if (data) {
  //         const index = banner.data.findIndex((item) => item.id === id);
  //         if (index !== -1) {
  //           banner.data[index].is_private = data.is_private;
  //         }
  //         currentBanners.value = data;
  //         return data;
  //       }
  //     } catch (error) {
  //       console.error("❌ Failed to update status:", error);
  //       throw error;
  //     } finally {
  //       isLoading.value = false;
  //     }
  //   };

  // สร้าง FormData จากข้อมูลที่ได้รับ
  const prepareFormData = (formData: any) => {
    const popupsFormData = new FormData();

    // ตรวจสอบและเพิ่มรูปภาพ (ถ้ามี)
    if (formData.image) {
      popupsFormData.append("image", formData.image);
    }

    // เพิ่มข้อมูลอื่นๆ
    popupsFormData.append("link", formData.link || "");
    popupsFormData.append("is_private", formData.is_private ? "1" : "0");
    popupsFormData.append("start_time", formData.start_time || "");
    popupsFormData.append("end_time", formData.end_time || "");

    return popupsFormData;
  };

  // แก้ไขเพื่อใช้ฟังก์ชัน prepareFormData
  const createPopup = async (formData: any) => {
    try {
      isLoading.value = true;

      // ตรวจสอบภาพก่อนส่งข้อมูล
      if (!formData.image) {
        throw new Error("ກະລຸນາອັບໂຫລດຮູບພາບ");
      }

      // แปลงข้อมูลเป็น FormData
      const popupsFormData = prepareFormData(formData);

      const { data } = await api.post("/popup", popupsFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (data) {
        // โหลดข้อมูลใหม่โดยใช้ตัวกรองปัจจุบัน
        await refreshWithFilters();
        return data;
      }
    } catch (error) {
      console.error("❌ Failed to create :", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };
  const updatePopup = async (id: number, formData: any) => {
    try {
      isLoading.value = true;
      const popupsFormData = prepareFormData(formData);
      const { data } = await api.put(`/popup/${id}`, popupsFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (data) {
        await refreshWithFilters();
        currentPopups.value = data;
        return data;
      }
    } catch (error) {
      console.error("❌ Failed to update :", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const deletePopup = async (id: number) => {
    try {
      isLoading.value = true;
      const res = await api.delete(`/popup/${id}`);
      if (res) {
        // โหลดข้อมูลใหม่โดยใช้ตัวกรองปัจจุบัน
        await refreshWithFilters();
      }
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    popups,
    currentPopups,
    filters,
    setFilters,
    clearFilters,
    getAllPopups,
    refreshWithFilters,
    getPopupsId,
    createPopup,
    updatePopup,
    deletePopup,
    isExpired,
    prepareFormData,
    changeStatus,
  };
});
