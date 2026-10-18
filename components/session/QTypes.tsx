"use client";
/* Ô trả lời cho câu Đúng/Sai và trả lời ngắn (đề cấu trúc mới từ 2025) */
import { MathText } from "@/components/MathText";
import type { Pick, PlayQ } from "@/lib/types";
import { shortOk } from "@/lib/grading";

export function TFInput({ q, value, onChange, reveal, dark }: { q: PlayQ; value: Pick; onChange: (v: Pick) => void; reveal?: boolean; dark?: boolean }) {
  const v = Array.isArray(value) ? value : (q.st || []).map(() => null);
  const set = (i: number, b: boolean) => { const nv = [...v]; nv[i] = b; onChange(nv); };
  return (
    <div className="mb-2.5 overflow-hidden rounded-[14px] border-[1.5px] border-line" role="group" aria-label="Chọn Đúng hoặc Sai cho từng ý">
      {(q.st || []).map((s, i) => {
        const ok = reveal ? v[i] === s.a : null;
        return (
          <div key={i} className={`flex items-start gap-3 border-t border-line px-3.5 py-3 first:border-t-0 ${reveal ? (ok ? "bg-good-soft" : "bg-bad-soft") : dark ? "" : "bg-surface"}`}>
            <span className="mt-0.5 w-5 flex-none font-extrabold text-accent">{"abcd"[i]})</span>
            <div className="min-w-0 flex-1 break-words leading-relaxed"><MathText text={s.t} />
              {reveal && <div className={`small mt-1 font-bold ${ok ? "text-good" : "text-bad"}`}>{ok ? "✓ " : "✗ "}Đáp án: {s.a ? "Đúng" : "Sai"}</div>}
            </div>
            <div className="flex flex-none gap-1.5">
              {([true, false] as const).map((b) => (
                <button key={String(b)} type="button" disabled={reveal} aria-pressed={v[i] === b} onClick={() => set(i, b)}
                  className={`h-10 min-w-12 rounded-lg border-[1.5px] px-2 text-sm font-bold ${v[i] === b ? "border-accent bg-accent text-on-accent" : "border-line bg-transparent"}`}>
                  {b ? "Đúng" : "Sai"}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ShortInput({ q, value, onChange, reveal, onEnter }: { q: PlayQ; value: Pick; onChange: (v: Pick) => void; reveal?: boolean; onEnter?: () => void }) {
  const v = typeof value === "string" ? value : "";
  const ok = reveal ? shortOk(q, v) : null;
  return (
    <div className="mb-2.5">
      <label className="flabel !mt-0" htmlFor={"short-" + q.id}>Đáp số của bạn</label>
      <input id={"short-" + q.id} className={`field max-w-xs text-lg font-bold tabular-nums ${reveal ? (ok ? "!border-good" : "!border-bad") : ""}`}
        inputMode="decimal" autoComplete="off" placeholder="Ví dụ: 2,5 hoặc -12" maxLength={8} readOnly={reveal} value={v}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9,.\-]/g, ""))} onKeyDown={(e) => { if (e.key === "Enter") onEnter?.(); }} />
      <p className="small muted !mb-0 mt-1.5">Chỉ ghi số (tối đa 4 kí tự, dùng dấu phẩy cho số thập phân), giống phiếu trả lời.</p>
      {reveal && <p className={`!mb-0 mt-1.5 font-bold ${ok ? "text-good" : "text-bad"}`}>{ok ? "✓ Chính xác" : "✗ Đáp án đúng: " + q.sa}</p>}
    </div>
  );
}
