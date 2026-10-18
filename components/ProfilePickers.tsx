"use client";
import { useApp } from "@/lib/store";
import { EXB, EXLIST, GRADES, SUBJECTS, SUBJECT_OPTS } from "@/lib/data/curriculum";
import { gradeNum, syncExamName } from "@/lib/logic";
import type { Exam } from "@/lib/types";

export function GradePicker() {
  const grade = useApp((s) => s.S.profile.grade);
  const update = useApp((s) => s.update);
  const setUI = useApp((s) => s.setUI);
  return (
    <div className="seg">
      {GRADES.map(([k, l]) => (
        <button key={k} aria-pressed={grade === k}
          onClick={() => { update((S) => { S.profile.grade = k; syncExamName(S); }); setUI((u) => { u.ef = null; u.ai.grade = null; }); }}>
          {l}
        </button>
      ))}
    </div>
  );
}

export function ExamChecks() {
  const S = useApp((s) => s.S);
  const update = useApp((s) => s.update);
  const setUI = useApp((s) => s.setUI);
  const p = S.profile, g = gradeNum(S);
  const toggle = (id: string, on: boolean) => {
    update((S) => {
      const arr = S.profile.exams, i = arr.indexOf(id);
      if (on && i < 0) arr.push(id); else if (!on && i >= 0) arr.splice(i, 1);
      arr.sort((a, b) => EXLIST.findIndex((x) => x.id === a) - EXLIST.findIndex((x) => x.id === b));
      syncExamName(S);
    });
    setUI({ ef: null });
  };
  const group = (title: string, list: Exam[]) => (
    <div key={title}>
      <p className="small muted" style={{ margin: "14px 0 6px", fontWeight: 600 }}>{title}</p>
      {list.map((e) => {
        const on = p.exams.includes(e.id);
        let sub = e.d;
        if (e.school) sub += `, lớp ${g}`;
        if (e.id === "thpt" && g < 12) sub = `Ôn sớm, chỉ dùng kiến thức lớp 10${g > 10 ? "–" + g : ""} bạn đã học`;
        if (e.dgnl && g < 12) sub += `, phạm vi kiến thức đến lớp ${g}`;
        return (
          <div key={e.id}>
            <label className={`choice ${on ? "on" : ""}`}>
              <input type="checkbox" checked={on} onChange={(ev) => toggle(e.id, ev.target.checked)} />
              <span className="flex-1"><b>{e.n}</b><small>{sub}</small></span>
            </label>
            {e.id === "other" && on && (
              <input className="field" style={{ margin: "-2px 0 10px" }} autoFocus placeholder="Ví dụ: Thi học sinh giỏi Hóa cấp trường"
                value={p.examOther} aria-label="Tên kỳ thi khác"
                onChange={(ev) => update((S) => { S.profile.examOther = ev.target.value; syncExamName(S); })} />
            )}
          </div>
        );
      })}
    </div>
  );
  return (
    <>
      {group("Kiểm tra ở trường", EXLIST.filter((e) => e.school))}
      {group("Thi tốt nghiệp và xét tuyển", EXLIST.filter((e) => !e.school && e.id !== "other"))}
      {group("Kỳ thi khác", [EXB.other])}
    </>
  );
}

export function SubjectChecks() {
  const p = useApp((s) => s.S.profile);
  const update = useApp((s) => s.update);
  return (
    <>
      {SUBJECT_OPTS.map((s) => {
        const on = p.subjects.includes(s), inBank = SUBJECTS.includes(s);
        const desc = s === "Ngữ văn" ? "Thực hành tiếng Việt, luyện trình bày đọc hiểu, đề mẫu" : s === "Tiếng Anh" ? "Ngữ pháp, phát âm, từ vựng, đọc hiểu, đề mẫu" : inBank ? "Có lý thuyết, luyện tập, đấu và đề mẫu" : "Luyện bằng đề AI";
        return (
          <label key={s} className={`choice ${on ? "on" : ""}`}>
            <input type="checkbox" checked={on}
              onChange={(ev) => update((S) => { const a = S.profile.subjects, i = a.indexOf(s); if (ev.target.checked && i < 0) a.push(s); else if (!ev.target.checked && i >= 0) a.splice(i, 1); })} />
            <span className="flex-1"><b>{s}</b><small>{desc}</small></span>
          </label>
        );
      })}
      <label className="flabel" htmlFor="subO">Môn khác (không bắt buộc)</label>
      <input className="field" id="subO" placeholder="Ví dụ: Công nghệ, Giáo dục quốc phòng" value={p.subjectOther}
        onChange={(ev) => update((S) => { S.profile.subjectOther = ev.target.value; })} />
    </>
  );
}

export function MinutesPicker() {
  const minutes = useApp((s) => s.S.profile.minutes);
  const update = useApp((s) => s.update);
  return (
    <div className="seg">
      {[15, 30, 45, 60].map((m) => (
        <button key={m} aria-pressed={minutes === m} onClick={() => update((S) => { S.profile.minutes = m; })}>{m} phút</button>
      ))}
    </div>
  );
}

/** Ô nhập gắn với một trường trong profile */
export function ProfileInput({ k, id, type = "text", ...rest }: { k: "target" | "examName" | "examDate" | "time"; id: string; type?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const v = useApp((s) => s.S.profile[k]);
  const update = useApp((s) => s.update);
  return (
    <input className="field" id={id} type={type} value={v as string | number} {...rest}
      onChange={(ev) => update((S) => {
        const val = ev.target.value;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (S.profile as any)[k] = type === "number" ? (val === "" ? "" : +val) : val;
        if (k === "examName") S.profile.nameAuto = false;
      })} />
  );
}
