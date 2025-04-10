<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useNewscategoriesStore } from "../store/new.categories.store";
import { useNotification } from "@/utils/notificationService";
import { Modal } from "ant-design-vue";
import UiForm from "@/components/Form/UiForm.vue";
import UiFormItem from "@/components/Form/UiFormItem.vue";
import UiInput from "@/components/Input/UiInput.vue";
import Tab from "@/components/Tab/Tab.vue";
import UiButton from "@/components/button/UiButton.vue";

/********************************************************************************* */
type LanguageKeys = "lo" | "en" | "zh_cn";
const newsCategoriesStore = useNewscategoriesStore();
const route = useRoute();
const { push } = useRouter();
const { openNotification } = useNotification();
const isLoading = ref(false);
const activeTab = ref("1");
const tabsConfig = [
  { key: "1", label: "ພາສາລາວ", slotName: "tab1" },
  { key: "2", label: "ພາສາອັງກິດ", slotName: "tab2" },
  { key: "3", label: "ພາສາຈີນ", slotName: "tab3" },
];

// For internal use - maintain slug generation if needed
const slugs = reactive({
  lo: "",
  en: "",
  zh_cn: "",
});

/********************************************************************************* */

// Form data structure matching the required output format
const formData = reactive<Record<LanguageKeys, { id?: number; name: string }>>({
  lo: { id: undefined, name: "" },
  en: { id: undefined, name: "" },
  zh_cn: { id: undefined, name: "" },
});

const currentNewsCategories = ref(null);
const categoryId = ref<number>(0);

/********************************************************************************* */

// Generate slug from name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "");
};
/********************************************************************************* */

// Update name and automatically generate slug
// const updateName = (lang: LanguageKeys, value: string) => {
//   formData[lang].name = value;
//   slugs[lang] = generateSlug(value);
// };
const updateName = (lang: LanguageKeys, value: string | number) => {
  formData[lang].name = String(value);
  slugs[lang] = generateSlug(String(value));
};
/********************************************************************************* */
// Remove

const removeNewCategories = async (id: number) => {
  Modal.confirm({
    title: "ຢືນຢັນການລົບ",
    content: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບລາຍການນີ້??",
    okText: "ແມ່ນແລ້ວ,ຂ້ອຍແນ່ໃຈ",
    cancelText: "ບໍ່,ຍົກເລີກ",
    okType: "danger",
    onOk: async () => {
      try {
        isLoading.value = true;
        await newsCategoriesStore.deleteCategories(id);
        push({ name: "newsCategoriess" });
        openNotification("success", "ລຶບຂໍ້ມູນ", "ລົບຂໍ້ມູນສຳເລັດ");
      } catch (err) {
        console.error("Error:", err);
        openNotification("error", "ລຶບຂໍ້ມູນ", "ເກີດຂໍ້ຜິດພາດໃນການລຶບ");
      } finally {
        isLoading.value = false;
      }
    },
  });
};

/********************************************************************************* */

// Fetch news category data when component is mounted
const fetchNewsCategory = async () => {
  try {
    isLoading.value = true;
    const id = Number(route.params.id);
    if (!id) {
      openNotification("error", "ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບໄອດີຂອງໝວດໝູ່ຂ່າວ");
      return;
    }

    categoryId.value = id;
    const data = await newsCategoriesStore.getNewsCategoriesById(id);

    if (data) {
      currentNewsCategories.value = data;

      // Handle data when it comes in translates array format
      if (data.translates && Array.isArray(data.translates)) {
        data.translates.forEach((translate: any) => {
          const lang = translate.lang as LanguageKeys;
          if (formData[lang]) {
            formData[lang].name = translate.name || "";
            formData[lang].id = translate.id || undefined; // Store the ID for each language
            slugs[lang] = translate.slug || "";
          }
        });
      }

      // Alternative: If the API returns data in the format you showed
      // This handles the case where data is returned in the format you provided
      Object.keys(data).forEach((lang) => {
        if (lang in formData && typeof data[lang] === "object") {
          const langKey = lang as LanguageKeys;
          if (data[lang].name) formData[langKey].name = data[lang].name;
          if (data[lang].id) formData[langKey].id = data[lang].id;
        }
      });
    }
  } catch (error) {
    console.error("ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນໝວດໝູ່ຂ່າວ:", error);
    openNotification(
      "error",
      "ເກີດຂໍ້ຜິດພາດ",
      "ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນໝວດໝູ່ຂ່າວ"
    );
  } finally {
    isLoading.value = false;
  }
};

// Form submission for update
const handleUpdate = async () => {
  try {
    // Validate data - ensure all languages have names
    const emptyFields = Object.entries(formData).filter(
      ([_, value]) => !value.name.trim()
    );

    if (emptyFields.length > 0) {
      alert("ກະລຸນາປ້ອນຊື່ໝວດໝູ່ໃຫ້ຄົບທຸກພາສາ");
      return;
    }

    if (!categoryId.value) {
      openNotification("error", "ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບໄອດີຂອງໝວດໝູ່ຂ່າວ");
      return;
    }

    // Make sure the data we send has the id fields included
    isLoading.value = true;
    await newsCategoriesStore.updateNewsCategories(categoryId.value, formData);
    openNotification("success", "ແກ້ໄຂປະເພດຂ່າວ", "ແກ້ໄຂສຳເລັດ");

    push({ name: "newsCategoriess" });
  } catch (error) {
    console.error("ເກີດຂໍ້ຜິດພາດໃນການອັບເດດຂໍ້ມູນ:", error);
    openNotification(
      "error",
      "ເກີດຂໍ້ຜິດພາດ",
      "ເກີດຂໍ້ຜິດພາດໃນການແກ້ໄຂຂໍ້ມູນ ກະລຸນາລອງອີກຄັ້ງ"
    );
  } finally {
    isLoading.value = false;
  }
};

// Load data when component is mounted
onMounted(() => {
  fetchNewsCategory();
});
/********************************************************************************* */
</script>

<template>
  <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white mt-12">
    ອັບເດດຂ່າວສານ
  </h2>
  <UiForm :model="formData" v-if="!isLoading">
    <Tab v-model="activeTab" :tabs="tabsConfig">
      <!-- ພາສາລາວ (Lao) -->
      <template #tab1>
        <UiFormItem label="ຊື່ຂ່າວສານ " name="lo_name">
          <UiInput
            v-model="formData.lo.name"
            @update:modelValue="(val) => updateName('lo', val)"
            placeholder="ປ້ອນຊື່ຂອງຂ່າວສານ"
            allowClear
            size="large"
          />
        </UiFormItem>
      </template>

      <!-- ພາສາອັງກິດ (English) -->
      <template #tab2>
        <UiFormItem label="ຊື່ຂ່າວສານ " name="en_name">
          <UiInput
            v-model="formData.en.name"
            @update:modelValue="(val) => updateName('en', val)"
            placeholder="ປ່ອນຊື່ຂອງຂ່າວສານ"
            allowClear
            size="large"
          />
        </UiFormItem>
      </template>

      <!-- ພາສາຈີນ (Chinese) -->
      <template #tab3>
        <UiFormItem label="ຊື່ຂ່າວສານ " name="zh_cn_name">
          <UiInput
            v-model="formData.zh_cn.name"
            @update:modelValue="(val) => updateName('zh_cn', val)"
            placeholder="ປ້ອນຊື່ຂອງຂ່າວສານ"
            allowClear
            size="large"
          />
        </UiFormItem>
      </template>
    </Tab>
    <div class="flex items-center gap-4">
      <UiButton
        @click="handleUpdate"
        type="submit"
        size="large"
        :loading="isLoading"
        colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center"
      >
        ອັບເດດຂ່າວສານ
      </UiButton>
      <UiButton
        type="submit"
        size="large"
        :loading="isLoading"
        colorClass="!bg-red-700 hover:!bg-red-900 text-white flex items-center"
        icon="material-symbols:delete-outline-rounded"
        @click="removeNewCategories(categoryId)"
      >
        ລຶບ
      </UiButton>
    </div>
  </UiForm>
  <div v-else class="flex justify-center items-center h-64">
    <p>ກຳລັງໂຫລດຂໍ້ມູນ</p>
  </div>
</template>
