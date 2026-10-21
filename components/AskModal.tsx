"use client";
/* Hộp xác nhận nổi giữa màn hình (thay confirm() của trình duyệt) */
import { useEffect, useRef } from "react";
import { answerAsk, useAsk } from "@/lib/confirm";
import { Coin } from "./Icon";

export default function AskModal() {
  const cur = useAsk((s) => s.cur);
  const okRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!cur) return;
    okRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") answerAsk(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cur]);
  if (!cur) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 p-4" onClick={() => answerAsk(false)}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="ask-t" aria-describedby="ask-m"
        className="panel pop !mb-0 w-full max-w-[400px] text-center" onClick={(e) => e.stopPropagation()}>
        {cur.icon === "coin" && <div className="mb-1 flex justify-center"><Coin size={40} /></div>}
        {cur.icon === "warn" && <div className="mb-1 text-[34px] leading-none" aria-hidden>⚠️</div>}
        <h3 id="ask-t" className="!mt-0 !mb-1.5">{cur.title || "Xác nhận"}</h3>
        <p id="ask-m" className="!mb-4 whitespace-pre-line">{cur.msg}</p>
        <div className="flex gap-2">
          <button className="btn btn-line flex-1" onClick={() => answerAsk(false)}>{cur.cancel || "Hủy"}</button>
          <button ref={okRef} className={`btn flex-1 ${cur.danger ? "!bg-bad !text-white" : ""}`} onClick={() => answerAsk(true)}>{cur.ok || "Đồng ý"}</button>
        </div>
      </div>
    </div>
  );
}
