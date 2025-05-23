<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { onMounted, ref, computed, getCurrentInstance } from "vue";
import { UserOutlined } from "@ant-design/icons-vue";
import { useAuthStore } from "@/lib/stores/auth.store";
import { Dropdown, Menu } from "ant-design-vue";
import { useRouter } from "vue-router";
import { getFileUrl } from "@/utils/ConfigPathImage";

const emit = defineEmits<{ (e: "toggle"): void }>();
const authStore = useAuthStore();
const { getProfile } = authStore;
const { push } = useRouter();
const isDarkMode = ref(false);
const isLoading = ref(false);

// เพิ่มข้อมูลรูปภาพในโปรไฟล์
const userProfile = computed(() => {
  const currentUser = authStore.user;
  if (!currentUser || !currentUser.profile) return null;

  return {
    id: currentUser.profile.id,
    first_name: currentUser.profile.first_name || "N/A",
    last_name: currentUser.profile.last_name || "N/A",
    email: currentUser.email || "N/A",
    image: currentUser.profile.image || null, // เพิ่มข้อมูลรูปภาพ
  };
});

// ใช้ getFileUrl เพื่อรับ URL รูปโปรไฟล์
const profileImageUrl = computed(() => {
  if (userProfile.value?.image) {
    return getFileUrl(userProfile.value.image);
  }
  return null;
});

// จัดการเมื่อรูปภาพโหลดไม่สำเร็จ
const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  target.style.display = "none"; // ซ่อนรูปภาพ
};

// สร้างฟังก์ชันสำหรับ getPopupContainer เพื่อหลีกเลี่ยงปัญหา document is not defined
const getPopupContainer = () => {
  return document.body;
};

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
    authStore.resetAuth();
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
    if (!authStore.isLoading) {
      isLoading.value = true;
      await getProfile();
      isLoading.value = false;
    } else {
      console.log("[HEADER] User already loaded, using cached data");
    }
  } catch (error) {
    console.error("[HEADER] Error fetching profile:", error);
    isLoading.value = false;
  }

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    isDarkMode.value = savedTheme === "dark";
    document.documentElement.classList.toggle("dark", isDarkMode.value);
  }
});
</script>

<template>
  <header
    class="fixed top-0 z-50 flex items-center justify-start w-full h-16 px-4 bg-white dark:bg-gray-900 dark:text-white shadow-sm"
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
      <Dropdown placement="bottomRight" :getPopupContainer="getPopupContainer">
        <template #overlay>
          <Menu class="profile-dropdown-menu">
            <Menu.Item>
              <template v-if="isLoading">
                <div class="p-2">
                  <p>ກຳລັງໂຫລດຂໍ້ມູນ...</p>
                </div>
              </template>
              <template v-else-if="userProfile">
                <div class="">
                  <p class="font-semibold dark:text-white">
                    {{ userProfile.first_name }} {{ userProfile.last_name }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-300">
                    {{ userProfile.email }}
                  </p>
                </div>
              </template>
              <template v-else>
                <div class="">
                  <p class="text-sm text-gray-500 dark:text-gray-300">
                    ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້ກະລານາລ໋ອກອິນໃຫມ່
                  </p>
                </div>
              </template>
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item v-if="userProfile?.id">
              <a
                @click="gotoDetailsUser(userProfile.id)"
                class="block px-4 py-2 dark:text-white"
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

        <a-avatar
          :size="48"
          class="cursor-pointer flex items-center justify-center"
        >
          <template v-if="profileImageUrl">
            <img
              :src="profileImageUrl"
              alt="Profile"
              @error="handleImageError"
              class="w-full h-full object-cover rounded-full"
            />
          </template>
          <template v-else>
            <UserOutlined style="font-size: 24px" />
          </template>
        </a-avatar>
      </Dropdown>
    </div>
  </header>
</template>

<style>
/* ปรับ z-index ให้สูง และกำหนดตำแหน่งใหม่สำหรับ dropdown */
.ant-dropdown {
  position: fixed !important;
  z-index: 2000 !important;
}

.profile-dropdown-menu.ant-dropdown-menu {
  min-width: 200px;
}

/* สำหรับโหมดกลางคืน */
.dark .ant-dropdown-menu {
  background-color: #1f2937 !important;
  border-color: #374151 !important;
}

.dark .ant-dropdown-menu-item,
.dark .ant-dropdown-menu-submenu-title {
  color: #e5e7eb !important;
}

.dark .ant-dropdown-menu-item:hover,
.dark .ant-dropdown-menu-submenu-title:hover {
  background-color: #374151 !important;
}

.dark .ant-dropdown-menu-item-divider {
  background-color: #374151 !important;
}
</style>
