import api from "@/lib/axios";

export interface UserAddress {
  id: number;
  user_id: number;
  address_detail: string;
  is_default: boolean;
}

export interface UserPhone {
  id: number;
  user_id: number;
  phone_number: string;
  is_default: boolean;
}
export type AdminUser = {
  id: number;
  avatar?: string;
  name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  isActive?: boolean;
  createdAt?: string;
  // add other fields you need
};

export const UserAPI = {
  getAddresses: async () => {
    const response = await api.get("/api/user/addresses");
    return response.data.data as UserAddress[];
  },

  createAddress: async (data: {
    address_detail: string;
    is_default?: boolean;
  }) => {
    const response = await api.post("/api/user/addresses", data);
    return response.data.data as UserAddress;
  },

  updateAddress: async (
    id: number,
    data: { address_detail?: string; is_default?: boolean }
  ) => {
    const response = await api.put(`/api/user/addresses/${id}`, data);
    return response.data.data as UserAddress;
  },

  deleteAddress: async (id: number) => {
    const response = await api.delete(`/api/user/addresses/${id}`);
    return response.data;
  },

  getPhones: async () => {
    const response = await api.get("/api/user/phones");
    return response.data.data as UserPhone[];
  },

  createPhone: async (data: { phone_number: string; is_default?: boolean }) => {
    const response = await api.post("/api/user/phones", data);
    return response.data.data as UserPhone;
  },

  updatePhone: async (
    id: number,
    data: { phone_number?: string; is_default?: boolean }
  ) => {
    const response = await api.put(`/api/user/phones/${id}`, data);
    return response.data.data as UserPhone;
  },

  deletePhone: async (id: number) => {
    const response = await api.delete(`/api/user/phones/${id}`);
    return response.data;
  },
};

export const getUsersForAdmin = async (): Promise<AdminUser[]> => {
  const res = await api.get("/api/user/admin");
  return res.data.data;
};

export const updateUserStatus = async (id: number) => {
  // backend toggles status; no body required
  const res = await api.put(`/api/user/admin/${id}`);
  return res.data;
};

export const deleteUser = async (id: number) => {
  const res = await api.delete(`/api/user/admin/${id}`);
  return res.data;
};

export default {
  getUsersForAdmin,
  updateUserStatus,
  deleteUser,
};
