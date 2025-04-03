import dayjs from "dayjs";

export function formatDatePicker(dateString: string | undefined): string {
  if (!dateString) {
    return "";
  }
  return dayjs(dateString).format("DD/MM/YYYY");
}

export function formatDateTime(dateString: string | undefined): string {
  if (!dateString) {
    return "";
  }
  return dayjs(dateString).format("DD/MM/YYYY HH:mm:ss");
}
