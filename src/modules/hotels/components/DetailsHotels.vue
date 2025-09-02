<script setup lang="ts">
import { ref, reactive, computed, onMounted, h } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useHotelsStore } from "../store/hotels.store";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useNotification } from "@/utils/notificationService";
import { Modal } from "ant-design-vue";
import { DeleteOutlined } from "@ant-design/icons-vue";
import type {
  HotelDetailData,
  TranslationsData,
  TabConfig,
} from "../interface/hotels.interface";
import { formatDateTime } from "@/utils/FormatDataTime";
import LoadingSpinner from "@/components/loading/LoadingSpinner.vue";
import Tab from "@/components/Tab/Tab.vue";
import UiButton from "@/components/button/UiButton.vue";
import HasPermission from "@/components/CheckPermission/HasPermission.vue";
import {
  HOTEL_READ,
  HOTEL_WRITE,
  HOTEL_REMOVE,
} from "@/common/utils/PermissionGroup";

// Store, router และ notification
const hotelsStore = useHotelsStore();
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const { openNotification } = useNotification();
const hotelId = computed<number>(() => Number(route.params.id));
const imageBaseUrl: string =
  import.meta.env.VITE_IMG_URL || "http://178.128.20.203:81/api";
const isLoading = ref<boolean>(true);
const activeTab = ref<string>("1");

// คอมพิวเต็ดพร็อพเพอร์ตี้สำหรับตรวจสอบสิทธิ์
const canReadHotel = computed(() => authStore.hasPermission(HOTEL_READ));
const canWriteHotel = computed(() => authStore.hasPermission(HOTEL_WRITE));
const canDeleteHotel = computed(() => authStore.hasPermission(HOTEL_REMOVE));

const tabsConfig: TabConfig[] = [
  { key: "1", label: "ພາສາລາວ", slotName: "lo" },
  { key: "2", label: "ພາສາອັງກິດ", slotName: "en" },
  { key: "3", label: "ພາສາຈີນ", slotName: "zh_cn" },
];
const translations = reactive<TranslationsData>({
  lo: { name: "", province: "", district: "", village: "" },
  en: { name: "", province: "", district: "", village: "" },
  zh_cn: { name: "", province: "", district: "", village: "" },
});
const hotel = reactive<HotelDetailData>({
  id: 0,
  image: null,
  link: "",
  map_link: "",
  phone_number: "",
  is_published: false,
  created_at: "",
  updated_at: "",
  user: null,
});
const fullImageUrl = computed<string>(() => {
  if (!hotel.image) return "";
  if (
    typeof hotel.image === "string" &&
    (hotel.image.startsWith("http://") || hotel.image.startsWith("https://"))
  ) {
    return hotel.image;
  }
  return `${imageBaseUrl}/${String(hotel.image).replace(/^\//, "")}`;
});

const getPublishStatus = computed<boolean>(() => {
  if (typeof hotel.is_published === "string") {
    return hotel.is_published === "1";
  }
  return !!hotel.is_published;
});
onMounted(async (): Promise<void> => {
  
  if (!canReadHotel.value) {
    openNotification("error", "ຂໍ້ຜິດພາດ", "ທ່ານບໍ່ມີສິດເຂົ້າເຖິງຂໍ້ມູນນີ້");
    router.push({ name: "hotels" });
    return;
  }

  if (!hotelId.value) {
    openNotification("error", "ຜິດພາດ", "ບໍ່ພົບ ID ຂອງໂຮງແຮມ");
    router.push({ name: "hotels" });
    return;
  }
  try {
    isLoading.value = true;
    const data = await hotelsStore.getHotelsById(hotelId.value);

    if (!data) {
      openNotification("error", "ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນໂຮງແຮມ");
      router.push({ name: "hotels" });
      return;
    }
    hotel.id = data.id || 0;
    hotel.image = data.image || null;
    hotel.link = data.link || "";
    hotel.map_link = data.map_link || data.link_map || "";
    hotel.phone_number = data.phone_number || "";
    hotel.is_published =
      typeof data.is_published === "string"
        ? data.is_published === "1"
        : !!data.is_published;
    hotel.created_at = data.created_at || "";
    hotel.updated_at = data.updated_at || "";
    hotel.user = data.user || null;
    if (data.translates && Array.isArray(data.translates)) {
      data.translates.forEach((translate: any) => {
        if (
          translate.lang === "lo" ||
          translate.lang === "en" ||
          translate.lang === "zh_cn"
        ) {
          const lang = translate.lang as keyof TranslationsData;
          translations[lang] = {
            id: translate.id,
            name: translate.name || "",
            province: translate.province || "",
            district: translate.district || "",
            village: translate.village || "",
          };
        }
      });
    }
  } catch (error) {
    console.error("Failed to fetch hotel data:", error);
    openNotification("error", "ຜິດພາດ", "ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ");
  } finally {
    isLoading.value = false;
  }
});

// เพิ่มการตรวจสอบสิทธิ์ก่อนทำการลบ
const confirmDelete = (): void => {
  // ตรวจสอบสิทธิ์ก่อนแสดง Modal ยืนยันการลบ
  if (!canDeleteHotel.value) {
    openNotification("error", "ຂໍ້ຜິດພາດ", "ທ່ານບໍ່ມີສິດລຶບໂຮງແຮມນີ້");
    return;
  }

  Modal.confirm({
    title: "ຍືນຍັນການລຶບ",
    icon: () => h(DeleteOutlined),
    content: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບລາຍການນີ້?",
    okText: "ແມ່ນແລ້ວ, ຂ້ອຍແນ່ໃຈ",
    cancelText: "ບໍ່, ຍົກເລີກ",
    okType: "danger",
    onOk: async (): Promise<void> => {
      try {
        await hotelsStore.deleteHotels(hotelId.value);
        openNotification("success", "ລຶບຂໍ້ມູນ", "ລຶບຂໍ້ມູນສຳເລັດ");
        router.push({ name: "hotels" });
      } catch (error) {
        openNotification("error", "ຜິດພາດ", "ເກີດຂໍ້ຜິດພາດໃນການລຶບຂໍ້ມູນ");
      }
    },
  });
};
const handleEdit = (): void => {
  if (!canWriteHotel.value) {
    openNotification("error", "ຂໍ້ຜິດພາດ", "ທ່ານບໍ່ມີສິດແກ້ໄຂໂຮງແຮມນີ້");
    return;
  }
  router.push({ name: "hotels_edit", params: { id: hotelId.value } });
};

// ฟังก์ชันกลับไปยังหน้าโรงแรม
const goBack = (): void => {
  router.push({ name: "hotels" });
};
</script>

<template>
  <HasPermission :permission="HOTEL_READ">
    <div class="hotel-detail-container ">
      <div class="flex justify-between items-center mb-4">
        <!-- ปุ่มกลับ -->
        <div class="flex items-center gap-4">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">
            ລາຍລະອຽດໂຮງແຮມ
          </h2>
        </div>
      </div>

      <!-- Loading state -->
      <LoadingSpinner v-if="isLoading" class="relative h-[80vh]" />
      <div v-else class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <!-- Tab สำหรับเลือกภาษา -->
        <Tab v-model:activeKey="activeTab" :tabs="tabsConfig" class="mb-6">
          <!-- laos -->
          <template #lo>
            <div>
              <div
                class="px-4 mb-4 grid gap-4 sm:mb-5 sm:grid-cols-2 sm:gap-6 md:gap-12"
              >
                <dl>
                  <dt
                    class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
                  >
                    ຊື່ໂຮງແຮມ
                  </dt>
                  <dd
                    class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
                  >
                    <p>{{ translations.lo.name || "-" }}</p>
                  </dd>
                </dl>
                <dl>
                  <dt
                    class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
                  >
                    ທີຢູ່
                  </dt>
                  <dd
                    class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
                  >
                    <p>
                      ບ້ານ: {{ translations.lo.village || "-" }}, ເມືອງ:
                      {{ translations.lo.district || "-" }}, ແຂວງ:
                      {{ translations.lo.province || "-" }}
                    </p>
                  </dd>
                </dl>
              </div>
            </div>
          </template>

          <!-- en -->
          <template #en>
            <div>
              <div
                class="px-4 mb-4 grid gap-4 sm:mb-5 sm:grid-cols-2 sm:gap-6 md:gap-12"
              >
                <dl>
                  <dt
                    class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
                  >
                    ຊື່ໂຮງແຮມ
                  </dt>
                  <dd
                    class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
                  >
                    <p>{{ translations.en.name || "-" }}</p>
                  </dd>
                </dl>
                <dl>
                  <dt
                    class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
                  >
                    ທີຢູ່
                  </dt>
                  <dd
                    class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
                  >
                    <p>
                      ບ້ານ: {{ translations.en.village || "-" }}, ເມືອງ:{{
                        translations.en.district || "-"
                      }}, ແຂວງ:{{ translations.en.province || "-" }}
                    </p>
                  </dd>
                </dl>
              </div>
            </div>
          </template>

          <!-- zh_cn -->
          <template #zh_cn>
            <div>
              <div
                class="px-4 mb-4 grid gap-4 sm:mb-5 sm:grid-cols-2 sm:gap-6 md:gap-12"
              >
                <dl>
                  <dt
                    class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
                  >
                    ຊື່ໂຮງແຮມ
                  </dt>
                  <dd
                    class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
                  >
                    <p>{{ translations.zh_cn.name || "-" }}</p>
                  </dd>
                </dl>
                <dl>
                  <dt
                    class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
                  >
                    ທີຢູ່
                  </dt>
                  <dd
                    class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
                  >
                    <p>
                      ບ້ານ: {{ translations.zh_cn.village || "-" }}, ເມືອງ:
                      {{ translations.zh_cn.district || "-" }}, ແຂວງ:
                      {{ translations.zh_cn.province || "-" }}
                    </p>
                  </dd>
                </dl>
              </div>
            </div>
          </template>
        </Tab>

        <!-- Data Hotels -->
        <div
          class="px-4 mb-4 grid gap-4 sm:mb-5 sm:grid-cols-2 sm:gap-6 md:gap-12"
        >
          <dl>
            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ຮູບພາບ
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              <div class="relative w-full mx-auto">
                <img
                  v-if="fullImageUrl"
                  class="w-full object-cover rounded-md"
                  :src="fullImageUrl"
                  alt="Hotel Image"
                />
                <div
                  v-else
                  class="w-full h-40 bg-gray-200 flex items-center justify-center rounded-md"
                >
                  <span class="text-gray-500">ບໍ່ມີຮູບພາບ</span>
                </div>
              </div>
            </dd>
          </dl>
          <dl>
            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ເບີໂທ
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              {{ hotel.phone_number || "-" }}
            </dd>

            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ລິ້ງໂຮງແຮມ
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              <a
                v-if="hotel.link"
                :href="hotel.link"
                target="_blank"
                class="font-medium text-primary-600 dark:text-primary-500 hover:underline"
              >
                {{ hotel.link }}
              </a>
              <span v-else>-</span>
            </dd>

            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ສະຖານະ
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              <span
                class="px-2 py-1 rounded-full text-xs"
                :class="
                  getPublishStatus
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                "
              >
                {{ getPublishStatus ? "ເຜີຍແຜ່" : "ບໍ່ເຜີຍແຜ່" }}
              </span>
            </dd>

            <template v-if="hotel.user">
              <dt
                class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
              >
                ອີເມວຜູ້ໃຊ້
              </dt>
              <dd
                class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
              >
                {{ hotel.user.email || "-" }}
              </dd>
            </template>

            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ເວລາສ້າງ:
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              {{ formatDateTime(hotel.created_at) }}
            </dd>
            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ເວລາອັບເດດ:
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              {{ formatDateTime(hotel.updated_at) }}
            </dd>
          </dl>
        </div>

        <!-- Action buttons with permission checks -->
        <div
          class="flex items-center justify-start gap-4 mt-6 p-4 border-t border-gray-100 dark:border-gray-700"
        >
          <!-- ปุ่มแก้ไข - แสดงเฉพาะเมื่อมีสิทธิ์แก้ไข -->
          <HasPermission :permission="HOTEL_WRITE">
            <UiButton
              @click="handleEdit"
              type="primary"
              class="flex items-center gap-1 !bg-primary-700 hover:!bg-primary-900"
              size="large"
              icon="material-symbols:edit-square"
            >
              ແກ້ໄຂ
            </UiButton>
          </HasPermission>

          <!-- ปุ่มลบ - แสดงเฉพาะเมื่อมีสิทธิ์ลบ -->
          <HasPermission :permission="HOTEL_REMOVE">
            <UiButton
              @click="confirmDelete"
              type="primary"
              class="flex items-center gap-1 !bg-red-600 hover:!bg-red-900"
              size="large"
              icon="material-symbols:delete-outline-sharp"
            >
              ລຶບ
            </UiButton>
          </HasPermission>
        </div>
      </div>
    </div>

    <!-- Template slot สำหรับแสดงเมื่อไม่มีสิทธิ์เข้าถึง -->
    <template #fallback>
      <div class="flex flex-col items-center justify-center h-screen">
        <div class="text-6xl text-gray-300 mb-4">
          <i class="fas fa-lock"></i>
        </div>
        <h2 class="text-xl font-medium text-gray-700 mb-2">
          ທ່ານບໍ່ມີສິດເຂົ້າເຖິງຂໍ້ມູນໂຮງແຮມ
        </h2>
        <p class="text-gray-500 mb-6">
          ກະລຸນາຕິດຕໍ່ຜູ້ດູແລລະບົບຖ້າທ່ານເຊື່ອວ່ານີ້ແມ່ນຂໍ້ຜິດພາດ
        </p>
        <UiButton
          @click="goBack"
          type="primary"
          class="flex items-center gap-1"
          size="large"
        >
          ກັບຄືນໜ້າຫຼັກ
        </UiButton>
      </div>
    </template>
  </HasPermission>
</template>

<style scoped>
.hotel-detail-container {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.loader {
  border: 4px solid #f3f3f3;
  border-radius: 50%;
  border-top: 4px solid #3498db;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
