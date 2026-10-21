"use client";
/* Nhân vật vẽ bằng SVG, nét kiểu vẽ tay. Ngoại hình đổi theo bậc (cấp độ) và đồ đang mặc.
   Mỗi ô trang bị trống thì dùng đồ mặc định của bậc hiện tại. */
import { useId } from "react";
import { tierOf, type Equip } from "@/lib/game";

const INK = "#2a2622";
const SKIN = "#f2cba8";
type P = { k: string };

/* Đồ mặc định theo bậc: Tân binh, Chiến binh, Hiệp sĩ, Paladin, Huyền thoại */
const DEF: Record<number, Required<Omit<Equip, "pet">> & { pet?: string }> = {
  0: { weapon: "kiem-go", shield: "", helmet: "", armor: "vai", cape: "", aura: "" },
  1: { weapon: "kiem-sat", shield: "khien-go", helmet: "mu-sat", armor: "ao-da", cape: "", aura: "" },
  2: { weapon: "truong-kiem", shield: "khien-sat", helmet: "mu-hiep-si", armor: "giap-xich", cape: "", aura: "" },
  3: { weapon: "truong-kiem", shield: "khien-sat", helmet: "mu-hiep-si", armor: "giap-tam", cape: "ao-choang-do", aura: "" },
  4: { weapon: "truong-kiem", shield: "khien-sat", helmet: "mu-hiep-si", armor: "giap-tam", cape: "ao-choang-hoang-gia", aura: "nhe" },
};

export function resolveLook(lv: number, equip: Equip = {}) {
  const d = DEF[tierOf(lv)];
  return {
    weapon: equip.weapon || d.weapon, shield: equip.shield || d.shield, helmet: equip.helmet || d.helmet,
    armor: equip.armor || d.armor, cape: equip.cape || d.cape, pet: equip.pet || "", aura: equip.aura || d.aura,
  };
}

const ARMOR: Record<string, { body: string; leg: string; arm: string; hand: string; trim?: string; plate?: boolean; chain?: boolean }> = {
  vai: { body: "#c69a63", leg: "#6f5641", arm: "#c69a63", hand: SKIN },
  "ao-da": { body: "#8d5b34", leg: "#5a4433", arm: "#a06a3e", hand: "#6e4a2c" },
  "giap-xich": { body: "#a9b2bb", leg: "#8e979f", arm: "#a9b2bb", hand: "#8e979f", chain: true },
  "giap-tam": { body: "#dfe3e8", leg: "#c9cfd6", arm: "#dfe3e8", hand: "#c9cfd6", plate: true },
  "giap-vang": { body: "#f0cd62", leg: "#d9b24a", arm: "#f0cd62", hand: "#d9b24a", plate: true, trim: "#fff2b8" },
};
const CAPE: Record<string, { c: string; trim?: string }> = {
  "ao-choang-do": { c: "#c9473f" }, "ao-choang-xanh": { c: "#3f6fb5" }, "ao-choang-hoang-gia": { c: "#6c3fa3", trim: "#f2c94c" },
};
const AURA: Record<string, string[]> = {
  nhe: ["#fff4c2"], "hao-quang-xanh": ["#7fd6ff"], "hao-quang-vang": ["#ffd84d"], "hao-quang-cau-vong": ["#ff7b7b", "#ffd84d", "#7be08a", "#7fd6ff", "#c39bff"],
};

/* ================= Các bộ phận (toạ độ trong khung 200×240) ================= */
function Aura({ k, id }: P & { id: string }) {
  const cs = AURA[k]; if (!cs) return null;
  const strong = k !== "nhe";
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-au`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={cs[0]} stopOpacity={strong ? 0.85 : 0.5} />
          <stop offset="70%" stopColor={cs[cs.length > 1 ? 2 : 0]} stopOpacity={strong ? 0.35 : 0.18} />
          <stop offset="100%" stopColor={cs[cs.length - 1]} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="128" rx="88" ry="108" fill={`url(#${id}-au)`} />
      {cs.length > 1 && cs.map((c, i) => (
        <ellipse key={i} cx="100" cy="128" rx={70 + i * 5} ry={92 + i * 5} fill="none" stroke={c} strokeWidth="2.5" strokeDasharray="10 9" opacity=".8" />
      ))}
      {strong && cs.length === 1 && <ellipse cx="100" cy="128" rx="74" ry="96" fill="none" stroke={cs[0]} strokeWidth="2.5" strokeDasharray="6 10" opacity=".9" />}
    </g>
  );
}

function Cape({ k }: P) {
  const c = CAPE[k]; if (!c) return null;
  return (
    <g>
      <path d="M78 96 Q64 150 58 212 Q78 218 100 216 Q122 218 142 212 Q136 150 122 96 Z" fill={c.c} />
      <path d="M84 120 Q80 170 76 210 M116 120 Q120 170 124 210" fill="none" stroke="rgba(0,0,0,.18)" strokeWidth="3" />
      {c.trim && <path d="M58 212 Q78 218 100 216 Q122 218 142 212" fill="none" stroke={c.trim} strokeWidth="5" />}
    </g>
  );
}

function Legs({ k }: P) {
  const a = ARMOR[k] || ARMOR.vai;
  return (
    <g>
      <path d="M86 156 L84 204 L98 204 L99 158 Z" fill={a.leg} />
      <path d="M102 158 L103 204 L117 204 L115 156 Z" fill={a.leg} />
      <path d="M79 201 Q78 214 84 216 L100 216 L99 201 Z" fill={a.plate ? a.hand : "#4a3527"} />
      <path d="M102 201 L101 216 L118 216 Q124 214 122 201 Z" fill={a.plate ? a.hand : "#4a3527"} />
      {a.plate && <path d="M85 180 L98 180 M103 180 L116 180" stroke={INK} strokeWidth="2" />}
    </g>
  );
}

function Torso({ k }: P) {
  const a = ARMOR[k] || ARMOR.vai;
  return (
    <g>
      <path d="M76 94 Q100 85 124 94 L121 160 Q100 168 79 160 Z" fill={a.body} />
      {k === "vai" && <path d="M91 91 L100 106 L109 91" fill="none" />}
      {k === "ao-da" && <path d="M100 92 L100 146 M88 110 L94 112 M106 112 L112 110 M88 124 L94 126 M106 126 L112 124" fill="none" strokeWidth="2" />}
      {a.chain && (
        <g fill="none" strokeWidth="1.6" opacity=".75">
          {[104, 114, 124, 134].map((y) => <path key={y} d={`M80 ${y} q5 5 10 0 q5 5 10 0 q5 5 10 0 q5 5 10 0 q5 5 10 0`} />)}
        </g>
      )}
      {a.plate && (
        <g fill="none">
          <path d="M80 112 Q100 119 120 112 M80 128 Q100 135 120 128" strokeWidth="2.4" />
          <path d="M90 98 Q94 104 92 110" stroke="#fff" strokeWidth="3" opacity=".7" />
          {a.trim ? <path d="M100 100 l5 8 -5 8 -5 -8 z" fill={a.trim} /> : <path d="M100 99 L100 111 M95 104 L105 104" stroke="#c9473f" strokeWidth="3" />}
        </g>
      )}
      <path d="M79 146 Q100 152 121 146 L121 156 Q100 162 79 156 Z" fill="#5a3f2b" />
      <rect x="95" y="147" width="10" height="10" rx="2" fill="#e8c45a" />
      {a.plate && (
        <>
          <ellipse cx="76" cy="99" rx="13" ry="9" fill={a.body} />
          <ellipse cx="124" cy="99" rx="13" ry="9" fill={a.body} />
        </>
      )}
    </g>
  );
}

function Arm({ side, k }: { side: "l" | "r"; k: string }) {
  const a = ARMOR[k] || ARMOR.vai;
  const d = side === "l" ? "M79 100 Q64 120 66 142" : "M121 100 Q136 120 138 144";
  const [hx, hy] = side === "l" ? [66, 144] : [138, 146];
  return (
    <g>
      <path d={d} fill="none" stroke={INK} strokeWidth="17" />
      <path d={d} fill="none" stroke={a.arm} strokeWidth="11" />
      <circle cx={hx} cy={hy} r="7.5" fill={a.hand} />
    </g>
  );
}

function Head({ k, face = true }: P & { face?: boolean }) {
  const full = k === "mu-hiep-si";
  return (
    <g>
      <rect x="93" y="82" width="14" height="10" fill={SKIN} />
      <circle cx="100" cy="66" r="22" fill={SKIN} />
      {face && !full && (
        <g>
          <circle cx="92.5" cy="68" r="2.4" fill={INK} stroke="none" />
          <circle cx="107.5" cy="68" r="2.4" fill={INK} stroke="none" />
          <path d="M95 77 Q100 81 105 77" fill="none" strokeWidth="2.4" />
          <circle cx="88" cy="75" r="3" fill="#f29b8f" stroke="none" opacity=".6" />
          <circle cx="112" cy="75" r="3" fill="#f29b8f" stroke="none" opacity=".6" />
        </g>
      )}
      {(k === "" || k === "vuong-mien") && <path d="M77 64 Q78 40 100 40 Q122 40 123 64 Q116 52 104 53 Q98 47 90 52 Q82 54 77 64 Z" fill="#5b3a24" />}
    </g>
  );
}

function Helmet({ k }: P) {
  switch (k) {
    case "mu-vai":
      return (
        <g>
          <path d="M77 60 Q78 38 100 38 Q122 38 123 60 Z" fill="#4f7fc0" />
          <path d="M76 58 L124 58 L124 64 L76 64 Z" fill="#e8dcc2" />
          <circle cx="100" cy="36" r="5" fill="#e8dcc2" />
        </g>
      );
    case "mu-sat":
    case "mu-sung":
      return (
        <g>
          {k === "mu-sung" && (
            <>
              <path d="M80 46 Q62 42 58 22 Q70 36 84 40 Z" fill="#f3ead7" />
              <path d="M120 46 Q138 42 142 22 Q130 36 116 40 Z" fill="#f3ead7" />
            </>
          )}
          <path d="M76 58 Q78 33 100 33 Q122 33 124 58 Z" fill="#aab3bc" />
          <path d="M70 56 L130 56 L126 62 L74 62 Z" fill="#8f99a3" />
          <rect x="97" y="58" width="6" height="15" rx="2" fill="#8f99a3" />
          <path d="M86 41 Q90 37 96 36" fill="none" stroke="#fff" strokeWidth="3" opacity=".7" />
        </g>
      );
    case "mu-hiep-si":
      return (
        <g>
          <path d="M100 38 Q112 18 130 26 Q116 30 106 42 Z" fill="#d9473f" />
          <path d="M77 46 Q100 30 123 46 L123 84 Q100 94 77 84 Z" fill="#dfe3e8" />
          <path d="M83 64 L117 64" strokeWidth="5" />
          <path d="M100 66 L100 86" strokeWidth="2" />
          <circle cx="92" cy="76" r="1.4" fill={INK} /><circle cx="108" cy="76" r="1.4" fill={INK} />
          <path d="M84 48 Q90 42 98 41" fill="none" stroke="#fff" strokeWidth="3" opacity=".8" />
        </g>
      );
    case "vuong-mien":
      return (
        <g>
          <path d="M80 50 L82 28 L91 40 L100 24 L109 40 L118 28 L120 50 Z" fill="#f2c94c" />
          <circle cx="100" cy="42" r="3.5" fill="#e0475a" /><circle cx="88" cy="45" r="2.5" fill="#4aa3df" /><circle cx="112" cy="45" r="2.5" fill="#4aa3df" />
        </g>
      );
    default:
      return null;
  }
}

/* Vũ khí vẽ thẳng đứng từ bàn tay (138,146) rồi xoay nghiêng 28° */
function Weapon({ k }: P) {
  const blade = (fill: string, top: number, w = 7) => <path d={`M${138 - w / 2} 138 L${138 - w / 2} ${top + 10} L138 ${top} L${138 + w / 2} ${top + 10} L${138 + w / 2} 138 Z`} fill={fill} />;
  const hilt = (guard = "#7a5a3a", grip = "#5a3f2b", pom = "#e8c45a") => (
    <g>
      <rect x="126" y="136" width="24" height="6" rx="2.5" fill={guard} />
      <rect x="135" y="142" width="6" height="14" fill={grip} />
      <circle cx="138" cy="159" r="4" fill={pom} />
    </g>
  );
  let body: React.ReactNode = null;
  switch (k) {
    case "kiem-go": body = <g>{blade("#c89b62", 92, 8)}{hilt("#8a6a46", "#6b4e33", "#8a6a46")}</g>; break;
    case "kiem-sat": body = <g>{blade("#cfd6dd", 76)}<path d="M138 132 L138 88" stroke="#fff" strokeWidth="1.6" opacity=".8" />{hilt()}</g>; break;
    case "truong-kiem": body = <g>{blade("#dfe5ea", 58, 8)}<path d="M138 132 L138 72" strokeWidth="1.6" />{hilt("#9aa3ad", "#3f4a6b", "#c9473f")}</g>; break;
    case "riu-chien": body = (
      <g>
        <rect x="135" y="72" width="6" height="92" rx="2" fill="#7a5a3a" />
        <path d="M141 74 Q170 78 166 110 Q154 98 141 100 Z" fill="#b8c0c8" />
        <path d="M135 78 Q118 84 120 102 Q128 96 135 96 Z" fill="#b8c0c8" />
      </g>
    ); break;
    case "gay-phep": body = (
      <g>
        <rect x="135" y="70" width="6" height="96" rx="2" fill="#7a5a3a" />
        <path d="M130 70 Q138 52 146 70" fill="none" strokeWidth="3" />
        <circle cx="138" cy="60" r="12" fill="#7fd6ff" opacity=".35" stroke="none" />
        <circle cx="138" cy="60" r="8" fill="#9fe2ff" />
        <path d="M135 57 Q137 55 139 55" stroke="#fff" strokeWidth="2" />
      </g>
    ); break;
    case "kiem-lua": body = (
      <g>
        <path d="M133 138 L131 100 Q128 84 138 66 Q136 82 143 92 Q147 104 143 138 Z" fill="#ff8a3d" />
        <path d="M136 132 L135 104 Q134 92 138 84 Q139 96 141 104 L140 132 Z" fill="#ffd24d" stroke="none" />
        {hilt("#3a2a22", "#3a2a22", "#ff8a3d")}
      </g>
    ); break;
    case "thanh-kiem": body = (
      <g>
        <path d="M138 50 L138 140" stroke="#fff6c8" strokeWidth="18" opacity=".45" />
        {blade("#fffbe8", 50, 9)}
        <path d="M138 132 L138 66" stroke="#e8c45a" strokeWidth="1.6" />
        <path d="M122 140 Q130 132 138 138 Q146 132 154 140 Q146 144 138 142 Q130 144 122 140 Z" fill="#f2c94c" />
        <rect x="135" y="142" width="6" height="14" fill="#6c3fa3" />
        <circle cx="138" cy="159" r="4.5" fill="#7fd6ff" />
      </g>
    ); break;
  }
  if (!body) return null;
  return <g transform="rotate(28 138 146)">{body}</g>;
}

function Shield({ k }: P) {
  const kite = (fill: string, deco: React.ReactNode, rim = INK) => (
    <g>
      <path d="M40 114 Q60 104 82 114 L80 142 Q64 168 44 144 Z" fill={fill} stroke={rim} />
      {deco}
    </g>
  );
  switch (k) {
    case "khien-go":
      return (
        <g>
          <circle cx="62" cy="136" r="23" fill="#b07a45" />
          <path d="M50 116 L50 156 M62 113 L62 159 M74 116 L74 156" fill="none" strokeWidth="1.6" opacity=".7" />
          <circle cx="62" cy="136" r="5.5" fill="#9aa3ad" />
        </g>
      );
    case "khien-sat": return kite("#aab3bc", <path d="M61 112 L61 154 M46 126 L77 126" stroke="#c9473f" strokeWidth="5" />);
    case "khien-rong": return kite("#3f8f6a", (
      <g fill="none" strokeWidth="1.6" opacity=".85">
        {[120, 130, 140].map((y) => <path key={y} d={`M46 ${y} q4 5 8 0 q4 5 8 0 q4 5 8 0 q4 5 8 0`} />)}
        <circle cx="61" cy="130" r="5" fill="#f2c94c" />
      </g>
    ));
    case "khien-vang": return kite("#f0cd62", (
      <g>
        <path d="M44 116 Q60 108 78 116" fill="none" stroke="#fff2b8" strokeWidth="3" />
        <path d="M61 118 l4 9 10 1 -8 6 3 10 -9 -6 -9 6 3 -10 -8 -6 10 -1 z" fill="#fff2b8" />
      </g>
    ));
    default: return null;
  }
}

function Pet({ k }: P) {
  switch (k) {
    case "meo-mun":
      return (
        <g>
          <path d="M146 212 Q136 200 142 190" fill="none" stroke={INK} strokeWidth="5" />
          <ellipse cx="160" cy="210" rx="15" ry="10" fill="#2d2a30" />
          <circle cx="172" cy="197" r="9" fill="#2d2a30" />
          <path d="M165 191 L166 182 L171 189 Z M175 189 L180 182 L180 192 Z" fill="#2d2a30" />
          <circle cx="169" cy="197" r="1.8" fill="#ffd84d" stroke="none" /><circle cx="176" cy="197" r="1.8" fill="#ffd84d" stroke="none" />
        </g>
      );
    case "cu-tri-thuc":
      return (
        <g>
          <ellipse cx="164" cy="204" rx="13" ry="15" fill="#9a7350" />
          <ellipse cx="164" cy="208" rx="8" ry="9" fill="#e8d3b0" />
          <circle cx="159" cy="197" r="5" fill="#fff" /><circle cx="169" cy="197" r="5" fill="#fff" />
          <circle cx="159" cy="197" r="2" fill={INK} stroke="none" /><circle cx="169" cy="197" r="2" fill={INK} stroke="none" />
          <path d="M162 202 L164 206 L166 202 Z" fill="#f2a33a" />
          <path d="M152 188 L164 183 L176 188 L164 193 Z" fill="#2d2a30" />
          <path d="M174 188 L176 196" strokeWidth="1.6" />
        </g>
      );
    case "rong-con":
      return (
        <g>
          <path d="M150 208 Q140 212 136 204" fill="none" stroke={INK} strokeWidth="6" />
          <path d="M150 208 Q140 212 136 204" fill="none" stroke="#5bb36a" strokeWidth="3" />
          <path d="M158 196 Q150 180 166 184 Q160 190 164 196 Z" fill="#8fd6a0" />
          <ellipse cx="162" cy="208" rx="13" ry="10" fill="#5bb36a" />
          <circle cx="174" cy="196" r="9" fill="#5bb36a" />
          <path d="M170 188 L169 181 L174 186 Z M177 187 L180 180 L181 188 Z" fill="#f3ead7" />
          <circle cx="177" cy="196" r="1.8" fill={INK} stroke="none" />
          <path d="M180 200 Q183 201 184 199" strokeWidth="1.6" fill="none" />
        </g>
      );
    default: return null;
  }
}

/* ================= Nhân vật đầy đủ ================= */
export default function HeroArt({ lv, equip, size = 220, className, label, bust, animated }: { lv: number; equip?: Equip; size?: number | string; className?: string; label?: string; bust?: boolean; animated?: boolean }) {
  const id = useId().replace(/:/g, "");
  const L = resolveLook(lv, equip);
  const f = `url(#${id}-r)`;
  return (
    <svg viewBox={bust ? "46 18 108 108" : "0 0 200 240"} width={size} height={typeof size === "number" ? (bust ? size : (size * 240) / 200) : undefined} className={`${className || ""}${animated ? " hero-anim" : ""}`}
      role="img" aria-label={label || `Nhân vật cấp ${lv}`}>
      <defs>
        <filter id={`${id}-r`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="4" />
          <feDisplacementMap in="SourceGraphic" scale="2.2" />
        </filter>
      </defs>
      <ellipse cx="100" cy="222" rx="56" ry="8" fill="rgba(0,0,0,.18)" />
      <g className="h-aura"><Aura k={L.aura} id={id} /></g>
      {/* Bộ lọc nét vẽ tay đặt ở từng bộ phận (bên trong nhóm chuyển động): nếu đặt bộ lọc bao ngoài,
          Chrome không vẽ lại khi nhóm con chuyển động nên nhân vật trông như đứng yên */}
      <g stroke={INK} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
        <g className="h-cape"><g filter={f}><Cape k={L.cape} /></g></g>
        <g filter={f}><Legs k={L.armor} /></g>
        {/* Thân trên thở nhẹ; tay phải + vũ khí thỉnh thoảng giơ lên ngắm rồi hạ xuống */}
        <g className="h-up">
          <g className="h-swing"><g filter={f}><Arm side="r" k={L.armor} /></g></g>
          <g filter={f}><Torso k={L.armor} /></g>
          <g className="h-head"><g filter={f}><Head k={L.helmet} /><Helmet k={L.helmet} /></g></g>
          <g className="h-swing"><g filter={f}><Weapon k={L.weapon} /></g></g>
          <g className="h-shield"><g filter={f}><Arm side="l" k={L.armor} /><Shield k={L.shield} /></g></g>
        </g>
        <g className="h-pet"><g filter={f}><Pet k={L.pet} /></g></g>
      </g>
    </svg>
  );
}

/* ================= Ảnh vật phẩm (chỉ vẽ một bộ phận) ================= */
const VIEW: Record<string, string> = {
  weapon: "104 40 76 124", shield: "30 98 64 76", helmet: "52 14 96 84", armor: "50 82 100 140", cape: "50 88 100 136",
  pet: "130 172 60 52", aura: "0 10 200 230",
};
export function ItemArt({ slot, id, size = 64 }: { slot: string; id: string; size?: number }) {
  const fid = useId().replace(/:/g, "");
  if (slot === "consumable") {
    return (
      <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
        <g stroke={INK} strokeWidth="2.5" strokeLinejoin="round">
          <rect x="14" y="8" width="36" height="48" rx="6" fill="#fff4d6" transform="rotate(-8 32 32)" />
          <path d="M32 18c2 6 9 9 9 17a9 9 0 01-18 0c0-4 2-6 4-8 0 3 2 5 4 5-1-5 0-10 1-14z" fill="#ff8a3d" />
        </g>
      </svg>
    );
  }
  let part: React.ReactNode = null;
  if (slot === "weapon") part = <Weapon k={id} />;
  else if (slot === "shield") part = <Shield k={id} />;
  else if (slot === "helmet") part = <><Head k={id} face={id !== "mu-hiep-si"} /><Helmet k={id} /></>;
  else if (slot === "armor") part = <><Legs k={id} /><Arm side="r" k={id} /><Torso k={id} /><Arm side="l" k={id} /></>;
  else if (slot === "cape") part = <Cape k={id} />;
  else if (slot === "pet") part = <Pet k={id} />;
  else if (slot === "aura") return (
    <svg viewBox={VIEW.aura} width={size} height={size} aria-hidden="true"><Aura k={id} id={fid} /><circle cx="100" cy="128" r="26" fill="#fffaf0" stroke={INK} strokeWidth="4" /></svg>
  );
  return (
    <svg viewBox={VIEW[slot] || "0 0 200 240"} width={size} height={size} aria-hidden="true">
      <g stroke={INK} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">{part}</g>
    </svg>
  );
}
