<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { message } from "ant-design-vue";
import { useNewsStore } from "../store/new.store";
import { storeToRefs } from "pinia";
import { formatDateTime } from "@/utils/FormatDataTime";
import { getFileUrl } from "@/utils/ConfigPathImage";
import type { TabConfigDetails } from "../interface/new.interface";
import { Modal } from "ant-design-vue";
import { useNotification } from "@/utils/notificationService";
import LoadingSpinner from "@/components/loading/LoadingSpinner.vue";
import Tab from "@/components/Tab/Tab.vue";
import UiButton from "@/components/button/UiButton.vue";
import NewsEditorContent from "@/components/editor/NewsEditorContent.vue";

/*************************************************************** */
// Router และ Store
const router = useRouter();
const route = useRoute();
const newsId = computed(() => Number(route.params.id));
const newsStore = useNewsStore();
const { openNotification } = useNotification();
const { currentNews } = storeToRefs(newsStore);
const activeTab = ref("1");
const isLoading = ref(false);
// TabConfig show language
const tabsConfig = computed(() => {
  const tabs: TabConfigDetails[] = [];

  if (currentNews.value && currentNews.value.translates) {
    currentNews.value.translates.forEach((translate, index) => {
      tabs.push({
        key: (index + 1).toString(),
        label:
          translate.lang === "lo"
            ? "ພາສາລາວ"
            : translate.lang === "en"
            ? "ພາສາອັງກິດ"
            : "ພາສາຈີນ",
        slotName: `tab${index + 1}`,
        lang: translate.lang,
      });
    });
  }

  return tabs;
});

// delete
const handleDelete = async () => {
  Modal.confirm({
    title: "ຢືນຢັນການລົບ",
    content: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບລາຍການນີ້??",
    okText: "ແມ່ນແລ້ວ,ຂ້ອຍແນ່ໃຈ",
    cancelText: "ບໍ່,ຍົກເລີກ",
    okType: "danger",
    onOk: async () => {
      try {
        isLoading.value = true;
        await newsStore.deleteNews(newsId.value);
        router.push({ name: "news" });
        openNotification("success", "ລຶບຂໍ້ມູນ", "ລົບຂໍ້ມູນສຳເລັດ");
      } catch (err) {
        console.error("Error:", err);
      } finally {
        isLoading.value = false;
      }
    },
  });
};
/*************************************************** */
const handleEdit = () => {
  router.push({ name: "news_edit" });
};

/*************************************************** */
// Back to news list
const handleBack = () => {
  router.push("/admin/news");
};
/*************************************************** */
onMounted(async () => {
  try {
    isLoading.value = true;
    await newsStore.getNewsById(newsId.value);

    if (!currentNews.value) {
      message.error("ບໍ່ພົບຂໍ້ມູນຂ່າວ");
      router.push("/admin/news");
    }
  } catch (error) {
    console.error("Failed to load news data:", error);
    message.error("ບໍ່ສາມາດໂຫລດຂໍ້ມູນຂ່າວໄດ້");
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <LoadingSpinner v-if="isLoading" size="large" class="relative h-[80vh]" />
  <div v-else-if="currentNews" class="relative mt-12">
    <Tab v-model:activeKey="activeTab" :tabs="tabsConfig">
      <template
        v-for="(tab, index) in tabsConfig"
        :key="tab.key"
        #[tab.slotName]
      >
        <div class="my-4">
          <div class="px-4 mb-4 grid gap-4 sm:grid-cols-2 sm:gap-6 md:gap-12">
            <dl>
              <div class="relative w-full mx-auto">
                <img
                  class="w-full object-cover rounded-md"
                  :src="getFileUrl(currentNews.thumbnail)"
                  :alt="currentNews.translates[index]?.title || 'News image'"
                />
              </div>
            </dl>
            <dl>
              <dt
                class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
              >
                ຫົວຂໍ້
              </dt>
              <dd
                class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
              >
                <p>{{ currentNews.translates[index]?.title }}</p>
              </dd>
              <dt
                class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
              >
                ຄຳອະທິບາຍ
              </dt>
              <dd
                class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
              >
                <p>{{ currentNews.translates[index]?.description }}</p>
              </dd>
            </dl>
          </div>

          <dl>
            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ເນື້ອຫາ
            </dt>
            <dd class="px-4 py-2 bg-white rounded">
              <NewsEditorContent
                :content="currentNews.translates[index]?.content"
              />
            </dd>
          </dl>
        </div>
      </template>
    </Tab>

    <div class="px-4 mb-4 grid gap-4 sm:mb-5 sm:grid-cols-2 sm:gap-6 md:gap-12">
      <dl>
        <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
          ປະເພດຂ່າວ:
        </dt>
        <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
          <template
            v-if="
              currentNews.category &&
              currentNews.category.translates &&
              currentNews.category.translates.length > 0
            "
          >
            {{ currentNews.category.translates[0].name }}
          </template>
          <template v-else> ບໍ່ໄດ້ລະບຸປະເພດ </template>
        </dd>
        <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
          ສະຖານະ:
        </dt>
        <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
          <template v-if="currentNews.status">
            <span
              v-if="currentNews.status === 'draft'"
              class="bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300"
            >
              ແບບຮ່າງ
            </span>
            <span
              v-else-if="currentNews.status === 'private'"
              class="bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300"
            >
              ສ່ວນໂຕ
            </span>
            <span
              v-else-if="currentNews.status === 'published'"
              class="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300"
            >
              ເຜີຍແຜ່
            </span>
          </template>
          <template v-else> ... </template>
        </dd>
      </dl>

      <dl>
        <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
          ເຜີຍແຜ່ເມື່ອ:
        </dt>
        <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
          {{
            currentNews.public_at
              ? formatDateTime(currentNews.public_at)
              : "ບໍ່ມີຂໍ້ມູນ"
          }}
        </dd>
        <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
          ເພີ່ມເມື່ອ:
        </dt>
        <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
          {{
            currentNews.created_at
              ? formatDateTime(currentNews.created_at)
              : "ບໍ່ມີຂໍ້ມູນ"
          }}
        </dd>
        <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
          ອັບເດດລ່າສຸດເມືອ:
        </dt>
        <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
          {{
            currentNews.updated_at
              ? formatDateTime(currentNews.updated_at)
              : "ບໍ່ມີຂໍ້ມູນ"
          }}
        </dd>
      </dl>
    </div>

    <br />

    <div class="p-4 flex items-center gap-4">
      <UiButton
        type="primary"
        size="large"
        colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center"
        @click="handleEdit"
        icon="material-symbols:edit-square"
      >
        ແກ້ໄຂ
      </UiButton>

      <UiButton
        type="danger"
        size="large"
        icon="material-symbols:delete-outline"
        colorClass="!bg-red-600 hover:!bg-red-800 text-white flex items-center"
        @click="handleDelete"
      >
        ລຶບ
      </UiButton>
    </div>
  </div>
  <div v-else class="p-8 text-center">
    <p class="text-gray-500 dark:text-gray-400">ບໍ່ພົບຂໍ້ມູນຂ່າວ</p>
    <UiButton type="primary" size="medium" @click="handleBack" class="mt-4">
      ກັບຄືນໄປໜ້າຂ່າວ
    </UiButton>
  </div>
</template>
