<script setup lang="ts">
import { ref, onMounted, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import { useHotelsStore } from "../store/hotels.store";
import { useAuthStore } from "@/lib/stores/auth.store";
import {
  HOTEL_READ,
  HOTEL_WRITE,
  HOTEL_REMOVE,
} from "@/common/utils/PermissionGroup";
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
import HasPermission from "@/components/CheckPermission/HasPermission.vue";

/********************************************************** */
const router = useRouter();
const hotelsStore = useHotelsStore();
const authStore = useAuthStore();
const { isLoading, hotels } = storeToRefs(hotelsStore);
const canReadHotel = computed(() => authStore.hasPermission(HOTEL_READ));
const canWriteHotel = computed(() => authStore.hasPermission(HOTEL_WRITE));
const canDeleteHotel = computed(() => authStore.hasPermission(HOTEL_REMOVE));

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
    // ตรวจสอบสิทธิ์ก่อนอัปเดตสถานะ
    if (!canWriteHotel.value) {
      message.error("ທ່ານບໍ່ມີສິດອັບເດດສະຖານະ");
      return;
    }

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
  if (!canWriteHotel.value) {
    message.error("ທ່ານບໍ່ມີສິດເພີ່ມໂຮງແຮມໃໝ່");
    return;
  }
  router.push({ name: "hotels_add" });
};

const { push } = useRouter();

// สร้างเมนูตามสิทธิ์
const menuOptions = computed(() => {
  const options = [];

  if (canReadHotel.value) {
    options.push({ key: "1", label: "ລາຍລະອຽດ" });
  }

  if (canWriteHotel.value) {
    options.push({ key: "2", label: "ແກ້ໄຂ" });
  }

  if (canDeleteHotel.value) {
    options.push({ key: "3", label: "ລຶບ" });
  }

  return options;
});

const handleSelect = (key: string, record: any) => {
  if (key === "1" && canReadHotel.value) {
    push({ name: "hotels_details", params: { id: record.id } });
  } else if (key === "2" && canWriteHotel.value) {
    push({ name: "hotels_edit", params: { id: record.id } });
  } else if (key === "3" && canDeleteHotel.value) {
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
          message.success("ລົບຂໍ້ມູນສຳເລັດ");
          await fetchData();
        } catch (err) {
          console.error("Error:", err);
          message.error("ລົບຂໍ້ມູນບໍ່ສຳເລັດ");
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
    // ควรตรวจสอบสิทธิ์ HOTEL_READ ก่อนดึงข้อมูล
    if (!canReadHotel.value) {
      message.error("ທ່ານບໍ່ມີສິດເຂົ້າເຖິງຂໍ້ມູນໂຮງແຮມ");
      return;
    }

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

onMounted(async () => {
  // ตรวจสอบสิทธิ์ก่อนดึงข้อมูล
  if (canReadHotel.value) {
    await fetchData();
  } else {
    message.error("ທ່ານບໍ່ມີສິດເຂົ້າເຖິງຂໍ້ມູນໂຮງແຮມ");
    // อาจต้องเปลี่ยนเส้นทางหรือแสดงหน้าข้อความแจ้งว่าไม่มีสิทธิ์
  }
});
</script>

<template>
  <!-- ใช้ HasPermission เพื่อแสดงเฉพาะเมื่อมีสิทธิ์อ่านข้อมูลโรงแรม -->
  <HasPermission :permission="HOTEL_READ">
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

        <!-- ใช้ HasPermission สำหรับปุ่มเพิ่มข้อมูล -->
        <HasPermission :permission="HOTEL_WRITE">
          <UiButton
            type="primary"
            size="large"
            colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center"
            icon="ant-design:plus-outlined"
            @click="handleAddNew"
          >
            ເພີ່ມຂໍ້ມູນໂຮງແຮມ
          </UiButton>
        </HasPermission>
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

        <template #created_at="{ record }">
          {{ formatDateTime(record.created_at) }}
        </template>

        <template #status="{ record }">
          <!-- ใช้ HasPermission สำหรับการแสดง Switch -->
          <HasPermission :permission="HOTEL_WRITE">
            <Switch
              :model-value="record.is_published"
              @update:model-value="(value) => toggleStatus(record)"
              :loading="isLoading"
            />

            <!-- สลอตสำหรับแสดงเมื่อไม่มีสิทธิ์แก้ไข -->
            <template #fallback>
              <Switch
                :model-value="record.is_published"
                disabled
                :title="'ທ່ານບໍ່ມີສິດອັບເດດສະຖານະ'"
              />
            </template>
          </HasPermission>
        </template>

        <template #action="{ record }">
          <!-- แสดงปุ่มดรอปดาวน์เฉพาะเมื่อมีตัวเลือกให้แสดง -->
          <Dropdown
            v-if="menuOptions.length > 0"
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
  </HasPermission>

  <!-- แสดงข้อความเมื่อไม่มีสิทธิ์เข้าถึง -->
  <HasPermission :permission="HOTEL_READ" :not="true">
    <div class="flex flex-col items-center justify-center p-8 mt-12">
      <div class="text-6xl text-gray-400 mb-4">
        <i class="fas fa-lock"></i>
      </div>
      <h2 class="text-2xl font-semibold text-gray-700 mb-2">
        ທ່ານບໍ່ມີສິດເຂົ້າເຖິງຂໍ້ມູນໂຮງແຮມ
      </h2>
      <p class="text-gray-500 mb-4">
        ກະລຸນາຕິດຕໍ່ຜູ້ດູແລລະບົບຖ້າທ່ານຄິດວ່ານີ້ແມ່ນຂໍ້ຜິດພາດ
      </p>
      <UiButton type="primary" @click="router.push({ name: 'dashboard' })">
        ກັບໄປໜ້າຫຼັກ
      </UiButton>
    </div>
  </HasPermission>
</template>
