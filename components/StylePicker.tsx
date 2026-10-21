"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { MathText } from "./MathText";

type Font = "pro" | "comic";
const OPTS: { k: Font; name: string; desc: string; family: string; read: string }[] = [
  { k: "pro", name: "Chuyên nghiệp", desc: "Chữ Google Sans gọn gàng, dễ đọc lâu. Hợp khi ôn thi nghiêm túc.", family: '"Google Sans", system-ui, sans-serif', read: '"Google Sans", system-ui, sans-serif' },
  { k: "comic", name: "Truyện tranh", desc: "Chữ viết tay vui nhộn như vẽ phấn trên bảng. Đề bài vẫn dùng chữ in cho rõ.", family: '"Patrick Hand", system-ui, sans-serif', read: '"Be Vietnam Pro", system-ui, sans-serif' },
];

/** Bản xem trước: cùng một đoạn giao diện hiển thị bằng từng phong cách chữ */
function Preview({ o }: { o: (typeof OPTS)[number] }) {
  const pro = o.k === "pro";
  return (
    <div className="rounded-[12px] border-[1.5px] border-line bg-paper p-3 text-left" style={{ fontFamily: o.family }} aria-hidden="true">
      <div className="flex items-center gap-2">
        <span style={{ fontSize: pro ? 20 : 24, fontWeight: pro ? 600 : 400 }}>Đại Sảnh</span>
        <span className="ml-auto rounded-full border-[1.5px] border-chalk px-2 text-[14px]">Lv. 5</span>
      </div>
      <div className="mt-1 text-accent" style={{ fontSize: pro ? 30 : 36, lineHeight: 1 }}>7 <span style={{ fontSize: pro ? 18 : 22 }}>ngày</span></div>
      <div className="text-[14px] opacity-75">còn đến Giữa học kì 1</div>
      <div className="mt-2 rounded-[10px] border-[1.5px] border-line bg-surface p-2" style={{ fontFamily: o.read, fontSize: 14, lineHeight: 1.5 }}>
        Câu 3. Tìm nghiệm của phương trình <MathText text="$2\sin x - 1 = 0$" /> trên <MathText text="$[0;\pi]$" />.
      </div>
      <div className="mt-2 inline-block rounded-[10px] border-2 border-chalk bg-p-yellow px-3 py-1 text-on-pastel" style={{ fontWeight: pro ? 600 : 400, fontSize: pro ? 15 : 17 }}>Vào trận!</div>
    </div>
  );
}

/** Chọn phong cách chữ. `gate` = màn hình hỏi lần đầu vào app. */
export default function StylePicker({ gate }: { gate?: boolean }) {
  const saved = useApp((s) => s.S.theme.font);
  const update = useApp((s) => s.update);
  const [sel, setSel] = useState<Font | undefined>(saved);
  const cur = gate ? sel : saved;
  const save = (k: Font) => update((S) => { S.theme.font = k; });
  const pick = (k: Font) => {
    document.documentElement.dataset.font = k; // xem trước ngay trên cả trang
    if (gate) setSel(k); else save(k);
  };
  return (
    <div className={gate ? "mx-auto max-w-3xl px-4 pt-safe pb-10" : ""}>
      {gate && (
        <div className="pt-8 md:pt-14">
          <h1 className="!m-0 text-[30px] leading-tight">Chào mừng đến Chinh Phục!</h1>
          <p className="muted mt-2">Chọn phong cách chữ bạn thích. Xem trước bên dưới chữ sẽ trông thế nào; đổi lại lúc nào cũng được trong Thiết Lập.</p>
        </div>
      )}
      <div className="mt-3 grid gap-3 md:grid-cols-2" role="radiogroup" aria-label="Phong cách chữ">
        {OPTS.map((o) => (
          <button key={o.k} role="radio" aria-checked={cur === o.k} onClick={() => pick(o.k)}
            className={`choice !mb-0 !flex-col !items-stretch !gap-2.5 ${cur === o.k ? "on" : ""}`}>
            <span className="flex items-center gap-2">
              <span className={`grid h-5 w-5 flex-none place-items-center rounded-full border-2 border-chalk`}>{cur === o.k && <span className="h-2.5 w-2.5 rounded-full bg-accent" />}</span>
              <b className="text-[20px]" style={{ fontFamily: o.family, fontWeight: o.k === "pro" ? 600 : 400 }}>{o.name}</b>
            </span>
            <small style={{ fontFamily: o.read }}>{o.desc}</small>
            <Preview o={o} />
          </button>
        ))}
      </div>
      {gate && (
        <button className="btn btn-gold mt-4 w-full text-[20px]" disabled={!sel} onClick={() => sel && save(sel)}>
          {sel ? `Bắt đầu với phong cách ${OPTS.find((o) => o.k === sel)!.name}` : "Chọn một phong cách để bắt đầu"}
        </button>
      )}
    </div>
  );
}
