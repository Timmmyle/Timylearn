"use client";
/* Chế độ game: nhân vật, xu, cửa hàng, bảng xếp hạng.
   Xu và đồ nằm trên Supabase (bảng heroes / inventory / coin_ledger) và chỉ đổi qua hàm RPC phía server,
   nên người chơi không tự sửa được. Cấp độ nhân vật = cấp độ học (tính từ XP). */
import { create } from "zustand";
import { supabase } from "./supabase";
import { toast } from "./toast";
import { useApp, syncNow } from "./store";
import { today, levelInfo, xpForLevel } from "./logic";
export { levelInfo, xpForLevel };

export type Slot = "weapon" | "shield" | "helmet" | "armor" | "cape" | "pet" | "aura" | "consumable";
export type Rarity = "thuong" | "hiem" | "suthi" | "huyenthoai";
export type Item = { id: string; name: string; slot: Slot; price: number; min_level: number; rarity: Rarity; description: string; sort: number };
export type Equip = Partial<Record<Exclude<Slot, "consumable">, string>>;

export const SLOT_LABEL: Record<Slot, string> = {
  weapon: "Vũ khí", shield: "Khiên", helmet: "Mũ", armor: "Giáp", cape: "Áo choàng", pet: "Thú cưng", aura: "Hào quang", consumable: "Vật phẩm",
};
export const RARITY_LABEL: Record<Rarity, string> = { thuong: "Thường", hiem: "Hiếm", suthi: "Sử thi", huyenthoai: "Huyền thoại" };

/* ---------- Cấp độ (levelInfo trong logic.ts) ---------- */
export const TIERS = [
  { min: 1, name: "Tân binh" }, { min: 5, name: "Chiến binh" }, { min: 10, name: "Hiệp sĩ" }, { min: 15, name: "Paladin" }, { min: 20, name: "Huyền thoại" },
];
export const tierOf = (lv: number) => TIERS.reduce((t, x, i) => (lv >= x.min ? i : t), 0);
export const levelReward = (lv: number) => 30 + 20 * lv;

/** Hạng đấu theo điểm xếp hạng */
export function league(rating: number) {
  if (rating >= 1400) return { name: "Kim cương", color: "#7FD6FF" };
  if (rating >= 1250) return { name: "Vàng", color: "#F2C94C" };
  if (rating >= 1150) return { name: "Bạc", color: "#C9CED6" };
  if (rating >= 1050) return { name: "Đồng", color: "#D08B54" };
  return { name: "Lá", color: "#8FD18B" };
}

/* ---------- Danh mục dự phòng (khi chưa kết nối máy chủ). Giá thật lấy từ bảng shop_items. ---------- */
const I = (id: string, name: string, slot: Slot, price: number, min_level: number, rarity: Rarity, description: string, sort: number): Item => ({ id, name, slot, price, min_level, rarity, description, sort });
export const CATALOG: Item[] = [
  I("kiem-sat", "Kiếm sắt", "weapon", 120, 1, "thuong", "Thanh kiếm đầu tiên của mọi hiệp sĩ.", 10),
  I("truong-kiem", "Trường kiếm", "weapon", 400, 5, "hiem", "Lưỡi dài, chém gọn mọi câu hỏi khó.", 11),
  I("riu-chien", "Rìu chiến", "weapon", 650, 6, "hiem", "Nặng tay, phá tan sổ lỗi sai.", 12),
  I("gay-phep", "Gậy phép tri thức", "weapon", 900, 8, "suthi", "Viên ngọc phát sáng mỗi lần bạn trả lời đúng.", 13),
  I("kiem-lua", "Kiếm lửa", "weapon", 1800, 12, "suthi", "Rèn từ những chuỗi ngày học không nghỉ.", 14),
  I("thanh-kiem", "Thánh kiếm", "weapon", 3500, 20, "huyenthoai", "Chỉ dành cho người đã vượt qua mọi thử thách.", 15),
  I("khien-go", "Khiên gỗ", "shield", 100, 1, "thuong", "Đỡ được vài câu hỏi bẫy.", 20),
  I("khien-sat", "Khiên sắt", "shield", 350, 4, "hiem", "Chắc chắn, đáng tin trước giờ thi.", 21),
  I("khien-rong", "Khiên vảy rồng", "shield", 1500, 12, "suthi", "Làm từ vảy của con rồng tên Đạo Hàm.", 22),
  I("khien-vang", "Khiên hoàng kim", "shield", 3000, 18, "huyenthoai", "Phản chiếu ánh sáng của điểm 10.", 23),
  I("mu-vai", "Mũ vải", "helmet", 80, 1, "thuong", "Giữ ấm đầu óc khi học khuya.", 30),
  I("mu-sat", "Mũ sắt", "helmet", 300, 4, "hiem", "Không câu hỏi nào làm bạn choáng.", 31),
  I("mu-hiep-si", "Mũ hiệp sĩ", "helmet", 800, 8, "suthi", "Có chùm lông đỏ của đội cận vệ.", 32),
  I("mu-sung", "Mũ sừng", "helmet", 1200, 10, "suthi", "Dũng mãnh như chiến binh phương Bắc.", 33),
  I("vuong-mien", "Vương miện học giả", "helmet", 4000, 22, "huyenthoai", "Dành cho bậc thầy của mọi môn học.", 34),
  I("ao-da", "Áo da", "armor", 150, 2, "thuong", "Nhẹ và linh hoạt.", 40),
  I("giap-xich", "Giáp xích", "armor", 500, 5, "hiem", "Từng mắt xích là một bài đã học.", 41),
  I("giap-tam", "Giáp tấm", "armor", 1200, 10, "suthi", "Áo giáp của hiệp sĩ thực thụ.", 42),
  I("giap-vang", "Giáp hoàng kim", "armor", 3200, 18, "huyenthoai", "Lấp lánh như bảng vàng thành tích.", 43),
  I("ao-choang-do", "Áo choàng đỏ", "cape", 250, 3, "thuong", "Bay phấp phới khi bạn thắng trận.", 50),
  I("ao-choang-xanh", "Áo choàng xanh", "cape", 250, 3, "thuong", "Màu của sự bình tĩnh trong phòng thi.", 51),
  I("ao-choang-hoang-gia", "Áo choàng hoàng gia", "cape", 1600, 14, "suthi", "Viền vàng, dành cho nhà vô địch.", 52),
  I("meo-mun", "Mèo mun", "pet", 600, 5, "hiem", "Ngồi cạnh bạn suốt những đêm ôn bài.", 60),
  I("cu-tri-thuc", "Cú tri thức", "pet", 900, 7, "suthi", "Biết hết công thức nhưng chỉ nhắc khi cần.", 61),
  I("rong-con", "Rồng con", "pet", 2500, 15, "huyenthoai", "Một ngày nào đó sẽ lớn, giống như bạn.", 62),
  I("hao-quang-xanh", "Hào quang xanh", "aura", 700, 6, "hiem", "Tỏa sáng khi bạn tập trung.", 70),
  I("hao-quang-vang", "Hào quang vàng", "aura", 2000, 15, "suthi", "Ánh vàng của người đứng đầu.", 71),
  I("hao-quang-cau-vong", "Hào quang cầu vồng", "aura", 5000, 25, "huyenthoai", "Hiếm như điểm 10 tuyệt đối.", 72),
  I("the-giu-chuoi", "Thẻ giữ chuỗi", "consumable", 150, 1, "thuong", "Giữ chuỗi ngày học khi lỡ nghỉ một ngày. Giữ tối đa 3 thẻ.", 90),
];

type GameState = {
  status: "off" | "guest" | "loading" | "ready" | "error";
  name: string; coins: number; equip: Equip; inventory: Record<string, number>; claimedLevel: number;
  todayEarned: Record<string, number>; items: Item[];
  /** phần thưởng xu của phiên vừa xong (theo ses.start) */ lastReward: { ref: string; coins: number } | null;
  busy: string | null;
};
export const useGame = create<GameState>(() => ({
  status: "off", name: "", coins: 0, equip: {}, inventory: {}, claimedLevel: 1, todayEarned: {}, items: CATALOG, lastReward: null, busy: null,
}));

const errMsg = (e: unknown) => {
  const m = (e as { message?: string })?.message || String(e);
  if (/function .* does not exist|schema cache|relation .* does not exist/i.test(m)) return "Máy chủ chưa bật chế độ game (cần chạy 0005_game.sql).";
  return m.replace(/^.*?ERROR:\s*/, "");
};

/** Tải ví, đồ, danh mục. Gọi khi khởi động và khi đăng nhập/đăng xuất. */
export async function loadGame() {
  if (!supabase) { useGame.setState({ status: "off" }); return; }
  const items = await supabase.from("shop_items").select("*").order("sort");
  if (!items.error && items.data?.length) useGame.setState({ items: items.data as Item[] });
  if (!useApp.getState().user) { useGame.setState({ status: "guest", coins: 0, equip: {}, inventory: {}, name: "" }); return; }
  useGame.setState({ status: "loading" });
  const { data, error } = await supabase.rpc("game_state");
  if (error) { useGame.setState({ status: "error" }); console.warn("game_state:", errMsg(error)); return; }
  const g = data as { name: string; coins: number; equip: Equip; inventory: Record<string, number>; claimed_level: number; today: Record<string, number> };
  useGame.setState({ status: "ready", name: g.name, coins: g.coins, equip: g.equip || {}, inventory: g.inventory || {}, claimedLevel: g.claimed_level || 1, todayEarned: g.today || {} });
  claimMissions();
}

/** Nhận xu cho một hoạt động. Máy chủ quyết định số xu (có trần theo ngày). */
export async function earnCoins(kind: "practice" | "exam" | "fight" | "mission" | "level", ref: string, n = 0, silent = false) {
  if (!supabase || useGame.getState().status !== "ready") return 0;
  const { data, error } = await supabase.rpc("earn_coins", { p_kind: kind, p_ref: ref, p_n: Math.round(n) });
  if (error) { console.warn("earn_coins:", errMsg(error)); return 0; }
  const r = data as { granted: number; coins: number; reason: string };
  useGame.setState((s) => ({ coins: r.coins, todayEarned: { ...s.todayEarned, [kind]: (s.todayEarned[kind] || 0) + r.granted } }));
  if (!silent && r.granted > 0) toast(`+${r.granted} xu`);
  if (!silent && r.reason === "cap" && r.granted === 0) toast("Hôm nay đã nhận đủ xu cho hoạt động này");
  return r.granted;
}

const rewarded = new Set<string>();
/** Thưởng xu khi xong một phiên làm bài */
export async function rewardSession(kind: string, start: number, n: number) {
  const k = kind === "exam" ? "exam" : kind === "fight" ? "fight" : kind === "practice" || kind === "review" || kind === "diag" ? "practice" : null;
  if (!k) return;
  const ref = String(start);
  if (rewarded.has(ref)) return; rewarded.add(ref);
  const got = await earnCoins(k, ref, n, true);
  useGame.setState({ lastReward: { ref, coins: got } });
  if (got > 0) toast(`+${got} xu`);
}

/** Nhận thưởng lên cấp (tất cả các cấp chưa nhận) */
export async function claimLevels() {
  const g = useGame.getState(); if (g.status !== "ready") return;
  const lv = levelInfo(useApp.getState().S.xp).lv;
  if (lv <= g.claimedLevel) return;
  useGame.setState({ busy: "level" });
  await syncNow(); // máy chủ tính cấp từ XP đã đồng bộ
  let total = 0, last = g.claimedLevel;
  for (let l = g.claimedLevel + 1; l <= lv; l++) {
    const got = await earnCoins("level", String(l), 0, true);
    total += got; last = l;
  }
  useGame.setState({ busy: null, claimedLevel: last });
  toast(total > 0 ? `Lên cấp ${lv}! Nhận ${total} xu` : `Đã lên cấp ${lv}`);
}

export async function buyItem(id: string) {
  if (!supabase) return false;
  useGame.setState({ busy: id });
  await syncNow();
  const { data, error } = await supabase.rpc("buy_item", { p_item: id });
  if (error) { useGame.setState({ busy: null }); toast(errMsg(error)); return false; }
  const r = data as { coins: number; equip: Equip; item: string };
  useGame.setState((s) => ({ busy: null, coins: r.coins, equip: r.equip || s.equip, inventory: { ...s.inventory, [id]: (s.inventory[id] || 0) + 1 } }));
  const it = useGame.getState().items.find((x) => x.id === id);
  if (id === "the-giu-chuoi") {
    // Dùng ngay: thêm thẻ giữ chuỗi vào tiến độ học
    const u = await supabase.rpc("use_item", { p_item: id });
    if (!u.error) {
      useApp.getState().update((S) => { S.streak.freezes = Math.min(3, (S.streak.freezes || 0) + 1); });
      useGame.setState((s) => { const inv = { ...s.inventory }; inv[id] = Math.max(0, (inv[id] || 1) - 1); if (!inv[id]) delete inv[id]; return { inventory: inv }; });
    }
    toast("Đã thêm 1 thẻ giữ chuỗi");
  } else toast(`Đã mua ${it?.name || "vật phẩm"} và trang bị`);
  return true;
}

export async function equipItem(slot: Exclude<Slot, "consumable">, id: string | null) {
  if (!supabase) return;
  const prev = useGame.getState().equip;
  const next = { ...prev }; if (id) next[slot] = id; else delete next[slot];
  useGame.setState({ equip: next });
  const { data, error } = await supabase.rpc("equip_item", { p_slot: slot, p_item: id });
  if (error) { useGame.setState({ equip: prev }); toast(errMsg(error)); return; }
  useGame.setState({ equip: (data as { equip: Equip }).equip || {} });
}

export async function renameHero(name: string) {
  if (!supabase) return false;
  const { data, error } = await supabase.rpc("rename_hero", { p_name: name });
  if (error) { toast(errMsg(error)); return false; }
  useGame.setState({ name: (data as { name: string }).name });
  toast("Đã đổi tên nhân vật");
  return true;
}

export type LbRow = { rank: number; display_name: string; hero_name: string; equip: Equip; level: number; value: number; is_me: boolean };
export async function loadLeaderboard(kind: "level" | "rating" | "week", lim = 20): Promise<LbRow[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("leaderboard_game", { p_kind: kind, lim });
  if (error) { console.warn("leaderboard_game:", errMsg(error)); return null; }
  return data as LbRow[];
}

/* ---------- Tự nhận xu nhiệm vụ khi hoàn thành (nhiệm vụ do logic học tập đánh dấu) ---------- */
const sentMission = new Set<string>();
let started = false;
export function initGame() {
  if (started) return; started = true;
  useApp.subscribe((st, prev) => {
    if (st.user?.id !== prev.user?.id) loadGame();
    const m = st.S.missions;
    if (st.S.missions !== prev.S.missions) claimMissions();
  });
  loadGame();
}
function claimMissions() {
  if (useGame.getState().status !== "ready") return;
  const m = useApp.getState().S.missions;
  if (m.day !== today()) return;
  for (const id of Object.keys(m.claimed || {})) {
    const ref = `${m.day}:${id}`;
    if (m.claimed[id] && !sentMission.has(ref)) { sentMission.add(ref); earnCoins("mission", ref, 0); }
  }
}
