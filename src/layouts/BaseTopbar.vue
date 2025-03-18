<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { onMounted, ref, watchEffect } from "vue";
import { UserOutlined } from "@ant-design/icons-vue";
import { useAuthStore } from "@/modules/Admin/authentication/store/auth.store";

const emit = defineEmits<{ toggle: [] }>();

const { getProfile } = useAuthStore();

const isDarkMode = ref(false);

// Toggle Dark Mode
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  document.documentElement.classList.toggle("dark", isDarkMode.value);
};

// ติดตามการเปลี่ยนแปลงของธีมเพื่ออัปเดตค่าใน Local Storage (ถ้าต้องการจำค่า)
watchEffect(() => {
  localStorage.setItem("theme", isDarkMode.value ? "dark" : "light");
});

onMounted(async () => {
  await getProfile();
});
</script>

<template>
  <header
    class="fixed top-0 z-10 flex items-center justify-start w-full h-16 px-4 bg-white dark:bg-gray-900 dark:text-white shadow-sm"
  >
    <!-- Toggle Sidebar -->
    <Icon
      icon="lucide-align-justify"
      width="24"
      height="24"
      class="cursor-pointer"
      @click="emit('toggle')"
    />

    <!-- Right Side: Dark Mode & Avatar -->
    <div class="flex items-center gap-4 ml-auto">
      <!-- Dark Mode Toggle -->
      <button @click="toggleDarkMode">
        <Icon
          :icon="isDarkMode ? 'lucide-moon' : 'lucide-sun'"
          width="24"
          height="24"
        />
      </button>

      <!-- User Avatar -->
      <a-avatar size="large" class="cursor-pointer">
        <template #icon><UserOutlined /></template>
      </a-avatar>
    </div>
  </header>
</template>

<style scoped>
/* Tailwind CSS จะช่วยจัดการ Dark Mode ได้ดีขึ้น */
</style>
