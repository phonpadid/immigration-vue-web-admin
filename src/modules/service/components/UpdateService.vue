<script setup lang="ts">
import { ref, reactive, watch, onMounted } from "vue";
import { message } from "ant-design-vue";
import { useRouter, useRoute } from "vue-router";
import { useServiceStore } from "../store/service.store";
import { storeToRefs } from "pinia";
import Tab from "@/components/Tab/Tab.vue";
import UiInput from "@/components/Input/UiInput.vue";
import UiButton from "@/components/button/UiButton.vue";
import UiFormItem from "@/components/Form/UiFormItem.vue";
import UiForm from "@/components/Form/UiForm.vue";
import QuillEditorComponent from "@/components/editor/QuillEditorComponent.vue";
import Textarea from "@/components/Input/Textarea.vue";

// Define explicit type for tab language
type TabLanguage = "lo" | "en" | "zh_cn";

// Define interface for translates data structure
interface ServiceTranslate {
  id: number;
  service_id: number;
  title: string;
  description: string;
  content: string | any;
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
const store = useServiceStore();
const { isLoading, error,  } = storeToRefs(store);
const router = useRouter();
const route = useRoute();

// Get service ID from route params
const serviceId = ref<number>(parseInt(route.params.id as string));
const translateIds = ref<Record<TabLanguage, number>>(
  {} as Record<TabLanguage, number>
);
const loading = ref(false);

// Form state
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

// Tab configuration
const tabsConfig: TabConfig[] = [
  { key: "1", label: "ພາສາລາວ", slotName: "tab1", lang: "lo" },
  { key: "2", label: "ພາສາອັງກິດ", slotName: "tab2", lang: "en" },
  { key: "3", label: "ພາສາຈີນ", slotName: "tab3", lang: "zh_cn" },
];

// ฟังก์ชันสำหรับแปลงข้อมูล content ให้อยู่ในรูปแบบที่ editor ใช้งานได้
const parseContentForEditor = (content: any): string => {
  if (!content) return "";

  try {
    // หากเป็น object ให้แปลงเป็น JSON string
    if (typeof content === "object") {
      return JSON.stringify(content);
    }

    // หากเป็น string ให้ตรวจสอบว่าเป็น JSON หรือไม่
    if (typeof content === "string") {
      // ลองแปลงเป็น JSON เพื่อตรวจสอบ
      JSON.parse(content);
      // ถ้าแปลงได้ ส่งคืนเป็น string ตามเดิม
      return content;
    }

    return JSON.stringify(content);
  } catch (e) {
    // ถ้าแปลงไม่ได้ แสดงว่าไม่ใช่ JSON
    return typeof content === "string" ? content : "";
  }
};

// ฟังก์ชันโหลดข้อมูลบริการ
const loadServiceData = async () => {
  try {
    if (!serviceId.value) return;

    loading.value = true;
    console.log("Loading service data for ID:", serviceId.value);

    // ใช้ store เพื่อเรียกข้อมูลบริการ
    const response = await store.getServiceById(serviceId.value);
    console.log("Service response:", response);

    if (response && response.translates) {
      // วนลูปผ่านข้อมูลแปลในแต่ละภาษา
      response.translates.forEach((translate: ServiceTranslate) => {
        const lang = translate.lang as TabLanguage;
        if (lang in formState) {
          // บันทึก ID สำหรับการอัพเดต
          translateIds.value[lang] = translate.id;

          // นำข้อมูลเข้า formState
          formState[lang] = {
            title: translate.title || "",
            description: translate.description || "",
            content: parseContentForEditor(translate.content),
          };
        }
      });

      console.log(
        "Form state after loading:",
        JSON.parse(JSON.stringify(formState))
      );
      console.log("Translate IDs:", translateIds.value);
    }
  } catch (err) {
    console.error("Failed to load service data:", err);
    message.error("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນບໍລິການໄດ້");
  } finally {
    loading.value = false;
  }
};

// ฟังก์ชันแปลงข้อมูลสำหรับส่ง API
const formatContentForSubmit = (content: any): string | any => {
  try {
    // ถ้าเป็น string ให้ตรวจสอบว่าเป็น JSON หรือไม่
    if (typeof content === "string") {
      try {
        // ลองแปลงเป็น JSON object
        const jsonObj = JSON.parse(content);
        return jsonObj;
      } catch (e) {
        // ถ้าแปลงไม่ได้ แสดงว่าไม่ใช่ JSON
        return content;
      }
    }

    // ถ้าเป็น object อยู่แล้ว ส่งคืนเป็น object
    return content;
  } catch (e) {
    console.error("Error formatting content:", e);
    return content;
  }
};

// ฟังก์ชันส่งข้อมูลอัพเดต
const handleSubmit = async () => {
  if (submitting.value || !serviceId.value) return;

  try {
    submitting.value = true;
    await formRef.value?.submitForm();
    const submitData: Record<string, any> = {};
    // เพิ่มข้อมูลแต่ละภาษา
    Object.entries(formState).forEach(([lang, data]) => {
      submitData[lang] = {
        id: translateIds.value[lang as TabLanguage] || 0,
        title: data.title || "",
        description: data.description || "",
        content: data.content, // ส่งตามรูปแบบเดิม ไม่ต้องแปลง
      };
    });

    console.log("Submitting update data:", submitData);
    await store.updateService(serviceId.value, submitData);
    message.success("ອັບເດດຂໍ້ມູນສຳເລັດ");
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

// Debug helper for editor content
const debugEditorContent = (lang: string, content: any) => {
  console.group(`Editor Content Change - ${lang}`);
  try {
    const parsedContent =
      typeof content === "string" ? JSON.parse(content) : content;
    console.log("Raw Content:", content);
    console.log("Parsed Content:", parsedContent);
  } catch (e) {
    console.warn("Failed to parse content:", e);
  }
  console.groupEnd();
};

// โหลดข้อมูลเมื่อคอมโพเนนต์ถูกโหลด
onMounted(() => {
  if (!serviceId.value) {
    message.error("ບໍ່ພົບ ID ຂອງບໍລິການ");
    router.push("/services");
    return;
  }
  loadServiceData();
});

// Watchers
watch(error, (newError) => {
  if (newError) {
    message.error(newError);
  }
});
</script>

<template>
  <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white mt-12">
    ແກ້ໄຂຂໍ້ມູນບໍລິການ
  </h2>

  <a-spin :spinning="loading || isLoading">
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
.service-form {
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

:global(.dark) .service-form {
  background: #1f2937;
}
</style>
