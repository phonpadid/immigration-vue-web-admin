<script setup lang="ts">
import { ref, reactive, onMounted, watch } from "vue";
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";
import { useVisaStore } from "../store/visa.store";
import type {
  VisaLanguageContent,
  DocumentContent,
  VisaFormState,
  TabConfig,
  LanguageKey,
  ParagraphContent,
  ImageContent,
} from "../interface/visa.interface";
import { storeToRefs } from "pinia";
// Components
import Tab from "@/components/Tab/Tab.vue";
import QuillEditorComponent, {
  type QuillDelta,
} from "@/components/editor/QuillEditorComponent.vue";
import UiInput from "@/components/Input/UiInput.vue";
import UiButton from "@/components/button/UiButton.vue";
import UiFormItem from "@/components/Form/UiFormItem.vue";
import UiForm from "@/components/Form/UiForm.vue";

// Store and Router
const store = useVisaStore();
const { isLoading, error } = storeToRefs(store);
const router = useRouter();

// Form state
const activeTab = ref("1");
const formRef = ref<InstanceType<typeof UiForm>>();
const submitting = ref(false);

// const formState = reactive<Record<string, VisaLanguageContent>>({
//   lo: { name: "", content: "" },
//   en: { name: "", content: "" },
//   zh_cn: { name: "", content: "" },
// });
const formState = reactive<VisaFormState>({
  lo: { name: "", content: "" },
  en: { name: "", content: "" },
  zh_cn: { name: "", content: "" },
});

// Validation rules
const rules = {
  "lo.name": [
    { required: true, message: "ກະລຸນາປ້ອນຊື່ພາສາລາວ", trigger: "blur" },
  ],
  "en.name": [
    { required: true, message: "ກະລຸນາປ້ອນຊື່ພາສາລາວ", trigger: "blur" },
  ],
  "zh_cn.name": [
    { required: true, message: "ກະລຸນາປ້ອນຊື່ພາສາລາວ", trigger: "blur" },
  ],
};

// Tab configuration
// const tabsConfig = [
//   { key: "1", label: "ພາສາລາວ", slotName: "tab1", lang: "lo" },
//   { key: "2", label: "ພາສາອັງກິດ", slotName: "tab2", lang: "en" },
//   { key: "3", label: "ພາສາຈີນ", slotName: "tab3", lang: "zh_cn" },
// ];
const tabsConfig: TabConfig[] = [
  { key: "1", label: "ພາສາລາວ", slotName: "tab1", lang: "lo" },
  { key: "2", label: "ພາສາອັງກິດ", slotName: "tab2", lang: "en" },
  { key: "3", label: "ພາສາຈີນ", slotName: "tab3", lang: "zh_cn" },
];

const formatQuillContent = (content: any): string => {
  if (!content) {
    return JSON.stringify({ type: "doc", content: [] } as DocumentContent);
  }

  try {
    const delta = typeof content === "string" ? JSON.parse(content) : content;
    const formattedContent: DocumentContent = {
      type: "doc",
      content: [],
    };

    if (delta.ops) {
      delta.ops.forEach((op: { insert: string | { image: string } }) => {
        if (typeof op.insert === "string") {
          const lines = op.insert.split("\n");
          lines.forEach((line: string, index: number) => {
            if (line || index < lines.length - 1) {
              const paragraph: ParagraphContent = {
                type: "paragraph",
                attrs: { textAlign: "left" },
                content: [],
              };

              if (line) {
                paragraph.content.push({
                  type: "text",
                  text: line,
                });
              }

              if (index < lines.length - 1) {
                paragraph.content.push({
                  type: "hardBreak",
                });
              }

              formattedContent.content.push(paragraph);
            }
          });
        } else if (op.insert?.image) {
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
    }

    return JSON.stringify(formattedContent);
  } catch (error) {
    console.error("Error formatting content:", error);
    return JSON.stringify({ type: "doc", content: [] } as DocumentContent);
  }
};

// Form handlers
// const handleSubmit = async () => {
//   if (submitting.value) return;

//   try {
//     submitting.value = true;
//     await formRef.value?.submitForm();

//     const submitData = Object.entries(formState).reduce((acc, [lang, data]) => {
//       // ตรวจสอบว่ามี content หรือไม่
//       const content =
//         data.content ||
//         JSON.stringify({
//           type: "doc",
//           content: [],
//         });

//       acc[lang as LanguageKey] = {
//         name: data.name || "",
//         content: content, // ใช้ content ที่มีอยู่หรือค่าเริ่มต้น
//       };

//       return acc;
//     }, {} as Record<LanguageKey, VisaLanguageContent>);

//     console.log("Submitting data:", submitData); // เพิ่ม log เพื่อตรวจสอบข้อมูล

//     await store.createVisa(submitData);
//     message.success("ບັນທຶກຂໍ້ມູນສຳເລັດ");
//     router.push("/visa-category");
//   } catch (err: any) {
//     console.error("Submit error:", err);
//     message.error(
//       error.value || err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດ"
//     );
//   } finally {
//     submitting.value = false;
//   }
// };
const formatContentForSubmit = (content: string): string => {
  try {
    const parsedContent =
      typeof content === "string" ? JSON.parse(content) : content;

    // ถ้าเป็น Quill Delta format (มี ops)
    if (parsedContent.ops) {
      const formattedContent: DocumentContent = {
        type: "doc",
        content: [],
      };

      parsedContent.ops.forEach((op: QuillDelta["ops"][0]) => {
        if (typeof op.insert === "string") {
          const text = op.insert.trim();
          if (text) {
            const paragraph: ParagraphContent = {
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
            };
            formattedContent.content.push(paragraph);
          }
        } else if (typeof op.insert === "object" && "image" in op.insert) {
          const imageContent: ImageContent = {
            type: "image",
            attrs: {
              src: op.insert.image,
              alt: op.insert.image,
              title: null,
            },
          };
          formattedContent.content.push(imageContent);
        }
      });

      return JSON.stringify(formattedContent);
    }

    // ถ้าเป็น format ที่ถูกต้องอยู่แล้ว
    return typeof content === "string" ? content : JSON.stringify(content);
  } catch (e) {
    console.error("Error formatting content:", e);
    return JSON.stringify({
      type: "doc",
      content: [],
    } as DocumentContent);
  }
};

// ปรับปรุงฟังก์ชัน handleSubmit
const handleSubmit = async () => {
  if (submitting.value) return;

  try {
    submitting.value = true;
    await formRef.value?.submitForm();

    const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");
    const userLogin = "phonpadid";

    const submitData = Object.entries(formState).reduce((acc, [lang, data]) => {
      const formattedContent = formatContentForSubmit(data.content);

      acc[lang as LanguageKey] = {
        name: data.name || "",
        content: formattedContent,
        Date: currentDate,
        "User-Login": userLogin,
      };

      return acc;
    }, {} as Record<LanguageKey, VisaLanguageContent>);

    console.log("Final Submit Data:", JSON.stringify(submitData, null, 2));

    await store.createVisa(submitData);
    message.success("ບັນທຶກຂໍ້ມູນສຳເລັດ");
    router.push("/visa-category");
  } catch (err: any) {
    console.error("Submit error:", err);
    message.error(
      error.value || err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດ"
    );
  } finally {
    submitting.value = false;
  }
};

const debugEditorContent = (lang: string, content: any) => {
  console.group(`Editor Content Change - ${lang}`);
  try {
    const parsedContent =
      typeof content === "string" ? JSON.parse(content) : content;
    console.log("Raw Content nome:", content);
    console.log("Parsed Content:", parsedContent);
    if (parsedContent.ops) {
      console.log("Delta Operations:", parsedContent.ops);
    }
  } catch (e) {
    console.warn("Failed to parse content:", e);
  }
  console.groupEnd();
};

const resetForm = () => {
  formRef.value?.resetFields();
};

const handleCancel = () => {
  resetForm();
  router.back();
};

// Watchers
watch(error, (newError) => {
  if (newError) {
    message.error(newError);
  }
});
</script>
<template>
  <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white mt-12">
    ເພີ່ມຂໍ້ມູນປະເພດວີຊາ
  </h2>
  <UiForm ref="formRef" :model="formState" :rules="rules">
    <Tab v-model:activeKey="activeTab" :tabs="tabsConfig">
      <template v-for="tab in tabsConfig" :key="tab.key" #[tab.slotName]>
        <UiFormItem
          :name="[tab.lang, 'name']"
          :label="
            tab.lang === 'lo'
              ? 'ຊື່ປະເພດວີຊາ'
              : tab.lang === 'en'
              ? 'ຊື່ປະເພດວີຊາ'
              : 'ຊື່ປະເພດວີຊາ'
          "
          :required="tab.lang === 'lo'"
        >
          <UiInput
            v-model="formState[tab.lang].name"
            :placeholder="
              tab.lang === 'lo'
                ? 'ປ້ອນຊື່ປະເພດວີຊາ'
                : tab.lang === 'en'
                ? 'ປ້ອນຊື່ປະເພດວີຊາ'
                : 'ປ້ອນຊື່ປະເພດວີຊາ'
            "
          />
        </UiFormItem>
        <UiFormItem
          :name="[tab.lang, 'content']"
          :label="
            tab.lang === 'lo'
              ? 'ເນື້ອຫາ'
              : tab.lang === 'en'
              ? 'ເນື້ອຫາ'
              : 'ເນື້ອຫາ'
          "
        >
          <!-- <QuillEditorComponent
            v-model="formState[tab.lang].content"
            :placeholder="
              tab.lang === 'lo'
                ? 'ປ້ອນເນື້ອຫາ...'
                : tab.lang === 'en'
                ? 'ປ້ອນເນື້ອຫາ...'
                : 'ປ້ອນເນື້ອຫາ...'
            "
          /> -->
          <QuillEditorComponent
            v-model="formState[tab.lang].content"
            :placeholder="
              tab.lang === 'lo'
                ? 'ປ້ອນເນື້ອຫາ...'
                : tab.lang === 'en'
                ? 'ປ້ອນເນື້ອຫາ...'
                : 'ປ້ອນເນື້ອຫາ...'
            "
            @update:modelValue="(val) => debugEditorContent(tab.lang, val)"
          />
        </UiFormItem>
      </template>
    </Tab>

    <div class="flex justify-end gap-4 mt-4">
      <UiButton type="default" :disabled="submitting" @click="handleCancel">
        {{ "ຍົກເລີກ" }}
      </UiButton>
      <UiButton
        type="primary"
        :loading="submitting"
        :disabled="submitting"
        @click="handleSubmit"
      >
        {{ submitting ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກ" }}
      </UiButton>
    </div>
  </UiForm>
</template>
