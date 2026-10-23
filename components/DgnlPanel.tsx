"use client";
/* Mục đề luyện thi đánh giá năng lực trong Thử Thách */
import { useEffect, useState } from "react";
import { initDgnl, startDgnlMock, startDgnlPart, useDgnl, type DgnlSet } from "@/lib/dgnl";
import { EXB } from "@/lib/data/curriculum";

const NOTE: Record<string, string> = {
  vact: "120 câu trắc nghiệm, 150 phút, thang 1200. Gồm Tiếng Việt, Tiếng Anh, Toán học, Tư duy khoa học.",
  hsa: "150 câu, 195 phút, thang 150. Gồm Toán học và xử lý số liệu, Văn học – Ngôn ngữ, Khoa học.",
  tsa: "100 câu, 150 phút, thang 100. Gồm Tư duy Toán học, Tư duy Đọc hiểu, Tư duy Khoa học.",
  spt: "Thi theo từng môn, cấu trúc gần với đề tốt nghiệp mới, độ phân hóa cao hơn.",
};

export default function DgnlPanel({ exam }: { exam: string }) {
  const { sets, status } = useDgnl();
  const [busy, setBusy] = useState<string | null>(null);
  useEffect(() => { initDgnl(); }, []);
  const list = sets.filter((x) => x.exam === exam);
  const mocks = list.filter((x) => x.kind === "mock"), parts = list.filter((x) => x.kind === "part");
  const run = async (x: DgnlSet, f: (x: DgnlSet) => Promise<void>) => { setBusy(x.id); await f(x); setBusy(null); };
  const name = EXB[exam]?.n || exam;

  return (
    <>
      <h2>Luyện thi {name}</h2>
      <p className="small muted !mt-[-4px]">{NOTE[exam]} Đề soạn mới theo cấu trúc từ năm 2025, không phải đề thật của kỳ thi; điểm quy đổi chỉ để tham khảo.</p>
      {status !== "ready" && <div className="panel"><p className="!m-0">{status === "error" ? "Chưa tải được danh sách đề. Kiểm tra mạng rồi mở lại trang." : "Đang tải đề…"}</p></div>}
      {mocks.length > 0 && <>
        <h3 className="!mt-2">Đề thi thử đủ cấu trúc</h3>
        <div className="grid gap-x-3 lg:grid-cols-2">
          {mocks.map((x) => (
            <div className="panel flex flex-col" key={x.id}>
              <h3>{x.title}</h3>
              <p className="small muted !mb-1 flex-1">{x.count} câu · {x.minutes} phút{x.scale ? ` · thang ${x.scale}` : ""}</p>
              {x.parts && <p className="read !m-0 text-[13px] leading-snug opacity-75">{x.parts}</p>}
              <button className="btn mt-2.5 w-full" disabled={busy === x.id} onClick={() => run(x, startDgnlMock)}>{busy === x.id ? "Đang tải đề…" : "Làm bài thi thử"}</button>
            </div>
          ))}
        </div>
      </>}
      {parts.length > 0 && <>
        <h3 className="!mt-2">Luyện từng phần</h3>
        <p className="small muted !mt-[-4px]">Mỗi lượt khoảng 15 câu chọn ngẫu nhiên, câu cùng một đoạn dữ kiện đi cùng nhau, có giải thích ngay sau mỗi câu.</p>
        <div className="grid gap-x-3 sm:grid-cols-2 lg:grid-cols-3">
          {parts.map((x) => (
            <div className="panel flex flex-col" key={x.id}>
              <h3>{x.title.replace(/^Luyện phần /, "")}</h3>
              <p className="small muted !mb-2 flex-1">Kho {x.count} câu{x.n ? ` · trong đề có ${x.n} câu` : ""}</p>
              <button className="btn btn-ghost w-full" disabled={busy === x.id} onClick={() => run(x, (y) => startDgnlPart(y))}>{busy === x.id ? "Đang tải…" : "Luyện 15 câu"}</button>
            </div>
          ))}
        </div>
      </>}
    </>
  );
}
