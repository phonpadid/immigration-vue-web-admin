<script setup lang="ts">
import { ref, reactive, watch, onMounted } from "vue";
import { message } from "ant-design-vue";
import { useRouter, useRoute } from "vue-router";
import { useVisaStore } from "../store/visa.store";
import type {
  VisaFormState,
  TabConfig,
  LanguageKey,
  VisaTranslate,
} from "../interface/visa.interface";
import { storeToRefs } from "pinia";
import UiInput from "@/components/Input/UiInput.vue";
import UiButton from "@/components/button/UiButton.vue";
import UiFormItem from "@/components/Form/UiFormItem.vue";
import UiForm from "@/components/Form/UiForm.vue";
import QuillEditorComponent from "@/components/editor/QuillEditorComponent.vue";
import Tab from "@/components/Tab/Tab.vue";

const route = useRoute();
const router = useRouter();
const store = useVisaStore();
const { isLoading, error } = storeToRefs(store);
// Form state
const activeTab = ref("1");
const formRef = ref<InstanceType<typeof UiForm>>();
const submitting = ref(false);
const visaId = ref<number>(parseInt(route.params.id as string));
const translateIds = ref<Record<string, number>>({});

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

// Validation rules
const rules = {
  "lo.name": [
    { required: true, message: "ກະລຸນາປ້ອນຊື່ພາສາລາວ", trigger: "blur" },
  ],
  "en.name": [
    { required: true, message: "ກະລຸນາປ້ອນຊື່ພາສາອັງກິດ", trigger: "blur" },
  ],
  "zh_cn.name": [
    { required: true, message: "ກະລຸນາປ້ອນຊື່ພາສາຈີນ", trigger: "blur" },
  ],
};

const loadVisaData = async () => {
  try {
    if (!visaId.value) return;

    isLoading.value = true;
    const response = await store.getVisaById(visaId.value);

    if (response && response.translates) {
      response.translates.forEach((translate: VisaTranslate) => {
        const lang = translate.lang as keyof VisaFormState;
        if (lang in formState) {
          translateIds.value[lang] = translate.id;
          formState[lang] = {
            name: translate.name,

            content:
              typeof translate.content === "string"
                ? translate.content
                : JSON.stringify(translate.content),
          };
        }
      });
    }
  } catch (error) {
    console.error("Error loading visa data:", error);
    message.error("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້");
  } finally {
    isLoading.value = false;
  }
};
// Update submit handler to match API structure
const handleSubmit = async () => {
  if (submitting.value || !visaId.value) return;

  try {
    submitting.value = true;
    await formRef.value?.submitForm();

    const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");
    const userLogin = "phonpadid";

    const submitData = Object.entries(formState).reduce((acc, [lang, data]) => {
      if (data.name || data.content) {
        acc[lang as LanguageKey] = {
          id: translateIds.value[lang],
          name: data.name,
          // ต้องเป็น string เท่านั้น
          content:
            typeof data.content === "string"
              ? data.content // ถ้าเป็น string อยู่แล้วใช้เลย
              : JSON.stringify(data.content), // ถ้าไม่ใช่ แปลงเป็น string
          lang: lang,
          visa_category_id: visaId.value,
          date: currentDate,
          userLogin: userLogin,
        };
      }
      return acc;
    }, {} as Record<LanguageKey, any>);

    console.log("Submit Data:", submitData);
    await store.updateVisa(visaId.value, submitData);
    message.success("ອັບເດດຂໍ້ມູນສຳເລັດ");
    router.push("/visa-category");
  } catch (err: any) {
    console.error("Update error:", err);
    message.error(
      error.value || err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການອັບເດດ"
    );
  } finally {
    submitting.value = false;
  }
};
// Debug helper with better type safety
const debugEditorContent = (lang: string, content: any) => {
  // console.group(`Editor Content Change - ${lang}`);
  try {
    const parsedContent =
      typeof content === "string" ? JSON.parse(content) : content;
    // console.log("Raw Content:", content);
    // console.log("Parsed Content:", parsedContent);
    if (parsedContent.ops) {
      // console.log("Delta Operations:", parsedContent.ops);
    }
  } catch (e) {
    // console.warn("Failed to parse content:", e);
  }
  console.groupEnd();
};

// Load data on mount
onMounted(() => {
  if (!visaId.value) {
    message.error("ບໍ່ພົບໄອດີຂອງວີຊາ");
    router.push("/visa-category");
    return;
  }
  loadVisaData();
});

// Watch for errors
watch(error, (newError) => {
  if (newError) {
    message.error(newError);
  }
});
</script>

<template>
  <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white ">
    ແກ້ໄຂຂໍ້ມູນປະເພດວີຊາ
  </h2>

  <a-spin :spinning="isLoading">
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
      <div class="flex justify-start gap-4 mt-4">
        <UiButton
          type="primary"
          size="large"
          colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center"
          :loading="submitting"
          :disabled="submitting"
          @click="handleSubmit"
        >
          {{ submitting ? "ກຳລັງອັບເດດ..." : "ອັບເດດ" }}
        </UiButton>
      </div>
    </UiForm>
  </a-spin>
</template>

<style scoped>
.visa-form {
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

:global(.dark) .visa-form {
  background: #1f2937;
}
</style>
