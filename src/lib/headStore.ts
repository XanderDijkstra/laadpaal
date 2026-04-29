import type { PageMeta } from "@/hooks/usePageMeta";

let current: PageMeta | null = null;

export function resetHead() {
  current = null;
}

export function recordHead(meta: PageMeta) {
  current = { ...meta };
}

export function getRecordedHead(): PageMeta | null {
  return current;
}
