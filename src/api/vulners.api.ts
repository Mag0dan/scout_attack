import { API_BASE } from "@/app/constants";

export async function fetchVuln<T>(name: string): Promise<T> {
  const res = await fetch(
    `${API_BASE}/vulner?name=${encodeURIComponent(name)}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  if (!res.ok) {
    throw new Error(`Ошибка загрузки уязвимости: ${res.status}`);
  }
  return res.json();
}

export async function fetchEncrypt<T>(name: string): Promise<T> {
  const res = await fetch(
    `${API_BASE}/encrypt?name=${encodeURIComponent(name)}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  if (!res.ok) {
    throw new Error(`Ошибка загрузки информации о шифровании: ${res.status}`);
  }
  return res.json();
}
