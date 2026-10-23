"use client";
/* Đoạn văn / bảng số liệu / mô tả thí nghiệm dùng chung cho nhóm câu (đề ĐGNL) */
import { useState } from "react";
import { MathText } from "@/components/MathText";

export default function Ctx({ text }: { text?: string }) {
  const [open, setOpen] = useState(true);
  if (!text) return null;
  return (
    <div className="panel-soft mt-2 !mb-0">
      <button type="button" className="small flex w-full items-center justify-between font-semibold" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span>Đọc đoạn sau để trả lời</span><span className="muted">{open ? "Thu gọn" : "Mở"}</span>
      </button>
      {open && <div className="read mt-2 max-h-[55vh] overflow-y-auto whitespace-pre-wrap text-[15px] leading-relaxed"><MathText text={text} /></div>}
    </div>
  );
}
