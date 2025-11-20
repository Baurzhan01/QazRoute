"use client"

import { API_BASE_URL } from "@/app/api/apiService"

export const buildAbsoluteUrl = (url: string) => {
  if (!url) return ""
  if (/^https?:\/\//i.test(url)) return url
  const host = (process.env.NEXT_PUBLIC_API_URL || API_BASE_URL || "").replace(/\/$/, "")
  const normalized = url.startsWith("/") ? url : `/${url}`
  return `${host}${normalized}`
}
