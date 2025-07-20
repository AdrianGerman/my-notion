import { Page } from "@/types/page";

const STORAGE_KEY = "notion-mini-pages";

export function getPages(): Page[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function savePages(pages: Page[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
}