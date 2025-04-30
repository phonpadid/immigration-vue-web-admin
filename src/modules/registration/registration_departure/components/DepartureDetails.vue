<script setup lang="ts">
import { onMounted, watch, computed, ref } from "vue";
import { useRoute } from "vue-router";
import { formatDatePicker, formatDateTime } from "@/utils/FormatDataTime";
import { CheckCircleOutlined } from "@ant-design/icons-vue";
import { useDepartureStore } from "../store/departure.store";
import UiButton from "@/components/button/UiButton.vue";
import QRCode from "qrcode";

const route = useRoute();
const departureStore = useDepartureStore();
const departureId = route.params.id as string;
const qrCodeGenerated = ref(false);

// Environment variables
const imgUrl = computed(() => import.meta.env.VITE_IMG_URL || "");

// QR Code Generation
const generateQRCode = async (codeValue: string) => {
  if (qrCodeGenerated.value) return;

  try {
    const element = document.getElementById("departure-qr");
    if (!element) return;

    element.innerHTML = "";
    const canvas = document.createElement("canvas");
    element.appendChild(canvas);

    await QRCode.toCanvas(canvas, codeValue, {
      width: 150,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });

    qrCodeGenerated.value = true;
  } catch (error) {
    console.error("Failed to generate QR code:", error);
  }
};

// Verification handling
const handleVerification = async () => {
  await departureStore.verifyDeparture(departureId);
};

// Image URL handling
const getImageUrl = (path: string | undefined) => {
  if (!path) return "";
  return `${imgUrl.value}/${path.startsWith("/") ? path.substring(1) : path}`;
};

// Initial data loading
onMounted(async () => {
  if (
    !departureStore.currentDeparture ||
    departureStore.currentDeparture.id.toString() !== departureId
  ) {
    await departureStore.getDepartureById(parseInt(departureId));
  }

  if (
    departureStore.currentDeparture?.verification_code &&
    !qrCodeGenerated.value
  ) {
    await generateQRCode(departureStore.currentDeparture.verification_code);
  }
});

// Watch for changes in verification code
watch(
  () => departureStore.currentDeparture?.verification_code,
  async (newValue) => {
    if (newValue && !qrCodeGenerated.value) {
      await generateQRCode(newValue);
    }
  },
  { immediate: false }
);
</script>

<template>
  <div class="relative p-4 mt-12">
    <!-- Loading State -->
    <div
      v-if="departureStore.isLoading"
      class="flex justify-center items-center h-64"
    >
      <div
        class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
      ></div>
    </div>

    <!-- Data Display -->
    <div v-else-if="departureStore.currentDeparture">
      <!-- Departure Information Section -->
      <div class="mb-3 border-b pb-4">
        <h2
          class="mb-4 text-xl font-semibold leading-none text-gray-900 md:text-2xl dark:text-white"
        >
          ຂໍ້ມູນການອອກເມືອງ
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <dl>
            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ຈຸດອອກ
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              {{ departureStore.currentDeparture.departure_name }}
            </dd>

            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ຈຸດອອກຄັ້ງສຸດທ້າຍ
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              {{ departureStore.currentDeparture.last_leaving }}
            </dd>

            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ບັນຊີດໍາ
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              <div class="flex items-center">
                <div
                  class="border rounded-full h-3 w-3 mr-2"
                  :class="{
                    'bg-green-500':
                      departureStore.currentDeparture.black_list ===
                      'available',
                    'bg-red-500':
                      departureStore.currentDeparture.black_list ===
                      'unavailable',
                  }"
                ></div>
                {{
                  departureStore.currentDeparture.black_list === "available"
                    ? "ບໍ່ມີໃນບັນຊີດຳ"
                    : "ມີໃນບັນຊີດຳ"
                }}
              </div>
            </dd>

            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ລົງທະບຽນເມືອ
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              {{ formatDateTime(departureStore.currentDeparture.created_at) }}
            </dd>
          </dl>

          <dl>
            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ລະຫັດຢືນຢັນອອກເມືອງ
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              <span
                v-if="departureStore.currentDeparture.verification_code"
                class="font-medium text-gray-900"
              >
                {{
                  departureStore.currentDeparture.verification_code
                    .split("")
                    .join(" ")
                }}
              </span>
              <span v-else>ລົງທະບຽນບໍ່ສຳເລັດ</span>
            </dd>

            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ຢືນຢັນໃນວັນທີ່
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              <span
                v-if="departureStore.currentDeparture.verified_at"
                class="text-green-500 font-medium flex gap-1 items-center"
              >
                <CheckCircleOutlined class="h-4 w-4" />
                {{
                  formatDateTime(departureStore.currentDeparture.verified_at)
                }}
              </span>
              <span v-else class="flex items-center">
                ຍັງບໍ່ມີການຢືນຢັນ
                <UiButton
                  @click="handleVerification"
                  :disabled="departureStore.isVerifying"
                  class="ms-2 bg-primary-700 hover:bg-primary-900 text-white font-bold py-1 px-2 text-sm rounded flex items-center"
                  icon="material-symbols:verified-rounded"
                  size="large"
                >
                  <span v-if="departureStore.isVerifying" class="mr-2">
                    <span
                      class="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full inline-block"
                    ></span>
                  </span>
                  ຢືນຢັນ
                </UiButton>
              </span>
            </dd>

            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              QR Code
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              <div
                id="departure-qr"
                class="w-40 h-40 border rounded p-2 flex items-center justify-center"
              ></div>
            </dd>
          </dl>
        </div>
      </div>

      <!-- Personal Information Section -->
      <div class="mb-3 border-b pb-4">
        <h2
          class="mb-4 text-xl font-semibold leading-none text-gray-900 md:text-2xl dark:text-white"
        >
          ຂໍ້ມູນສ່ວນຕົວ
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <dl>
            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ຊື່ ແລະ ນາມສະກຸນ
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              {{ departureStore.currentDeparture.personal_information.name }}
              {{
                departureStore.currentDeparture.personal_information.family_name
              }}
            </dd>

            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ວັນເດືອນປີເກີດ
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              {{
                formatDatePicker(
                  departureStore.currentDeparture.personal_information
                    .date_of_birth
                )
              }}
            </dd>

            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ສະຖານທີ່ເກີດ
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              {{
                departureStore.currentDeparture.personal_information
                  .place_of_birth
              }}
            </dd>
          </dl>

          <dl>
            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ເພດ
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              {{
                departureStore.currentDeparture.personal_information.gender ===
                "female"
                  ? "ຍິງ"
                  : "ຊາຍ"
              }}
            </dd>

            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ສັນຊາດ
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              {{
                departureStore.currentDeparture.personal_information.nationality
              }}
            </dd>

            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ອາຊີບ
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              {{
                departureStore.currentDeparture.personal_information.occupation
              }}
            </dd>
          </dl>
        </div>
      </div>

      <!-- Passport Information Section -->
      <div>
        <h2
          class="mb-4 text-xl font-semibold leading-none text-gray-900 md:text-2xl dark:text-white"
        >
          ຂໍ້ມູນຫນັງສືຜ່ານແດນ
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <img
            :src="
              getImageUrl(
                departureStore.currentDeparture.passport_information.image
              )
            "
            alt="passport image"
            class="w-full rounded-lg border"
          />

          <dl
            class="ms-0 md:ms-4 flex flex-row md:flex-col justify-between md:justify-start"
          >
            <div>
              <dt
                class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
              >
                ເລກໜັງສືຜ່ານແດນ
              </dt>
              <dd
                class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
              >
                {{
                  departureStore.currentDeparture.passport_information.number
                }}
              </dd>
            </div>
            <div>
              <dt
                class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
              >
                ວັນ​ຫມົດ​ອາ​ຍຸ
              </dt>
              <dd
                class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
              >
                {{
                  formatDatePicker(
                    departureStore.currentDeparture.passport_information
                      .expiry_date
                  )
                }}
              </dd>
            </div>
            <div>
              <dt
                class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
              >
                ວັນທີອອກ
              </dt>
              <dd
                class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
              >
                {{
                  formatDatePicker(
                    departureStore.currentDeparture.passport_information
                      .date_issue
                  )
                }}
              </dd>
            </div>
            <div>
              <dt
                class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
              >
                ສະ​ຖານ​ທີ່​ອອກ
              </dt>
              <dd
                class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
              >
                {{
                  departureStore.currentDeparture.passport_information
                    .place_issue
                }}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>

    <!-- No Data State -->
    <div v-else-if="!departureStore.isLoading" class="text-center p-8">
      <p class="text-gray-500 dark:text-gray-400">ບໍ່ພົບຂໍ້ມູນການອອກເມືອງ</p>
    </div>
  </div>
</template>

<style scoped>
.border-s {
  border-left-width: 1px;
}

.-start-3 {
  left: -0.75rem;
}
</style>
