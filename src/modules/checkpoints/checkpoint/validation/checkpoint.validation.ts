import type { ValidationRule } from "@/types/checkpoint.type";

export const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const phonePattern = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;

export const validationRules = {
  category_id: [
    { required: true, message: "ກະລຸນາເລືອກປະເພດດ່ານ", trigger: "change" },
  ],
  province_id: [
    { required: true, message: "ກະລຸນາເລືອກແຂວງ", trigger: "change" },
  ],
  country: [{ required: true, message: "ກະລຸນາເລືອກປະເທດ", trigger: "change" }],
  email: [
    {
      pattern: emailPattern,
      message: "ກະລຸນາປ້ອນອີເມວໃຫ້ຖືກຕ້ອງ",
      trigger: "blur",
    },
  ],
  phone_number: [
    {
      pattern: phonePattern,
      message: "ກະລຸນາປ້ອນເບີໂທໃຫ້ຖືກຕ້ອງ",
      trigger: "blur",
    },
  ],
} as Record<string, ValidationRule[]>;

export const validateTranslations = (
  translates: Record<string, any>,
  requiredFields: string[] = ["name"]
): string[] => {
  const errors: string[] = [];

  Object.entries(translates).forEach(([lang, data]) => {
    requiredFields.forEach((field) => {
      if (!data[field]) {
        errors.push(`ກະລຸນາປ້ອນ ${field} ສຳລັບພາສາ ${lang}`);
      }
    });
  });

  return errors;
};
