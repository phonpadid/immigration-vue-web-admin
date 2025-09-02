<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";
import { useServiceStore } from "../store/service.store";
import type { TabLanguage, TabConfig } from "../interface/service.interface";
import { storeToRefs } from "pinia";
import type { ValidateMessages } from "ant-design-vue/es/form/interface";
import type {
  QuillDelta,
  QuillContent,
} from "@/components/editor/editor.types";
import Tab from "@/components/Tab/Tab.vue";
import UiInput from "@/components/Input/UiInput.vue";
import UiButton from "@/components/button/UiButton.vue";
import UiFormItem from "@/components/Form/UiFormItem.vue";
import UiForm from "@/components/Form/UiForm.vue";
import QuillEditorComponent from "@/components/editor/QuillEditorComponent.vue";
import Textarea from "@/components/Input/Textarea.vue";

// Store and Router
const store = useServiceStore();
const { error } = storeToRefs(store);
const router = useRouter();

// Form state with explicit typing
const activeTab = ref("1");
const formRef = ref<InstanceType<typeof UiForm>>();
const submitting = ref(false);
const validationError = ref("");
const formState = reactive<
  Record<TabLanguage, { title: string; content: string; description: string }>
>({
  lo: { title: "", content: "", description: "" },
  en: { title: "", content: "", description: "" },
  zh_cn: { title: "", content: "", description: "" },
});

const validateMessages: ValidateMessages = {
  required: "ຈະຕ້ອງບໍ່ຫວ່າງເປົ່າ.",
  types: {
    string: "${label} ຕ້ອງເປັນຂໍ້ຄວາມ",
    number: "${label} ຕ້ອງເປັນຕົວເລກ",
    array: "${label} ຕ້ອງເປັນ Array",
  },
  string: {
    min: "${label} ຕ້ອງມີຢ່າງໜ້ອຍ ${min} ຕົວອັກສອນ",
    max: "${label} ຕ້ອງມີບໍ່ເກີນ ${max} ຕົວອັກສອນ",
    range: "${label} ຕ້ອງມີລະຫວ່າງ ${min}-${max} ຕົວອັກສອນ",
  },
  number: {
    min: "${label} ຕ້ອງມີຄ່າຢ່າງໜ້ອຍ ${min}",
    max: "${label} ຕ້ອງມີຄ່າບໍ່ເກີນ ${max}",
  },
  array: {
    min: "${label} ຕ້ອງມີຢ່າງໜ້ອຍ ${min} ລາຍການ",
    max: "${label} ຕ້ອງມີບໍ່ເກີນ ${max} ລາຍການ",
  },
  pattern: {
    mismatch: "${label} ບໍ່ຖືກຕ້ອງຕາມຮູບແບບທີ່ກຳນົດ",
  },
};
// Tab configuration with proper typing
const tabsConfig: TabConfig[] = [
  { key: "1", label: "ພາສາລາວ", slotName: "tab1", lang: "lo" },
  { key: "2", label: "ພາສາອັງກິດ", slotName: "tab2", lang: "en" },
  { key: "3", label: "ພາສາຈີນ", slotName: "tab3", lang: "zh_cn" },
];
const validateForm = async (): Promise<boolean> => {
  try {
    validationError.value = "";

    if (!formRef.value) {
      throw new Error("ບໍ່ພົບຂໍ້ມູນແບບຟອມ");
    }
    await formRef.value.validate();

    return true;
  } catch (errors: any) {
    if (errors?.errorFields?.length > 0) {
      const firstError = errors.errorFields[0];
      validationError.value = firstError.errors[0];

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
      validationError.value = "ກະລຸນາກວດສອບຂໍ້ມູນທີ່ປ້ອນ";
    }

    return false;
  }
};

// ปรับปรุงฟังก์ชัน handleSubmit
const handleSubmit = async () => {
  if (submitting.value) return;

  try {
    submitting.value = true;
    validationError.value = "";

    // เรียกใช้ validateForm และรอผลลัพธ์
    const isValid = await validateForm();

    if (!isValid) {
      submitting.value = false;
      return;
    }

    // ถ้าผ่านการ validate แล้วค่อยสร้าง submitData
    const submitData = Object.entries(formState).reduce((acc, [lang, data]) => {
      acc[lang as TabLanguage] = {
        title: data.title.trim(),
        description: data.description.trim(),
        content: formatContentForSubmit(data.content),
      };
      return acc;
    }, {} as Record<TabLanguage, any>);

    // ส่งข้อมูลไปยัง backend
    await store.createService(submitData);
    message.success("ບັນທຶກຂໍ້ມູນສຳເລັດ");
    router.push("/services");
  } catch (err: any) {
    console.error("Submit error:", err);
  } finally {
    submitting.value = false;
  }
};
const formatContentForSubmit = (
  content: string | QuillDelta | QuillContent
): string => {
  try {
    const parsedContent =
      typeof content === "string" ? JSON.parse(content) : content;
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
</script>

<template>
  <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white ">
    ເພີ່ມຂໍ້ມູນບໍລິການ
  </h2>
  <UiForm
    ref="formRef"
    :model="formState"
    :validate-messages="validateMessages"
  >
    <Tab v-model:activeKey="activeTab" :tabs="tabsConfig">
      <template v-for="tab in tabsConfig" :key="tab.key" #[tab.slotName]>
        <UiFormItem :name="[tab.lang, 'title']" label="ຫົວຂໍ້" required>
          <UiInput
            v-model="formState[tab.lang as TabLanguage].title"
            placeholder="ປ້ອນຊື່ບໍລິການ"
          />
        </UiFormItem>
        <UiFormItem :name="[tab.lang, 'description']" label="ຄຳອະທິບາຍ">
          <Textarea
            v-model="formState[tab.lang as TabLanguage].description"
            placeholder="ປ້ອນຄຳອະທິບາຍ"
            :rows="3"
          />
        </UiFormItem>
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
