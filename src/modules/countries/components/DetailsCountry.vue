<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useCountryStore } from "../store/country.store";
import { useRoute, useRouter } from "vue-router";
import type {
  CountryDetailsResponse,
  TabConfig,
  Translation,
} from "../interface/country.interface";
import { formatDateTime } from "@/utils/FormatDataTime";
import { imgBaseUrl } from "@/utils/ConfigPathImage";
import { Modal } from "ant-design-vue";
import { useNotification } from "@/utils/notificationService";
import Tab from "@/components/Tab/Tab.vue";
import UiButton from "@/components/button/UiButton.vue";

/************************************************************* */
const activeTab = ref("1");
const tabsConfig: TabConfig[] = [
  { key: "1", label: "ພາສາລາວ", slotName: "tab1" },
  { key: "2", label: "ພາສາອັງກິດ", slotName: "tab2" },
  { key: "3", label: "ພາສາຈີນ", slotName: "tab3" },
];
const laoTranslation = ref<Translation | null>(null);
const englishTranslation = ref<Translation | null>(null);
const chineseTranslation = ref<Translation | null>(null);
/************************************************************* */
const { getCountryById, deleteCountry } = useCountryStore();
const countryData = ref<CountryDetailsResponse | null>(null);
const route = useRoute();
const { push } = useRouter();
const countryId = ref<number | null>(null);
const isLoading = ref(false);
const { openNotification } = useNotification();
/******************************************************************* */
// Helper function to get translation by language
const getTranslation = (lang: string): Translation | null => {
  if (!countryData.value || !countryData.value.translates) return null;
  // Use type assertion to tell TypeScript that translates is an array of Translation objects
  const translations = countryData.value.translates as unknown as Translation[];
  return translations.find((t) => t.lang === lang) || null;
};

const editCountry = () => {
  push({ name: "countries_edit" });
};

const removeCountry = (id: number) => {
  Modal.confirm({
    title: "ຢືນຢັນການລົບ",
    content: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບລາຍການນີ້??",
    okText: "ແມ່ນແລ້ວ,ຂ້ອຍແນ່ໃຈ",
    cancelText: "ບໍ່,ຍົກເລີກ",
    okType: "danger",
    onOk: async () => {
      try {
        isLoading.value = true;
        await deleteCountry(id);
        push({ name: "countries" });
        openNotification("success", "ລຶບຂໍ້ມູນ", "ລົບຂໍ້ມູນສຳເລັດ");
      } catch (err) {
        console.error("Error:", err);
        openNotification("error", "ລຶບຂໍ້ມູນ", "ເກີດຂໍ້ຜິດພາດໃນການລຶບ");
      } finally {
        isLoading.value = false;
      }
    },
  });
};

const fetchCountryData = async (id: number): Promise<void> => {
  if (!id) return;

  isLoading.value = true;
  try {
    const data = await getCountryById(id);
    countryData.value = data;
    laoTranslation.value = getTranslation("lo");
    englishTranslation.value = getTranslation("en");
    chineseTranslation.value = getTranslation("zh_cn");
  } catch (error) {
    console.error("Failed to fetch country data:", error);
  } finally {
    isLoading.value = false;
  }
};
onMounted(() => {
  if (route.params.id) {
    countryId.value = parseInt(route.params.id as string);
    fetchCountryData(countryId.value);
  }
});
</script>

<template>
  <h2 class="text-xl font-bold text-gray-900 dark:text-white ">
    ລາຍລະອຽດປະເທດ
  </h2>

  <div v-if="isLoading" class="flex justify-center my-8">
    <div
      class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"
    ></div>
  </div>

  <div v-else-if="!countryData" class="text-center my-8 text-gray-500">
    ບໍ່ພົບຂໍ້ມູນປະເທດ
  </div>

  <div v-else class="relative">
    <Tab v-model="activeTab" :tabs="tabsConfig">
      <!-- Lao language tab -->
      <template #tab1>
        <dl class="mt-4" v-if="laoTranslation">
          <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
            ຊື່
          </dt>
          <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
            {{ laoTranslation.name }}
          </dd>

          <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
            ຄຳອະທິບາຍ
          </dt>
          <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
            {{ laoTranslation.description || "-" }}
          </dd>
        </dl>

        <div class="grid gap-4 my-4 sm:mb-8 md:grid-cols-2 md:gap-6">
          <div class="grid gap-4 sm:mb-5 sm:grid-cols-1 sm:gap-6 md:gap-12">
            <div class="relative w-full mx-auto">
              <img
                v-if="countryData && countryData.image"
                :src="`${imgBaseUrl}/${countryData.image}`"
                alt="Country Image"
                class="max-w-full h-auto rounded-lg"
              />
              <div v-else class="text-gray-500">ບໍ່ມີຮູບພາບ</div>
            </div>
          </div>

          <dl v-if="countryData">
            <div class="grid sm:mb-8 md:grid-cols-2">
              <dt
                class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
              >
                ຍົກເວັ້ນວິຊາ:
              </dt>
              <dd
                class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5 flex items-center"
              >
                <span
                  class="w-3 h-3 rounded-full mr-2"
                  :class="
                    countryData.is_except_visa ? 'bg-green-500' : 'bg-red-500'
                  "
                ></span>
                {{
                  countryData.is_except_visa ? "ຍົກເວັ້ນວິຊາ" : "ຕ້ອງການວິຊາ"
                }}
              </dd>

              <dt
                class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
              >
                ເວລາສ້າງ:
              </dt>
              <dd
                class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
              >
                {{ formatDateTime(countryData.created_at) }}
              </dd>
              <dt
                class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
              >
                ເວລາອັບເດດ:
              </dt>
              <dd
                class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
              >
                {{ formatDateTime(countryData.updated_at) }}
              </dd>
            </div>
          </dl>
        </div>
      </template>

      <!-- English language tab -->
      <template #tab2>
        <dl class="mt-4" v-if="englishTranslation">
          <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
            ຊື່
          </dt>
          <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
            {{ englishTranslation.name }}
          </dd>

          <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
            ຄຳອະທິບາຍ
          </dt>
          <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
            {{ englishTranslation.description || "-" }}
          </dd>
        </dl>

        <div class="grid gap-4 my-4 sm:mb-8 md:grid-cols-2 md:gap-6">
          <div class="grid gap-4 sm:mb-5 sm:grid-cols-1 sm:gap-6 md:gap-12">
            <div class="relative w-full mx-auto">
              <img
                v-if="countryData && countryData.image"
                :src="`${imgBaseUrl}/${countryData.image}`"
                alt="Country Image"
                class="max-w-full h-auto rounded-lg"
              />
              <div v-else class="text-gray-500">No image available</div>
            </div>
          </div>

          <dl v-if="countryData">
            <div class="grid sm:mb-8 md:grid-cols-2">
              <dt
                class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
              >
                ຍົກເວັ້ນວິຊາ:
              </dt>
              <dd
                class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5 flex items-center"
              >
                <span
                  class="w-3 h-3 rounded-full mr-2"
                  :class="
                    countryData.is_except_visa ? 'bg-green-500' : 'bg-red-500'
                  "
                ></span>
                {{
                  countryData.is_except_visa ? "ຍົກເວັ້ນວິຊາ" : "ຕ້ອງການວິຊາ"
                }}
              </dd>

              <dt
                class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
              >
                ເວລາສ້າງ:
              </dt>
              <dd
                class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
              >
                {{ formatDateTime(countryData.created_at) }}
              </dd>
              <dt
                class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
              >
                ເວລາອັບເດດ:
              </dt>
              <dd
                class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
              >
                {{ formatDateTime(countryData.updated_at) }}
              </dd>
            </div>
          </dl>
        </div>
      </template>

      <!-- Chinese language tab -->
      <template #tab3>
        <dl class="mt-4" v-if="chineseTranslation">
          <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
            ຊື່
          </dt>
          <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
            {{ chineseTranslation.name }}
          </dd>

          <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
            ຄຳອະທິບາຍ
          </dt>
          <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
            {{ chineseTranslation.description || "-" }}
          </dd>
        </dl>

        <div class="grid gap-4 my-4 sm:mb-8 md:grid-cols-2 md:gap-6">
          <div class="grid gap-4 sm:mb-5 sm:grid-cols-1 sm:gap-6 md:gap-12">
            <div class="relative w-full mx-auto">
              <img
                v-if="countryData && countryData.image"
                :src="`${imgBaseUrl}/${countryData.image}`"
                alt="Country Image"
                class="max-w-full h-auto rounded-lg"
              />
              <div v-else class="text-gray-500">ບໍ່ມີຮູບພາບ</div>
            </div>
          </div>

          <dl v-if="countryData">
            <div class="grid sm:mb-8 md:grid-cols-2">
              <dt
                class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
              >
                ຍົກເວັ້ນວິຊາ:
              </dt>
              <dd
                class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5 flex items-center"
              >
                <span
                  class="w-3 h-3 rounded-full mr-2"
                  :class="
                    countryData.is_except_visa ? 'bg-green-500' : 'bg-red-500'
                  "
                ></span>
                {{
                  countryData.is_except_visa ? "ຍົກເວັ້ນວິຊາ" : "ຕ້ອງການວິຊາ"
                }}
              </dd>

              <dt
                class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
              >
                ເວລາສ້າງ:
              </dt>
              <dd
                class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
              >
                {{ formatDateTime(countryData.created_at) }}
              </dd>
              <dt
                class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
              >
                ເວລາອັບເດດ:
              </dt>
              <dd
                class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
              >
                {{ formatDateTime(countryData.updated_at) }}
              </dd>
            </div>
          </dl>
        </div>
      </template>
    </Tab>
    <div class="p-4 flex items-center gap-4">
      <UiButton
        @click="editCountry"
        type="submit"
        size="large"
        colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center"
      >
        ແກ້ໄຂ
      </UiButton>

      <UiButton
        @click="countryId !== null && removeCountry(countryId)"
        type="button"
        size="large"
        icon="material-symbols:delete-outline-sharp"
        colorClass="!bg-red-500 hover:!bg-red-700 text-white flex items-center"
      >
        ລຶບ
      </UiButton>
    </div>
  </div>
</template>
