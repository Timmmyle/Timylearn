"use client";
/* Hộp xác nhận giữa màn hình thay cho confirm() của trình duyệt.
   Dùng: if (!(await ask({ msg: "Mua ...?" }))) return; */
import { create } from "zustand";

export type AskOpts = { title?: string; msg: string; ok?: string; cancel?: string; danger?: boolean; icon?: "coin" | "warn" | "info" };
type Store = { cur: (AskOpts & { resolve: (v: boolean) => void }) | null };
export const useAsk = create<Store>(() => ({ cur: null }));

export function ask(o: AskOpts | string): Promise<boolean> {
  const opts = typeof o === "string" ? { msg: o } : o;
  return new Promise((resolve) => {
    const prev = useAsk.getState().cur; if (prev) prev.resolve(false);
    useAsk.setState({ cur: { ...opts, resolve } });
  });
}
export function answerAsk(v: boolean) {
  const c = useAsk.getState().cur; if (!c) return;
  useAsk.setState({ cur: null }); c.resolve(v);
}
