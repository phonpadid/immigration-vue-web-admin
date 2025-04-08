<script setup lang="ts">
import { onMounted, ref, watch, computed } from "vue";
import { message } from "ant-design-vue";
import { useVisaStore } from "../store/visa.store";
import { useRouter } from "vue-router";
import Tab from "@/components/Tab/Tab.vue";
import Collapse from "@/components/Collapse/Collapse.vue";
import UiButton from "@/components/button/UiButton.vue";

// Store and router initialization
const store = useVisaStore();
const { push } = useRouter();

// Reactive references
const activeTab = ref("1");
const isLoading = ref(false);
const activeCollapseKeys = ref<string[]>([]);

// Tab configuration with language support
const tabsConfig = [
  { key: "1", label: "ພາສາລາວ", slotName: "tab1", lang: "lo" },
  { key: "2", label: "ພາສາອັງກິດ", slotName: "tab2", lang: "en" },
  { key: "3", label: "ພາສາຈີນ", slotName: "tab3", lang: "zh_cn" },
];

// Interface for content types
interface ContentItem {
  images: Array<{ url: string; alt: string }>;
  text: Array<string>;
}

/**
 * Transforms the raw content data into structured format
 * @param data Raw content data from API
 * @returns Structured content with images and text
 */
const transformContent = (data: any): ContentItem => {
  try {
    if (!data?.content?.content) {
      return { images: [], text: [] };
    }

    const contentItems: ContentItem = {
      images: [],
      text: [],
    };

    // Process each content item
    data.content.content.forEach((item: any) => {
      if (item.type === "image") {
        // Handle image content
        contentItems.images.push({
          url: item.attrs.src,
          alt: item.attrs.alt || item.attrs.title || "Visa image",
        });
      } else if (item.type === "paragraph" && item.content) {
        // Handle text content
        const paragraphText = item.content
          .filter((textItem: any) => textItem.type === "text")
          .map((textItem: any) => textItem.text)
          .join(" ")
          .trim();

        if (paragraphText) {
          contentItems.text.push(paragraphText);
        }
      }
    });

    return contentItems;
  } catch (error) {
    console.error("Error transforming content:", error);
    return { images: [], text: [] };
  }
};

/**
 * Loads visa data for specified language
 * @param lang Language code to load data for
 */
const loadLanguageData = async (lang: string) => {
  try {
    isLoading.value = true;
    await store.getAllVisa(lang);
  } catch (error) {
    console.error(`Error loading ${lang} data:`, error);
    message.error("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້");
  } finally {
    isLoading.value = false;
  }
};

/**
 * Handles panel expansion and loads details if needed
 * @param keys Array of panel keys that are being expanded
 */
const handlePanelExpand = async (keys: string[]) => {
  const currentLang =
    tabsConfig.find((tab) => tab.key === activeTab.value)?.lang || "lo";

  for (const key of keys) {
    try {
      const panelData = store.visaByLang[currentLang].data.find(
        (item) => item.id.toString() === key
      );

      if (panelData && !store.currentDetails[currentLang][panelData.id]) {
        isLoading.value = true;
        await store.getVisaDetails(panelData.id, currentLang);
      }
    } catch (error) {
      console.error("Error expanding panel:", error);
      message.error("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້");
    } finally {
      isLoading.value = false;
    }
  }
};

/**
 * Handles tab change and loads data if needed
 * @param key New tab key
 */
const handleTabChange = async (key: string) => {
  activeTab.value = key;
  activeCollapseKeys.value = [];

  const newLang = tabsConfig.find((tab) => tab.key === key)?.lang || "lo";
  if (!store.visaByLang[newLang].data.length) {
    await loadLanguageData(newLang);
  }
};

// Navigation handlers
const addVisa = () => {
  push({ name: "visa_category_add" });
};

const handleEdit = (panel: any) => {
  message.info(`ກຳລັງແກ້ໄຂແຜງ ${panel.key}`);
};

const handleDelete = (panel: any) => {
  message.warning(`ກຳລັງລຶບແຜງ ${panel.key}`);
};

// Computed property for current panels data
const currentPanels = computed(() => {
  const currentLang =
    tabsConfig.find((tab) => tab.key === activeTab.value)?.lang || "lo";
  const visaData = store.visaByLang[currentLang].data;

  return visaData.map((item) => {
    const details = store.currentDetails[currentLang][item.id];
    const content = details
      ? transformContent(details)
      : { images: [], text: [] };

    return {
      key: item.id.toString(),
      header: item.name,
      images: content.images,
      text: content.text,
      visaId: item.id,
      lang: currentLang,
    };
  });
});

// Initial data load
onMounted(async () => {
  await loadLanguageData("lo");
});
</script>

<template>
  <div
    class="bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 mt-12"
  >
    <!-- Header Section -->
    <div
      class="flex flex-col items-start justify-between dark:border-gray-600 p-4 sm:flex-row sm:items-center"
    >
      <h2 class="text-lg font-semibold mb-2 sm:mb-0 dark:text-white">
        ລາຍການປະເພດວີຊາ
      </h2>

      <div
        class="flex items-center justify-end flex-col sm:flex-row gap-2 w-full sm:w-fit"
      >
        <UiButton
          type="primary"
          size="large"
          colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center"
          icon="ant-design:plus-outlined"
          @click="addVisa"
        >
          ເພີ່ມຂໍ້ມູນ
        </UiButton>
      </div>
    </div>

    <!-- Tab Section -->
    <Tab
      v-model:activeKey="activeTab"
      :tabs="tabsConfig"
      @change="handleTabChange"
    >
      <template v-for="tab in tabsConfig" :key="tab.key" #[tab.slotName]>
        <a-spin :spinning="isLoading">
          <Collapse
            :panels="currentPanels"
            :bordered="true"
            v-model:activeKey="activeCollapseKeys"
            @change="handlePanelExpand"
            @edit="handleEdit"
            @delete="handleDelete"
          >
            <!-- Panel Content Template -->
            <template
              v-for="panel in currentPanels"
              :key="panel.key"
              #[`content-${panel.key}`]="{ panel }"
            >
              <div class="visa-content">
                <!-- Images Section -->
                <div v-if="panel.images?.length > 0" class="visa-images">
                  <img
                    v-for="(image, index) in panel.images"
                    :key="index"
                    :src="image.url"
                    :alt="image.alt"
                    class="visa-image"
                  />
                </div>

                <!-- Text Section -->
                <div v-if="panel.text?.length > 0" class="visa-text">
                  <p
                    v-for="(text, index) in panel.text"
                    :key="index"
                    class="text-paragraph"
                  >
                    {{ text }}
                  </p>
                </div>

                <!-- Empty State -->
                <div
                  v-if="!panel.images?.length && !panel.text?.length"
                  class="empty-content"
                >
                  <a-spin v-if="isLoading" />
                  <template v-else>
                    <div class="text-gray-500">ບໍ່ມີຂໍ້ມູນ</div>
                  </template>
                </div>
              </div>
            </template>
          </Collapse>
        </a-spin>
      </template>
    </Tab>
  </div>
</template>

<style scoped>
.visa-content {
  padding: 16px;
  background-color: #ffffff;
}

.visa-images {
  margin-bottom: 20px;
}

.visa-image {
  max-width: 100%;
  height: auto;
  margin-bottom: 16px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.visa-text {
  color: #333333;
  line-height: 1.6;
}

.text-paragraph {
  margin-bottom: 12px;
  font-size: 14px;
}

.empty-content {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  color: #999999;
  background-color: #f5f5f5;
  border-radius: 4px;
  min-height: 100px;
}

/* Dark mode support */
:global(.dark) .visa-content {
  background-color: #1f2937;
}

:global(.dark) .visa-text {
  color: #e5e7eb;
}

:global(.dark) .empty-content {
  background-color: #374151;
  color: #9ca3af;
}
</style>
