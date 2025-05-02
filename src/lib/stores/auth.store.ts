import { defineStore } from "pinia";
import { computed, ref } from "vue";
import axios from "axios"; // หรือใช้ instance axios ที่คุณมีอยู่แล้ว
import { usePermissionStore } from "@/modules/users/permission/store/permission.store";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<any>(null);
  const token = ref<string | null>(null);
  const isAuthenticated = ref<boolean>(false);
  const isLoading = ref<boolean>(false);

  // เรียกใช้ permissionStore เพื่อเข้าถึงข้อมูล permissions
  const permissionStore = usePermissionStore();

  // สร้าง getter สำหรับเข้าถึงข้อมูล permissions จาก permissionStore
  const permissions = computed(() => permissionStore.permissions || []);

  // โหลดข้อมูลผู้ใช้จาก token
  const loadUser = async () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      resetAuth();
      return null;
    }

    token.value = accessToken;
    isLoading.value = true;

    try {
      // เรียกใช้ API เพื่อดึงข้อมูลผู้ใช้
      const response = await axios.get("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      user.value = response.data;

      // โหลดข้อมูล permissions ผ่าน permissionStore
      await permissionStore.getPermission();

      isAuthenticated.value = true;
      return user.value;
    } catch (error) {
      console.error("Failed to load user:", error);
      resetAuth();
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  // รีเซ็ตข้อมูลการยืนยันตัวตน
  const resetAuth = () => {
    localStorage.removeItem("access_token");
    user.value = null;
    token.value = null;
    isAuthenticated.value = false;
  };

  return {
    user,
    permissions, // ใช้ permissions จาก permissionStore
    token,
    isAuthenticated,
    isLoading,
    loadUser,
    resetAuth,
  };
});
