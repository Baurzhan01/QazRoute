// service/minioService.ts
import apiClient from "@/app/api/apiClient"
import { API_BASE_URL } from "@/app/api/apiService"
import type { MinioUploadResponse } from "@/types/minio.types"

const BASE_URL = "/minio"
const API_HOST = process.env.NEXT_PUBLIC_API_URL || API_BASE_URL

interface UploadResult {
  fileName: string
  url: string
}

const buildDownloadUrl = (fileName: string) => `${API_HOST.replace(/\/$/, "")}${BASE_URL}/${encodeURIComponent(fileName)}`

const makeAbsolute = (url?: string) => {
  if (!url) return undefined
  if (/^https?:\/\//i.test(url)) return url
  const trimmedUrl = url.startsWith("/") ? url : `/${url}`
  return `${API_HOST.replace(/\/$/, "")}${trimmedUrl}`
}

const extractValue = (data: MinioUploadResponse | string | Record<string, unknown> | null | undefined) => {
  if (!data) return null
  if (typeof data === "string") return data
  if (typeof (data as MinioUploadResponse).value !== "undefined") {
    return (data as MinioUploadResponse).value
  }
  return data
}

export const minioService = {
  upload: async (file: File | Blob, fileName?: string): Promise<UploadResult> => {
    const fallbackName =
      fileName || (file instanceof File ? file.name : `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`)

    const formData = new FormData()
    formData.append("file", file, fallbackName)

    const res = await apiClient.post(`${BASE_URL}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })

    const payload = extractValue(res.data as MinioUploadResponse | string | Record<string, unknown>)
    let uploadedFileName: string | undefined
    let uploadedUrl: string | undefined

    if (typeof payload === "string") {
      uploadedFileName = payload
    } else if (payload && typeof payload === "object") {
      uploadedFileName = (payload as any).fileName ?? (payload as any).name ?? undefined
      uploadedUrl = (payload as any).url ?? undefined
    }

    uploadedUrl = makeAbsolute(uploadedUrl)

    if (!uploadedUrl && uploadedFileName) {
      uploadedUrl = buildDownloadUrl(uploadedFileName)
    }

    if (!uploadedFileName && uploadedUrl) {
      const parts = uploadedUrl.split("/")
      uploadedFileName = parts[parts.length - 1]
    }

    if (!uploadedFileName) {
      uploadedFileName = fallbackName
    }
    if (!uploadedUrl) {
      uploadedUrl = buildDownloadUrl(uploadedFileName)
    }

    return { fileName: uploadedFileName, url: uploadedUrl }
  },

  getFile: async (fileName: string): Promise<Blob> => {
    const res = await apiClient.get(`${BASE_URL}/${encodeURIComponent(fileName)}`, {
      responseType: "blob",
    })
    return res.data as Blob
  },
}
