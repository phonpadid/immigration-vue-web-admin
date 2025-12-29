<script setup lang="ts">
import { ref, reactive, watch, onMounted } from "vue";
import { message } from "ant-design-vue";
import { useRouter, useRoute } from "vue-router";
import { useNationalityStore } from "../store/nationality.store";
import { storeToRefs } from "pinia";
import Tab from "@/components/Tab/Tab.vue";
import UiInput from "@/components/Input/UiInput.vue";
import UiButton from "@/components/button/UiButton.vue";
import UiFormItem from "@/components/Form/UiFormItem.vue";
import UiForm from "@/components/Form/UiForm.vue";

// Define explicit type for tab language
type TabLanguage = "lo" | "en" | "zh_cn";

// Define interface for translates data structure
interface NationalityTranslate {
  id: number;
  nationality_id: number;
  name: string;
  short_name?: string;
  lang: string;
}

// Define tab configuration with proper typing
interface TabConfig {
  key: string;
  label: string;
  slotName: string;
  lang: TabLanguage;
}

// Store and Router
const store = useNationalityStore();
const { isLoading, error } = storeToRefs(store);
const router = useRouter();
const route = useRoute();

// Get nationality ID from route params
const nationalityId = ref<number>(parseInt(route.params.id as string));
const translateIds = ref<Record<TabLanguage, number>>(
  {} as Record<TabLanguage, number>
);
const loading = ref(false);

// Form state
const activeTab = ref("1");
const formRef = ref<InstanceType<typeof UiForm>>();
const submitting = ref(false);

const formState = reactive<Record<TabLanguage, { name: string; short_name: string }>>({
  lo: { name: "", short_name: "" },
  en: { name: "", short_name: "" },
  zh_cn: { name: "", short_name: "" },
});

// Validation rules
const rules = {
  "lo.name": [
    { required: true, message: "ກະລຸນາປ້ອນຊື່ສັນຊາດພາສາລາວ", trigger: "blur" },
  ],
  "en.name": [
    {
      required: true,
      message: "ກະລຸນາປ້ອນຊື່ສັນຊາດພາສາອັງກິດ",
      trigger: "blur",
    },
  ],
  "zh_cn.name": [
    { required: true, message: "ກະລຸນາປ້ອນຊື່ສັນຊາດພາສາຈີນ", trigger: "blur" },
  ],
};

// Tab configuration
const tabsConfig: TabConfig[] = [
  { key: "1", label: "ພາສາລາວ", slotName: "tab1", lang: "lo" },
  { key: "2", label: "ພາສາອັງກິດ", slotName: "tab2", lang: "en" },
  { key: "3", label: "ພາສາຈີນ", slotName: "tab3", lang: "zh_cn" },
];

// ฟังก์ชันโหลดข้อมูลสัญชาติ
const loadNationalityData = async () => {
  try {
    if (!nationalityId.value) return;

    loading.value = true;
    console.log("Loading nationality data for ID:", nationalityId.value);

    const response = await store.getNationalityById(nationalityId.value);
    console.log("Nationality response:", response);

    if (response && response.translates) {
      response.translates.forEach((translate: NationalityTranslate) => {
        const lang = translate.lang as TabLanguage;
        if (lang in formState) {
          translateIds.value[lang] = translate.id;

          formState[lang] = {
            name: translate.name || "",
            short_name: translate.short_name || "",
          };
        }
      });

      console.log("Form state after loading:", JSON.parse(JSON.stringify(formState)));
      console.log("Translate IDs:", translateIds.value);
    }
  } catch (err) {
    console.error("Failed to load nationality data:", err);
    message.error("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນສັນຊາດໄດ້");
  } finally {
    loading.value = false;
  }
};

// ฟังก์ชันส่งข้อมูลอัพเดต
const handleSubmit = async () => {
  if (submitting.value || !nationalityId.value) return;

  try {
    submitting.value = true;
    await formRef.value?.submitForm();
    const submitData: Record<string, any> = {};

    Object.entries(formState).forEach(([lang, data]) => {
      submitData[lang] = {
        id: translateIds.value[lang as TabLanguage] || 0,
        name: data.name || "",
        short_name: data.short_name || "",
      };
    });

    console.log("Submitting update data:", submitData);
    await store.updateNationality(nationalityId.value, submitData);
    message.success("ອັບເດດຂໍ້ມູນສຳເລັດ");
    router.push("/admin/nationalities");
  } catch (err: any) {
    console.error("Submit error:", err);
    message.error(
      error.value || err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດ"
    );
  } finally {
    submitting.value = false;
  }
};

// โหลดข้อมูลเมื่อคอมโพเนนต์ถูกโหลด
onMounted(() => {
  if (!nationalityId.value) {
    message.error("ບໍ່ພົບ ID ຂອງສັນຊາດ");
    router.push("/admin/nationalities");
    return;
  }
  loadNationalityData();
});

// Watchers
watch(error, (newError) => {
  if (newError) {
    message.error(newError);
  }
});
</script>

<template>
  <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white ">
    ແກ້ໄຂຂໍ້ມູນສັນຊາດ
  </h2>

  <a-spin :spinning="loading || isLoading">
    <UiForm ref="formRef" :model="formState" :rules="rules">
      <Tab v-model:activeKey="activeTab" :tabs="tabsConfig">
        <template v-for="tab in tabsConfig" :key="tab.key" #[tab.slotName]>
          <!-- ชื่อสัญชาติ -->
          <UiFormItem
            :name="[tab.lang, 'name']"
            label="ຊື່ສັນຊາດ"
            :required="tab.lang === 'lo'"
          >
            <UiInput
              v-model="formState[tab.lang as TabLanguage].name"
              placeholder="ປ້ອນຊື່ສັນຊາດ"
            />
          </UiFormItem>

          <!-- ชื่อย่อ -->
          <UiFormItem
            :name="[tab.lang, 'short_name']"
            label="ຊື່ຍໍ້"
          >
            <UiInput
              v-model="formState[tab.lang as TabLanguage].short_name"
              placeholder="ປ້ອນຊື່ຍໍ້"
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
.nationality-form {
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

:global(.dark) .nationality-form {
  background: #1f2937;
}
</style>
