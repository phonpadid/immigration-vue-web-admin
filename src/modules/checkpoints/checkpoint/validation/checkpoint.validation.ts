import type { CheckpointForm } from "@/types/checkpoint.type";

export const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const phonePattern = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;

export const validationRules = {
  category_id: [
    { required: true, message: "ກະລຸນາເລືອກປະເພດດ່ານ", trigger: "change" },
  ],
  province_id: [
    { required: true, message: "ກະລຸນາເລືອກແຂວງ", trigger: "change" },
  ],
  country: [
    { required: true, message: "ກະລຸນາເລືອກປະເທດ", trigger: "change" },
  ],
  email: [
    { 
      pattern: emailPattern,
      message: "ກະລຸນາປ້ອນອີເມວໃ຃ຫ້ຖືກຕ້ອງ", 
      trigger: "blur" 
    },
  ],
  phone_number: [
    {
      pattern: phonePattern,
      message: "ກະລຸນາປ້ອນເບີໂທໃຫ້ຖືກຕ້ອງ",
      trigger: "blur",
    },
  ],
  "translates.lo.name": [
    { required: true, message: "ກະລຸນາປ້ອນຊື່ດ່ານ (ພາສາລາວ)", trigger: "blur" },
  ],
  "translates.en.name": [
    { required: true, message: "ກະລຸນາປ້ອນຊື່ດ່ານ (ພາສາອັງກິດ)", trigger: "blur" },
  ],
  "translates.zh_cn.name": [
    { required: true, message: "ກະລຸນາປ້ອນຊື່ດ່ານ (ພາສາຈີນ)", trigger: "blur" },
  ],
};

export const validateCheckpointForm = (form: CheckpointForm): string[] => {
  const errors: string[] = [];

  // Validate basic fields
  if (!form.category_id) {
    errors.push("ກະລຸນາເລືອກປະເພດດ່ານ");
  }
  if (!form.province_id) {
    errors.push("ກະລຸນາເລືອກແຂວງ");
  }
  if (!form.country) {
    errors.push("ກະລຸນາເລືອກປະເທດ");
  }

  // Validate translations
  Object.entries(form.translates).forEach(([lang, translate]) => {
    if (!translate.name) {
      errors.push(`ກະລຸນາປ້ອນຊື່ດ່ານ (${lang})`);
    }
  });

  // Validate email if provided
  if (form.email && !emailPattern.test(form.email)) {
    errors.push("ກະລຸນາປ້ອນອີເມວໃຫ້ຖືກຕ້ອງ");
  }

  // Validate phone if provided
  if (form.phone_number && !phonePattern.test(form.phone_number)) {
    errors.push("ກະລຸນາປ້ອນເບີໂທໃຫ້ຖືກຕ້ອງ");
  }

  return errors;
};