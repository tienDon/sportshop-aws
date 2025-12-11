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
  getAddresses: async (): Promise<UserAddress[]> => {
    try {
      const response = await api.get("/api/user/addresses");
      // Ensure we always return an array, never undefined
      return Array.isArray(response.data?.data) ? response.data.data : [];
    } catch (error) {
      console.error("Error fetching addresses:", error);
      // Return empty array on error to prevent undefined
      return [];
    }
  },

  createAddress: async (data: {
    address_detail: string;
    is_default?: boolean;
  }): Promise<UserAddress> => {
    const response = await api.post("/api/user/addresses", data);
    if (!response.data?.data) {
      throw new Error("Invalid response from create address API");
    }
    return response.data.data as UserAddress;
  },

  updateAddress: async (
    id: number,
    data: { address_detail?: string; is_default?: boolean }
  ): Promise<UserAddress> => {
    const response = await api.put(`/api/user/addresses/${id}`, data);
    if (!response.data?.data) {
      throw new Error("Invalid response from update address API");
    }
    return response.data.data as UserAddress;
  },

  deleteAddress: async (id: number) => {
    const response = await api.delete(`/api/user/addresses/${id}`);
    return response.data || {};
  },

  getPhones: async (): Promise<UserPhone[]> => {
    try {
      const response = await api.get("/api/user/phones");
      // Ensure we always return an array, never undefined
      return Array.isArray(response.data?.data) ? response.data.data : [];
    } catch (error) {
      console.error("Error fetching phones:", error);
      // Return empty array on error to prevent undefined
      return [];
    }
  },

  createPhone: async (data: { phone_number: string; is_default?: boolean }): Promise<UserPhone> => {
    const response = await api.post("/api/user/phones", data);
    if (!response.data?.data) {
      throw new Error("Invalid response from create phone API");
    }
    return response.data.data as UserPhone;
  },

  updatePhone: async (
    id: number,
    data: { phone_number?: string; is_default?: boolean }
  ): Promise<UserPhone> => {
    const response = await api.put(`/api/user/phones/${id}`, data);
    if (!response.data?.data) {
      throw new Error("Invalid response from update phone API");
    }
    return response.data.data as UserPhone;
  },

  deletePhone: async (id: number) => {
    const response = await api.delete(`/api/user/phones/${id}`);
    return response.data || {};
  },
};

export const getUsersForAdmin = async (): Promise<AdminUser[]> => {
  const res = await api.get("/api/users/admin");
  return res.data.data;
};

export const updateUserStatus = async (id: number) => {
  // backend toggles status; no body required
  const res = await api.put(`/api/users/admin/${id}`);
  return res.data;
};

export const deleteUser = async (id: number) => {
  const res = await api.delete(`/api/users/admin/${id}`);
  return res.data;
};

export default {
  getUsersForAdmin,
  updateUserStatus,
  deleteUser,
};
