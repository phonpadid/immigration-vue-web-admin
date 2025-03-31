<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { onMounted, ref } from "vue";
import { UserOutlined } from "@ant-design/icons-vue";
import { useAuthStore } from "@/modules/Admin/authentication/store/auth.store";
import { Dropdown, Menu } from "ant-design-vue";
import { useRouter, useRoute } from "vue-router";

const emit = defineEmits<{ toggle: [] }>();
const { getProfile, logout } = useAuthStore();
const userProfile = ref<{
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
} | null>(null);

const { push } = useRouter();
const { params } = useRoute();
const isDarkMode = ref(false);

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
    const profileData = await getProfile();

    if (!profileData || !profileData.profile) {
      console.error("❌ Profile Data is null or undefined!");
      return;
    }

    userProfile.value = {
      id: profileData.profile.id ?? undefined,
      first_name: profileData.profile.first_name ?? "N/A",
      last_name: profileData.profile.last_name ?? "N/A",
      email: profileData.email ?? "N/A",
    };
  } catch (error) {
    console.error("❌ Error fetching profile:", error);
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
              <div class="">
                <p class="font-semibold">
                  {{ userProfile?.first_name }} {{ userProfile?.last_name }}
                </p>
                <p class="text-sm text-gray-500">{{ userProfile?.email }}</p>
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
