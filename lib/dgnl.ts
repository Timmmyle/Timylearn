"use client";
/* Đề luyện thi đánh giá năng lực (V-ACT, HSA, TSA, SPT) – file tĩnh public/de-dgnl.
   Tạo lại bằng: node scripts/data/dgnl-build.mjs */
import { create } from "zustand";
import type { Question } from "./types";
import { remember } from "./remote";
import { startSession } from "./store";
import { toast } from "./toast";

export type DgnlSet = {
  id: string; exam: string; kind: "mock" | "part"; title: string; count: number; minutes?: number; scale?: number;
  parts?: string; part?: string; n?: number;
};
export const useDgnl = create<{ sets: DgnlSet[]; status: "idle" | "loading" | "ready" | "error" }>(() => ({ sets: [], status: "idle" }));

export async function initDgnl() {
  const st = useDgnl.getState().status; if (st === "loading" || st === "ready") return;
  useDgnl.setState({ status: "loading" });
  try { const sets = (await (await fetch("/de-dgnl/index.json")).json()) as DgnlSet[]; useDgnl.setState({ sets, status: "ready" }); }
  catch { useDgnl.setState({ status: "error" }); }
}
const cache: Record<string, Promise<Question[]>> = {};
const file = (id: string) => (cache[id] ||= fetch(`/de-dgnl/${id}.json`).then((r) => r.json()).then((d) => d.questions as Question[]).catch((e) => { delete cache[id]; throw e; }));

const shuffle = <T,>(a: T[]) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/** Thi thử đủ cấu trúc, có giờ, giữ thứ tự phần thi */
export async function startDgnlMock(x: DgnlSet) {
  try {
    const qs = await file(x.id); remember(qs);
    startSession("exam", qs.map((q) => q.id), x.title, { durationMin: x.minutes || Math.ceil(qs.length * 1.2), keepOrder: true, scale: x.scale });
  } catch { toast("Chưa tải được đề. Kiểm tra kết nối mạng rồi thử lại."); }
}
/** Luyện một phần: bốc ngẫu nhiên khoảng n câu, câu chung một đoạn dữ kiện thì đi cùng nhau */
export async function startDgnlPart(x: DgnlSet, n = 15) {
  try {
    const qs = await file(x.id); remember(qs);
    const groups = new Map<string, Question[]>();
    qs.forEach((q, i) => { const k = q.ctx ? "c:" + q.ctx.slice(0, 80) : "q:" + i; (groups.get(k) || groups.set(k, []).get(k)!).push(q); });
    const pick: Question[] = [];
    for (const g of shuffle([...groups.values()])) { if (pick.length >= n) break; if (pick.length + g.length > n + 3 && pick.length >= n - 3) continue; pick.push(...g); }
    startSession("practice", pick.map((q) => q.id), x.title, { keepOrder: true });
  } catch { toast("Chưa tải được bộ câu. Kiểm tra kết nối mạng rồi thử lại."); }
}
