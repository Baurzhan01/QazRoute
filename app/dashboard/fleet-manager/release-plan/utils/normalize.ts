export function normalizeString(value: string | undefined | null): string {
    return value ?? "";
  }
  
  export function normalizeId(value: string | undefined | null): string {
    return value ?? "unknown";
  }
  