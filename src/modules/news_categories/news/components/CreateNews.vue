<script setup lang="ts">
import { reactive, ref } from "vue";
import UploadDragger from "@/components/Upload/UploadDragger.vue";
import type { NewForm } from "../interface/new.interface";
import Tab from "@/components/Tab/Tab.vue";
import UiForm from "@/components/Form/UiForm.vue";
import UiFormItem from "@/components/Form/UiFormItem.vue";
import UiInput from "@/components/Input/UiInput.vue";
import Textarea from "@/components/Input/Textarea.vue";
import InputSelect from "@/components/Input/InputSelect.vue";
import QuillEditorComponent from "@/components/editor/QuillEditorComponent.vue";

/************************************************************ */
type LanguageKeys = "lo" | "en" | "zh_cn";

const newForm = reactive<NewForm>({
  category_id: "",
});
const activeTab = ref("1");
const isLoading = ref(false);
const uploadedFiles = ref<any[]>([]);
/*************************************************************** */
const newCategories = [
  {
    value: "lucy",
    label: "Lucy",
  },
];

/*************************************************************** */

const tabsConfig = [
  { key: "1", label: "ພາສາລາວ", slotName: "tab1" },
  { key: "2", label: "ພາສາອັງກິດ", slotName: "tab2" },
  { key: "3", label: "ພາສາຈີນ", slotName: "tab3" },
];

/*************************************************************** */
const handleUploadChange = (fileList: any) => {
  console.log("Upload File:", fileList);
  uploadedFiles.value = Array.isArray(fileList) ? fileList : [];
};
/*************************************************************** */
</script>

<template>
  <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white mt-12">
    ເພີ່ມຂ່າວ
  </h2>
  <UiForm :model="newForm">
    <UploadDragger
      v-model:file-list="uploadedFiles"
      @change="handleUploadChange"
    />

    <div class="grid gap-4 my-4 md:grid-cols-2 md:gap-6">
      <UiFormItem label="ເລືອກຂ່າວ">
        <InputSelect
          v-model:value="newForm.category_id"
          :options="newCategories"
          placeholder="ເລືອກຂ່າວສານ"
          size="large"
        />
      </UiFormItem>
      <UiFormItem label="ສະຖານະ">
        <InputSelect
          v-model:value="newForm.category_id"
          :options="newCategories"
          placeholder="ເລືອກສະຖານະ"
          size="large"
        />
      </UiFormItem>
    </div>
    <Tab v-model="activeTab" :tabs="tabsConfig">
      <template #tab1>
        <UiFormItem label="ຫົວຂໍ້ຂ່າວ " name="lo_name">
          <UiInput
            v-model="newForm.category_id"
            placeholder="ປ້ອນຫົວຂໍ້ຂ່າວ"
            allowClear
            size="large"
          />
          <!-- @update:modelValue="(val) => updateName('lo', val)" -->
        </UiFormItem>
        <UiFormItem label="ຄຳອະທິບາຍ " name="descriptions">
          <Textarea
            v-model="newForm.category_id"
            placeholder="ປ້ອນຄຳອະທິບາຍ"
            allowClear
            size="large"
          />
          <!-- @update:modelValue="(val) => updateName('lo', val)" -->
        </UiFormItem>
      </template>
      <template #tab2>
        <UiFormItem label="ຫົວຂໍ້ຂ່າວ " name="lo_name">
          <UiInput
            v-model="newForm.category_id"
            placeholder="ປ້ອນຫົວຂໍ້ຂ່າວ"
            allowClear
            size="large"
          />
          <!-- @update:modelValue="(val) => updateName('lo', val)" -->
        </UiFormItem>
        <UiFormItem label="ຄຳອະທິບາຍ " name="descriptions">
          <Textarea
            v-model="newForm.category_id"
            placeholder="ປ້ອນຄຳອະທິບາຍ"
            allowClear
            size="large"
          />
          <!-- @update:modelValue="(val) => updateName('lo', val)" -->
        </UiFormItem>
      </template>
      <template #tab3>
        <UiFormItem label="ຫົວຂໍ້ຂ່າວ " name="lo_name">
          <UiInput
            v-model="newForm.category_id"
            placeholder="ປ້ອນຫົວຂໍ້ຂ່າວ"
            allowClear
            size="large"
          />
          <!-- @update:modelValue="(val) => updateName('lo', val)" -->
        </UiFormItem>
        <UiFormItem label="ຄຳອະທິບາຍ " name="descriptions">
          <Textarea
            v-model="newForm.category_id"
            placeholder="ປ້ອນຄຳອະທິບາຍ"
            allowClear
            size="large"
          />
          <!-- @update:modelValue="(val) => updateName('lo', val)" -->
        </UiFormItem>
      </template>
    </Tab>
  </UiForm>
</template>
