import type { Locale } from "./i18n-config";

const dictionaries = {
  en: () => import("./en").then((module) => module.en),
  vi: () => import("./vi").then((module) => module.vi),
};

export const getDictionary = async (locale: Locale) =>
  dictionaries[locale]?.() ?? dictionaries.en();
