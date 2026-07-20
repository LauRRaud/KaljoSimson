"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  clearAdminSession,
  createAdminSession,
  isAdminAuthenticated,
  setAdminPassword,
  verifyAdminPassword,
} from "@/lib/admin-auth";
import { saveSiteContent } from "@/lib/content-store";

export async function loginAction(formData) {
  const password = String(formData.get("password") || "");

  if (!(await verifyAdminPassword(password))) {
    redirect("/admin?error=password");
  }

  await createAdminSession();
  redirect("/admin");
}

export async function changePasswordAction(_previousState, formData) {
  if (!(await isAdminAuthenticated())) {
    return { ok: false, message: "Admini sessioon puudub. Logi uuesti sisse." };
  }

  const current = String(formData.get("current") || "");
  const next = String(formData.get("next") || "");
  const confirm = String(formData.get("confirm") || "");

  if (!(await verifyAdminPassword(current))) {
    return { ok: false, message: "Praegune parool on vale." };
  }

  if (next.length < 8) {
    return { ok: false, message: "Uus parool peab olema vähemalt 8 märki." };
  }

  if (next !== confirm) {
    return { ok: false, message: "Uus parool ja kinnitus ei kattu." };
  }

  await setAdminPassword(next);
  return { ok: true, message: "Parool on vahetatud." };
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin");
}

export async function saveContentAction(serializedContent) {
  if (!(await isAdminAuthenticated())) {
    return {
      ok: false,
      message: "Admini sessioon puudub. Logi uuesti sisse.",
    };
  }

  try {
    const parsed = JSON.parse(serializedContent);
    await saveSiteContent(parsed);
    revalidatePath("/", "layout");

    return {
      ok: true,
      message: "Sisu salvestati.",
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Sisu salvestamine ebaõnnestus.",
    };
  }
}
