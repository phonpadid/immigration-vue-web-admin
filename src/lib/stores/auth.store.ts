import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { api } from "../axios";
import { usePermissionStore } from "@/modules/users/permission/store/permission.store";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<any>(null);
  const token = ref<string | null>(null);
  const isAuthenticated = ref<boolean>(false);
  const isLoading = ref<boolean>(false);
  const permissionStore = usePermissionStore();

  // เพิ่มตัวแปรสำหรับติดตามสถานะการโหลดข้อมูล
  const isUserLoaded = ref<boolean>(false);
  // เพิ่มตัวแปรสำหรับเก็บ Promise ระหว่างการโหลดข้อมูล
  let loadUserPromise: Promise<any> | null = null;

  // สร้าง getter สำหรับเข้าถึงข้อมูล permissions
  const permissions = computed(() => {
    // ตรวจสอบว่ามี user.permissions หรือไม่
    if (user.value?.permissions && Array.isArray(user.value.permissions)) {
      // แปลง string permissions เป็น object ตามรูปแบบที่ใช้ในระบบ
      return user.value.permissions.map((p: string) => ({ name: p }));
    }
    // ถ้าไม่มี user.permissions ให้ใช้จาก permissionStore
    return permissionStore.permissions || [];
  });

  // ตรวจสอบเฉพาะผู้ใช้ที่มีบทบาท dev
  const isDevOrAdmin = computed(() => {
    if (!user.value || !user.value.roles) {
      return false;
    }

    // รองรับทั้งกรณีที่ roles เป็น array หรือ string
    const roles = Array.isArray(user.value.roles)
      ? user.value.roles
      : [user.value.roles];

    // ตรวจสอบเฉพาะบทบาท "dev"
    const isDev = roles.includes("dev");
    return isDev;
  });

  // ฟังก์ชันสำหรับรับข้อมูลโปรไฟล์ของผู้ใช้
  const getProfile = async () => {
    // ถ้ามีข้อมูลผู้ใช้อยู่แล้ว ให้ส่งคืนทันที
    if (user.value && isUserLoaded.value) {
      // console.log("[AUTH] Using cached user data for profile");
      return user.value;
    }

    // ถ้ากำลังโหลดข้อมูลอยู่ ให้รอ Promise เดิม
    if (loadUserPromise) {
      // console.log("[AUTH] Already loading user data, waiting for completion");
      return loadUserPromise;
    }

    // ถ้ายังไม่มีข้อมูลและไม่ได้กำลังโหลด ให้โหลดใหม่
    console.log("[AUTH] Loading user data for profile");
    return loadUser();
  };

  // ปรับปรุงฟังก์ชัน hasPermission ให้ชัดเจนยิ่งขึ้น
  const hasPermission = (permissionName: any) => {
    // ถ้าผู้ใช้ไม่มีข้อมูล ปฏิเสธสิทธิ์
    if (!user.value) {
      // console.log(`No user data, denying: ${permissionName}`);
      return false;
    }

    // ตรวจสอบบทบาท dev โดยตรง เพื่อป้องกันปัญหา reactivity cycle
    const roles = Array.isArray(user.value.roles)
      ? user.value.roles
      : [user.value.roles];

    // ถ้าเป็น dev ให้มีสิทธิ์ทุกอย่าง
    if (roles.includes("dev")) {
      // console.log(`Permission granted (dev role): ${permissionName}`);
      return true;
    }

    if (user.value.permissions && Array.isArray(user.value.permissions)) {
      const hasUserPerm = user.value.permissions.includes(permissionName);
      // console.log(`Permission ${permissionName} direct check: ${hasUserPerm}`);
      if (hasUserPerm) return true;
    }

    // ถ้าไม่พบใน user.permissions ให้ตรวจสอบจาก permissionStore
    const storePermissions = permissions.value || [];
    if (storePermissions.length === 0) {
      // console.log(`No permissions available, denying: ${permissionName}`);
      return false;
    }

    const result = storePermissions.some((p: any) => p.name === permissionName);
    // console.log(`Permission store check for ${permissionName}: ${result}`);
    return result;
  };

  // ฟังก์ชันตรวจสอบหลายสิทธิ์
  const hasAllPermissions = (permissionNames: any) => {
    // ถ้าเป็น dev ให้ผ่านทุกสิทธิ์
    const roles = user.value?.roles || [];
    const isDev = Array.isArray(roles)
      ? roles.includes("dev")
      : roles === "dev";

    if (isDev) {
      return true;
    }

    // สำหรับผู้ใช้อื่นๆ ตรวจสอบตามปกติ
    const userPerms = user.value?.permissions || [];
    if (Array.isArray(userPerms) && userPerms.length > 0) {
      // ตรวจสอบจาก user.permissions โดยตรง
      return permissionNames.every((name: any) => userPerms.includes(name));
    }

    // ถ้าไม่มี user.permissions ใช้จาก permissionStore
    const permissionMap = new Set(permissions.value.map((p: any) => p.name));
    return permissionNames.every((name: any) => permissionMap.has(name));
  };

  const hasAnyPermission = (permissionNames: any) => {
    // ถ้าเป็น dev ให้ผ่านทุกสิทธิ์
    const roles = user.value?.roles || [];
    const isDev = Array.isArray(roles)
      ? roles.includes("dev")
      : roles === "dev";

    if (isDev) {
      return true;
    }

    // สำหรับผู้ใช้อื่นๆ ตรวจสอบตามปกติ
    const userPerms = user.value?.permissions || [];
    if (Array.isArray(userPerms) && userPerms.length > 0) {
      // ตรวจสอบจาก user.permissions โดยตรง
      return permissionNames.some((name: any) => userPerms.includes(name));
    }

    // ถ้าไม่มี user.permissions ใช้จาก permissionStore
    const permissionMap = new Set(permissions.value.map((p: any) => p.name));
    return permissionNames.some((name: any) => permissionMap.has(name));
  };

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
      // เก็บอ้างอิงของ Promise เพื่อป้องกันการเรียกซ้ำซ้อน
      loadUserPromise = (async () => {
        // เรียกใช้ API เพื่อดึงข้อมูลผู้ใช้
        const response = await api.get("/auth/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        user.value = response.data;

        // โหลด permissions เฉพาะเมื่อผู้ใช้ไม่ใช่ dev และไม่มี permissions ในข้อมูลผู้ใช้
        const roles = user.value?.roles || [];
        const isDev = Array.isArray(roles)
          ? roles.includes("dev")
          : roles === "dev";

        if (
          !isDev &&
          (!user.value.permissions || user.value.permissions.length === 0)
        ) {
          console.log(
            "[AUTH] User is not dev and has no permissions, loading from store..."
          );

          // โหลดข้อมูล permissions จาก localStorage หรือเรียก API
          permissionStore.loadPermissionsFromStorage();
          if (!permissionStore.permissions.length) {
            console.log(
              "[AUTH] No permissions in storage, fetching from API..."
            );
            await permissionStore.getPermission();
          }
        }

        isAuthenticated.value = true;
        isUserLoaded.value = true; // บันทึกว่าโหลดข้อมูลแล้ว
        return user.value;
      })();

      // รอ Promise ทำงานเสร็จ
      const userData = await loadUserPromise;
      return userData;
    } catch (error) {
      console.error("[AUTH] Failed to load user:", error);
      resetAuth();
      return null;
    } finally {
      isLoading.value = false;
      loadUserPromise = null; // รีเซ็ต Promise เมื่อเสร็จสิ้น
    }
  };

  // ฟังก์ชัน logout
  const logout = async () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      console.log("[AUTH] No access token found during logout");
      resetAuth();
      return;
    }

    try {
      console.log("[AUTH] Calling logout API...");

      // เรียกใช้ API logout
      await api.post(
        "/auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log("[AUTH] Logout API successful");
    } catch (error) {
      console.error("[AUTH] Error during logout API call:", error);
    } finally {
      // ล้างข้อมูลผู้ใช้ทันทีเมื่อเรียก API เสร็จ (สำเร็จหรือไม่ก็ตาม)
      resetAuth();
    }
  };

  // ฟังก์ชัน resetAuth
  const resetAuth = () => {
    console.log("[AUTH] Resetting auth state...");

    // ล้างข้อมูลใน localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("permissions");
    localStorage.removeItem("menuKey");
    localStorage.removeItem("subMenuKey");

    // ล้างข้อมูลใน state
    user.value = null;
    token.value = null;
    isAuthenticated.value = false;
    isUserLoaded.value = false;
    loadUserPromise = null;

    console.log("[AUTH] Auth state reset completed");
  };

  // เรียกดูข้อมูลผู้ใช้ล่าสุด โดยไม่เรียก API ใหม่
  const getCurrentUser = () => {
    return user.value;
  };

  return {
    user,
    permissions,
    token,
    isDevOrAdmin,
    isAuthenticated,
    isLoading,
    isUserLoaded,
    loadUser,
    getProfile,
    getCurrentUser,
    logout,
    resetAuth,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
  };
});
