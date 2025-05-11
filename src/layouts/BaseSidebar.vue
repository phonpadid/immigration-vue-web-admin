<script setup lang="ts">
import { onMounted, ref, watchEffect, computed } from "vue";
import { menuItems } from "./menu";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/lib/stores/auth.store";
import { validateUserPermissions } from "@/common/utils/PermissionGroup";

defineProps<{ toggle: boolean }>();
const { push } = useRouter();
const authStore = useAuthStore();
const selectedKeys = ref<string[]>([""]);
const openKeys = ref<string[]>([""]);
const isDarkMode = ref(localStorage.getItem("theme") === "dark");
const isLoading = ref(true);

// สร้าง computed property เพื่อตรวจสอบว่าพร้อมแสดงเมนูหรือไม่
const isReady = computed(() => {
  return authStore.isAuthenticated && !isLoading.value;
});

// โหลดข้อมูลผู้ใช้ถ้ายังไม่ได้โหลด
async function ensureUserLoaded() {
  isLoading.value = true;
  try {
    // ตรวจสอบว่ามี Token หรือไม่
    const token = localStorage.getItem("access_token");
    if (!token) {
      return;
    }

    if (!authStore.user) {
      await authStore.loadUser();
      // ตรวจสอบผลลัพธ์หลังจากโหลด
      // console.log("[SIDEBAR] User data after loading:", authStore.user);
      // console.log("[SIDEBAR] Roles after loading:", authStore.user?.roles);
    }

    // ตรวจสอบ permissions เมื่อโหลดเสร็จ
    if (
      authStore.user?.permissions &&
      Array.isArray(authStore.user.permissions)
    ) {
      // console.log("[SIDEBAR] Validating user permissions...");
      validateUserPermissions(authStore.user.permissions);
    } else {
      console.warn("[SIDEBAR] No permissions data in user object!");
    }
  } catch (error) {
    console.error("[SIDEBAR] Error loading user:", error);
  } finally {
    isLoading.value = false;
  }
}
onMounted(async () => {
  try {
    await ensureUserLoaded();
    // โหลด keys จาก localStorage
    const menuKey = localStorage.getItem("menuKey");
    const subMenuKey = localStorage.getItem("subMenuKey");

    if (menuKey) {
      try {
        selectedKeys.value.push(JSON.parse(menuKey));
      } catch (e) {
        console.error("Error parsing menuKey:", e);
        selectedKeys.value.push("dashboard");
      }
    } else {
      selectedKeys.value.push("dashboard");
    }

    if (subMenuKey) {
      try {
        openKeys.value.push(JSON.parse(subMenuKey));
      } catch (e) {
        console.error("Error parsing subMenuKey:", e);
      }
    }
  } catch (e) {
    console.error("[SIDEBAR] Error in onMounted:", e);
    isLoading.value = false;
  }
});

function handleClick({ key, keyPath }: { key: string; keyPath: string[] }) {
  localStorage.setItem("menuKey", JSON.stringify(key));
  localStorage.setItem("subMenuKey", JSON.stringify(keyPath[0]));
  push({ name: key });
}
</script>

<template>
  <nav
    class="fixed top-0 left-0 z-50 w-0 h-full overflow-hidden overflow-y-auto transition-all bg-white dark:bg-gray-900 text-black dark:text-white whitespace-nowrap"
    :class="{ 'w-[256px] border dark:border-gray-700': toggle }"
  >
    <div class="flex flex-row items-center gap-2 mt-4 ml-4">
      <img src="/public/logo.webp" alt="logo" class="w-12 h-16 mb-2" />
      <span class="text-2xl font-bold">DOI LPDR</span>
    </div>
    <!-- <div v-if="isLoading" class="p-4 text-sm text-center">
      กำลังโหลดข้อมูล...
    </div>
    <div class="p-2 text-xs">
      <button
        @click="toggleDebug"
        class="px-2 py-1 bg-gray-200 rounded text-xs"
      >
        {{ debugVisible ? "Hide Debug" : "Show Debug" }}
      </button>
      <button
        @click="forceReloadUser"
        class="ml-2 px-2 py-1 bg-blue-200 rounded text-xs"
      >
        โหลดข้อมูลใหม่
      </button>
    </div> -->
    <!-- Debug info -->
    <!-- <div
      v-if="debugVisible"
      class="p-2 m-2 bg-gray-100 dark:bg-gray-800 rounded text-xs"
    >
      <h4 class="font-bold mb-1">Debug Info</h4>
      <div class="mb-2">
        <div><b>Has User Data:</b> {{ hasUserData ? "✓ Yes" : "✗ No" }}</div>
        <div><b>ID:</b> {{ userData.id }}</div>
        <div><b>Email:</b> {{ userData.email }}</div>
        <div><b>Raw Roles:</b> {{ JSON.stringify(userData.rawRoles) }}</div>
      </div>

      <div class="mb-2">
        <div><b>Roles:</b> {{ userRoles.join(", ") || "None" }}</div>
        <div>
          <b>Is Dev:</b> {{ userRoles.includes("dev") ? "Yes ✓" : "No ✗" }}
        </div>
        <div>
          <b>Is SuperAdmin:</b>
          {{ userRoles.includes("SuperAdmin") ? "Yes ✓" : "No ✗" }}
        </div>
        <div>
          <b>IsDevOrAdmin:</b> {{ isDevOrAdminUser ? "Yes ✓" : "No ✗" }}
        </div>
      </div>

      <div class="mb-2">
        <div><b>Permissions:</b> {{ userPermissions.length }}</div>
        <div v-if="userPermissions.length <= 10" class="mt-1">
          <div v-for="(perm, i) in userPermissions" :key="i" class="ml-2">
            - {{ perm }}
          </div>
        </div>
        <div v-else class="mt-1 ml-2 max-h-20 overflow-y-auto">
          {{ userPermissions.join(", ") }}
        </div>
      </div>

      <div class="mt-1"><b>Menu items:</b> {{ menuItems.length }}</div>
      <div><b>Is Ready:</b> {{ isReady ? "Yes ✓" : "No ✗" }}</div>
    </div>
    <div
      v-if="isReady && menuItems.length === 0"
      class="p-4 text-sm text-red-500"
    >
      ไม่พบเมนูที่มีสิทธิ์เข้าถึง
    </div> -->

    <div class="mt-4">
      <a-menu
        v-if="isReady"
        v-model:openKeys="openKeys"
        v-model:selectedKeys="selectedKeys"
        mode="inline"
        :items="menuItems"
        class="dark:bg-gray-800 dark:text-white"
        @click="handleClick"
      />
    </div>
  </nav>
</template>
