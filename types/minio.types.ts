// types/minio.types.ts
import type { ApiResponse } from "./api.types";

export interface MinioUploadResult {
  fileName: string;
  url?: string;
}

export type MinioUploadResponse = ApiResponse<MinioUploadResult>;
