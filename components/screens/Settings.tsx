"use client";
import { ask } from "@/lib/confirm";
import Link from "next/link";
import StylePicker from "../StylePicker";
import { useApp } from "@/lib/store";
import { toast } from "@/lib/toast";
import { ACCENTS } from "@/lib/data/curriculum";
import { DEF, level, makeIcs } from "@/lib/logic";
import { hasSupabase } from "@/lib/supabase";
import { ExamChecks, GradePicker, MinutesPicker, ProfileInput, SubjectChecks } from "../ProfilePickers";

async function downloadIcs() {
  const txt = makeIcs(useApp.getState().S);
  if (!txt) { toast("Đặt ngày thi hoặc chọn ngày học trước"); return; }
  const file = new File([txt], "lich-on-thi.ics", { type: "text/calendar" });
  // Trên điện thoại / app: mở bảng chia sẻ để thêm vào Lịch
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.canShare && nav.canShare({ files: [file] }) && matchMedia("(pointer: coarse)").matches) {
    try { await navigator.share({ files: [file], title: "Lịch ôn thi" }); return; } catch (e) { if ((e as Error).name === "AbortError") return; }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement("a"); a.href = url; a.download = "lich-on-thi.ics"; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export default function Settings() {
  const S = useApp((s) => s.S);
  const syncNote = useApp((s) => s.syncNote);
  const user = useApp((s) => s.user);
  const update = useApp((s) => s.update);
  const setUI = useApp((s) => s.setUI);
  const p = S.profile, lv = level(S), dn = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  return (
    <div className="flex flex-col">
      <div>
        <h2>Lớp</h2><div className="panel"><GradePicker /></div>
        <h2>Kỳ thi</h2><div className="panel !pt-1"><ExamChecks /></div>
        <h2>Môn học</h2><div className="panel"><SubjectChecks /></div>
      </div>
      <div>
        <h2>Mục tiêu và thời gian</h2>
        <div className="panel">
          <label className="flabel !mt-0" htmlFor="sT">Điểm mục tiêu mỗi môn (thang 10)</label>
          <ProfileInput k="target" id="sT" type="number" min={1} max={10} step={0.25} inputMode="decimal" />
          <label className="flabel">Thời gian học mỗi ngày</label><MinutesPicker />
        </div>
        <h2>Ngày thi và lịch học</h2>
        <div className="panel">
          <label className="flabel !mt-0" htmlFor="sN">Kỳ thi gần nhất</label><ProfileInput k="examName" id="sN" />
          <label className="flabel" htmlFor="sD">Ngày thi</label><ProfileInput k="examDate" id="sD" type="date" />
          <label className="flabel">Ngày học trong tuần</label>
          <div className="seg">
            {[1, 2, 3, 4, 5, 6, 0].map((d) => (
              <button key={d} aria-pressed={p.days.includes(d)} onClick={() => update((S) => { const a = S.profile.days, i = a.indexOf(d); if (i >= 0) a.splice(i, 1); else a.push(d); })}>{dn[d]}</button>
            ))}
          </div>
          {/* Giờ học + thêm vào lịch: chỉ dùng trên điện thoại, ẩn ở bản web máy tính */}
          <div className="md:hidden">
            <label className="flabel" htmlFor="sH">Giờ học</label><ProfileInput k="time" id="sH" type="time" />
            <button className="btn mt-3.5 w-full" onClick={downloadIcs}>Thêm vào lịch điện thoại</button>
            <p className="small muted !mb-0 mt-2">Tải tệp lịch (.ics) gồm ngày thi (nhắc trước 1 ngày) và các buổi học hằng tuần (nhắc trước 10 phút). Mở tệp để thêm vào Google Calendar hoặc Lịch iPhone.</p>
          </div>
        </div>
        <h2>Giao diện</h2>
        <div className="panel">
          <label className="flabel !mt-0">Phong cách chữ</label>
          <StylePicker />
          <div className="h-3" />
          <label className="flabel">Chế độ</label>
          <div className="seg">
            {([["auto", "Theo máy"], ["light", "Sáng: trang vở"], ["dark", "Tối: bảng đen"]] as const).map(([k, l]) => (
              <button key={k} aria-pressed={S.theme.mode === k} onClick={() => update((S) => { S.theme.mode = k; })}>{l}</button>
            ))}
          </div>
          <label className="flabel">Màu chủ đạo</label>
          <div className="flex flex-wrap gap-2.5">
            {ACCENTS.map(([k, n, c, need]) => {
              const locked = !!need && lv < need;
              return (
                <button key={k} className="swatch" aria-pressed={S.theme.accent === k} style={{ background: c, opacity: locked ? 0.35 : 1 }}
                  aria-label={n + (locked ? ", mở khóa ở cấp " + need : "")} title={n + (locked ? " (mở khóa ở cấp " + need + ")" : "")}
                  onClick={() => { if (locked) { toast("Đạt cấp " + need + " để mở khóa màu " + n); return; } update((S) => { S.theme.accent = k; }); }} />
              );
            })}
          </div>
          <p className="small muted !mb-0 mt-2">Màu Vàng nắng mở khóa khi đạt cấp 5.</p>
        </div>
        <h2>Tài khoản và dữ liệu</h2>
        <div className="panel">
          <p className="small">{syncNote}.{user?.email ? ` Tài khoản: ${user.email}.` : ""}</p>
          <div className="flex flex-wrap gap-2.5">
            {hasSupabase && <Link href="/dang-nhap" className="btn btn-ghost">{user ? "Quản lý tài khoản" : "Đăng nhập để đồng bộ"}</Link>}
            <button className="btn btn-line" onClick={() => {
              // Mở lại các câu hỏi bắt đầu (lớp, kỳ thi, môn, mục tiêu); tiến độ học vẫn giữ nguyên
              update((S) => { S.onboarded = false; });
              setUI({ ob: 0 });
              window.scrollTo(0, 0);
            }}>Làm lại các câu hỏi bắt đầu</button>
            <button className="btn btn-line" onClick={async () => {
              if (!(await ask({ title: "Xóa toàn bộ tiến độ?", msg: "Xóa toàn bộ tiến độ, lựa chọn, sổ lỗi sai và đề AI? Không thể hoàn tác.", ok: "Xóa hết", danger: true, icon: "warn" }))) return;
              update((S) => { const th = S.theme; Object.assign(S, DEF()); S.theme = th; });
              setUI({ ob: 0, ef: null });
            }}>Xóa toàn bộ tiến độ</button>
          </div>
          <p className="small muted !mb-0 mt-3">Phiên bản: {(process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || "local").slice(0, 7)} · luyện chủ đề 12 câu</p>
        </div>
      </div>
    </div>
  );
}
