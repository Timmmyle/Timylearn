"use client";
/* Đề ôn giữa kì / cuối kì soạn theo SGK GDPT 2018 (file tĩnh public/de-hk, không cần Supabase).
   Tạo lại bằng: node scripts/data/hk-build.mjs */
import { create } from "zustand";
import type { Question, WritePassage } from "./types";
import { remember, useRemote } from "./remote";
import { startSession } from "./store";
import { toast } from "./toast";

export type HKSet = {
  id: string; grade: number; subject: string; exam: "gk1" | "ck1" | "gk2" | "ck2"; title: string; scope: string;
  duration_min: number; count: number; kind: "quiz" | "write"; parts?: { mcq: number; tf: number; short: number }; work?: string;
};
export const useHK = create<{ sets: HKSet[]; status: "idle" | "ready" | "error" }>(() => ({ sets: [], status: "idle" }));

const url = (f: string) => `/de-hk/${f}`;
let started = false;
export async function initHK() {
  if (started) return; started = true;
  try {
    const r = await fetch(url("index.json"));
    const sets = (await r.json()) as HKSet[];
    useHK.setState({ sets, status: "ready" });
    // Bài Ngữ văn nhỏ, tải sẵn để hiện trong "Luyện trình bày"
    const ws = await Promise.all(sets.filter((x) => x.kind === "write").map((x) => fetch(url(x.id + ".json")).then((r) => r.json()).then((d) => d.passage as WritePassage).catch(() => null)));
    useRemote.setState({ localPassages: ws.filter(Boolean).map((p) => ({ ...p!, hk: true })) as WritePassage[] });
  } catch { useHK.setState({ status: "error" }); started = false; }
}

/** Mở đề ôn: trắc nghiệm → thi thử có giờ; Ngữ văn → luyện đọc hiểu + viết */
export async function startHK(x: HKSet, startWrite: (pid: string, qi: number) => void) {
  try {
    if (x.kind === "write") {
      if (!useRemote.getState().localPassages.some((p) => p.id === x.id)) {
        const d = await (await fetch(url(x.id + ".json"))).json();
        useRemote.setState((s) => ({ localPassages: [...s.localPassages, { ...d.passage, hk: true }] }));
      }
      startWrite(x.id, 0);
      return;
    }
    const d = await (await fetch(url(x.id + ".json"))).json();
    const qs = d.questions as Question[];
    remember(qs);
    startSession("exam", qs.map((q) => q.id), x.title, { durationMin: x.duration_min, keepOrder: true });
  } catch {
    toast("Chưa tải được đề. Kiểm tra kết nối mạng rồi thử lại.");
  }
}
