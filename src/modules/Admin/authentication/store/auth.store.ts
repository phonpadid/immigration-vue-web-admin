import { defineStore } from "pinia";
import { ref } from "vue";
import type { DeviceInfoUser } from "@/modules/Admin/authentication/interface/auth.interface";
import { authApi, api } from "@/lib/axios";
import type {
  User,
  Users,
} from "@/modules/Admin/authentication/interface/auth.interface";
import router from "@/router";

export const useAuthStore = defineStore("authentication", () => {
  const isLoading = ref(false);

  async function login(form: DeviceInfoUser) {
    try {
      isLoading.value = true;

      // 🚀 Debug API Response
      const res = await authApi.post(`/auth/login`, form);

      if (!res || !res.data) {
        console.error("❌ API did not return data");
        return;
      }

      // ✅ ใช้โครงสร้างที่ตรงกับ API Response จริง ๆ
      const accessToken = res.data.access_token;
      const userData: User = res.data.user;

      if (!accessToken) {
        // console.error("❌ Missing access_token in response");
        return;
      }

      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("user", JSON.stringify(userData));

      router.push({ name: "dashboard" }).catch(() => {});
    } catch (error) {
      console.error("❌ Login Error:", error);
    } finally {
      isLoading.value = false; // Fix here: missing closure
    }
  }

  async function getProfile(): Promise<Users | null> {
    try {
      isLoading.value = true;

      const res = await api.get(`/auth/me`);
      if (!res || !res.data) {
        console.error("❌ API did not return data");
        return null;
      }

      const userData: any = res.data; // เนื่องจากเรายังไม่รู้โครงสร้างจริงๆ ของ userData

      // ตรวจสอบให้แน่ใจว่ามีข้อมูลครบตามที่ต้องการ
      const completeUserData: Users = {
        id: userData.id, // ค่าที่ได้จาก API
        hotel_id: userData.hotel_id ?? null, // กำหนดเป็น null ถ้าไม่มี
        email: userData.email ?? "", // กำหนดเป็นค่าว่างถ้าไม่มี
        profile: {
          id: userData.profile?.id ?? 0, // ค่าเริ่มต้นหากไม่มี
          user_id: userData.profile?.user_id ?? 0,
          first_name: userData.profile?.first_name ?? "",
          last_name: userData.profile?.last_name ?? "",
          image: userData.profile?.image ?? null,
        },
      };

      localStorage.setItem("user", JSON.stringify(completeUserData));

      return completeUserData;
    } catch (error) {
      console.error("❌ Profile Error:", error);
      return null;
    } finally {
      isLoading.value = false;
    }
  }
  async function logout() {
    try {
      isLoading.value = true;
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      await router.push({ name: "login" });
    } catch (error) {
      console.error("❌ Logout Error:", error);
    }
  }
  return { isLoading, login, getProfile, logout };
});
