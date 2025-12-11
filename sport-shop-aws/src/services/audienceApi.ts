import api from "@/lib/axios";

export interface Audience {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAudienceDTO {
  name: string;
  slug: string;
}

export interface UpdateAudienceDTO {
  name?: string;
  slug?: string;
}

export const audienceApi = {
  getAll: async () => {
    const response = await api.get<{ data: Audience[] }>("/api/audiences");
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<{ data: Audience }>(`/api/audiences/${id}`);
    return response.data;
  },

  create: async (data: CreateAudienceDTO) => {
    const response = await api.post<{ data: Audience }>("/api/audiences", data);
    return response.data;
  },

  update: async (id: number, data: UpdateAudienceDTO) => {
    const response = await api.put<{ data: Audience }>(
      `/api/audiences/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/api/audiences/${id}`);
    return response.data;
  },
};
