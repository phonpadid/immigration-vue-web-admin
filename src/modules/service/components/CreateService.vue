<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";
import { useServiceStore } from "../store/service.store";
import type { LanguageKey } from "../interface/service.interface";
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
import Textarea from "@/components/Input/Textarea.vue";

// Define explicit type for tab language
type TabLanguage = "lo" | "en" | "zh_cn";
// Define tab configuration with proper typing
interface TabConfig {
  key: string;
  label: string;
  slotName: string;
  lang: TabLanguage;
}
// Store and Router
const store = useServiceStore();
const { isLoading, error } = storeToRefs(store);
const router = useRouter();

// Form state with explicit typing
const activeTab = ref("1");
const formRef = ref<InstanceType<typeof UiForm>>();
const submitting = ref(false);
const formState = reactive<
  Record<TabLanguage, { title: string; content: string; description: string }>
>({
  lo: { title: "", content: "", description: "" },
  en: { title: "", content: "", description: "" },
  zh_cn: { title: "", content: "", description: "" },
});

// Validation rules
const rules = {
  "lo.title": [
    { required: true, message: "ກະລຸນາປ້ອນຊື່ບໍລິການພາສາລາວ", trigger: "blur" },
  ],
  "en.title": [
    {
      required: true,
      message: "ກະລຸນາປ້ອນຊື່ບໍລິການພາສາອັງກິດ",
      trigger: "blur",
    },
  ],
  "zh_cn.title": [
    { required: true, message: "ກະລຸນາປ້ອນຊື່ບໍລິການພາສາຈີນ", trigger: "blur" },
  ],
  "lo.description": [
    { required: true, message: "ກະລຸນາປ້ອນຄຳອະທິບາຍພາສາລາວ", trigger: "blur" },
  ],
};

// Tab configuration with proper typing
const tabsConfig: TabConfig[] = [
  { key: "1", label: "ພາສາລາວ", slotName: "tab1", lang: "lo" },
  { key: "2", label: "ພາສາອັງກິດ", slotName: "tab2", lang: "en" },
  { key: "3", label: "ພາສາຈີນ", slotName: "tab3", lang: "zh_cn" },
];

// ฟังก์ชันสำหรับแปลงข้อมูล Editor ให้อยู่ในรูปแบบที่ต้องการ
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

// ฟังก์ชันสำหรับส่งข้อมูลฟอร์ม
const handleSubmit = async () => {
  if (submitting.value) return;

  try {
    submitting.value = true;
    await formRef.value?.submitForm();

    const submitData = Object.entries(formState).reduce((acc, [lang, data]) => {
      acc[lang as TabLanguage] = {
        title: data.title || "",
        description: data.description || "",
        content: formatContentForSubmit(data.content),
      };

      return acc;
    }, {} as Record<TabLanguage, any>);

    await store.createService(submitData);
    message.success("ບັນທຶກຂໍ້ມູນສຳເລັດ");
    router.push("/services");
  } catch (err: any) {
    console.error("Submit error:", err);
    message.error(
      error.value || err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດ"
    );
  } finally {
    submitting.value = false;
  }
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
    ເພີ່ມຂໍ້ມູນບໍລິການ
  </h2>

  <UiForm ref="formRef" :model="formState" :rules="rules">
    <Tab v-model:activeKey="activeTab" :tabs="tabsConfig">
      <template v-for="tab in tabsConfig" :key="tab.key" #[tab.slotName]>
        <!-- ชื่อบริการ -->
        <UiFormItem
          :name="[tab.lang, 'title']"
          label="ຊື່ບໍລິການ"
          :required="tab.lang === 'lo'"
        >
          <UiInput
            v-model="formState[tab.lang as TabLanguage].title"
            placeholder="ປ້ອນຊື່ບໍລິການ"
          />
        </UiFormItem>

        <!-- คำอธิบาย -->
        <UiFormItem
          :name="[tab.lang, 'description']"
          label="ຄຳອະທິບາຍ"
          :required="tab.lang === 'lo'"
        >
          <Textarea
            v-model="formState[tab.lang as TabLanguage].description"
            placeholder="ປ້ອນຄຳອະທິບາຍ"
            :rows="3"
          />
        </UiFormItem>

        <!-- เนื้อหา -->
        <UiFormItem :name="[tab.lang, 'content']" label="ເນື້ອຫາ">
          <QuillEditorComponent
            v-model="formState[tab.lang as TabLanguage].content"
            placeholder="ປ້ອນເນື້ອຫາ..."
          />
        </UiFormItem>
      </template>
    </Tab>

    <div class="flex justify-start gap-4 mt-4">
      <UiButton
        type="primary"
        size="large"
        colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center"
        :loading="submitting"
        :disabled="submitting"
        @click="handleSubmit"
      >
        {{ submitting ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກ" }}
      </UiButton>
    </div>
  </UiForm>
</template>
