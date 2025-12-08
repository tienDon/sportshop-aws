import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";

export interface Color {
  id: number;
  name: string;
  hexCode: string;
}

export const ColorAPI = {
  getAllColors: async () => {
    const response = await api.get<ApiResponse<Color[]>>("/api/colors");
    return response.data;
  },
};
