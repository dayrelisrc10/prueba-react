import type { Post, User } from "./types";

const API_URL = "https://jsonplaceholder.typicode.com";

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`La solicitud falló (${response.status}).`);
  }

  return response.json() as Promise<T>;
}

export function getUsers(signal?: AbortSignal): Promise<User[]> {
  return getJson<User[]>(`${API_URL}/users`, signal);
}

export function getPosts(userId: number, signal?: AbortSignal): Promise<Post[]> {
  return getJson<Post[]>(`${API_URL}/posts?userId=${userId}`, signal);
}
