<script setup lang="ts">
import { RouterView } from "vue-router";
import { onBeforeMount, ref } from "vue";
import { useAuthStore } from "@/lib/stores/auth.store";

const authStore = useAuthStore();
const isLoading = ref(true);

// โหลดข้อมูลผู้ใช้ก่อนแสดงแอป
onBeforeMount(async () => {
  isLoading.value = true;
  try {
    if (localStorage.getItem("access_token")) {
      // console.log("[APP] Loading user data on app mount");
      await authStore.loadUser();
      // console.log("[APP] User data loaded:", {
      //   isAuthenticated: authStore.isAuthenticated,
      //   user: authStore.user?.email,
      //   roles: authStore.user?.roles,
      // });
    }
  } catch (error) {
    console.error("[APP] Error loading user:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>
<template>
  <div v-if="isLoading" class="flex items-center justify-center h-screen">
    <!-- แสดง loading spinner หรือข้อความ -->
    <div class="text-lg">กำลังโหลดข้อมูล...</div>
  </div>
  <RouterView v-else />
</template>
