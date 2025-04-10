<script setup lang="ts">
import { ref, reactive, watch } from "vue";
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
import Tab from "@/components/Tab/Tab.vue";
import type {
  QuillDelta,
  QuillContent,
} from "@/components/editor/editor.types";
import UiInput from "@/components/Input/UiInput.vue";
import UiButton from "@/components/button/UiButton.vue";
import UiFormItem from "@/components/Form/UiFormItem.vue";
import UiForm from "@/components/Form/UiForm.vue";
import QuillEditorComponent from "@/components/editor/QuillEditorComponent.vue";

// Store and Router
const store = useVisaStore();
const { isLoading, error } = storeToRefs(store);
const router = useRouter();

// Form state
const activeTab = ref("1");
const formRef = ref<InstanceType<typeof UiForm>>();
const submitting = ref(false);
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
const tabsConfig: TabConfig[] = [
  { key: "1", label: "ພາສາລາວ", slotName: "tab1", lang: "lo" },
  { key: "2", label: "ພາສາອັງກິດ", slotName: "tab2", lang: "en" },
  { key: "3", label: "ພາສາຈີນ", slotName: "tab3", lang: "zh_cn" },
];
// const formatContentForSubmit = (content: string | QuillDelta): string => {
//   try {
//     const parsedContent =
//       typeof content === "string" ? JSON.parse(content) : content;
//     if (parsedContent.ops) {
//       const formattedContent: DocumentContent = {
//         type: "doc",
//         content: [],
//       };

//       parsedContent.ops.forEach((op: QuillDelta["ops"][0]) => {
//         if (typeof op.insert === "string") {
//           const text = op.insert.trim();
//           if (text) {
//             const paragraph: ParagraphContent = {
//               type: "paragraph",
//               attrs: {
//                 textAlign: op.attributes?.align || "left",
//               },
//               content: [
//                 {
//                   type: "text",
//                   text: text,
//                 },
//               ],
//             };
//             formattedContent.content.push(paragraph);
//           }
//         } else if (typeof op.insert === "object" && "image" in op.insert) {
//           const imageContent: ImageContent = {
//             type: "image",
//             attrs: {
//               src: op.insert.image,
//               alt: op.insert.image,
//               title: null,
//             },
//           };
//           formattedContent.content.push(imageContent);
//         }
//       });

//       return JSON.stringify(formattedContent);
//     }

//     return typeof content === "string" ? content : JSON.stringify(content);
//   } catch (e) {
//     console.error("Error formatting content:", e);
//     return JSON.stringify({
//       type: "doc",
//       content: [],
//     } as DocumentContent);
//   }
// };
// ปรับปรุงฟังก์ชัน handleSubmit
const formatContentForSubmit = (
  content: string | QuillDelta | QuillContent
): string => {
  try {
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
    return JSON.stringify({
      type: "doc",
      content: [],
    });
  }
};

const handleSubmit = async () => {
  if (submitting.value) return;

  try {
    submitting.value = true;
    await formRef.value?.submitForm();

    const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");
    const userLogin = "phonpadid";

    const submitData = Object.entries(formState).reduce((acc, [lang, data]) => {
      acc[lang as LanguageKey] = {
        name: data.name || "",
        content: formatContentForSubmit(data.content),
        date: currentDate,
        userLogin: userLogin,
      };

      return acc;
    }, {} as Record<LanguageKey, VisaLanguageContent>);

    // console.log("Final Submit Data:", JSON.stringify(submitData, null, 2));

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
  // console.group(`Editor Content Change - ${lang}`);
  try {
    const parsedContent =
      typeof content === "string" ? JSON.parse(content) : content;
    // console.log("Raw Content nome:", content);
    // console.log("Parsed Content:", parsedContent);
    if (parsedContent.ops) {
      // console.log("Delta Operations:", parsedContent.ops);
    }
  } catch (e) {
    console.warn("Failed to parse content:", e);
  }
  console.groupEnd();
};

const handleCancel = () => {
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
