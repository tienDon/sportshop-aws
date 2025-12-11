import api from "@/lib/axios";

export interface AttributeValue {
  id: number;
  attributeId: number;
  value: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Attribute {
  id: number;
  name: string;
  code: string;
  values?: AttributeValue[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateAttributeDTO {
  name: string;
  code: string;
}

export interface UpdateAttributeDTO {
  name?: string;
  code?: string;
}

export interface CreateAttributeValueDTO {
  value: string;
  sortOrder?: number;
}

export interface UpdateAttributeValueDTO {
  value?: string;
  sortOrder?: number;
}

export const attributeApi = {
  // Attribute CRUD
  getAll: async () => {
    const response = await api.get<{ data: Attribute[] }>("/api/attributes");
    return response.data;
  },

  getWithValues: async (code?: string) => {
    const url = code
      ? `/api/attributes/with-values?code=${code}`
      : "/api/attributes/with-values";
    const response = await api.get<{ data: Attribute[] }>(url);
    return response.data;
  },

  create: async (data: CreateAttributeDTO) => {
    const response = await api.post<{ data: Attribute }>(
      "/api/attributes",
      data
    );
    return response.data;
  },

  update: async (id: number, data: UpdateAttributeDTO) => {
    const response = await api.put<{ data: Attribute }>(
      `/api/attributes/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/api/attributes/${id}`);
    return response.data;
  },

  // Attribute Value CRUD
  getValues: async (attributeId: number) => {
    const response = await api.get<{ data: AttributeValue[] }>(
      `/api/attributes/${attributeId}/values`
    );
    return response.data;
  },

  createValue: async (attributeId: number, data: CreateAttributeValueDTO) => {
    const response = await api.post<{ data: AttributeValue }>(
      `/api/attributes/${attributeId}/values`,
      data
    );
    return response.data;
  },

  updateValue: async (valueId: number, data: UpdateAttributeValueDTO) => {
    const response = await api.put<{ data: AttributeValue }>(
      `/api/attributes/values/${valueId}`,
      data
    );
    return response.data;
  },

  deleteValue: async (valueId: number) => {
    const response = await api.delete(`/api/attributes/values/${valueId}`);
    return response.data;
  },
};
