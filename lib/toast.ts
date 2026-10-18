import { create } from "zustand";

type ToastStore = { msg: string; id: number };
export const useToast = create<ToastStore>(() => ({ msg: "", id: 0 }));
let timer: ReturnType<typeof setTimeout> | undefined;
/** Hiện thông báo ngắn ở cuối màn hình (gọi được ở bất kỳ đâu, kể cả trong logic). */
export function toast(msg: string) {
  useToast.setState((s) => ({ msg, id: s.id + 1 }));
  clearTimeout(timer);
  timer = setTimeout(() => useToast.setState({ msg: "" }), 2600);
}
