"use client";
import { create } from "zustand";
import { produce } from "immer";
import type { AppState, Session, QuizSession, SessionKind } from "./types";
import { DEF, migrate, STORAGE_KEY, getQ, shuffle, prep, record, bump, touchStreak, today } from "./logic";
import { BOTS } from "./data/curriculum";
import { supabase } from "./supabase";
import { isCorrect } from "./grading";
import { toast } from "./toast";
import { examScore } from "./grading";
import { rewardSession } from "./game";

export type UIState = {
  ob: number; learnSub: string | null; learnScope: string;
  ef: { exam: string; grade: string; subject: string } | null;
  ai: { exam: string | null; subject: string | null; grade: number | null; level: number; n: number; busy: boolean; err: string; mode: "exam" | "doc"; newId: string | null };
  fightSub: string; bot: number; progRange: number; toolTab: string; ptSel: number | null; fq: string; unitCat: string; molMode: string;
  wBusy: boolean; wErr: string; examTab: "bank" | "mine" | null;
};

type Store = {
  S: AppState;
  hydrated: boolean;
  ses: Session | null;
  ui: UIState;
  user: { id: string; email?: string } | null;
  syncNote: string;
  ai: { enabled: boolean; needAuth: boolean };
  /** Sửa state học tập (tự lưu máy + đồng bộ Supabase) */
  update: (fn: (S: AppState) => void) => void;
  /** Sửa state học tập và phiên làm bài cùng lúc */
  act: (fn: (S: AppState, ses: Session | null) => Session | null | void) => void;
  setUI: (p: Partial<UIState> | ((ui: UIState) => void)) => void;
  setSes: (s: Session | null) => void;
};

const initialUI = (): UIState => ({
  ob: 0, learnSub: null, learnScope: "route", ef: null,
  ai: { exam: null, subject: null, grade: null, level: 2, n: 10, busy: false, err: "", mode: "exam", newId: null },
  fightSub: "Lộ trình", bot: 1, progRange: 7, toolTab: "cong-thuc", ptSel: null, fq: "", unitCat: "Chiều dài", molMode: "m",
  wBusy: false, wErr: "", examTab: null,
});

let saveTimer: ReturnType<typeof setTimeout> | undefined;
async function pushRemote(uid: string) {
  const cur = useApp.getState().S;
  const { error } = await supabase!.from("user_state").upsert({ user_id: uid, data: cur, updated_at: new Date(cur.updatedAt).toISOString() });
  useApp.setState({ syncNote: error ? "Đang lưu trên máy này (chưa đồng bộ được)" : "Đã đồng bộ với tài khoản của bạn" });
}
/** Đồng bộ ngay (trước khi máy chủ cần XP mới nhất: nhận thưởng cấp, mua đồ theo cấp) */
export async function syncNow() {
  const st = useApp.getState();
  if (!supabase || !st.user) return;
  clearTimeout(saveTimer);
  await pushRemote(st.user.id);
}
function persist(S: AppState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(S)); } catch {}
  const st = useApp.getState();
  if (supabase && st.user) {
    clearTimeout(saveTimer);
    const uid = st.user.id;
    saveTimer = setTimeout(() => pushRemote(uid), 1200);
  }
}

export const useApp = create<Store>((set, get) => ({
  S: DEF(),
  hydrated: false,
  ses: null,
  ui: initialUI(),
  user: null,
  syncNote: "Đang lưu trên thiết bị này",
  ai: { enabled: false, needAuth: false },
  update: (fn) => {
    const S = produce(get().S, (d) => { fn(d); d.updatedAt = Date.now(); });
    set({ S }); persist(S);
  },
  act: (fn) => {
    const prev = get();
    const out = produce({ S: prev.S, ses: prev.ses as Session | null }, (d) => {
      const r = fn(d.S, d.ses);
      if (r !== undefined) d.ses = r;
    });
    const changed = out.S !== prev.S;
    const S = changed ? produce(out.S, (d) => { d.updatedAt = Date.now(); }) : out.S;
    set({ S, ses: out.ses });
    if (changed) persist(S);
  },
  setUI: (p) => set((st) => ({ ui: typeof p === "function" ? produce(st.ui, p) : { ...st.ui, ...p } })),
  setSes: (ses) => set({ ses }),
}));

/** Đọc state từ máy khi khởi động (chỉ gọi phía client) */
export function hydrateLocal() {
  let S = DEF();
  try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) S = migrate(JSON.parse(raw)); } catch {}
  useApp.setState({ S, hydrated: true });
}

/** Ghép dữ liệu tài khoản: bản nào mới hơn thì dùng bản đó */
export async function pullRemote(uid: string) {
  if (!supabase) return;
  const { data, error } = await supabase.from("user_state").select("data, updated_at").eq("user_id", uid).maybeSingle();
  if (error) { useApp.setState({ syncNote: "Đang lưu trên máy này (chưa đồng bộ được)" }); return; }
  const local = useApp.getState().S;
  if (data?.data && (data.data.updatedAt || 0) > (local.updatedAt || 0)) {
    const S = migrate(data.data);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(S)); } catch {}
    useApp.setState({ S });
  } else if (local.onboarded) {
    persist(local);
  }
  useApp.setState({ syncNote: "Đã đồng bộ với tài khoản của bạn" });
}

/* ================= Hành động phiên làm bài ================= */
export function startSession(kind: SessionKind, qids: string[], title: string, extra: Partial<QuizSession> = {}) {
  const { S } = useApp.getState();
  const qs = qids.map((id) => getQ(S, id)).filter(Boolean) as NonNullable<ReturnType<typeof getQ>>[];
  if (!qs.length) { toast("Chưa có câu hỏi phù hợp trong phạm vi này"); return; }
  const ses: QuizSession = { kind, title, items: extra.keepOrder ? qs.map((q) => ({ ...q, opts: q.o || [], ans: q.qt && q.qt !== "mcq" ? -1 : q.a })) : shuffle(qs).map(prep), i: 0, picks: Array(qs.length).fill(null), start: Date.now(), ...extra };
  if (kind === "exam") ses.end = Date.now() + (extra.durationMin ? extra.durationMin : Math.ceil(qs.length * 1.5)) * 60000;
  if (kind === "fight") {
    ses.me = 0; ses.bot = 0; ses.botRes = []; ses.myRes = [];
    const b = BOTS[extra.botLv ?? 1];
    ses.botPlan = ses.items.map((q) => ({ ok: Math.random() < Math.max(0.2, b.acc - (q.l - 2) * 0.1), t: b.min + Math.random() * (b.max - b.min) }));
  }
  useApp.setState({ ses });
  if (typeof window !== "undefined") window.scrollTo(0, 0);
}

export function finishSession() {
  useApp.getState().act((S, ses) => {
    const s = ses as QuizSession; if (!s || s.done) return;
    s.done = true;
    if (s.kind === "exam") { s.items.forEach((q, i) => record(S, q, isCorrect(q, s.picks[i]), "exam")); bump(S, "practice"); }
    else if (s.kind === "practice" || s.kind === "diag") bump(S, "practice");
    if (s.kind === "fight") {
      const b = BOTS[s.botLv!], me = s.me!, bot = s.bot!;
      const res = me > bot ? 1 : me === bot ? 0.5 : 0, exp = 1 / (1 + Math.pow(10, (b.r - S.fight.rating) / 400));
      const delta = Math.round(32 * (res - exp)); S.fight.rating += delta; s.delta = delta; s.res = res;
      if (res === 1) { S.fight.w++; S.xp += 50; } else if (res === 0.5) S.fight.d++; else S.fight.l++;
      bump(S, "fight");
    }
    if (s.kind === "diag") S.onboarded = true;
    touchStreak(S);
  });
  // Thưởng xu (máy chủ quyết định số xu, có trần theo ngày)
  const s = useApp.getState().ses as QuizSession | null;
  if (s && s.done && s.kind !== undefined) {
    const n = s.kind === "fight" ? (s.res === 1 ? 2 : s.res === 0.5 ? 1 : 0)
      : s.kind === "exam" ? Math.round(examScore(s.items, s.picks) * 10)
      : s.items.filter((q, i) => isCorrect(q, s.picks[i])).length;
    rewardSession(s.kind, s.start, n);
  }
  if (typeof window !== "undefined") window.scrollTo(0, 0);
}

export { today };
