<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useCheckpointcategoriesStore } from "../store/checkpoint.categories.store";
import { useNotification } from "@/utils/notificationService";
import { Modal } from "ant-design-vue";
import UiForm from "@/components/Form/UiForm.vue";
import UiFormItem from "@/components/Form/UiFormItem.vue";
import UiInput from "@/components/Input/UiInput.vue";
import Tab from "@/components/Tab/Tab.vue";
import UiButton from "@/components/button/UiButton.vue";
import Textarea from "@/components/Input/Textarea.vue";

/********************************************************************************* */
type LanguageKeys = "lo" | "en" | "zh_cn";
const {
  deleteCheckpointCategories,
  getCheckpointCategoriesById,
  updateCheckpointCategories,
} = useCheckpointcategoriesStore();
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
const formData = reactive<
  Record<LanguageKeys, { id?: number; title: string; description: string }>
>({
  lo: { id: undefined, title: "", description: "" },
  en: { id: undefined, title: "", description: "" },
  zh_cn: { id: undefined, title: "", description: "" },
});

const currentNewsCategories = ref(null);
const CheckpointCategoryId = ref<number>(0);

/********************************************************************************* */

// Generate slug from name
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "");
};
/********************************************************************************* */
const updateName = (lang: LanguageKeys, value: string | number) => {
  formData[lang].title = String(value);
  slugs[lang] = generateSlug(String(value));
};
/********************************************************************************* */
// Remove

const removeCheckpointCategories = async (id: number) => {
  Modal.confirm({
    title: "ຢືນຢັນການລົບ",
    content: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບລາຍການນີ້??",
    okText: "ແມ່ນແລ້ວ,ຂ້ອຍແນ່ໃຈ",
    cancelText: "ບໍ່,ຍົກເລີກ",
    okType: "danger",
    onOk: async () => {
      try {
        isLoading.value = true;
        await deleteCheckpointCategories(id);
        push({ name: "checkpointCategories" });
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
const fetchCheckpointCategory = async () => {
  try {
    isLoading.value = true;
    const id = Number(route.params.id);
    if (!id) {
      openNotification("error", "ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບໄອດີຂອງໝວດໝູ່ຂ່າວ");
      return;
    }

    CheckpointCategoryId.value = id;
    const data = await getCheckpointCategoriesById(id);

    if (data) {
      currentNewsCategories.value = data;

      // Handle data when it comes in translates array format
      if (data.translates && Array.isArray(data.translates)) {
        data.translates.forEach((translate: any) => {
          const lang = translate.lang as LanguageKeys;
          if (formData[lang]) {
            formData[lang].title = translate.title || "";
            formData[lang].description = translate.description || "";
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
          if (data[lang].title) formData[langKey].title = data[lang].title;
          if (data[lang].description)
            formData[langKey].description = data[lang].description;
          if (data[lang].id) formData[langKey].id = data[lang].id;
        }
      });
    }
  } catch (error) {
    console.error("ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ:", error);
    openNotification("error", "ເກີດຂໍ້ຜິດພາດ", "ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ");
  } finally {
    isLoading.value = false;
  }
};

// Form submission for update
const handleUpdate = async () => {
  try {
    // Validate data - ensure all languages have names
    const emptyFields = Object.entries(formData).filter(
      ([_, value]) => !value.title.trim()
    );

    if (emptyFields.length > 0) {
      alert("ກະລຸນາປ້ອນຊື່ໝວດໝູ່ໃຫ້ຄົບທຸກພາສາ");
      return;
    }

    if (!CheckpointCategoryId.value) {
      openNotification("error", "ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບໄອດີຂອງໝວດໝູ່ຂ່າວ");
      return;
    }

    // Make sure the data we send has the id fields included
    isLoading.value = true;
    await updateCheckpointCategories(CheckpointCategoryId.value, formData);
    openNotification("success", "ແກ້ໄຂປະເພດດ່ານ", "ແກ້ໄຂສຳເລັດ");

    push({ name: "checkpointCategories" });
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
  fetchCheckpointCategory();
});
/********************************************************************************* */
</script>

<template>
  <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white mt-12">
    ອັບເດດປະເພດດ່ານ
  </h2>
  <UiForm :model="formData" v-if="!isLoading">
    <Tab v-model="activeTab" :tabs="tabsConfig">
      <!-- ພາສາລາວ (Lao) -->
      <template #tab1>
        <UiFormItem label="ຊື່ປະເພດດ່ານ " name="lo_name">
          <UiInput
            v-model="formData.lo.title"
            @update:modelValue="(val) => updateName('lo', val)"
            placeholder="ປ້ອນຊື່ຂອງຂ່າວສານ"
            allowClear
            size="large"
          />
        </UiFormItem>
        <UiFormItem label="ຄຳອະທິບາຍປະເພດດ່ານ" name="description">
          <Textarea
            v-model="formData.lo.description"
            placeholder="ປ້ອນຄຳອະທິບາຍປະເພດດ່ານ"
            allowClear
            size="large"
          />
        </UiFormItem>
      </template>

      <!-- ພາສາອັງກິດ (English) -->
      <template #tab2>
        <UiFormItem label="ຊື່ຂ່າວສານ " name="en_name">
          <UiInput
            v-model="formData.en.title"
            @update:modelValue="(val) => updateName('en', val)"
            placeholder="ປ່ອນຊື່ຂອງຂ່າວສານ"
            allowClear
            size="large"
          />
        </UiFormItem>
        <UiFormItem label="ຄຳອະທິບາຍປະເພດດ່ານ" name="description">
          <Textarea
            v-model="formData.en.description"
            placeholder="ປ້ອນຄຳອະທິບາຍປະເພດດ່ານ"
            allowClear
            size="large"
          />
        </UiFormItem>
      </template>

      <!-- ພາສາຈີນ (Chinese) -->
      <template #tab3>
        <UiFormItem label="ຊື່ຂ່າວສານ " name="zh_cn_name">
          <UiInput
            v-model="formData.zh_cn.title"
            @update:modelValue="(val) => updateName('zh_cn', val)"
            placeholder="ປ້ອນຊື່ຂອງຂ່າວສານ"
            allowClear
            size="large"
          />
        </UiFormItem>
        <UiFormItem label="ຄຳອະທິບາຍປະເພດດ່ານ" name="description">
          <Textarea
            v-model="formData.zh_cn.description"
            placeholder="ປ້ອນຄຳອະທິບາຍປະເພດດ່ານ"
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
        ອັບເດດປະເພດດ່ານ
      </UiButton>
      <UiButton
        type="submit"
        size="large"
        :loading="isLoading"
        colorClass="!bg-red-700 hover:!bg-red-900 text-white flex items-center"
        icon="material-symbols:delete-outline-rounded"
        @click="removeCheckpointCategories(CheckpointCategoryId)"
      >
        ລຶບ
      </UiButton>
    </div>
  </UiForm>
  <div v-else class="flex justify-center items-center h-64">
    <p>ກຳລັງໂຫລດຂໍ້ມູນ</p>
  </div>
</template>
