export const buildFormData = (form: Record<string, any>) => {
  const formData = new FormData();
  Object.keys(form).forEach((key) => {
    if (form[key] !== undefined && form[key] !== null) {
      if (Array.isArray(form[key])) {
        formData.append(key, form[key].join(",")); // แปลง array เป็น string
      } else {
        formData.append(key, form[key]);
      }
    }
  });
  return formData;
};
