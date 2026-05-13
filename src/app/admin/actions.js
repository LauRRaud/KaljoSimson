"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  clearAdminSession,
  createAdminSession,
  getAdminPassword,
  isAdminAuthenticated,
} from "@/lib/admin-auth";
import { saveSiteContent } from "@/lib/content-store";

export async function loginAction(formData) {
  const password = String(formData.get("password") || "");

  if (password !== getAdminPassword()) {
    redirect("/admin?error=password");
  }

  await createAdminSession();
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin");
}

export async function saveContentAction(serializedContent) {
  if (!(await isAdminAuthenticated())) {
    return {
      ok: false,
      message: "Admin sessioon puudub. Logi uuesti sisse.",
    };
  }

  try {
    const parsed = JSON.parse(serializedContent);
    await saveSiteContent(parsed);
    revalidatePath("/", "layout");
    revalidatePath("/gallery");
    revalidatePath("/admin");

    return {
      ok: true,
      message: "Sisu salvestati edukalt.",
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Sisu salvestamine ebaõnnestus.",
    };
  }
}
