import api from "@/lib/axios";
import type { Brand } from "@/types/api";

export interface BrandsResponse {
  success: boolean;
  message: string;
  data: {
    brands: Brand[];
    count: number;
  };
}

export class BrandAPI {
  static async getAllBrands(): Promise<BrandsResponse> {
    const response = await api.get("/api/brands");
    return response.data;
  }
}

export default BrandAPI;
