import dayjs from "dayjs";

export function formatDate(dateString: string): string {
  return dayjs(dateString).format("DD/MM/YYYY");
}

export function formatDateTime(dateString: string): string {
  if (!dateString) {
    return "";
  }
  return dayjs(dateString).format("DD/MM/YYYY HH:mm:ss");
}
