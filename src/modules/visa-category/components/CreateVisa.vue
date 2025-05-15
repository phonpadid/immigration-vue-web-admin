<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";
import { useVisaStore } from "../store/visa.store";
import type {
  VisaLanguageContent,
  VisaFormState,
  TabConfig,
  LanguageKey,
} from "../interface/visa.interface";
import { storeToRefs } from "pinia";
import Tab from "@/components/Tab/Tab.vue";
import type {
  QuillDelta,
  QuillContent,
} from "@/components/editor/editor.types";
import type { ValidateMessages } from "ant-design-vue/es/form/interface";
import UiInput from "@/components/Input/UiInput.vue";
import UiButton from "@/components/button/UiButton.vue";
import UiFormItem from "@/components/Form/UiFormItem.vue";
import UiForm from "@/components/Form/UiForm.vue";
import QuillEditorComponent from "@/components/editor/QuillEditorComponent.vue";

// Store and Router
const store = useVisaStore();
const { error } = storeToRefs(store);
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

// Tab configuration
const tabsConfig: TabConfig[] = [
  { key: "1", label: "ພາສາລາວ", slotName: "tab1", lang: "lo" },
  { key: "2", label: "ພາສາອັງກິດ", slotName: "tab2", lang: "en" },
  { key: "3", label: "ພາສາຈີນ", slotName: "tab3", lang: "zh_cn" },
];

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
const validateMessages: ValidateMessages = {
  default: "ກະລຸນາກວດສອບຂໍ້ມູນ ${label}",
  required: "ຈະຕ້ອງບໍ່ຫວ່າງເປົ່າ.",
  string: {
    min: "${label} ຕ້ອງມີຢ່າງໜ້ອຍ ${min} ຕົວອັກສອນ",
  },
};

// เพิ่มฟังก์ชัน validateForm
const validateForm = async (): Promise<boolean> => {
  try {
    if (!formRef.value) {
      throw new Error("ບໍ່ພົບຂໍ້ມູນແບບຟອມ");
    }

    // validate ทั้งฟอร์ม
    await formRef.value.validate();

    // ตรวจสอบว่าข้อมูลถูก trim แล้วไม่เป็นค่าว่าง
    if (!formState.lo.name.trim()) {
      message.error("ກະລຸນາປ້ອນຊື່ປະເພດວີຊາພາສາລາວ");
      activeTab.value = "1";
      return false;
    }

    return true;
  } catch (errors: any) {
    console.error("Form validation errors:", errors);

    if (errors?.errorFields?.length > 0) {
      const firstError = errors.errorFields[0];

      // เปลี่ยน tab ไปยังภาษาที่มีข้อผิดพลาด
      const fieldPath = firstError.name[0];
      const lang =
        typeof fieldPath === "string" ? fieldPath.split(".")[0] : fieldPath;

      switch (lang) {
        case "lo":
          activeTab.value = "1";
          break;
        case "en":
          activeTab.value = "2";
          break;
        case "zh_cn":
          activeTab.value = "3";
          break;
      }
    } else {
      message.error("ກະລຸນາກວດສອບຂໍ້ມູນທີ່ປ້ອນ");
    }

    return false;
  }
};

// ปรับปรุงฟังก์ชัน handleSubmit
const handleSubmit = async () => {
  if (submitting.value) return;

  try {
    submitting.value = true;
    const isValid = await validateForm();
    if (!isValid) {
      submitting.value = false;
      return;
    }

    const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");
    const userLogin = "phonpadid";

    const submitData = Object.entries(formState).reduce((acc, [lang, data]) => {
      acc[lang as LanguageKey] = {
        name: data.name.trim(),
        content: formatContentForSubmit(data.content),
        date: currentDate,
        userLogin: userLogin,
      };
      return acc;
    }, {} as Record<LanguageKey, VisaLanguageContent>);

    await store.createVisa(submitData);
    message.success("ບັນທຶກຂໍ້ມູນສຳເລັດ");
    router.push("/visa-category");
  } catch (err: any) {
    console.error("Submit error:", err);
  } finally {
    submitting.value = false;
  }
};

const debugEditorContent = (lang: string, content: any) => {
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
</script>
<template>
  <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white mt-12">
    ເພີ່ມຂໍ້ມູນປະເພດວີຊາ
  </h2>
  <UiForm
    ref="formRef"
    :model="formState"
    :validate-messages="validateMessages"
  >
    <Tab v-model:activeKey="activeTab" :tabs="tabsConfig">
      <template v-for="tab in tabsConfig" :key="tab.key" #[tab.slotName]>
        <UiFormItem :name="[tab.lang, 'name']" :label="'ຊື່ປະເພດວີຊາ'" required>
          <UiInput
            v-model="formState[tab.lang].name"
            :placeholder="'ປ້ອນຊື່ປະເພດວີຊາ'"
          />
        </UiFormItem>
        <UiFormItem :name="[tab.lang, 'content']" :label="'ເນື້ອຫາ'">
          <QuillEditorComponent
            v-model="formState[tab.lang].content"
            :placeholder="'ປ້ອນເນື້ອຫາ...'"
            @update:modelValue="(val) => debugEditorContent(tab.lang, val)"
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
