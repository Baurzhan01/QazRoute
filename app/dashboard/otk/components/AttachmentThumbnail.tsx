"use client"

import { buildAbsoluteUrl } from "../utils"
import { cn } from "@/lib/utils"

interface AttachmentThumbnailProps {
  urls?: string[]
  onPreview?: (urls: string[], index?: number) => void
  size?: "sm" | "md"
  align?: "start" | "end"
  showCount?: boolean
  className?: string
}

export default function AttachmentThumbnail({
  urls,
  onPreview,
  size = "md",
  align = "start",
  showCount = true,
  className,
}: AttachmentThumbnailProps) {
  if (!urls || urls.length === 0) return null

  const absoluteUrls = urls.map(buildAbsoluteUrl)
  const dimension = size === "sm" ? "h-12 w-12" : "h-16 w-16"

  return (
    <div className={cn("flex items-center gap-3", align === "end" && "justify-end", className)}>
      <button
        type="button"
        onClick={() => onPreview?.(absoluteUrls, 0)}
        className="rounded-lg border border-gray-100 p-1 transition hover:scale-[1.02]"
      >
        <img src={absoluteUrls[0]} alt="Миниатюра вложения" className={cn("rounded-md object-cover", dimension)} />
      </button>
      {showCount && absoluteUrls.length > 1 && (
        <span className="text-xs text-gray-500">+ ещё {absoluteUrls.length - 1} фото</span>
      )}
    </div>
  )
}
