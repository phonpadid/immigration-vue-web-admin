<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "../store/user.store";
import type { UserResponse } from "../interface/user.interface";
import { onMounted, ref } from "vue";
import { formatDateTime } from "@/utils/FormatDataTime";
import UiButton from "@/components/button/UiButton.vue";
import AvatarComponent from "@/components/Avatar/AvatarComponent.vue";

const { push } = useRouter();
const { getUserById } = useUserStore();
const isLoading = ref(true);
const dataUser = ref<UserResponse>();
const route = useRoute();
const userId = Number(route.params.id);

const toEdit = () => {
  push({ name: "users_edit" });
};

const getUserData = async () => {
  try {
    isLoading.value = true;
    const data = await getUserById(userId);

    if (data) {
      dataUser.value = data;
    }
  } catch (err) {
    console.log("User Err :", err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  getUserData();
});
</script>

<template>
  <div class="relative">
    <div
      class="px-4 mb-4 grid gap-4 sm:mb-5 sm:grid-cols-3 sm:gap-6 md:gap-12 "
    >
      <div class="sm:col-span-2">
        <div class="flex items-center">
          <AvatarComponent :size="80" icon="mdi:user" />

          <div class="ml-4">
            <h2
              class="text-gray-900 leading-4 font-bold text-xl flex items-center mb-2 sm:text-2xl dark:text-white"
            >
              {{ dataUser?.profile.first_name }}
              {{ dataUser?.profile.last_name }}
            </h2>
            <div class="flex items-center gap-2">
              <span
                class="bg-primary-100 text-primary-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-primary-900 dark:text-primary-300"
                >{{ dataUser?.profile.first_name }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <dl>
        <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
          ທີ່​ຢູ່​ອີ​ເມວ
        </dt>
        <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
          {{ dataUser?.email }}
        </dd>
        <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
          ເຂົ້າລະບົບລ່າສຸດ
        </dt>
        <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
          {{
            dataUser?.created_at
              ? formatDateTime(dataUser.created_at)
              : "ບໍ່ພົບຂໍ້ມູນ"
          }}
        </dd>
      </dl>
    </div>
    <UiButton
      type="primary"
      size="large"
      colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center"
      icon="material-symbols-light:edit-square"
      @click="toEdit"
      >ແກ້ໄຂ</UiButton
    >
  </div>
</template>
