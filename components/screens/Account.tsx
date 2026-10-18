"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { toast } from "@/lib/toast";

export default function Account() {
  const user = useApp((s) => s.user);
  const syncNote = useApp((s) => s.syncNote);
  const onboarded = useApp((s) => s.S.onboarded);
  const router = useRouter();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  // Chỉ hiện nút Google khi provider đã bật trong Supabase (Authentication → Sign In / Providers),
  // nếu không Supabase trả về trang lỗi "Unsupported provider: provider is not enabled".
  const [googleOn, setGoogleOn] = useState(false);
  useEffect(() => {
    const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, ""), key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    if (!url || !key) return;
    fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setGoogleOn(!!j?.external?.google))
      .catch(() => {});
  }, []);

  if (!supabase) {
    return (
      <div className="panel mt-4">
        <h3>Chưa cấu hình Supabase</h3>
        <p className="small muted !m-0">Thêm <code>NEXT_PUBLIC_SUPABASE_URL</code> và <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> vào tệp <code>.env.local</code> để bật đăng nhập và đồng bộ. Hiện tại tiến độ được lưu trên thiết bị này.</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="mx-auto max-w-md">
        <div className="panel mt-4">
          <h3>Đã đăng nhập</h3>
          <p className="small muted">{user.email}</p>
          <p className="small">{syncNote}. Tiến độ, sổ lỗi sai, đề AI và điểm xếp hạng được đồng bộ giữa máy tính và điện thoại.</p>
          <button className="btn btn-line w-full" onClick={async () => { await supabase!.auth.signOut(); toast("Đã đăng xuất"); }}>Đăng xuất</button>
        </div>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setMsg(null);
    try {
      if (mode === "in") {
        const { error } = await supabase!.auth.signInWithPassword({ email, password: pw });
        if (error) throw error;
        toast("Đăng nhập thành công");
        router.push("/");
      } else {
        const { data, error } = await supabase!.auth.signUp({
          email, password: pw,
          options: { data: { display_name: name.trim() || email.split("@")[0] }, emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined },
        });
        if (error) throw error;
        if (data.session) { toast("Đã tạo tài khoản"); router.push("/"); }
        else setMsg({ ok: true, t: "Đã gửi email xác nhận. Mở email và bấm vào liên kết để kích hoạt tài khoản, sau đó đăng nhập." });
      }
    } catch (err) {
      const m = (err as Error).message || "";
      setMsg({ ok: false, t: /Invalid login/i.test(m) ? "Sai email hoặc mật khẩu." : /already registered/i.test(m) ? "Email này đã có tài khoản. Hãy đăng nhập." : /Password should/i.test(m) ? "Mật khẩu cần ít nhất 6 ký tự." : "Không thực hiện được: " + m });
    }
    setBusy(false);
  };

  const google = async () => {
    const { error } = await supabase!.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
    if (error) setMsg({ ok: false, t: "Đăng nhập Google chưa được bật trong Supabase. Hãy dùng email và mật khẩu." });
  };

  return (
    <div className="mx-auto max-w-md">
      <p className="muted mt-4">Đăng nhập để lưu tiến độ lên đám mây, dùng chung trên máy tính và điện thoại, tạo đề AI và lên bảng xếp hạng.</p>
      <div className="seg mb-3">
        <button aria-pressed={mode === "in"} onClick={() => setMode("in")}>Đăng nhập</button>
        <button aria-pressed={mode === "up"} onClick={() => setMode("up")}>Tạo tài khoản</button>
      </div>
      <form className="panel" onSubmit={submit}>
        {mode === "up" && (<><label className="flabel !mt-0" htmlFor="nm">Tên hiển thị</label>
          <input className="field" id="nm" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên trên bảng xếp hạng" autoComplete="nickname" /></>)}
        <label className={`flabel ${mode === "in" ? "!mt-0" : ""}`} htmlFor="em">Email</label>
        <input className="field" id="em" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" inputMode="email" />
        <label className="flabel" htmlFor="pw">Mật khẩu</label>
        <input className="field" id="pw" type="password" required minLength={6} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete={mode === "in" ? "current-password" : "new-password"} />
        <button className="btn mt-4 w-full" disabled={busy}>{busy ? "Đang xử lý…" : mode === "in" ? "Đăng nhập" : "Tạo tài khoản"}</button>
        {msg && <p className={`small !mb-0 mt-3 ${msg.ok ? "text-good" : "text-bad"}`}>{msg.t}</p>}
      </form>
      {googleOn && <button className="btn btn-line w-full" onClick={google}>Tiếp tục với Google</button>}
      {!onboarded && <button className="btn btn-ghost mt-3 w-full" onClick={() => router.push("/")}>Dùng thử không cần tài khoản</button>}
      <p className="small muted mt-4">Tiến độ bạn đã học trên máy này sẽ được ghép vào tài khoản (giữ bản mới hơn).</p>
    </div>
  );
}
