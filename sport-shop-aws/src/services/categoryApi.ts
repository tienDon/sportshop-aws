import api from "@/lib/axios";

export interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  parent?: Category;
  children?: Category[];
  categoryAudiences?: CategoryAudience[];
  categoryAttributes?: CategoryAttribute[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryAudience {
  id: number;
  categoryId: number;
  audienceId: number;
  sortOrder: number;
  audience: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface CategoryAttribute {
  id: number;
  categoryId: number;
  attributeId: number;
  attribute: {
    id: number;
    name: string;
    code: string;
  };
}

export interface CreateCategoryDTO {
  name: string;
  slug: string;
  parentId?: number | null;
}

export interface UpdateCategoryDTO {
  name?: string;
  slug?: string;
  parentId?: number | null;
}

export const categoryApi = {
  // Category CRUD
  getAll: async () => {
    const response = await api.get<{ data: Category[] }>("/api/categories/all");
    return response.data;
  },

  getTree: async () => {
    const response = await api.get<{ data: Category[] }>(
      "/api/categories/tree"
    );
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<{ data: Category }>(`/api/categories/${id}`);
    return response.data;
  },

  create: async (data: CreateCategoryDTO) => {
    const response = await api.post<{ data: Category }>(
      "/api/categories",
      data
    );
    return response.data;
  },

  update: async (id: number, data: UpdateCategoryDTO) => {
    const response = await api.put<{ data: Category }>(
      `/api/categories/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/api/categories/${id}`);
    return response.data;
  },

  // Audiences
  getAudiences: async (categoryId: number) => {
    const response = await api.get<{ data: CategoryAudience[] }>(
      `/api/categories/${categoryId}/audiences`
    );
    return response.data;
  },

  addAudiences: async (categoryId: number, audienceIds: number[]) => {
    const response = await api.post(`/api/categories/${categoryId}/audiences`, {
      audienceIds,
    });
    return response.data;
  },

  // Attributes
  getAttributes: async (categoryId: number) => {
    const response = await api.get<{ data: CategoryAttribute[] }>(
      `/api/categories/${categoryId}/attributes`
    );
    return response.data;
  },

  addAttributes: async (categoryId: number, attributeIds: number[]) => {
    const response = await api.post(
      `/api/categories/${categoryId}/attributes`,
      { attributeIds }
    );
    return response.data;
  },
};
