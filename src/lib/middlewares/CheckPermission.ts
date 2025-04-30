// src/store/permission.store.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { api } from "@/lib/axios";

export interface Permission {
  id: number;
  name: string;
  group_name: string;
  description: string;
  created_at: string;
}

export interface UserPermissions {
  permissions: string[];
  roles: string[];
  userId: number;
  hotelId?: number; // สำหรับผู้ใช้ที่เป็นเจ้าของโรงแรม
}

export const usePermissionStore = defineStore("permission", () => {
  const userPermissions = ref<UserPermissions>({
    permissions: [],
    roles: [],
    userId: 0,
    hotelId: undefined,
  });

  const isLoading = ref<boolean>(false);

  // นำเข้าข้อมูลสิทธิ์ของผู้ใช้จาก localStorage เมื่อ refresh
  const initUserPermissions = (): void => {
    const storedPermissions = localStorage.getItem("userPermissions");
    if (storedPermissions) {
      userPermissions.value = JSON.parse(storedPermissions);
    }
  };

  // โหลดข้อมูลสิทธิ์ของผู้ใช้จาก API
  const fetchUserPermissions = async (): Promise<void> => {
    try {
      isLoading.value = true;
      const { data } = await api.get("/auth/me");

      if (data) {
        userPermissions.value = {
          permissions: data.permissions?.map((p: any) => p.name) || [],
          roles: data.roles?.map((r: any) => r.name) || [],
          userId: data.id,
          hotelId: data.hotel_id || undefined,
        };

        // เก็บข้อมูลไว้ใน localStorage สำหรับการ refresh
        localStorage.setItem(
          "userPermissions",
          JSON.stringify(userPermissions.value)
        );
      }
    } catch (error) {
      console.error("Failed to fetch user permissions:", error);
    } finally {
      isLoading.value = false;
    }
  };

  // ตรวจสอบว่าผู้ใช้มีสิทธิ์ที่ระบุหรือไม่
  const hasPermission = (permission: string): boolean => {
    return userPermissions.value.permissions.includes(permission);
  };

  // ตรวจสอบว่าผู้ใช้มีบทบาทที่ระบุหรือไม่
  const hasRole = (role: string): boolean => {
    return userPermissions.value.roles.includes(role);
  };

  // ตรวจสอบว่าผู้ใช้มีสิทธิ์ในการอ่านหมวดหมู่ที่กำหนด
  const canRead = (moduleName: string): boolean => {
    return hasPermission(`${moduleName}:read`);
  };

  // ตรวจสอบว่าผู้ใช้มีสิทธิ์ในการเขียน/แก้ไขหมวดหมู่ที่กำหนด
  const canWrite = (moduleName: string): boolean => {
    return hasPermission(`${moduleName}:write`);
  };

  // ตรวจสอบว่าผู้ใช้มีสิทธิ์ในการลบหมวดหมู่ที่กำหนด
  const canDelete = (moduleName: string): boolean => {
    return hasPermission(`${moduleName}:remove`);
  };

  // ตรวจสอบว่าผู้ใช้เป็นเจ้าของโรงแรม
  const isHotelOwner = computed(() => !!userPermissions.value.hotelId);

  // ตรวจสอบว่าโรงแรมเป็นของผู้ใช้หรือไม่
  const isOwnHotel = (hotelId: number): boolean => {
    return isHotelOwner.value && userPermissions.value.hotelId === hotelId;
  };

  // ล้างข้อมูลสิทธิ์เมื่อออกจากระบบ
  const clearPermissions = (): void => {
    userPermissions.value = {
      permissions: [],
      roles: [],
      userId: 0,
      hotelId: undefined,
    };
    localStorage.removeItem("userPermissions");
  };

  return {
    userPermissions,
    isLoading,
    initUserPermissions,
    fetchUserPermissions,
    hasPermission,
    hasRole,
    canRead,
    canWrite,
    canDelete,
    isHotelOwner,
    isOwnHotel,
    clearPermissions,
  };
});
