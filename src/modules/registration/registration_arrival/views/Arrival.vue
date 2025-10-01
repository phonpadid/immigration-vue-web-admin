<script setup lang="ts">
import { ref, onMounted } from "vue";
import { columns } from "../interface/column";
import { useArrivalStore } from "../store/arrival.store";
import { formatDateTime } from "@/utils/FormatDataTime";
import { useRouter } from "vue-router"; // Add router import
import { Icon } from "@iconify/vue";
import InputSelect from "@/components/Input/InputSelect.vue";
import UiModal from "@/components/Modal/UiModal.vue";
import UiButton from "@/components/button/UiButton.vue";
import DatePicker from "@/components/Datepicker/DatePicker.vue";
import InputSearch from "@/components/Input/InputSearch.vue";
import Table from "@/components/table/Table.vue";
import HTMLQRCodeScan from "@/components/ScanQrcode/HTMLQRCodeScan.vue";

const router = useRouter(); // Initialize router
const arrivalStore = useArrivalStore();

// สถานะสำหรับการค้นหา
const searchState = ref({
  entry_name: "",
  passport_number: "",
  visa_number: "",
  verification_code: "",
  is_verified: "",
  black_list: "",
});

const exportModalVisible = ref(false);
const exportDateRange = ref<[string, string] | null>(null);

// ตัวแปรสำหรับ pagination
const pagination = ref({
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
  total: 0,
});

// ตัวเลือกสำหรับ Select components
const verificationOptions = [
  { label: "ການກວດສອບ", value: "" },
  { label: "ສຳເລັດ", value: "verified" },
  { label: "ຍັງບໍ່ສຳເລັດ", value: "no_verified" },
];

const blacklistOptions = [
  { label: "ບັນຊີດຳ", value: "" },
  { label: "ບໍ່ມີໃນບັນຊີດຳ", value: "available" },
  { label: "ມີໃນບັນຊີດຳ", value: "unavailable" },
];

// Function to navigate to details page
const navigateToDetails = (id: number) => {
  router.push(`/admin/arrival/details/${id}`);
};
<<<<<<< HEAD
=======

>>>>>>> 9ad2263 (up code)
const handleInputSearch = async (
  field: keyof typeof searchState.value,
  value: string
) => {
  // อัพเดทค่าใน searchState
  searchState.value[field] = value;

  // รีเซ็ต pagination
  pagination.value.current = 1;

  // สร้าง filters ใหม่
  const filters = {
    entry_name: searchState.value.entry_name,
    passport_number: searchState.value.passport_number,
    visa_number: searchState.value.visa_number,
    verification_code: searchState.value.verification_code,
    is_verified: searchState.value.is_verified,
    black_list: searchState.value.black_list,
    offset: 0,
    limit: pagination.value.pageSize,
  };

  try {
    // เรียก API เพื่อค้นหาข้อมูล
    await arrivalStore.setFilters(filters);
    await arrivalStore.getAllArrival();

<<<<<<< HEAD
=======
    // ✅ แก้ไขตรงนี้ให้ใช้ arrivalStore.arrival.total
>>>>>>> 9ad2263 (up code)
    if (
      field === "verification_code" &&
      arrivalStore.arrival.data.length === 1
    ) {
      const singleResult = arrivalStore.arrival.data[0];

      if (singleResult) {
        navigateToDetails(singleResult.id);
      } else {
        pagination.value.total = arrivalStore.arrival.total;
      }
    } else {
<<<<<<< HEAD
      pagination.value.total = arrivalStore.arrival.total;
=======
      pagination.value.total = arrivalStore.arrival.total; // ✅ แก้ไขตรงนี้ด้วยครับ
>>>>>>> 9ad2263 (up code)
    }
  } catch (error) {
    console.error("Failed to search:", error);
    pagination.value.total = arrivalStore.arrival.total;
  }
};

const handleInputChange = async (
  field: keyof typeof searchState.value,
  value: string
) => {
  searchState.value[field] = value;
  if (field === "is_verified" || field === "black_list") {
    // ใช้ฟังก์ชันเดียวกับ search
    await handleInputSearch(field, value);
  }
};
const handleTableChange = async (paginationInfo: any) => {
  pagination.value.current = paginationInfo.current;
  pagination.value.pageSize = paginationInfo.pageSize;

  // Calculate offset based on current page and page size
  const offset = (pagination.value.current - 1) * pagination.value.pageSize;

  await arrivalStore.setFilters({
    offset: offset,
    limit: pagination.value.pageSize,
  });

  await arrivalStore.getAllArrival();
};
// ฟังก์ชันที่เรียกเมื่อกดปุ่ม Export เพื่อเปิด Modal
const handleExport = () => {
  exportModalVisible.value = true;
};

const confirmExport = async () => {
  const filtersToExport = {
    ...searchState.value,
    start_date: exportDateRange.value ? exportDateRange.value[0] : "",
    end_date: exportDateRange.value ? exportDateRange.value[1] : "",
  };
  await arrivalStore.exportArrivalData(filtersToExport);
  exportModalVisible.value = false;
};

// โหลดข้อมูลครั้งแรก
onMounted(async () => {
  await arrivalStore.setFilters({
    offset: 0,
    limit: pagination.value.pageSize,
  });
  await arrivalStore.getAllArrival();
  pagination.value.total = arrivalStore.arrival.total; 
});
</script>

<template>
  <div>
    <!-- Header Section -->
    <div
      class="flex flex-col sm:flex-row justify-between border-b dark:border-gray-600 gap-2 p-4 items-start sm:items-center"
    >
      <h2 class="text-lg font-semibold mb-2 sm:mb-0 dark:text-white">
        ລາຍການລົງທະບຽນເຂົ້າເມືອງ
      </h2>
      <div class="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-fit">
        <HTMLQRCodeScan type="arrival" />
      </div>
    </div>

    <!-- Search Filters -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 py-3 mx-4">
      <!-- <InputSearch
        v-model="searchState.entry_name"
        placeholder="ຈຸດເຂົ້າ..."
        @search="(value) => handleInputSearch('entry_name', value)"
      /> -->
      <InputSearch
        v-model="searchState.passport_number"
        placeholder="ເລກທີ່ passport..."
        @search="(value) => handleInputSearch('passport_number', value)"
      />
      <!-- <InputSearch
        v-model="searchState.visa_number"
        placeholder="ເລກທີ່ visa..."
        @search="(value) => handleInputSearch('visa_number', value)"
      /> -->
      <InputSearch
        v-model="searchState.verification_code"
        placeholder="ລະຫັດຢືນຢັນ..."
        @search="(value) => handleInputSearch('verification_code', value)"
      />
      <InputSelect
        v-model="searchState.is_verified"
        :options="verificationOptions"
        placeholder="ການກວດສອບ"
        @change="(value) => handleInputChange('is_verified', value)"
      />
      <InputSelect
        v-model="searchState.black_list"
        :options="blacklistOptions"
        placeholder="ບັນຊີດຳ"
        @change="(value) => handleInputChange('black_list', value)"
      />
      <div>
        <UiButton
          type="submit"
          colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center"
          @click="handleExport"
          >Export</UiButton
        >
      </div>
    </div>
    <!-- Table Section -->
    <Table
      :columns="columns"
      :dataSource="arrivalStore.arrival.data"
      :loading="arrivalStore.isLoading"
      :pagination="pagination"
      class="mt-4"
      @change="handleTableChange"
    >
      <!-- filepath: e:\immigration-web-admin-vue\immigration-vue-web-admin\src\modules\registration\registration_arrival\views\Arrival.vue -->
      <template #passport_and_visa="{ record }">
        <div class="flex flex-col">
          <div>
            Passport:
            <span class="font-bold">{{
              record.passport_information.number
            }}</span>
          </div>
          <div v-if="record.visa_information && record.visa_information.number">
            Visa:
            <span class="font-bold">{{ record.visa_information.number }}</span>
          </div>
        </div>
      </template>
      <template #verification_code="{ record }">
        <div
          class="flex items-center gap-2"
          :class="{
            'font-medium text-green-600 dark:text-green-400':
              record.verified_at,
            'font-medium text-gray-900 dark:text-white': !record.verified_at,
          }"
        >
          <Icon
            icon="material-symbols:check-circle-rounded"
            v-if="record.verified_at"
            class="text-green-600 dark:text-green-400 text-lg"
          />
          <span>
            {{
              record.verification_code
                ? record.verification_code.split("").join(" ")
                : "ລົງທະບຽນບໍ່ສຳເລັດ"
            }}
          </span>
        </div>
      </template>

      <template #created_at="{ record }">
        <div class="flex flex-col">
          <div>{{ formatDateTime(record.created_at) }}</div>
        </div>
      </template>
      <template #verified_at="{ record }">
        <div class="flex items-center">
          <span
            class="w-2 h-2 rounded-full mr-2"
            :class="record.verified_at === null ? 'bg-green-500' : 'bg-red-500'"
          ></span>
          {{ record.verified_at === null ? "ບໍ່ມີໃນບັນຊີດຳ" : "ມີໃນບັນຊີດຳ" }}
        </div>
      </template>
      <template #action="{ record }">
        <div class="flex space-x-2">
          <a
            href="javascript:void(0)"
            @click="navigateToDetails(record.id)"
            class="text-primary-600 hover:text-primary-600 hover:underline cursor-pointer"
            >ລາຍລະອຽດ</a
          >
        </div>
      </template>
    </Table>
    <UiModal
      title="ເລືອກວັນທີເລິ່ມຕົ້ນແລະສິນສຸດສຳລັັບລົງທະບຽນເຂົ້າເມືອງ"
      v-model:visible="exportModalVisible"
      okText="ຢືນຢັນ"
      cancelText="ຍົກເລີກ"
      :confirmLoading="arrivalStore.isLoading"
      @ok="confirmExport"
      @cancel="exportModalVisible = false"
    >
      <div class="p-4">
        <p class="text-gray-700 dark:text-gray-300 mb-4">
          ກະລຸນາເລືອກຊ່ວງວັນທີ່ທີ່ຕ້ອງການສົ່ງອອກຂໍ້ມູນ.
        </p>
        <DatePicker
          v-model:value="exportDateRange"
          displayFormat="DD-MM-YYYY"
          valueFormat="YYYY-MM-DD"
        />
      </div>
    </UiModal>
  </div>
</template>

<style scoped>
.whitespace-pre-line {
  white-space: pre-line;
}
</style>
