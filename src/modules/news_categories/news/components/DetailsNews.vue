<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { message } from "ant-design-vue";
import { useNewsStore } from "../store/new.store";
import Tab from "@/components/Tab/Tab.vue";
import UiButton from "@/components/button/UiButton.vue";
import NewsEditorContent from "@/components/editor/NewsEditorContent.vue";
import { storeToRefs } from "pinia";

// สร้างประเภทสำหรับภาษาต่างๆ
type TabLanguage = "lo" | "en" | "zh_cn";

// กำหนด interface สำหรับ tab config
interface TabConfig {
  key: string;
  label: string;
  slotName: string;
  lang: string;
}

// ดึงค่า API URL จาก .env
const baseImgUrl =
  import.meta.env.VITE_IMG_URL || "http://178.128.20.203:81/api";

// Router และ Store
const router = useRouter();
const route = useRoute();
const newsId = computed(() => Number(route.params.id));
const newsStore = useNewsStore();
const { currentNews } = storeToRefs(newsStore);

// ตัวแปรสำหรับการควบคุมสถานะของฟอร์ม
const activeTab = ref("1");
const isLoading = ref(false);

// สร้าง function สำหรับแปลง HTML content
const parseNewsContent = (content: any): string => {
  try {
    if (typeof content === "string") {
      return content;
    }

    return JSON.stringify(content);
  } catch (e) {
    console.error("Error parsing news content:", e);
    return "";
  }
};

// สร้างฟังก์ชันช่วยในการแปลงวันที่ให้อยู่ในรูปแบบที่ต้องการ
const formatDate = (dateString: string): string => {
  if (!dateString) return "ບໍ່ມີຂໍ້ມູນ";

  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("lo-LA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch (e) {
    console.error("Error formatting date:", e);
    return dateString;
  }
};

// สร้าง URL เต็มสำหรับรูปภาพ
const getFullImageUrl = (path: string): string => {
  if (!path) return "";

  // ถ้า path เริ่มต้นด้วย http หรือ https ให้ใช้ URL นั้นเลย
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // ถ้ามี / นำหน้า ให้ลบออก
  const trimmedPath = path.startsWith("/") ? path.substring(1) : path;

  // สร้าง URL เต็ม
  return `${baseImgUrl}/${trimmedPath}`;
};

// กำหนดค่าแท็บต่างๆ จากข้อมูลข่าวที่โหลดมา
const tabsConfig = computed(() => {
  const tabs: TabConfig[] = [];

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

// ฟังก์ชันสำหรับการลบข่าว
const handleDelete = async () => {
  try {
    if (confirm("ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຂ່າວນີ້?")) {
      isLoading.value = true;
      await newsStore.deleteNews(newsId.value);
      message.success("ລຶບຂ່າວສຳເລັດ");
      router.push("/news");
    }
  } catch (error: any) {
    console.error("Error deleting news:", error);
    message.error(error?.message || "ເກີດຂໍ້ຜິດພາດໃນການລຶບຂ່າວ");
  } finally {
    isLoading.value = false;
  }
};

// ฟังก์ชันสำหรับการไปยังหน้าแก้ไข
const handleEdit = () => {
  router.push(`/news/update/${newsId.value}`);
};

// ฟังก์ชันสำหรับการกลับไปหน้าข่าวทั้งหมด
const handleBack = () => {
  router.push("/news");
};

// โหลดข้อมูลเมื่อเริ่มต้น
onMounted(async () => {
  try {
    isLoading.value = true;
    await newsStore.getNewsById(newsId.value);

    if (!currentNews.value) {
      message.error("ບໍ່ພົບຂໍ້ມູນຂ່າວ");
      router.push("/news");
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
  <div v-if="isLoading" class="flex justify-center items-center py-10">
    <div class="text-center">
      <div
        class="spinner-border inline-block w-8 h-8 border-4 rounded-full text-primary-600"
        role="status"
      >
        <span class="sr-only">ກຳລັງໂຫລດ...</span>
      </div>
      <div class="mt-2 text-primary-600">ກຳລັງໂຫລດຂໍ້ມູນຂ່າວ...</div>
    </div>
  </div>

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
                  :src="getFullImageUrl(currentNews.thumbnail)"
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
              ? formatDate(currentNews.public_at)
              : "ບໍ່ມີຂໍ້ມູນ"
          }}
        </dd>
        <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
          ເພີ່ມເມື່ອ:
        </dt>
        <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
          {{
            currentNews.created_at
              ? formatDate(currentNews.created_at)
              : "ບໍ່ມີຂໍ້ມູນ"
          }}
        </dd>
        <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
          ອັບເດດລ່າສຸດເມືອ:
        </dt>
        <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
          {{
            currentNews.updated_at
              ? formatDate(currentNews.updated_at)
              : "ບໍ່ມີຂໍ້ມູນ"
          }}
        </dd>
      </dl>
    </div>

    <br />

    <div class="p-4 flex items-center gap-4">
      <UiButton
        type="primary"
        size="medium"
        colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center"
        @click="handleEdit"
      >
        <i class="fas fa-edit mr-1"></i> ແກ້ໄຂ
      </UiButton>

      <UiButton
        type="danger"
        size="medium"
        colorClass="!bg-red-600 hover:!bg-red-800 text-white flex items-center"
        @click="handleDelete"
      >
        <i class="fas fa-trash-alt mr-1"></i> ລຶບ
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
