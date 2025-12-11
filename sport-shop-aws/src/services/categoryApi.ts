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

/**
 * Flatten category tree to flat array
 * Handles nested categories up to 3 levels deep
 */
function flattenCategoryTree(
  categories: Category[],
  parent: Category | null = null
): Category[] {
  const result: Category[] = [];

  for (const category of categories) {
    // Create a copy of category without children
    // Set parent reference if parent exists
    const flatCategory: Category = {
      ...category,
      parentId: category.parentId || (parent ? parent.id : null),
      parent: parent || undefined,
      children: undefined, // Remove children from flat structure
    };

    result.push(flatCategory);

    // Recursively flatten children if they exist
    if (category.children && category.children.length > 0) {
      const flattenedChildren = flattenCategoryTree(
        category.children,
        flatCategory
      );
      result.push(...flattenedChildren);
    }
  }

  return result;
}

export const categoryApi = {
  // Category CRUD
  getAll: async () => {
    const response = await api.get<{ data: Category[] }>("/api/categories/tree");
    console.log("Category API - Raw response:", response.data);
    
    // Check if categories have categoryAudiences and categoryAttributes
    if (response.data.data && response.data.data.length > 0) {
      const firstCategory = response.data.data[0];
      console.log("Category API - First category structure:", {
        id: firstCategory.id,
        name: firstCategory.name,
        hasCategoryAudiences: !!firstCategory.categoryAudiences,
        categoryAudiencesLength: firstCategory.categoryAudiences?.length || 0,
        hasCategoryAttributes: !!firstCategory.categoryAttributes,
        categoryAttributesLength: firstCategory.categoryAttributes?.length || 0,
        categoryKeys: Object.keys(firstCategory),
      });
    }
    
    // Flatten the tree structure to a flat array
    const flattenedCategories = flattenCategoryTree(response.data.data || []);
    
    // Check flattened categories
    if (flattenedCategories.length > 0) {
      const firstFlattened = flattenedCategories[0];
      console.log("Category API - First flattened category:", {
        id: firstFlattened.id,
        name: firstFlattened.name,
        hasCategoryAudiences: !!firstFlattened.categoryAudiences,
        categoryAudiencesLength: firstFlattened.categoryAudiences?.length || 0,
        hasCategoryAttributes: !!firstFlattened.categoryAttributes,
        categoryAttributesLength: firstFlattened.categoryAttributes?.length || 0,
      });
    }
    
    return {
      ...response.data,
      data: flattenedCategories,
    };
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
