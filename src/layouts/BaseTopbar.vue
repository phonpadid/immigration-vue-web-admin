<!-- filepath: e:\immigration-web-admin-vue\immigration-vue-web-admin\src\components\Header\HeaderBar.vue -->
<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { onMounted, ref, computed } from "vue";
import { UserOutlined } from "@ant-design/icons-vue";
import { useAuthStore } from "@/lib/stores/auth.store";
import { Dropdown, Menu } from "ant-design-vue";
import { useRouter } from "vue-router";

const emit = defineEmits<{ toggle: [] }>();
const authStore = useAuthStore();
const { getProfile } = authStore;
const { push } = useRouter();
const isDarkMode = ref(false);
const isLoading = ref(false);

// ใช้ computed property แทน ref เพื่อแสดงข้อมูลผู้ใช้ปัจจุบัน
const userProfile = computed(() => {
  const currentUser = authStore.user;
  if (!currentUser || !currentUser.profile) return null;

  return {
    id: currentUser.profile.id,
    first_name: currentUser.profile.first_name || "N/A",
    last_name: currentUser.profile.last_name || "N/A",
    email: currentUser.email || "N/A",
  };
});

async function logout() {
  const authStore = useAuthStore();

  try {
    // เรียกใช้ API logout ก่อน (ถ้ามี)
    if (localStorage.getItem("access_token")) {
      try {
        await authStore.logout();
      } catch (error) {
        console.error("[LOGOUT] Error calling logout API:", error);
      }
    }
    // ล้างข้อมูลใน authStore (ไม่ว่าจะเรียก API สำเร็จหรือไม่)
    authStore.resetAuth();
    // ล้าง localStorage
    localStorage.clear();

    push({
      name: "login",
    }).catch((err) => {
      console.error("[LOGOUT] Error navigating to login:", err);
    });
  } catch (error) {
    console.error("[LOGOUT] Unexpected error during logout:", error);
    localStorage.clear();
    authStore.resetAuth();

    push({
      name: "login",
    }).catch(() => {});
  }
}
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  document.documentElement.classList.toggle("dark", isDarkMode.value);
  localStorage.setItem("theme", isDarkMode.value ? "dark" : "light");
};

/******************************************************* */
const gotoDetailsUser = (id: number) => {
  push({
    name: "users_details",
    params: { id },
  });
};

/******************************************************* */

onMounted(async () => {
  try {
    // ตรวจสอบว่ามีข้อมูลผู้ใช้แล้วหรือไม่
    if (!authStore.isLoading) {
      console.log("[HEADER] User not loaded, fetching profile");
      isLoading.value = true;
      await getProfile(); // เรียกใช้ getProfile ที่จะตรวจสอบการแคชเอง
      isLoading.value = false;
    } else {
      console.log("[HEADER] User already loaded, using cached data");
    }
  } catch (error) {
    console.error("[HEADER] Error fetching profile:", error);
    isLoading.value = false;
  }

  // ตรวจสอบโหมด dark mode จาก localStorage
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    isDarkMode.value = savedTheme === "dark";
    document.documentElement.classList.toggle("dark", isDarkMode.value);
  }
});
</script>

<template>
  <header
    class="fixed top-0 z-10 flex items-center justify-start w-full h-16 px-4 bg-white dark:bg-gray-900 dark:text-white shadow-sm"
  >
    <Icon
      icon="lucide-align-justify"
      width="24"
      height="24"
      class="cursor-pointer"
      @click="emit('toggle')"
    />

    <div class="flex items-center gap-4 ml-auto">
      <button @click="toggleDarkMode">
        <Icon
          :icon="isDarkMode ? 'lucide-moon' : 'lucide-sun'"
          width="24"
          height="24"
        />
      </button>
      <Dropdown>
        <template #overlay>
          <Menu>
            <Menu.Item>
              <div v-if="isLoading" class="p-2">
                <p>กำลังโหลดข้อมูล...</p>
              </div>
              <div v-else-if="userProfile" class="">
                <p class="font-semibold">
                  {{ userProfile.first_name }} {{ userProfile.last_name }}
                </p>
                <p class="text-sm text-gray-500">{{ userProfile.email }}</p>
              </div>
              <div v-else class="">
                <p class="text-sm text-gray-500">
                  ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້ກະລານາລ໋ອກອິນໃຫມ່
                </p>
              </div>
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item>
              <a
                v-if="userProfile?.id"
                @click="gotoDetailsUser(userProfile.id)"
                class="block px-4 py-2"
                >ໂປຣໄຟລ໌ຂອງຂ້ອຍ</a
              >
            </Menu.Item>
            <Menu.Item>
              <a @click="logout()" class="block px-4 py-2 text-red-500"
                >ອອກຈາກລະບົບ</a
              >
            </Menu.Item>
          </Menu>
        </template>

        <a-avatar size="large" class="cursor-pointer">
          <template #icon><UserOutlined /></template>
        </a-avatar>
      </Dropdown>
    </div>
  </header>
</template>
