import { defineStore } from "pinia";
import { ref } from "vue";
import type { DeviceInfoUser } from "@/modules/Admin/authentication/interface/auth.interface";
import { authApi, api } from "@/lib/axios";
import type { User } from "@/modules/Admin/authentication/interface/auth.interface";
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

  async function getProfile() {
    try {
      isLoading.value = true;

      // 🚀 Debug API Response
      const res = await api.get(`/auth/me`);
      // console.log("Full Response:", res); // ตรวจสอบ response
      // console.log("Response Data:", res.data);

      if (!res || !res.data) {
        console.error("❌ API did not return data");
        return;
      }

      // ✅ ใช้โครงสร้างที่ตรงกับ API Response จริง ๆ
      const userData: User = res.data;

      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("❌ Profile Error:", error);
    } finally {
      isLoading.value = false; // Fix here: missing closure
    }
  }

  return { isLoading, login, getProfile };
});
