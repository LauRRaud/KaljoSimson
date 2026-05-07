export const SUPPORTED_LOCALES = ["et", "en"];
export const DEFAULT_LOCALE = "et";

export function normalizeLocale(value) {
  return SUPPORTED_LOCALES.includes(value) ? value : DEFAULT_LOCALE;
}

export function getLocaleFromSearchParams(searchParams) {
  const value = Array.isArray(searchParams?.lang)
    ? searchParams.lang[0]
    : searchParams?.lang;

  return normalizeLocale(value);
}

export function withLocale(path, locale, hash = "") {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}lang=${normalizeLocale(locale)}${hash}`;
}
