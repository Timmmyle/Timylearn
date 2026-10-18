import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Đóng gói app iOS/Android từ bản build tĩnh (thư mục out/).
 *   1) Đặt NEXT_PUBLIC_API_BASE=https://<domain-đã-deploy> trong .env.local (AI chạy trên server đó)
 *   2) npm run build:mobile
 *   3) npx cap add android   |  npx cap add ios   (lần đầu)
 *   4) npx cap sync && npx cap open android
 */
const config: CapacitorConfig = {
  appId: "com.aiktp.onthi",
  appName: "Ôn Thi",
  webDir: "out",
  backgroundColor: "#FAFAFE",
  android: { allowMixedContent: false },
  ios: { contentInset: "never" },
};
export default config;
