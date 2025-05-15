<script setup lang="ts">
import { RouterView } from "vue-router";
import { onBeforeMount, ref } from "vue";
import { useAuthStore } from "@/lib/stores/auth.store";

const authStore = useAuthStore();
const isLoading = ref(true);
onBeforeMount(async () => {
  isLoading.value = true;
  try {
    if (localStorage.getItem("access_token")) {
      await authStore.loadUser();
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
    <div class="text-lg">ກຳລັງໂຫລດຂໍ້ມູນ...</div>
  </div>
  <RouterView v-else />
</template>
