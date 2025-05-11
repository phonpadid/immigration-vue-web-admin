import type { MiddlewareContext } from "@/lib/middlewares/index";
import { useAuthStore } from "../stores/auth.store";

export default function permission(requiredPermissions: string | string[]) {
  return (context: MiddlewareContext) => {
    // ตรวจสอบว่ามี token หรือไม่
    if (!localStorage.getItem("access_token")) {
      return context.router.push({ name: "login" }).catch(() => {});
    }

    // รับข้อมูลสิทธิ์จาก store
    const authStore = useAuthStore();

    // ตรวจสอบว่าเป็น dev หรือ admin หรือไม่
    if (authStore.isDevOrAdmin) {
      // ถ้าเป็น dev หรือ admin ให้ผ่านทันที
      return context.next;
    }

    // แปลง requiredPermissions เป็น array ถ้าเป็น string
    const permissionsToCheck = Array.isArray(requiredPermissions)
      ? requiredPermissions
      : [requiredPermissions];

    // ตรวจสอบว่ามีสิทธิ์ที่ต้องการอย่างน้อยหนึ่งสิทธิ์หรือไม่
    const hasPermission = authStore.hasAnyPermission(permissionsToCheck);

    // ถ้าไม่มีสิทธิ์ ให้ redirect ไปหน้า unauthorized
    if (!hasPermission) {
      return context.router.push({ name: "unauthorized" }).catch(() => {});
    }

    return context.next;
  };
}
