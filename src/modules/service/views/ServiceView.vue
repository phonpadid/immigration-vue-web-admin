<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { watch } from "vue";
import { useServiceStore } from "../store/service.store";
import { Modal } from "ant-design-vue";
import { useRouter } from "vue-router";
import { columns } from "../interface/column";
import type { LanguageKey, ApiLangKey } from "../interface/service.interface";
import Tab from "@/components/Tab/Tab.vue";
import UiButton from "@/components/button/UiButton.vue";
import UiButtonDropdown from "@/components/button/UibuttonDropdown.vue";
import Table from "@/components/table/Table.vue";
import Dropdown from "@/components/Dropdown/Dropdown.vue";

const menuOptions = ref([
  { key: "1", label: "ແກ້ໄຂ" },
  { key: "2", label: "ລຶບ" },
]);
const SERVICE_HEADER = "ບໍລິການທັງໝົດ";
const ADD_BUTTON_TEXT = "ເພີ່ມບໍລິການ";
const serviceStore = useServiceStore();
const { push } = useRouter();
const Loading = ref(false);
const activeTab = ref<LanguageKey>("1");
const tabsConfig = [
  {
    key: "1" as LanguageKey,
    label: "ພາສາລາວ",
    slotName: "tab1",
    apiKey: "lo" as ApiLangKey,
  },
  {
    key: "2" as LanguageKey,
    label: "ພາສາອັງກິດ",
    slotName: "tab2",
    apiKey: "en" as ApiLangKey,
  },
  {
    key: "3" as LanguageKey,
    label: "ພາສາຈີນ",
    slotName: "tab3",
    apiKey: "zh_cn" as ApiLangKey,
  },
];

const service_add = () => {
  push({ name: "services_add" });
};

// ตัวแปรสำหรับ pagination
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
});

// แปลง LanguageKey เป็น ApiLangKey
const getApiLangKey = (tabKey: LanguageKey): ApiLangKey => {
  const tab = tabsConfig.find((t) => t.key === tabKey);
  return tab ? tab.apiKey : "lo";
};

// computed property สำหรับข้อมูลตาราง
const currentData = computed(() => {
  const apiLang = getApiLangKey(activeTab.value);
  return serviceStore.servicesByLang[apiLang]?.data || [];
});

// computed property สำหรับ total items
const totalItems = computed(() => {
  const apiLang = getApiLangKey(activeTab.value);
  return serviceStore.servicesByLang[apiLang]?.total || 0;
});

const loadData = async () => {
  const apiLang = getApiLangKey(activeTab.value);
  try {
    await serviceStore.getAllService(apiLang, pagination.pageSize);
    pagination.total = totalItems.value;
  } catch (error) {
    console.error("Failed to load data", error);
  }
};

const handlePaginationChange = (newPagination: any) => {
  pagination.current = newPagination.current;
  pagination.pageSize = newPagination.pageSize;
  loadData();
};

const handleSelect = (key: string, record: any) => {
  if (key === "1") {
    push({ name: "services_edit", params: { id: record.id } });
  } else if (key === "2") {
    Modal.confirm({
      title: "ຢືນຢັນການລົບ",
      content: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບລາຍການນີ້??",
      okText: "ແມ່ນແລ້ວ,ຂ້ອຍແນ່ໃຈ",
      cancelText: "ບໍ່,ຍົກເລີກ",
      okType: "danger",
      onOk: async () => {
        try {
          Loading.value = true;
          await serviceStore.deleteService(record.id);
          await loadData();
          alert("ລົບຂໍ້ມູນສຳເລັດ");
        } catch (err) {
          console.error("Error:", err);
        } finally {
          Loading.value = false;
        }
      },
    });
  }
};

watch(
  () => activeTab.value,
  async () => {
    pagination.current = 1;
    await loadData();
  }
);
onMounted(loadData);
</script>

<template>
  <div class="relative ">
    <Tab :tabs="tabsConfig" v-model:activeKey="activeTab" class="mb-4">
      >
      <template v-for="tab in tabsConfig" :key="tab.key" #[tab.slotName]>
        <div
          class="flex flex-col items-start justify-between border-b dark:border-gray-600 p-4 sm:flex-row sm:items-center"
        >
          <h2 class="text-lg font-semibold mb-2 sm:mb-0 dark:text-white">
            {{ SERVICE_HEADER }}
          </h2>
          <UiButton
            type="primary"
            size="large"
            colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center"
            icon="ant-design:plus-outlined"
            @click="service_add"
            >{{ ADD_BUTTON_TEXT }}</UiButton
          >
        </div>

        <!-- Table component -->
        <Table
          :columns="columns"
          :dataSource="currentData"
          :loading="serviceStore.isLoading"
          :pagination="{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: totalItems,
            showSizeChanger: pagination.showSizeChanger,
          }"
          @update:pagination="handlePaginationChange"
        >
          <!-- Action column slot -->
          <template #action="{ record }">
            <Dropdown
              :options="menuOptions"
              @select="(key) => handleSelect(key, record)"
            >
              <UiButtonDropdown
                type="primary"
                size="small"
                colorClass="!bg-white text-gray-900 flex items-center hover:!bg-gray-200 hover:!text-gray-900 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white"
                icon="ic:baseline-more-horiz"
              ></UiButtonDropdown>
            </Dropdown>
          </template>
        </Table>
      </template>
    </Tab>
  </div>
</template>
