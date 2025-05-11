import { ref, reactive, computed } from "vue";
import type {
  CheckpointForm,
  Checkpoint,
  Translation,
} from "@/types/checkpoint.type";
import { DEFAULT_FORM_VALUES } from "../interface/checkpoint.constan";
import { validateCheckpointForm } from "../validation/checkpoint.validation";
import { formatContentForSubmit } from "@/utils/formatContent";

const CURRENT_USER = "phonpadid";

export function useCheckpointForm(initialData?: Checkpoint) {
  // Refs
  const formRef = ref();
  const uploadedFile = ref<File | null>(null);
  const imageError = ref<string>("");
  const originalData = ref<Checkpoint | null>(null);
  const isLoading = ref(false);
  const activeTab = ref("1");

  const defaultTranslations = {
    lo: { name: "", time_operation: "", address: "", content: "" },
    en: { name: "", time_operation: "", address: "", content: "" },
    zh_cn: { name: "", time_operation: "", address: "", content: "" }
  };

  // Initialize form with deep clone of default values
  const form = reactive<CheckpointForm>({
    ...structuredClone(DEFAULT_FORM_VALUES),
  });

  // Map data from API to form
  const mapDataToForm = (data: Checkpoint) => {
    // Store original data for comparison
    originalData.value = structuredClone(data);

    // Map basic fields
    const basicFields = {
      category_id: data.category_id,
      province_id: data.province_id,
      country: data.country,
      link_map: data.link_map || "",
      phone_number: data.phone_number || "",
      email: data.email || "",
      visa: Boolean(data.visa),
      e_visa: Boolean(data.e_visa),
      image: data.image || null,
    };

    // Initialize empty translations
    const emptyTranslates = {
      lo: { name: "", time_operation: "", address: "", content: "" },
      en: { name: "", time_operation: "", address: "", content: "" },
      zh_cn: { name: "", time_operation: "", address: "", content: "" },
    };

    // Merge basic fields and empty translations
    Object.assign(form, {
      ...basicFields,
      translates: emptyTranslates,
    });

    // Map translations if they exist
    if (Array.isArray(data.translates)) {
      data.translates.forEach((translate: Translation) => {
        if (translate?.lang && translate.lang in form.translates) {
          form.translates[translate.lang] = {
            name: translate.name || "",
            time_operation: translate.time_operation || "",
            address: translate.address || "",
            content: translate.content || "",
          };
        }
      });
    }
  };

  // Initialize form if initial data is provided
  if (initialData) {
    mapDataToForm(initialData);
  }

  // Check for translation changes
  const hasTranslationChanges = () => {
    if (!originalData.value?.translates) return false;

    return Object.entries(form.translates).some(([lang, currentData]) => {
      const originalTranslate = originalData.value?.translates.find(
        (t) => t.lang === lang
      );

      if (!originalTranslate) return true;

      return ["name", "time_operation", "address", "content"].some(
        (field) =>
          currentData[field as keyof typeof currentData] !==
          originalTranslate[field as keyof typeof originalTranslate]
      );
    });
  };

  // Check for any changes in the form
  const hasChanges = computed(() => {
    if (!originalData.value) return false;

    const basicFieldsChanged = [
      "category_id",
      "province_id",
      "country",
      "link_map",
      "phone_number",
      "email",
      "visa",
      "e_visa",
    ].some(
      (field) =>
        originalData.value?.[field as keyof Checkpoint] !==
        form[field as keyof CheckpointForm]
    );

    return (
      basicFieldsChanged ||
      uploadedFile.value !== null ||
      hasTranslationChanges()
    );
  });

  // Prepare form data for submission
  const prepareFormData = () => {
    const formData = new FormData();
    const currentDate = new Date().toISOString();

    // Basic fields mapping
    const basicFields = {
      category_id: form.category_id.toString(),
      province_id: form.province_id.toString(),
      country: form.country,
      link_map: form.link_map,
      phone_number: form.phone_number,
      email: form.email,
      visa: form.visa.toString(),
      e_visa: form.e_visa.toString(),
      updated_by: CURRENT_USER,
      updated_at: currentDate,
    };

    // Append basic fields
    Object.entries(basicFields).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Handle image upload
    if (uploadedFile.value) {
      formData.append("image", uploadedFile.value);
    }

    // Handle translations
    Object.entries(form.translates).forEach(([lang, data]) => {
      formData.append(
        lang,
        JSON.stringify({
          name: data.name.trim(),
          time_operation: data.time_operation.trim(),
          address: data.address.trim(),
          content: formatContentForSubmit(data.content),
        })
      );
    });

    return formData;
  };

  // Validate form
  const validate = async (): Promise<boolean> => {
    try {
      // Form validation
      await formRef.value?.validate();

      // Custom validation
      const errors = validateCheckpointForm(form);
      if (errors.length > 0) {
        throw new Error(errors[0]);
      }

      // Image validation
      if (!form.image && !uploadedFile.value) {
        imageError.value = "ກະລຸນາອັບໂຫລດຮູບພາບ";
        throw new Error("ກະລຸນາອັບໂຫລດຮູບພາບ");
      }

      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Validation failed");
    }
  };

  return {
    form,
    formRef,
    uploadedFile,
    imageError,
    originalData,
    isLoading,
    activeTab,
    hasChanges,
    validate,
    prepareFormData,
    mapDataToForm, 
  };
}
