<script setup lang="ts">
import { onMounted, ref, computed, watch } from "vue";
import { useNewsStore } from "../store/new.store";
import { useNewscategoriesStore } from "../../news_categories/store/new.categories.store";
import { columns } from "../interface/column";
import { Modal } from "ant-design-vue";
import { useRouter } from "vue-router";
import { formatDateTime } from "@/utils/FormatDataTime";
import { getStatusColor, getStatusText } from "@/utils/StatusNews";
import { getImageUrl } from "@/utils/ConfigPathImage";
import { storeToRefs } from "pinia";
import Table from "@/components/table/Table.vue";
import Dropdown from "@/components/Dropdown/Dropdown.vue";
import UiButton from "@/components/button/UiButton.vue";
import UibuttonDropdown from "@/components/button/UibuttonDropdown.vue";
import InputSelect from "@/components/Input/InputSelect.vue";
import LoadingSpinner from "@/components/loading/LoadingSpinner.vue";

/***************************************************************** */
// ใช้ store พร้อม storeToRefs เพื่อรักษา reactivity
const newsStore = useNewsStore();
const categoriesStore = useNewscategoriesStore();
const { getAllNews, deleteNews } = newsStore;
const { getAllNewsCategories } = categoriesStore;
const { news, isLoading } = storeToRefs(newsStore);
const { newsCategories } = storeToRefs(categoriesStore);
const { push } = useRouter();
const Loading = ref(false);
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
});
const statusFilter = ref("all");
const categoryFilter = ref("all");
const statusOptions = ref([
  { value: "all", label: "ເລືອກສະຖານະ" },
  { value: "draft", label: "ແບບຮ່າງ" },
  { value: "published", label: "ເຜີຍແຜ່" },
  { value: "private", label: "ສ່ວນໂຕ" },
]);
const menuOptions = ref([
  { key: "1", label: "ລາຍລະອຽດ" },
  { key: "2", label: "ແກ້ໄຂ" },
  { key: "3", label: "ລຶບ" },
]);
const addNews = () => {
  push({ name: "news_add" });
};

/**************************************************************** */
const categoryOptions = computed(() => {
  const options = [{ value: "all", label: "ເລືອກປະເພດຂ່າວ" }];
  if (newsCategories.value && newsCategories.value.data) {
    newsCategories.value.data.forEach((category) => {
      try {
        let categoryName = "";
        if (
          category.translates &&
          Array.isArray(category.translates) &&
          category.translates.length > 0
        ) {
          const loTranslate = category.translates.find((t) => t.lang === "lo");
          if (loTranslate) {
            categoryName = loTranslate.name;
          } else {
            categoryName = category.translates[0].name;
          }
        }

        options.push({
          value: category.id.toString(),
          label: categoryName || `ປະເພດຂ່າວ ${category.id}`,
        });
      } catch (error) {
        console.error("Error processing category:", error, category);
      }
    });
  }

  return options;
});
/********************************************************************** */
const loadFilteredNews = async () => {
  try {
    Loading.value = true;
    const offset = (pagination.value.current - 1) * pagination.value.pageSize;
    await getAllNews({
      offset: offset,
      limit: pagination.value.pageSize,
      category_id: categoryFilter.value,
      status: statusFilter.value,
    });
    if (news.value && news.value.total) {
      pagination.value.total = news.value.total;
    }
  } catch (error) {
    console.error("Failed to load filtered news:", error);
  } finally {
    Loading.value = false;
  }
};
/************************************************************************ */
watch(
  [statusFilter, categoryFilter],
  () => {
    pagination.value.current = 1;
    loadFilteredNews();
  },
  { immediate: false }
);
/************************************************************************* */

const handleSelect = (key: string, record: any) => {
  if (key === "1") {
    push({ name: "news_details", params: { id: record.id } });
  } else if (key === "2") {
    push({ name: "news_edit", params: { id: record.id } });
  } else if (key === "3") {
    Modal.confirm({
      title: "ຢືນຢັນການລົບ",
      content: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບລາຍການນີ້??",
      okText: "ແມ່ນແລ້ວ,ຂ້ອຍແນ່ໃຈ",
      cancelText: "ບໍ່,ຍົກເລີກ",
      okType: "danger",
      onOk: async () => {
        try {
          Loading.value = true;
          await deleteNews(record.id);
          // โหลดข้อมูลใหม่พร้อมกับตัวกรอง
          await loadFilteredNews();
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
/************************************************************************* */

onMounted(async () => {
  try {
    await getAllNewsCategories();
    await loadFilteredNews();
  } catch (error) {
    console.error("Failed to load data:", error);
  }
});
</script>

<template>
  <LoadingSpinner v-if="isLoading" class="relative h-[80vh]" />
  <div v-else>
    <div
      class="flex flex-col items-start justify-between border-b dark:border-gray-600 p-4 sm:flex-row sm:items-center mt-12"
    >
      <h2 class="text-lg font-semibold mb-2 sm:mb-0 dark:text-white">
        ຕາຕະລາງຂໍ້ມູນຂ່າວສານ
      </h2>

      <div
        class="flex items-center justify-end flex-col sm:flex-row gap-2 w-full sm:w-fit"
      >
        <div class="w-full sm:w-48">
          <InputSelect
            v-model:value="statusFilter"
            :options="statusOptions"
            placeholder="ເລືອກປະເພດຂ່າວ"
            class="w-full"
            size="large"
          />
        </div>
        <div class="w-full sm:w-48">
          <InputSelect
            v-model:value="categoryFilter"
            :options="categoryOptions"
            placeholder="ເລືອກສະຖານະ"
            class="w-full"
            size="large"
          />
        </div>

        <UiButton
          type="primary"
          size="large"
          colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center"
          icon="ant-design:plus-outlined"
          @click="addNews"
          >ເພີ່ມຂໍ້ມູນ</UiButton
        >
      </div>
    </div>

    <div class="relative">
      <!-- ข้อความถ้าไม่มีข้อมูล -->
      <div v-if="!news.data || news.data.length === 0" class="p-4 text-center">
        ບໍ່ມີຂໍ້ມູນທີ່ກົງກັບເງື່ອນໄຂການຄົ້ນຫາ
      </div>

      <Table
        v-else
        :columns="columns"
        :dataSource="news.data"
        class="dark:bg-gray-800 dark:text-white dark:border-gray-700"
        :pagination="pagination"
        rowKey="id"
      >
        <template #thumbnail="{ record }">
          <div class="flex items-center">
            <img
              :src="getImageUrl(record.thumbnail)"
              alt="Thumbnail"
              class="min-w-32 w-60 object-contain h-32 rounded-md"
            />
          </div>
        </template>
        <template #updated_at="{ record }">
          <span>{{ formatDateTime(record.updated_at) }}</span>
        </template>
        <template #title="{ record }">
          <span>{{
            record.translates?.length > 0 ? record.translates[0].title : "-"
          }}</span>
        </template>
        <template #created_at="{ record }">
          <span>{{ formatDateTime(record.created_at) }}</span>
        </template>
        <template #status="{ record }">
          <a-tag :color="getStatusColor(record.status)">
            <span> {{ getStatusText(record.status) }}</span>
          </a-tag>
        </template>
        <template #action="{ record }">
          <Dropdown
            :options="menuOptions"
            @select="(key) => handleSelect(key, record)"
          >
            <UibuttonDropdown
              type="primary"
              size="small"
              colorClass="!bg-white text-gray-900 flex items-center hover:!bg-gray-200 hover:!text-gray-900 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white"
              icon="ic:baseline-more-horiz"
            ></UibuttonDropdown>
          </Dropdown>
        </template>
      </Table>
    </div>
  </div>
</template>
