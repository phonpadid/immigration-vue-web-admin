<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useNewsStore } from "../store/new.store";
import { columns } from "../interface/column";
import { Modal } from "ant-design-vue";
import { useRouter } from "vue-router";
import { formatDateTime } from "@/utils/FormatDataTime";
import { getStatusColor, getStatusText } from "@/utils/StatusNews";
import { getImageUrl } from "@/utils/ConfigPathImage";
import Table from "@/components/table/Table.vue";
import Dropdown from "@/components/Dropdown/Dropdown.vue";
import UiButton from "@/components/button/UiButton.vue";

const { getAllNews, news, deleteNews } = useNewsStore();
const { push } = useRouter();
const Loading = ref(false);

const menuOptions = ref([
  { key: "1", label: "ລາຍລະອຽດ" },
  { key: "2", label: "ແກ້ໄຂ" },
  { key: "3", label: "ລຶບ" },
]);
const addNews = () => {
  push({ name: "news_add" });
};

const handleSelect = (key: string, record: any) => {
  //   console.log("Selected:", key, "for record:", record);
  if (key === "1") {
    // View details
    push({ name: "news_details", params: { id: record.id } });
  }
  if (key === "2") {
    // View details
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

onMounted(async () => {
  try {
    await getAllNews();
  } catch (error) {
    console.error("Failed to load laws:", error);
  }
});
</script>

<template>
  <div
    class="flex flex-col items-start justify-between border-b dark:border-gray-600 p-4 sm:flex-row sm:items-center mt-12"
  >
    <h2 class="text-lg font-semibold mb-2 sm:mb-0 dark:text-white">
      ຕາຕະລາງຂໍ້ມູນຂ່າວສານ
    </h2>

    <div
      class="flex items-center justify-end flex-col sm:flex-row gap-2 w-full sm:w-fit"
    >
      <p>Select1</p>
      <p>Select2</p>
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
    <Table
      :columns="columns"
      :dataSource="news.data || []"
      class="dark:bg-gray-800 dark:text-white dark:border-gray-700"
    >
      <template #thumbnail="{ record }">
        <img
          :src="getImageUrl(record.thumbnail)"
          alt="Thumbnail"
          class="w-full h-36 object-cover"
        />
      </template>
      <template #updated_at="{ record }">
        <span>{{ formatDateTime(record.updated_at) }}</span>
      </template>
      <template #title="{ record }">
        <span>{{
          record.translates.length > 0 ? record.translates[0].title : "-"
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
</template>
