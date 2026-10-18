"use client";
import { imageUrl } from "@/lib/remote";

/** Ảnh trong đề bài / lời giải (bảng biến thiên, đồ thị, hình vẽ…) */
export function QImage({ src, alt }: { src?: string; alt: string }) {
  if (!src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={imageUrl(src)} alt={alt} loading="lazy" decoding="async"
      className="my-3 block h-auto max-h-[55vh] w-auto max-w-full rounded-lg border border-line bg-white" />
  );
}
