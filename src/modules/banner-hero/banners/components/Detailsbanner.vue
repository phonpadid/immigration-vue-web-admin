<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { usebannerStore } from "../store/banner.store";
import { useRoute, useRouter } from "vue-router";
import type { BannerResponse } from "../interface/banner.interface";
import { formatDatePicker, formatDateTime } from "@/utils/FormatDataTime";
import { Modal } from "ant-design-vue";
import Tab from "@/components/Tab/Tab.vue";
import UiButton from "@/components/button/UiButton.vue";

/*********************************************************************************** */

const route = useRoute();
const { push } = useRouter();
const { getBannerId, deleteBanner } = usebannerStore();
const bannerData = ref<BannerResponse>();
const bannerId = Number(route.params.id);

const loading = ref(true);
const activeTab = ref("1");
const tabsConfig = [
  { key: "1", label: "ພາສາລາວ", slotName: "tab1" },
  { key: "2", label: "ພາສາອັງກິດ", slotName: "tab2" },
  { key: "3", label: "ພາສາຈີນ", slotName: "tab3" },
];
const editBanner = () => {
  push({ name: "banners_edit" });
};
const removeBanner = () => {
  Modal.confirm({
    title: "ຢືນຢັນການລົບ",
    content: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບລາຍການນີ້??",
    okText: "ແມ່ນແລ້ວ,ຂ້ອຍແນ່ໃຈ",
    cancelText: "ບໍ່,ຍົກເລີກ",
    okType: "danger",
    onOk: async () => {
      try {
        loading.value = true;
        await deleteBanner(bannerId);
        alert("ລົບຂໍ້ມູນສຳເລັດ");
      } catch (err) {
        console.error("Error:", err);
      } finally {
        loading.value = false;
      }
    },
  });
};
/*********************************************************************************** */
const laoTranslation = computed(() => {
  if (!bannerData.value?.translates) return null;
  return bannerData.value.translates.find((item) => item.lang === "lo");
});
const englishTranslation = computed(() => {
  if (!bannerData.value?.translates) return null;
  return bannerData.value.translates.find((item) => item.lang === "en");
});
const chineseTranslation = computed(() => {
  if (!bannerData.value?.translates) return null;
  return bannerData.value.translates.find((item) => item.lang === "zh_cn");
});
const imageUrl = computed(() => {
  if (!bannerData.value?.image) return "";
  return `${import.meta.env.VITE_IMG_URL}/${bannerData.value.image}`;
});
/*********************************************************************************** */
const loadBannerData = async () => {
  try {
    loading.value = true;
    const bannerId = Number(route.params.id);
    if (isNaN(bannerId)) {
      //   console.error("Invalid banner ID:", route.params.id);
      return;
    }

    const data = await getBannerId(bannerId);
    bannerData.value = data;
  } catch (error) {
    console.error("Error loading banner data:", error);
  } finally {
    loading.value = false;
  }
};
/*********************************************************************************** */
onMounted(() => {
  loadBannerData();
});
</script>
<template>
  <div v-if="loading" class="flex justify-center items-center p-8">
    <div
      class="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"
    ></div>
  </div>

  <div v-else-if="bannerData">
    <h2 class="text-xl font-bold text-gray-900 dark:text-white mt-12">
      ລາຍລະອຽດປ້າຍ
    </h2>
    <div class="relative">
      <Tab v-model="activeTab" :tabs="tabsConfig">
        <!-- ພາສາລາວ -->
        <template #tab1>
          <div
            class="my-4 grid gap-4 sm:mb-5 sm:grid-cols-1 sm:gap-6 md:gap-12"
          >
            <div class="relative w-full mx-auto">
              <img
                :src="imageUrl"
                class="w-full object-cover rounded-md"
                :alt="laoTranslation?.title || 'Banner image'"
              />
              <div
                class="absolute inset-0 bg-gray-700 opacity-60 rounded-md"
              ></div>
              <div
                class="absolute inset-0 flex flex-col px-6 md:px-12 lg:px-28 justify-center gap-2 sm:gap-4 text-white"
              >
                <h2 class="text-2xl sm:text-4xl font-bold">
                  {{ laoTranslation?.title }}
                </h2>
                <p>{{ laoTranslation?.description }}</p>

                <UiButton
                  v-if="bannerData.link"
                  iconRight="material-symbols:arrow-right-alt-rounded"
                  type="primary"
                  size="large"
                  colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center w-28"
                >
                  ເພີ່ມຕື່ມ
                </UiButton>
              </div>
            </div>
          </div>
        </template>

        <!-- ພາສາອັງກິດ -->
        <template #tab2>
          <div
            class="my-4 grid gap-4 sm:mb-5 sm:grid-cols-1 sm:gap-6 md:gap-12"
          >
            <div class="relative w-full mx-auto">
              <img
                :src="imageUrl"
                class="w-full object-cover rounded-md"
                :alt="englishTranslation?.title || 'Banner image'"
              />
              <div
                class="absolute inset-0 bg-gray-700 opacity-60 rounded-md"
              ></div>
              <div
                class="absolute inset-0 flex flex-col px-6 md:px-12 lg:px-28 justify-center gap-2 sm:gap-4 text-white"
              >
                <h2 class="text-2xl sm:text-4xl font-bold">
                  {{ englishTranslation?.title }}
                </h2>
                <p>{{ englishTranslation?.description }}</p>

                <UiButton
                  v-if="bannerData.link"
                  iconRight="material-symbols:arrow-right-alt-rounded"
                  type="primary"
                  size="large"
                  colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center w-28"
                >
                  ເພີ່ມຕື່ມ
                </UiButton>
              </div>
            </div>
          </div>
        </template>

        <!-- ພາສາຈີນ -->
        <template #tab3>
          <div
            class="my-4 grid gap-4 sm:mb-5 sm:grid-cols-1 sm:gap-6 md:gap-12"
          >
            <div class="relative w-full mx-auto">
              <img
                :src="imageUrl"
                class="w-full object-cover rounded-md"
                :alt="chineseTranslation?.title || 'Banner image'"
              />
              <div
                class="absolute inset-0 bg-gray-700 opacity-60 rounded-md"
              ></div>
              <div
                class="absolute inset-0 flex flex-col px-6 md:px-12 lg:px-28 justify-center gap-2 sm:gap-4 text-white"
              >
                <h2 class="text-2xl sm:text-4xl font-bold">
                  {{ chineseTranslation?.title }}
                </h2>
                <p>{{ chineseTranslation?.description }}</p>

                <UiButton
                  v-if="bannerData.link"
                  iconRight="material-symbols:arrow-right-alt-rounded"
                  type="primary"
                  size="large"
                  colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center w-28"
                >
                  ເພີ່ມຕື່ມ
                </UiButton>
              </div>
            </div>
          </div>
        </template>
      </Tab>
      <div class="mt-6">
        <dl>
          <div class="grid gap-4 mb-4 sm:mb-8 md:grid-cols-2 md:gap-6">
            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ເວລາເລີມຕົ້ນ:
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              {{ formatDatePicker(bannerData.start_time) }}
            </dd>
            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ເວລາສິນສຸດ:
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              {{ formatDatePicker(bannerData.end_time) }}
            </dd>
            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ລິ້ງ:
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              <a
                v-if="bannerData.link"
                :href="bannerData.link"
                target="_blank"
                class="text-primary-600 hover:underline"
              >
                {{ bannerData.link }}
              </a>
              <span v-else>-</span>
            </dd>
            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ເວລາສ້າງ:
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              {{ formatDateTime(bannerData.created_at) }}
            </dd>
            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ເວລາອັບເດດ:
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              {{ formatDateTime(bannerData.updated_at) }}
            </dd>
          </div>
        </dl>
      </div>
      <div class="p-4 flex items-center gap-4">
        <UiButton
          @click="editBanner"
          size="large"
          icon="material-symbols:edit-square"
          colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center"
        >
          ແກ້ໄຂ
        </UiButton>
        <UiButton
          size="large"
          icon="material-symbols:delete-outline-sharp"
          colorClass="!bg-red-700 hover:!bg-red-900 text-white flex items-center"
          @click="removeBanner"
        >
          ລຶບ
        </UiButton>
      </div>
    </div>
  </div>

  <div v-else class="p-8 text-center">
    <p class="text-gray-500">ບໍ່ພົບຂໍ້ມູນປ້າຍ</p>
  </div>
</template>
