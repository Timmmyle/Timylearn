// Build tĩnh (out/) cho Capacitor. API route không chạy được trong app, nên tạm cất app/api
// trong lúc build; app gọi AI qua NEXT_PUBLIC_API_BASE (server Next.js đã deploy).
import { execSync } from "node:child_process";
import { existsSync, renameSync } from "node:fs";

const api = "app/api", tmp = "_api_build_skip";
if (!process.env.NEXT_PUBLIC_API_BASE) console.warn("⚠  Chưa đặt NEXT_PUBLIC_API_BASE — tính năng AI trong app sẽ tắt.");
if (existsSync(api)) renameSync(api, tmp);
try {
  execSync("next build", { stdio: "inherit", env: { ...process.env, NEXT_OUTPUT: "export" } });
  console.log("\n✓ Đã build vào thư mục out/. Tiếp theo: npx cap sync");
} finally {
  if (existsSync(tmp)) renameSync(tmp, api);
}
