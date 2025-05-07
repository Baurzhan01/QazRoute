// hooks/useAuthData.ts
"use client";

export const useAuthData = () => {
  const getAuthData = () => {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem("authData");
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Ошибка парсинга authData:", e);
      return null;
    }
  };

  const getConvoyId = (): string | null => {
    const auth = getAuthData();
    return auth?.convoyId ?? null;
  };

  const getConvoyNumber = (): string | null => {
    const auth = getAuthData();
    return auth?.convoyNumber ?? null;
  };

  const getUserRole = (): string | null => {
    const auth = getAuthData();
    return auth?.userRole ?? null;
  };

  return {
    getAuthData,
    getConvoyId,
    getConvoyNumber,
    getUserRole,
  };
};
