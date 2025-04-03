import { defineStore } from "pinia";
import { reactive, ref, computed } from "vue";
import { api } from "@/lib/axios";
import type { BannerForm } from "../interface/banner.interface";

export const usebannerStore = defineStore("banner", () => {
  const isLoading = ref(false);
  const banner = reactive<{
    data: BannerForm[];
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

  const currentBanners = ref<BannerForm | null>(null);

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

  const getAllBanner = async (
    offset = 0,
    limit = 10,
    is_private = "",
    is_inactive = ""
  ) => {
    try {
      isLoading.value = true;

      // สร้าง URL พร้อมพารามิเตอร์
      let url = `/banner-hero?offset=${offset}&limit=${limit}`;

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
        banner.data = data.data;
        banner.total = data.total || data.data.length;
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
    await getAllBanner(offset, limit, filters.visibility, filters.status);
  };

  const getBannerId = async (id: number) => {
    try {
      isLoading.value = true;
      const { data } = await api.get(`/banner-hero/${id}`);

      if (data) {
        currentBanners.value = data;
        return data;
      }
    } catch (error) {
      console.error("❌ Failed to fetch by ID:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const checkStatusPublic = async (id: number) => {
    try {
      isLoading.value = true;
      const { data } = await api.put(`/banner-hero/${id}/public`);

      if (data) {
        // อัปเดตข้อมูลใน local state ด้วย เพื่อไม่ต้อง reload ทั้งหมด
        const index = banner.data.findIndex((item) => item.id === id);
        if (index !== -1) {
          banner.data[index].is_private = data.is_private;
        }
        currentBanners.value = data;
        return data;
      }
    } catch (error) {
      console.error("❌ Failed to update status:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const checkStatusPrivate = async (id: number) => {
    try {
      isLoading.value = true;
      const { data } = await api.put(`/banner-hero/${id}/private`);

      if (data) {
        const index = banner.data.findIndex((item) => item.id === id);
        if (index !== -1) {
          banner.data[index].is_private = data.is_private;
        }
        currentBanners.value = data;
        return data;
      }
    } catch (error) {
      console.error("❌ Failed to update status:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  // สร้าง FormData จากข้อมูลที่ได้รับ
  const prepareFormData = (formData: any) => {
    const bannerFormData = new FormData();

    // ตรวจสอบและเพิ่มรูปภาพ (ถ้ามี)
    if (formData.image) {
      bannerFormData.append("image", formData.image);
    }

    // เพิ่มข้อมูลอื่นๆ
    bannerFormData.append("link", formData.link || "");
    bannerFormData.append("is_private", formData.is_private ? "1" : "0");
    bannerFormData.append("start_time", formData.start_time || "");
    bannerFormData.append("end_time", formData.end_time || "");
    bannerFormData.append("lo_title", formData.lo_title || "");
    bannerFormData.append("lo_description", formData.lo_description || "");
    bannerFormData.append("en_title", formData.en_title || "");
    bannerFormData.append("en_description", formData.en_description || "");
    bannerFormData.append("zh_cn_title", formData.zh_cn_title || "");
    bannerFormData.append(
      "zh_cn_description",
      formData.zh_cn_description || ""
    );

    return bannerFormData;
  };

  // แก้ไขเพื่อใช้ฟังก์ชัน prepareFormData
  const createBanner = async (formData: any) => {
    try {
      isLoading.value = true;

      // ตรวจสอบภาพก่อนส่งข้อมูล
      if (!formData.image) {
        throw new Error("ກະລຸນາອັບໂຫລດຮູບພາບໃນສ່ວນສໍາລັບແບນເນີ");
      }

      // แปลงข้อมูลเป็น FormData
      const bannerFormData = prepareFormData(formData);

      const { data } = await api.post("/banner-hero", bannerFormData, {
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
  const updateBanner = async (id: number, formData: any) => {
    try {
      isLoading.value = true;
      const bannerFormData = prepareFormData(formData);
      if (formData.lo_id) {
        bannerFormData.append("lo_id", formData.lo_id.toString());
      }
      if (formData.en_id) {
        bannerFormData.append("en_id", formData.en_id.toString());
      }
      if (formData.zh_cn_id) {
        bannerFormData.append("zh_cn_id", formData.zh_cn_id.toString());
      }

      const { data } = await api.put(`/banner-hero/${id}`, bannerFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (data) {
        await refreshWithFilters();
        currentBanners.value = data;
        return data;
      }
    } catch (error) {
      console.error("❌ Failed to update :", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteBanner = async (id: number) => {
    try {
      isLoading.value = true;
      const res = await api.delete(`/banner-hero/${id}`);
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
    banner,
    currentBanners,
    filters,
    setFilters,
    clearFilters,
    getAllBanner,
    refreshWithFilters,
    getBannerId,
    createBanner,
    updateBanner,
    deleteBanner,
    checkStatusPublic,
    checkStatusPrivate,
    isExpired,
    prepareFormData,
  };
});
