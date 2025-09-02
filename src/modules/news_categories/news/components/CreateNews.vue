<script setup lang="ts">
import { reactive, ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import { useNewsStore } from "../store/new.store";
import { useNewscategoriesStore } from "../../news_categories/store/new.categories.store";
import { storeToRefs } from "pinia";
import type {
  QuillDelta,
  QuillContent,
} from "@/components/editor/editor.types";
import type { TabLanguage, TabConfig } from "../interface/new.interface";
import Tab from "@/components/Tab/Tab.vue";
import UiForm from "@/components/Form/UiForm.vue";
import UiFormItem from "@/components/Form/UiFormItem.vue";
import UiInput from "@/components/Input/UiInput.vue";
import Textarea from "@/components/Input/Textarea.vue";
import InputSelect from "@/components/Input/InputSelect.vue";
import QuillEditorComponent from "@/components/editor/QuillEditorComponent.vue";
import UiButton from "@/components/button/UiButton.vue";
import UploadDragger from "@/components/Upload/UploadDragger.vue";

/**************************************************************** */
// Router และ Store
const router = useRouter();
const newsStore = useNewsStore();
const categoriesStore = useNewscategoriesStore();
const { newsCategories } = storeToRefs(categoriesStore);
const activeTab = ref("1");
const isLoading = ref(false);
const formRef = ref<InstanceType<typeof UiForm>>();
const uploadedFile = ref<File | null>(null);
const thumbnailError = ref("");
/**************************************************************** */
const newForm = reactive({
  category_id: "",
  status: "draft",
  thumbnail: "",
  translates: {
    lo: { title: "", description: "", content: "" },
    en: { title: "", description: "", content: "" },
    zh_cn: { title: "", description: "", content: "" },
  } as Record<
    TabLanguage,
    { title: string; description: string; content: string }
  >,
});

//Satus options for the news
const statusOptions = ref([
  { value: "draft", label: "ແບບຮ່າງ" },
  { value: "published", label: "ເຜີຍແຜ່" },
  { value: "private", label: "ສ່ວນໂຕ" },
]);

// tabConfig show language
const tabsConfig: TabConfig[] = [
  { key: "1", label: "ພາສາລາວ", slotName: "tab1", lang: "lo" },
  { key: "2", label: "ພາສາອັງກິດ", slotName: "tab2", lang: "en" },
  { key: "3", label: "ພາສາຈີນ", slotName: "tab3", lang: "zh_cn" },
];

// funtion for get all categories
const categoryOptions = computed(() => {
  const options = [{ value: "", label: "ກະລຸນາເລືອກໝວດໝູ່" }];

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
        console.error("Error processing category:", error);
      }
    });
  }

  return options;
});

// validation rules for form
const rules = {
  category_id: [
    { required: true, message: "ກະລຸນາເລືອກໝວດໝູ່", trigger: "change" },
  ],
};

// select file from UploadDragger component
const handleFileSelect = (file: File) => {
  uploadedFile.value = file;
  thumbnailError.value = "";

  // Using URL.createObjectURL to create a temporary URL for the file
  const fileUrl = URL.createObjectURL(file);

  // Save the file URL to the newForm object
  newForm.thumbnail = fileUrl;

  console.log("File selected:", file);
};

// format content for submit
const formatContentForSubmit = (
  content: string | QuillDelta | QuillContent
): string => {
  try {
    if (!content) return "";

    const parsedContent =
      typeof content === "string" ? JSON.parse(content) : content;

    // ถ้าเป็น QuillDelta
    if (parsedContent.ops && Array.isArray(parsedContent.ops)) {
      const formattedContent: QuillContent = {
        type: "doc",
        content: [],
      };

      parsedContent.ops.forEach((op: any) => {
        if (typeof op.insert === "string") {
          const text = op.insert.trim();
          if (text) {
            formattedContent.content.push({
              type: "paragraph",
              attrs: {
                textAlign: op.attributes?.align || "left",
              },
              content: [
                {
                  type: "text",
                  text: text,
                },
              ],
            });
          }
        } else if (typeof op.insert === "object" && "image" in op.insert) {
          formattedContent.content.push({
            type: "image",
            attrs: {
              src: op.insert.image,
              alt: op.insert.image,
              title: null,
            },
          });
        }
      });

      return JSON.stringify(formattedContent);
    }

    // ถ้าเป็น EditorContent อยู่แล้ว
    if (parsedContent.type === "doc") {
      return JSON.stringify(parsedContent);
    }

    return typeof content === "string" ? content : JSON.stringify(content);
  } catch (e) {
    console.error("Error formatting content:", e);
    return "";
  }
};

// ฟังก์ชันตรวจสอบก่อนส่งฟอร์ม - ลบการตรวจสอบข้อมูลภาษาออก
const validateForm = async () => {
  let isValid = true;
  const errors = [];

  // ตรวจสอบรูปภาพ
  if (!uploadedFile.value && !newForm.thumbnail) {
    errors.push("ກະລຸນາອັບໂຫລດຮູບພາບ");
    thumbnailError.value = "ກະລຸນາອັບໂຫລດຮູບພາບ";
    isValid = false;
  } else {
    thumbnailError.value = "";
  }

  // ตรวจสอบหมวดหมู่
  if (!newForm.category_id) {
    errors.push("ກະລຸນາເລືອກໝວດໝູ່");
    isValid = false;
  }

  // ตรวจสอบฟอร์มด้วย form validation
  try {
    await formRef.value?.submitForm();
  } catch (err) {
    isValid = false;
    console.error("Form validation failed:", err);
  }

  // แสดงข้อความผิดพลาด
  if (!isValid && errors.length > 0) {
    message.error(errors[0]);
  }

  return isValid;
};

// ฟังก์ชันส่งข้อมูลฟอร์ม - แก้ไขรูปแบบข้อมูลที่ส่งไป API
const handleSubmit = async () => {
  try {
    isLoading.value = true;

    // ตรวจสอบฟอร์มก่อนส่ง
    const isValid = await validateForm();
    if (!isValid) {
      isLoading.value = false;
      return;
    }

    // สร้าง FormData สำหรับส่งข้อมูลและไฟล์
    const formData = new FormData();

    // เพิ่มค่าพื้นฐานเข้า FormData
    formData.append("category_id", newForm.category_id);
    formData.append("status", newForm.status);

    // อัพโหลดไฟล์รูปภาพ
    if (uploadedFile.value) {
      formData.append("thumbnail", uploadedFile.value);
    }
    const languages: TabLanguage[] = ["lo", "en", "zh_cn"];

    languages.forEach((lang) => {
      const langData = {
        title:
          newForm.translates[lang].title ||
          (lang === "lo"
            ? "ຫົວຂໍ້ຂ່າວ"
            : lang === "en"
            ? "ຫົວຂໍ້ຂ່າວ"
            : "ຫົວຂໍ້ຂ່າວ"),
        description:
          newForm.translates[lang].description ||
          (lang === "lo"
            ? "ຄຳອະທິບາຍ"
            : lang === "en"
            ? "ຄຳອະທິບາຍ"
            : "ຄຳອະທິບາຍ"),
        content: formatContentForSubmit(newForm.translates[lang].content),
      };
      formData.append(lang, JSON.stringify(langData));
    });

    await newsStore.createNewsWithFormData(formData);
    message.success("ບັນທຶກຂ່າວສຳເລັດ");
    router.push("/admin/news");
  } catch (error: any) {
    console.error("Error submitting form:", error);
    message.error(error?.message || "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂ່າວ");
  } finally {
    isLoading.value = false;
  }
};

// load categories when component mounted
onMounted(async () => {
  try {
    await categoriesStore.getAllNewsCategories();
  } catch (error) {
    console.error("Failed to load categories:", error);
    message.error("ບໍ່ສາມາດໂຫລດຂໍ້ມູນໝວດໝູ່ໄດ້");
  }
});
</script>

<template>
  <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white">
    ເພີ່ມຂ່າວ
  </h2>
  <UiForm ref="formRef" :model="newForm" :rules="rules">
    <!-- รูปภาพ -->
    <div class="mb-6">
      <label
        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >
        ຮູບພາບຫຼັກ <span class="text-red-500">*</span>
      </label>
      <UploadDragger
        :existingImageUrl="newForm.thumbnail"
        @onFileSelect="handleFileSelect"
      />
      <div v-if="thumbnailError" class="mt-1 text-sm text-red-500">
        {{ thumbnailError }}
      </div>
    </div>

    <div class="grid gap-4 my-6 md:grid-cols-2 md:gap-6">
      <UiFormItem label="ເລືອກໝວດໝູ່" name="category_id" required>
        <InputSelect
          v-model:value="newForm.category_id"
          :options="categoryOptions"
          placeholder="ເລືອກໝວດໝູ່"
          size="large"
        />
      </UiFormItem>
      <UiFormItem label="ສະຖານະ" name="status">
        <InputSelect
          v-model:value="newForm.status"
          :options="statusOptions"
          placeholder="ເລືອກສະຖານະ"
          size="large"
        />
      </UiFormItem>
    </div>

    <Tab v-model:activeKey="activeTab" :tabs="tabsConfig">
      <template v-for="tab in tabsConfig" :key="tab.key" #[tab.slotName]>
        <UiFormItem :name="`translates.${tab.lang}.title`" label="ຫົວຂໍ້ຂ່າວ">
          <UiInput
            v-model="newForm.translates[tab.lang].title"
            placeholder="ປ້ອນຫົວຂໍ້ຂ່າວ"
            allowClear
            size="large"
          />
        </UiFormItem>

        <UiFormItem
          :name="`translates.${tab.lang}.description`"
          label="ຄຳອະທິບາຍ"
        >
          <Textarea
            v-model="newForm.translates[tab.lang].description"
            placeholder="ປ້ອນຄຳອະທິບາຍ"
            allowClear
            size="large"
            :rows="3"
          />
        </UiFormItem>

        <UiFormItem :name="`translates.${tab.lang}.content`" label="ເນື້ອຫາ">
          <QuillEditorComponent
            v-model="newForm.translates[tab.lang].content"
            placeholder="ປ້ອນເນື້ອຫາ..."
          />
        </UiFormItem>
      </template>
    </Tab>

    <div class="flex justify-start gap-4 mt-6">
      <UiButton
        type="primary"
        size="large"
        colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center"
        :loading="isLoading"
        @click="handleSubmit"
      >
        {{ isLoading ? "ກຳລັງບັນທຶກ..." : "ເພີ່ມຂ່າວ" }}
      </UiButton>
    </div>
  </UiForm>
</template>
