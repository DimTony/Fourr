import { api } from "@/lib/api";

export async function getProfile(id: string) {
  return await api.get(`/api/profiles/${id}`);
}