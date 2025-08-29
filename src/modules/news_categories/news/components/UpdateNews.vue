<script setup lang="ts">
import { reactive, ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { message } from "ant-design-vue";
import { useNewsStore } from "../store/new.store";
import { useNewscategoriesStore } from "../../news_categories/store/new.categories.store";
import { storeToRefs } from "pinia";
import type {
  QuillDelta,
  QuillContent,
} from "@/components/editor/editor.types";
import type { TabLanguage, TabConfig } from "../interface/new.interface";
import { getFileUrl } from "@/utils/ConfigPathImage";
import { Modal } from "ant-design-vue";
import { useNotification } from "@/utils/notificationService";
import Tab from "@/components/Tab/Tab.vue";
import UiForm from "@/components/Form/UiForm.vue";
import UiFormItem from "@/components/Form/UiFormItem.vue";
import UiInput from "@/components/Input/UiInput.vue";
import Textarea from "@/components/Input/Textarea.vue";
import InputSelect from "@/components/Input/InputSelect.vue";
import QuillEditorComponent from "@/components/editor/QuillEditorComponent.vue";
import UiButton from "@/components/button/UiButton.vue";
import UploadDragger from "@/components/Upload/UploadDragger.vue";
import LoadingSpinner from "@/components/loading/LoadingSpinner.vue";

/******************************************************************* */
// Router และ Store
const router = useRouter();
const route = useRoute();
const newsId = computed(() => Number(route.params.id));
const newsStore = useNewsStore();
const categoriesStore = useNewscategoriesStore();
const { newsCategories } = storeToRefs(categoriesStore);
const { currentNews } = storeToRefs(newsStore);
const { openNotification } = useNotification();
const activeTab = ref("1");
const isLoading = ref(false);
const formRef = ref<InstanceType<typeof UiForm>>();
const uploadedFile = ref<File | null>(null);
const thumbnailError = ref(""); // error message for thumbnail
const originalThumbnail = ref(""); // save original thumbnail path

// form data update news
const editForm = reactive({
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

// status options for news
const statusOptions = ref([
  { value: "draft", label: "ແບບຮ່າງ" },
  { value: "published", label: "ເຜີຍແຜ່" },
  { value: "private", label: "ສ່ວນໂຕ" },
]);

// TabConfig show language
const tabsConfig: TabConfig[] = [
  { key: "1", label: "ພາສາລາວ", slotName: "tab1", lang: "lo" },
  { key: "2", label: "ພາສາອັງກິດ", slotName: "tab2", lang: "en" },
  { key: "3", label: "ພາສາຈີນ", slotName: "tab3", lang: "zh_cn" },
];

// funtions for get news categories
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

//validate rules for form
const rules = {
  category_id: [
    { required: true, message: "ກະລຸນາເລືອກໝວດໝູ່", trigger: "change" },
  ],
};

// ฟังก์ชันจัดการการอัปโหลดไฟล์ใหม่
const handleFileSelect = (file: File) => {
  uploadedFile.value = file;
  thumbnailError.value = ""; // ล้าง error เมื่อมีการอัพโหลดไฟล์ใหม่

  // สร้าง URL สำหรับรูปที่อัพโหลด (สำหรับแสดงในหน้าเว็บ)
  const fileUrl = URL.createObjectURL(file);

  // เก็บ URL ไว้ในฟอร์ม
  editForm.thumbnail = fileUrl;

  console.log("File selected:", file);
};

// ฟังก์ชันสำหรับแปลงข้อมูล Editor ให้อยู่ในรูปแบบที่ต้องการ
const formatContentForSubmit = (
  content: string | QuillDelta | QuillContent
): string => {
  try {
    if (!content) return "";

    // ถ้าเป็น string และเป็น JSON อยู่แล้ว
    if (typeof content === "string") {
      try {
        const parsed = JSON.parse(content);
        if (parsed.type === "doc") {
          return content; // คืนค่าเดิมถ้าเป็น format ที่ถูกต้องแล้ว
        }
      } catch (e) {
        // ถ้า parse ไม่ได้ แสดงว่าไม่ใช่ JSON
      }
    }

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

  // ตรวจสอบรูปภาพ - หากมีรูปภาพเดิมอยู่แล้วและไม่ได้อัพโหลดใหม่ ก็ไม่ต้องแสดงข้อผิดพลาด
  if (!uploadedFile.value && !editForm.thumbnail) {
    errors.push("ກະລຸນາອັບໂຫລດຮູບພາບ");
    thumbnailError.value = "ກະລຸນາອັບໂຫລດຮູບພາບ";
    isValid = false;
  } else {
    thumbnailError.value = "";
  }

  // ตรวจสอบหมวดหมู่
  if (!editForm.category_id) {
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

// ฟังก์ชันแปลง content จาก API เพื่อให้ QuillEditor แสดงผลได้ถูกต้อง
const parseContentFromApi = (contentData: any): string => {
  try {
    // ถ้า contentData เป็น string ให้ลองแปลงเป็น JSON
    if (typeof contentData === "string") {
      try {
        contentData = JSON.parse(contentData);
      } catch (e) {
        console.error("Content is not a valid JSON string:", e);
        return contentData;
      }
    }

    // ถ้าเป็นรูปแบบที่ถูกต้องแล้ว (มี type: 'doc')
    if (
      contentData &&
      contentData.type === "doc" &&
      Array.isArray(contentData.content)
    ) {
      return JSON.stringify(contentData);
    }

    console.warn("Content format not recognized:", contentData);
    return JSON.stringify(contentData);
  } catch (e) {
    console.error("Error parsing content from API:", e);
    return "";
  }
};

// ฟังก์ชันโหลดข้อมูลข่าวและเติมข้อมูลลงในฟอร์ม
const loadNewsData = async () => {
  try {
    isLoading.value = true;
    await newsStore.getNewsById(newsId.value);

    if (!currentNews.value) {
      message.error("ບໍ່ພົບຂໍ້ມູນຂ່າວ");
      router.push("/admin/news");
      return;
    }

    // เติมข้อมูลพื้นฐาน
    editForm.category_id = currentNews.value.category_id.toString();
    editForm.status = currentNews.value.status;

    // จัดการรูปภาพให้มี URL เต็ม
    originalThumbnail.value = currentNews.value.thumbnail;
    editForm.thumbnail = getFileUrl(currentNews.value.thumbnail);

    // เติมข้อมูลภาษาต่างๆ
    if (
      currentNews.value.translates &&
      Array.isArray(currentNews.value.translates)
    ) {
      // ล้างข้อมูลเก่า
      editForm.translates = {
        lo: { title: "", description: "", content: "" },
        en: { title: "", description: "", content: "" },
        zh_cn: { title: "", description: "", content: "" },
      };

      // เติมข้อมูลใหม่จาก API
      currentNews.value.translates.forEach((translate) => {
        const lang = translate.lang as TabLanguage;
        if (lang && editForm.translates[lang]) {
          editForm.translates[lang] = {
            title: translate.title || "",
            description: translate.description || "",
            content: parseContentFromApi(translate.content || ""),
          };
        }
      });
    }

    console.log("News data loaded successfully", editForm);
  } catch (error) {
    console.error("Failed to load news data:", error);
    message.error("ບໍ່ສາມາດໂຫລດຂໍ້ມູນຂ່າວໄດ້");
  } finally {
    isLoading.value = false;
  }
};

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
    formData.append("category_id", editForm.category_id);
    formData.append("status", editForm.status);

    // อัพโหลดไฟล์รูปภาพใหม่ (ถ้ามี)
    if (uploadedFile.value) {
      formData.append("thumbnail", uploadedFile.value);
    } else if (originalThumbnail.value) {
      // ถ้าไม่มีการอัพโหลดใหม่ แต่มีรูปเดิม ใช้ path เดิม
      formData.append("thumbnail_path", originalThumbnail.value);
    }

    // จัดการข้อมูลภาษาต่างๆ ตามรูปแบบที่ต้องการ
    // ค้นหา ID ของแต่ละภาษาจากข้อมูลเดิม
    if (
      currentNews.value &&
      currentNews.value.translates &&
      Array.isArray(currentNews.value.translates)
    ) {
      currentNews.value.translates.forEach((translate) => {
        const lang = translate.lang as TabLanguage;
        if (lang && editForm.translates[lang]) {
          // สร้างข้อมูลสำหรับแต่ละภาษาโดยเก็บ ID เดิมไว้
          const langData = {
            id: translate.id, // ส่ง ID เดิมกลับไป
            title: editForm.translates[lang].title || translate.title,
            description:
              editForm.translates[lang].description || translate.description,
            content: formatContentForSubmit(editForm.translates[lang].content),
          };

          // เพิ่มเข้า FormData ในรูปแบบที่ต้องการ
          formData.append(lang, JSON.stringify(langData));
        }
      });
    }

    console.log("Updating news with FormData...");

    // แสดงข้อมูลที่จะส่งไป
    for (const pair of formData.entries()) {
      if (pair[0] === "thumbnail") {
        console.log(`${pair[0]}: [File object]`);
      } else {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
    }
    await newsStore.updateNewsWithFormData(newsId.value, formData);
    message.success("ອັບເດດຂ່າວສຳເລັດ");
    router.push("/admin/news");
  } catch (error: any) {
    console.error("Error updating news:", error);
    message.error(error?.message || "ເກີດຂໍ້ຜິດພາດໃນການອັບເດດຂ່າວ");
  } finally {
    isLoading.value = false;
  }
};

// delete news
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
// load data
onMounted(async () => {
  try {
    await Promise.all([categoriesStore.getAllNewsCategories(), loadNewsData()]);
  } catch (error) {
    console.error("Failed to load initial data:", error);
    message.error("ບໍ່ສາມາດໂຫລດຂໍ້ມູນເລີ່ມຕົ້ນໄດ້");
  }
});
</script>

<template>
  <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white mt-12">
    ອັບເດດຂ່າວ
  </h2>

  <LoadingSpinner v-if="isLoading" class="relative h-[80vh]" />

  <UiForm v-else ref="formRef" :model="editForm" :rules="rules">
    <!-- photo -->
    <div class="mb-6">
      <label
        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >
        ຮູບພາບຫຼັກ <span class="text-red-500">*</span>
      </label>
      <UploadDragger
        :existingImageUrl="editForm.thumbnail"
        @onFileSelect="handleFileSelect"
      />
      <!-- error photo -->
      <div v-if="thumbnailError" class="mt-1 text-sm text-red-500">
        {{ thumbnailError }}
      </div>
    </div>

    <div class="grid gap-4 my-6 md:grid-cols-2 md:gap-6">
      <UiFormItem label="ເລືອກໝວດໝູ່" name="category_id" required>
        <InputSelect
          v-model:value="editForm.category_id"
          :options="categoryOptions"
          placeholder="ເລືອກໝວດໝູ່"
          size="large"
        />
      </UiFormItem>
      <UiFormItem label="ສະຖານະ" name="status">
        <InputSelect
          v-model:value="editForm.status"
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
            v-model="editForm.translates[tab.lang].title"
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
            v-model="editForm.translates[tab.lang].description"
            placeholder="ປ້ອນຄຳອະທິບາຍ"
            allowClear
            size="large"
            :rows="3"
          />
        </UiFormItem>

        <UiFormItem :name="`translates.${tab.lang}.content`" label="ເນື້ອຫາ">
          <QuillEditorComponent
            v-model="editForm.translates[tab.lang].content"
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
        {{ isLoading ? "ກຳລັງອັບເດດ..." : "ອັບເດດຂ່າວ" }}
      </UiButton>
      <UiButton
        type="default"
        size="large"
        @click="handleDelete"
        icon="material-symbols:delete-outline"
        colorClass="!bg-red-700 hover:!bg-red-900 text-white flex items-center"
      >
        ລຶບ
      </UiButton>
    </div>
  </UiForm>
</template>
