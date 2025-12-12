import api from "@/lib/axios";

export interface UserAddress {
  id: number;
  user_id: number;
  addressDetail: string;
  defaultAddress: boolean;
}

export interface UserPhone {
  id: number;
  user_id: number;
  phoneNumber: string;
  defaultPhone: boolean;
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
      // API trả về array trực tiếp hoặc có wrapper { data: [...] }
      const data = response.data;
      if (Array.isArray(data)) {
        return data;
      }
      if (Array.isArray(data?.data)) {
        return data.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching addresses:", error);
      return [];
    }
  },

  createAddress: async (data: {
    addressDetail?: string;
    defaultAddress?: boolean;
  }): Promise<UserAddress> => {
    const response = await api.post("/api/user/addresses", data);
    // API có thể trả về object trực tiếp hoặc có wrapper { data: {...} }
    const result = response.data?.data || response.data;
    if (!result) {
      throw new Error("Invalid response from create address API");
    }
    return result as UserAddress;
  },

  updateAddress: async (
    id: number,
    data: {
      addressDetail?: string;
      defaultAddress?: boolean;
    }
  ): Promise<UserAddress> => {
    const response = await api.put(`/api/user/addresses/${id}`, data);
    // API có thể trả về object trực tiếp hoặc có wrapper { data: {...} }
    const result = response.data?.data || response.data;
    if (!result) {
      throw new Error("Invalid response from update address API");
    }
    return result as UserAddress;
  },

  deleteAddress: async (id: number) => {
    const response = await api.delete(`/api/user/addresses/${id}`);
    return response.data || {};
  },

  getPhones: async (): Promise<UserPhone[]> => {
    try {
      const response = await api.get("/api/user/phones");
      // API trả về array trực tiếp hoặc có wrapper { data: [...] }
      const data = response.data;
      if (Array.isArray(data)) {
        return data;
      }
      if (Array.isArray(data?.data)) {
        return data.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching phones:", error);
      return [];
    }
  },

  createPhone: async (data: {
    phoneNumber: string;
    defaultPhone?: boolean;
  }): Promise<UserPhone> => {
    const response = await api.post("/api/user/phones", data);
    // API có thể trả về object trực tiếp hoặc có wrapper { data: {...} }
    const result = response.data?.data || response.data;
    if (!result) {
      throw new Error("Invalid response from create phone API");
    }
    return result as UserPhone;
  },

  updatePhone: async (
    id: number,
    data: { phoneNumber?: string; defaultPhone?: boolean }
  ): Promise<UserPhone> => {
    const response = await api.put(`/api/user/phones/${id}`, data);
    // API có thể trả về object trực tiếp hoặc có wrapper { data: {...} }
    const result = response.data?.data || response.data;
    if (!result) {
      throw new Error("Invalid response from update phone API");
    }
    return result as UserPhone;
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
