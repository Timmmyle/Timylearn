"use client";
import Link from "next/link";
import { useApp, startSession } from "@/lib/store";
import { bankSubs, diagIds, examLabel, lc, roadmap, routeTitle, syncExamName } from "@/lib/logic";
import { hasSupabase } from "@/lib/supabase";
import { ExamChecks, GradePicker, MinutesPicker, ProfileInput, SubjectChecks } from "./ProfilePickers";

export default function Onboarding() {
  const S = useApp((s) => s.S);
  const st = useApp((s) => s.ui.ob);
  const user = useApp((s) => s.user);
  const setUI = useApp((s) => s.setUI);
  const update = useApp((s) => s.update);
  const p = S.profile;

  const valid = [!!p.grade, p.exams.length > 0 && (!p.exams.includes("other") || !!p.examOther.trim()), p.subjects.length > 0 || !!p.subjectOther.trim(), true][st];
  const hint = ["Chọn lớp để tiếp tục.", p.exams.includes("other") && !p.examOther.trim() ? "Điền tên kỳ thi khác để tiếp tục." : "Chọn ít nhất một kỳ thi.", "Chọn ít nhất một môn.", ""][st];

  const go = (d: number) => {
    update((S) => {
      if (st === 3) S.profile.target = Math.min(10, Math.max(1, +S.profile.target || 8));
      if (d > 0 && st === 1) syncExamName(S);
    });
    setUI({ ob: Math.max(0, st + d) });
    window.scrollTo(0, 0);
  };
  const Nav = ({ label = "Tiếp tục" }: { label?: string }) => (
    <>
      <div className="mt-[18px] flex gap-2.5">
        {st > 0 && <button className="btn btn-line" onClick={() => go(-1)}>Quay lại</button>}
        <button className="btn flex-1" disabled={!valid} onClick={() => go(1)}>{label}</button>
      </div>
      {!valid && hint && <p className="small muted mt-2">{hint}</p>}
    </>
  );
  const Step = ({ n }: { n: number }) => <div className="text-sm font-bold text-accent">Bước {n}/4</div>;
  const H = ({ children }: { children: React.ReactNode }) => <h2 className="!mt-1.5 !text-[28px]">{children}</h2>;

  return (
    <div className="pt-safe">
      <div className="pt-5 md:pt-12">
        {st === 0 && (
          <>
            <Step n={1} /><H>Bạn đang học lớp mấy?</H>
            <p className="muted">App dùng lớp của bạn để chỉ đưa ra kiến thức bạn đã và đang học.</p>
            <GradePicker /><Nav />
            {hasSupabase && !user && (
              <p className="small muted mt-6">Đã có tài khoản? <Link href="/dang-nhap" className="font-semibold text-accent underline">Đăng nhập</Link> để lấy lại tiến độ.</p>
            )}
          </>
        )}
        {st === 1 && (<><Step n={2} /><H>Bạn sắp thi gì?</H><p className="muted">Chọn một hoặc nhiều kỳ thi. Kỳ kiểm tra ở trường được ưu tiên trước trong lộ trình.</p><ExamChecks /><Nav /></>)}
        {st === 2 && (<><Step n={3} /><H>Bạn muốn ôn môn nào?</H><SubjectChecks /><Nav /></>)}
        {st === 3 && (
          <>
            <Step n={4} /><H>Thời gian và mục tiêu</H>
            <label className="flabel">Mỗi ngày bạn học được bao lâu?</label><MinutesPicker />
            <label className="flabel" htmlFor="obT">Điểm mục tiêu mỗi môn (thang 10)</label>
            <ProfileInput k="target" id="obT" type="number" min={1} max={10} step={0.25} inputMode="decimal" />
            <label className="flabel" htmlFor="obN">Kỳ thi gần nhất</label><ProfileInput k="examName" id="obN" />
            <label className="flabel" htmlFor="obD">Ngày thi</label><ProfileInput k="examDate" id="obD" type="date" />
            <p className="small muted mt-1.5">Xem ngày thi trên lịch của trường hoặc thông báo chính thức. Có thể để trống và điền sau.</p>
            <Nav label="Xem lộ trình" />
          </>
        )}
        {st >= 4 && <RoutePreview />}
      </div>
    </div>
  );

  function RoutePreview() {
    const r = roadmap(S);
    return (
      <>
        <h2>Lộ trình của bạn</h2>
        <p>{routeTitle(S)}, {r.length} chủ đề{bankSubs(S).length ? " thuộc các môn " + bankSubs(S).join(", ") : ""}.</p>
        {r.length ? (
          <>
            <div className="panel">
              {r.slice(0, 6).map((t, i) => (
                <div className="mission" key={t.k}>
                  <span className="num">{i + 1}</span>
                  <span className="flex-1"><b>{t.t}</b><br />
                    <span className="small muted">{t.s}, {t.g ? `lớp ${t.g}, học kì ${t.hk}` : "dùng cho mọi lớp"}, cho kỳ {lc(examLabel(S, t.ex))}</span>
                  </span>
                </div>
              ))}
              {r.length > 6 && <p className="small muted !mb-0 mt-2">và {r.length - 6} chủ đề nữa</p>}
            </div>
            <p className="small muted">Thứ tự chương theo bộ sách Kết nối tri thức. Nếu trường bạn dùng bộ sách khác, đổi phạm vi trong mục Học.</p>
            <button className="btn w-full" onClick={() => startSession("diag", diagIds(S), "Kiểm tra đầu vào")}>Làm bài kiểm tra đầu vào</button>
            <div className="h-2.5" />
          </>
        ) : (
          <div className="panel"><p className="!m-0">Các môn bạn chọn chưa có kho câu hỏi mẫu. Bạn vẫn luyện được bằng đề AI trong mục Đề thi.</p></div>
        )}
        <button className="btn btn-line w-full" onClick={() => update((S) => { S.onboarded = true; })}>{r.length ? "Bỏ qua, vào app" : "Vào app"}</button>
      </>
    );
  }
}
