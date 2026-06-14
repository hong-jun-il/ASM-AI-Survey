import { Answers } from "./types";

const STORE_KEY = "ai-survey-response-v1";

interface Store {
  respondentId: string;
  answers: Answers;
  submitted: boolean;
  created: boolean;
}

export function loadStore(): Store | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as Store) : null;
  } catch {
    return null;
  }
}

export function saveStore(store: Store) {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    // ignore (e.g. storage disabled)
  }
}

export function clearStore() {
  try {
    window.localStorage.removeItem(STORE_KEY);
  } catch {
    // ignore
  }
}

export function newRespondentId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
