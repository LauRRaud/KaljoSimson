export const DEFAULT_LOCALE = "et";

export function cloneContent(value) {
  return JSON.parse(JSON.stringify(value));
}

export function getCopy(value, locale = DEFAULT_LOCALE) {
  if (typeof value === "string") {
    return value;
  }

  if (!value || typeof value !== "object") {
    return "";
  }

  return value[locale] || value.et || value.en || "";
}
