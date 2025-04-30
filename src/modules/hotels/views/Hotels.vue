<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import { useHotelsStore } from "../store/hotels.store";
import { columns } from "../interface/column";
import { storeToRefs } from "pinia";
import { getFileUrl } from "@/utils/ConfigPathImage";
import { formatDateTime } from "@/utils/FormatDataTime";
import { Modal } from "ant-design-vue";
import UiButton from "@/components/button/UiButton.vue";
import InputSelect from "@/components/Input/InputSelect.vue";
import Table from "@/components/table/Table.vue";
import Switch from "@/components/Switch/Switch.vue";
import Dropdown from "@/components/Dropdown/Dropdown.vue";
import HTMLQRCodeScan from "@/components/ScanQrcode/HTMLQRCodeScan.vue";

/********************************************************** */
const router = useRouter();
const hotelsStore = useHotelsStore();
const { isLoading, hotels } = storeToRefs(hotelsStore);

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});
const selectedStatus = ref("");
const statusOptions = [
  { value: "", label: "ການເຜີ່ຍແຜ່" },
  { value: "1", label: "ສາທາລະນະ" },
  { value: "0", label: "ສ່ວນຕົວ" },
];

// ฟังก์ชันจัดการการเปลี่ยนหน้า
const handleTableChange = (pag: any) => {
  pagination.current = pag.current;
  fetchData();
};

// ฟังก์ชันจัดการการเปลี่ยนค่าตัวกรอง
const handleStatusChange = (value: string) => {
  selectedStatus.value = value;
  pagination.current = 1;
  fetchData();
};

const toggleStatus = async (record: any) => {
  try {
    if (record.is_published) {
      await hotelsStore.checkStatusPrivate(record.id);
    } else {
      await hotelsStore.checkStatusPublic(record.id);
    }
    await fetchData();
  } catch (error) {
    console.error("❌ Failed to update status:", error);
    message.error("ບໍ່ສາມາດອັບເດດສະຖານະໄດ້");
  }
};
// ฟังก์ชันเปิดหน้าสร้างโรงแรมใหม่
const handleAddNew = () => {
  router.push({ name: "hotels_add" });
};

const { push } = useRouter();

const menuOptions = ref([
  { key: "1", label: "ລາຍລະອຽດ" },
  { key: "2", label: "ແກ້ໄຂ" },
  { key: "3", label: "ລຶບ" },
]);
const handleSelect = (key: string, record: any) => {
  if (key === "1") {
    push({ name: "hotels_details", params: { id: record.id } });
  }
  if (key === "2") {
    push({ name: "hotels_edit", params: { id: record.id } });
  } else if (key === "3") {
    Modal.confirm({
      title: "ຢືນຢັນການລົບ",
      content: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບລາຍການນີ້?",
      okText: "ແມ່ນແລ້ວ, ຂ້ອຍແນ່ໃຈ",
      cancelText: "ບໍ່, ຍົກເລີກ",
      okType: "danger",
      onOk: async () => {
        try {
          isLoading.value = true;
          await hotelsStore.deleteHotels(record.id);
          alert("ລົບຂໍ້ມູນສຳເລັດ");
        } catch (err) {
          console.error("Error:", err);
        } finally {
          isLoading.value = false;
        }
      },
    });
  }
};

// ดึงข้อมูล
const fetchData = async () => {
  try {
    const offset = (pagination.current - 1) * pagination.pageSize;
    await hotelsStore.getAllHotels(
      offset,
      pagination.pageSize,
      selectedStatus.value
    );
    pagination.total = hotels.value.total;
  } catch (error) {
    console.error("Failed to fetch hotel data:", error);
    message.error("ບໍ່ສາມາດດຶງຂໍ້ມູນໄດ້");
  }
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div
    class="flex flex-col items-start justify-between border-b dark:border-gray-600 p-4 sm:flex-row sm:items-center mt-12"
  >
    <h2 class="text-lg font-semibold mb-2 sm:mb-0 dark:text-white">
      ຕາຕະລາງຂໍ້ມູນໂຮງແຮມ
    </h2>
    <div
      class="flex items-center justify-end flex-col sm:flex-row gap-2 w-full sm:w-fit"
    >
      <InputSelect
        v-model:value="selectedStatus"
        :options="statusOptions"
        placeholder="ເລືອກສະຖານະ"
        size="large"
        @change="handleStatusChange"
      />

      <UiButton
        type="primary"
        size="large"
        colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center"
        icon="ant-design:plus-outlined"
        @click="handleAddNew"
      >
        ເພີ່ມຂໍ້ມູນໂຮງແຮມ
      </UiButton>
    </div>
  </div>

  <div class="p-4">
    <Table
      :loading="isLoading"
      :columns="columns"
      :dataSource="hotels.data"
      :pagination="pagination"
      @change="handleTableChange"
    >
      <template #image="{ record }">
        <div class="w-12 h-12 overflow-hidden rounded-md">
          <img
            v-if="record.image"
            :src="getFileUrl(record.image)"
            alt="Hotel"
            class="w-full h-full object-cover"
          />
          <div
            v-else
            class="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs"
          >
            No image
          </div>
        </div>
      </template>

      <template #hotels_name="{ record }">
        <div>
          <template v-if="record.translates && record.translates.length">
            <div
              v-for="(translate, index) in record.translates"
              :key="translate.id"
              :class="index > 0 ? 'mt-1 text-gray-500 text-sm' : ''"
            >
              {{
                translate.lang === "lo"
                  ? "ລາວ: "
                  : translate.lang === "en"
                  ? "ອັງກິດ: "
                  : "ຈີນ: "
              }}
              {{ translate.name }}
            </div>
          </template>
          <div v-else>-</div>
        </div>
      </template>

      <!-- สร้าง template สำหรับวันที่ -->
      <template #created_at="{ record }">
        {{ formatDateTime(record.created_at) }}
      </template>

      <template #status="{ record }">
        <Switch
          :model-value="record.is_published"
          @update:model-value="(value) => toggleStatus(record)"
          :loading="isLoading"
        />
      </template>

      <template #action="{ record }">
        <Dropdown
          :options="menuOptions"
          @select="(key) => handleSelect(key, record)"
        >
          <UiButton
            type="primary"
            size="small"
            colorClass="!bg-white text-gray-900 flex items-center hover:!bg-gray-200 hover:!text-gray-900 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white"
            icon="ic:baseline-more-horiz"
          ></UiButton>
        </Dropdown>
      </template>
    </Table>
  </div>

  <div>
    <HTMLQRCodeScan />
  </div>
</template>
