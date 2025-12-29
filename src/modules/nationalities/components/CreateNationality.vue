<script setup lang="ts">
import { ref, reactive } from "vue";
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";
import { useNationalityStore } from "../store/nationality.store";
import type { TabLanguage, TabConfig } from "../interface/nationality.interface";
import type { ValidateMessages } from "ant-design-vue/es/form/interface";
import Tab from "@/components/Tab/Tab.vue";
import UiInput from "@/components/Input/UiInput.vue";
import UiButton from "@/components/button/UiButton.vue";
import UiFormItem from "@/components/Form/UiFormItem.vue";
import UiForm from "@/components/Form/UiForm.vue";

// Store and Router
const store = useNationalityStore();
const router = useRouter();

// Form state with explicit typing
const activeTab = ref("1");
const formRef = ref<InstanceType<typeof UiForm>>();
const submitting = ref(false);
const validationError = ref("");
const formState = reactive<
  Record<TabLanguage, { name: string; short_name: string }>
>({
  lo: { name: "", short_name: "" },
  en: { name: "", short_name: "" },
  zh_cn: { name: "", short_name: "" },
});

const validateMessages: ValidateMessages = {
  required: "ຈະຕ້ອງບໍ່ຫວ່າງເປົ່າ.",
  types: {
    string: "${label} ຕ້ອງເປັນຂໍ້ຄວາມ",
  },
  string: {
    min: "${label} ຕ້ອງມີຢ່າງໜ້ອຍ ${min} ຕົວອັກສອນ",
    max: "${label} ຕ້ອງມີບໍ່ເກີນ ${max} ຕົວອັກສອນ",
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

const handleSubmit = async () => {
  if (submitting.value) return;

  try {
    submitting.value = true;
    validationError.value = "";

    const isValid = await validateForm();

    if (!isValid) {
      submitting.value = false;
      return;
    }

    const submitData = Object.entries(formState).reduce((acc, [lang, data]) => {
      acc[lang as TabLanguage] = {
        name: data.name.trim(),
        short_name: data.short_name.trim(),
      };
      return acc;
    }, {} as Record<TabLanguage, any>);

    await store.createNationality(submitData);
    message.success("ບັນທຶກຂໍ້ມູນສຳເລັດ");
    router.push("/admin/nationalities");
  } catch (err: any) {
    console.error("Submit error:", err);
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white ">
    ເພີ່ມຂໍ້ມູນສັນຊາດ
  </h2>
  <UiForm
    ref="formRef"
    :model="formState"
    :validate-messages="validateMessages"
  >
    <Tab v-model:activeKey="activeTab" :tabs="tabsConfig">
      <template v-for="tab in tabsConfig" :key="tab.key" #[tab.slotName]>
        <UiFormItem :name="[tab.lang, 'name']" label="ຊື່ສັນຊາດ" required>
          <UiInput
            v-model="formState[tab.lang as TabLanguage].name"
            placeholder="ປ້ອນຊື່ສັນຊາດ"
          />
        </UiFormItem>
        <UiFormItem :name="[tab.lang, 'short_name']" label="ຊື່ຫຍໍ້">
          <UiInput
            v-model="formState[tab.lang as TabLanguage].short_name"
            placeholder="ປ້ອນຊື່ຫຍໍ້"
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
