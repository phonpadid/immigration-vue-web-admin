<script setup lang="ts">
import { onMounted, watch, computed, ref } from "vue";
import { useRoute } from "vue-router";
import { formatDatePicker, formatDateTime } from "@/utils/FormatDataTime";
import { UserOutlined, CheckCircleOutlined } from "@ant-design/icons-vue";
import { useArrivalStore } from "../store/arrival.store";
import { Modal } from "ant-design-vue";
import UiButton from "@/components/button/UiButton.vue";
import IconArrivalDetails from "@/components/Icon/IconArrivalDetails.vue";
import QRCode from "qrcode";

const route = useRoute();
const arrivalStore = useArrivalStore();
const arrivalId = route.params.id as string;
const qrCodeGenerated = ref(false); // เพิ่มตัวแปรเพื่อติดตามการสร้าง QR code

// Define environment variables with proper type safety
const imgUrl = computed(() => import.meta.env.VITE_IMG_URL || "");

// ปรับปรุงฟังก์ชัน generateQRCode
const generateQRCode = async (codeValue: string) => {
  // ถ้าเคยสร้าง QR code แล้ว ไม่ต้องสร้างซ้ำ
  if (qrCodeGenerated.value) return;

  try {
    const element = document.getElementById("arrival-qr");
    if (!element) return;

    // Clear previous content
    element.innerHTML = "";

    // Create a canvas element for the QR code
    const canvas = document.createElement("canvas");
    element.appendChild(canvas);

    // Generate QR code on canvas
    await QRCode.toCanvas(canvas, codeValue, {
      width: 150,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });

    qrCodeGenerated.value = true; // มาร์คว่าได้สร้าง QR code แล้ว
  } catch (error) {
    console.error("Failed to generate QR code:", error);
  }
};

// Handle verification
const handleVerification = async () => {
  Modal.confirm({
    title: "ຢືນຢັນ",
    content: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການຢືນຢັນຂໍ້ມູນການລົງທະບຽນນີ້?",
    okText: "ແມ່ນແລ້ວ,ຂ້ອຍແນ່ໃຈ",
    cancelText: "ບໍ່,ຍົກເລີກ",
    okType: "danger",
    async onOk() {
      try {
        await arrivalStore.verifyArrival(arrivalId);
        // Reset QR code generation flag and regenerate QR code
        qrCodeGenerated.value = false;
        if (arrivalStore.currentArrival?.verification_code) {
          await generateQRCode(arrivalStore.currentArrival.verification_code);
        }
      } catch (error) {
        console.error("Verification failed:", error);
      }
    },
  });
};

// Get image URL - safely handle URL construction
const getImageUrl = (path: string | undefined) => {
  if (!path) return "";
  return `${imgUrl.value}/${path.startsWith("/") ? path.substring(1) : path}`;
};

// ปรับปรุง onMounted
onMounted(async () => {
  // ตรวจสอบว่ามีข้อมูลใน store แล้วหรือไม่
  if (
    !arrivalStore.currentArrival ||
    arrivalStore.currentArrival.id.toString() !== arrivalId
  ) {
    await arrivalStore.getArrivalById(arrivalId);
  }

  // สร้าง QR code หลังจากโหลดข้อมูลเสร็จ
  if (
    arrivalStore.currentArrival?.verification_code &&
    !qrCodeGenerated.value
  ) {
    await generateQRCode(arrivalStore.currentArrival.verification_code);
  }
});

watch(
  [
    () => arrivalStore.currentArrival?.verification_code,
    () => arrivalStore.currentArrival?.verified_at,
  ],
  async ([newCode, newVerifiedAt]) => {
    if (newCode && (!qrCodeGenerated.value || newVerifiedAt)) {
      qrCodeGenerated.value = false;
      await generateQRCode(newCode);
    }
  },
  { immediate: false }
);
</script>

<template>
  <div class="relative p-4 mt-12">
    <div
      v-if="arrivalStore.isDetailLoading"
      class="flex justify-center items-center h-64"
    >
      <div
        class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
      ></div>
    </div>

    <div v-else-if="arrivalStore.currentArrival">
      <div class="mb-3 border-b pb-4">
        <h2
          class="mb-4 text-xl font-semibold leading-none text-gray-900 md:text-2xl dark:text-white"
        >
          ຂໍ້ມູນການເຂົ້າເມືອງ
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <dl>
            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ຈຸດເຂົ້າ
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              {{ arrivalStore.currentArrival.entry_name }}
            </dd>

            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ຈຸດປະສົງຂອງການເຂົ້າ
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              <span class="flex gap-1 items-center">
                <IconArrivalDetails
                  :purpose="arrivalStore.currentArrival.purpose"
                />
                {{
                  arrivalStore.getPurposeLabel(
                    arrivalStore.currentArrival.purpose
                  )
                }}
              </span>
            </dd>

            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ການເດີນທາງໃນແພັກເກດການທ່ອງທ່ຽວ
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              <span
                :class="
                  arrivalStore.currentArrival.is_traveling_in_tour !== 'No'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                "
                class="text-xs font-medium me-2 px-2.5 py-0.5 rounded"
              >
                {{
                  arrivalStore.currentArrival.is_traveling_in_tour !== "No"
                    ? arrivalStore.currentArrival.is_traveling_in_tour
                    : "ບໍ່ມີ"
                }}
              </span>
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
                      arrivalStore.currentArrival.black_list === 'available',
                    'bg-red-500':
                      arrivalStore.currentArrival.black_list === 'unavailable',
                  }"
                ></div>
                {{
                  arrivalStore.currentArrival.black_list === "available"
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
              {{ formatDateTime(arrivalStore.currentArrival.created_at) }}
            </dd>
          </dl>

          <dl>
            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ເດີນທາງໂດຍ
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              {{
                arrivalStore.getTravelTypeLabel(
                  arrivalStore.currentArrival.traveling_by_type
                )
              }}
              ເລກທີ່ {{ arrivalStore.currentArrival.traveling_by_no }}
            </dd>

            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ເດີນທາງມາຈາກ
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              {{ arrivalStore.currentArrival.traveling_from }}
            </dd>

            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ລະຫັດຢືນຢັນເຂົ້າເມືອງ
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              <span
                v-if="arrivalStore.currentArrival.verification_code"
                class="font-medium text-gray-900"
              >
                {{
                  arrivalStore.currentArrival.verification_code
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
                v-if="arrivalStore.currentArrival.verified_at"
                class="text-green-500 font-medium flex gap-1 items-center"
              >
                <CheckCircleOutlined class="h-4 w-4" />
                {{ formatDateTime(arrivalStore.currentArrival.verified_at) }}
              </span>
              <span v-else class="flex items-center">
                ຍັງບໍ່ມີການຢືນຢັນ
                <UiButton
                  @click="handleVerification"
                  :disabled="arrivalStore.isVerifying"
                  class="ms-2 bg-primary-700 hover:bg-primary-900 text-white font-bold py-1 px-2 text-sm rounded flex items-center"
                  icon="material-symbols:verified-rounded"
                  size="large"
                >
                  <span v-if="arrivalStore.isVerifying" class="mr-2">
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
                id="arrival-qr"
                class="w-40 h-40 border rounded p-2 flex items-center justify-center"
              ></div>
            </dd>
          </dl>
        </div>
      </div>

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
              {{ arrivalStore.currentArrival.personal_information.name }}
              {{ arrivalStore.currentArrival.personal_information.family_name }}
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
                  arrivalStore.currentArrival.personal_information.date_of_birth
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
                arrivalStore.currentArrival.personal_information.place_of_birth
              }}
            </dd>

            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ເບີໂທ
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              {{
                arrivalStore.currentArrival.personal_information.phone_number
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
                arrivalStore.getGenderLabel(
                  arrivalStore.currentArrival.personal_information.gender
                )
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
              {{ arrivalStore.currentArrival.personal_information.nationality }}
            </dd>

            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ເຊື້ອຊາດ
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              {{ arrivalStore.currentArrival.personal_information.race }}
            </dd>

            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ອາຊີບ
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              {{ arrivalStore.currentArrival.personal_information.occupation }}
            </dd>
          </dl>
        </div>
      </div>

      <div class="mb-6 border-b pb-4">
        <h2
          class="mb-4 text-xl font-semibold leading-none text-gray-900 md:text-2xl dark:text-white"
        >
          ຂໍ້ມູນຫນັງສືຜ່ານແດນ
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <img
            :src="
              getImageUrl(
                arrivalStore.currentArrival.passport_information.image
              )
            "
            alt="passport image"
            class="w-full rounded-lg border"
          />

          <img
            :src="
              getImageUrl(
                arrivalStore.currentArrival.passport_information.people_image
              )
            "
            alt="passport holder image"
            class="w-full rounded-lg border"
          />
        </div>

        <dl class="ms-0 md:ms-4 flex flex-wrap justify-between mt-4">
          <div>
            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ເລກໜັງສືຜ່ານແດນ
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              {{ arrivalStore.currentArrival.passport_information.number }}
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
                  arrivalStore.currentArrival.passport_information.expiry_date
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
                  arrivalStore.currentArrival.passport_information.date_issue
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
              {{ arrivalStore.currentArrival.passport_information.place_issue }}
            </dd>
          </div>
        </dl>
      </div>

      <div
        v-if="
          arrivalStore.currentArrival.visa_information &&
          (arrivalStore.currentArrival.visa_information.image ||
            arrivalStore.currentArrival.visa_information.number ||
            arrivalStore.currentArrival.visa_information.visaCategory ||
            arrivalStore.currentArrival.visa_information.date_issue ||
            arrivalStore.currentArrival.visa_information.place_issue)
        "
        class="mb-6 border-b pb-4"
      >
        <h2
          class="mb-4 text-xl font-semibold leading-none text-gray-900 md:text-2xl dark:text-white"
        >
          ຂໍ້ມູນວີຊາ
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <img
            v-if="arrivalStore.currentArrival.visa_information.image"
            :src="
              getImageUrl(arrivalStore.currentArrival.visa_information.image)
            "
            alt="visa image"
            class="w-full rounded-lg border"
          />
          <div
            v-else
            class="w-full rounded-lg border flex items-center justify-center h-48 bg-gray-100 dark:bg-gray-800"
          >
            <span class="text-gray-400">ບໍ່ມີຮູບພາບວີຊາ</span>
          </div>

          <dl
            class="ms-0 md:ms-4 flex flex-row md:flex-col justify-between md:justify-start"
          >
            <div
              v-if="arrivalStore.currentArrival.visa_information.visaCategory"
            >
              <dt
                class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
              >
                ປະເພດວີຊ່າ
              </dt>
              <dd
                class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
              >
                {{ arrivalStore.currentArrival.visa_information.visaCategory }}
              </dd>
            </div>

            <div v-if="arrivalStore.currentArrival.visa_information.number">
              <dt
                class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
              >
                ໝາຍເລກວີຊາ
              </dt>
              <dd
                class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
              >
                {{ arrivalStore.currentArrival.visa_information.number }}
              </dd>
            </div>

            <div v-if="arrivalStore.currentArrival.visa_information.date_issue">
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
                    arrivalStore.currentArrival.visa_information.date_issue
                  )
                }}
              </dd>
            </div>

            <div
              v-if="arrivalStore.currentArrival.visa_information.place_issue"
            >
              <dt
                class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
              >
                ສະ​ຖານ​ທີ່​ອອກ
              </dt>
              <dd
                class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
              >
                {{ arrivalStore.currentArrival.visa_information.place_issue }}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div
        v-if="
          arrivalStore.currentArrival.intended_address &&
          arrivalStore.currentArrival.intended_address.length > 0
        "
      >
        <h2
          class="mb-4 text-xl font-semibold leading-none text-gray-900 md:text-2xl dark:text-white"
        >
          ທີ່ຢູ່ໃນປະເທດລາວ
        </h2>

        <div
          class="relative border-s border-gray-200 dark:border-gray-700 ms-3 mb-6"
        >
          <div
            v-for="(address, index) in arrivalStore.currentArrival
              .intended_address"
            :key="index"
            class="mb-10 ms-6"
          >
            <span
              class="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -start-3 ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900"
            >
              <UserOutlined class="text-blue-800 dark:text-blue-300" />
            </span>
            <h3
              class="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white"
            >
              {{ address.name }}
            </h3>
            <time
              class="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500"
            >
              {{ formatDatePicker(address.check_in) }} -
              {{ formatDatePicker(address.check_out) }}
            </time>
            <p
              class="mb-4 text-base font-normal text-gray-500 dark:text-gray-400"
            >
              ບ້ານ: {{ address.village }}, ເມືອງ: {{ address.district }}, ແຂວງ:
              {{ address.province }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!arrivalStore.isDetailLoading" class="text-center p-8">
      <p class="text-gray-500 dark:text-gray-400">ບໍ່ພົບຂໍ້ມູນການເຂົ້າເມືອງ</p>
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
