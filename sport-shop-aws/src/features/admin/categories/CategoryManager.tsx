import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryApi } from "@/services/categoryApi";
import { audienceApi } from "@/services/audienceApi";
import { attributeApi } from "@/services/attributeApi";
import { generateSlug } from "@/utils/slugify";
import type { Category, CreateCategoryDTO } from "@/services/categoryApi";
import type { Audience } from "@/services/audienceApi";
import type { Attribute } from "@/services/attributeApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2, Plus, Loader2, Settings } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

export function CategoryManager() {
  const queryClient = useQueryClient();
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isRelationDialogOpen, setIsRelationDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [managingCategory, setManagingCategory] = useState<Category | null>(
    null
  );
  const [selectedAudiences, setSelectedAudiences] = useState<number[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<number[]>([]);

  // Fetch Categories
  const { data: categoriesData, isLoading: categoriesLoading, isError: categoriesError } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryApi.getAll,
  });

  // Fetch Audiences
  const { data: audiencesData, isError: audiencesError } = useQuery({
    queryKey: ["audiences"],
    queryFn: audienceApi.getAll,
  });

  // Fetch Attributes
  const { data: attributesData, isError: attributesError } = useQuery({
    queryKey: ["attributes"],
    queryFn: attributeApi.getAll,
  });

  const [categoriesWithRelations, setCategoriesWithRelations] = useState<Category[]>([]);
  
  const categories = categoriesData?.data || [];
  const audiences = audiencesData?.data || [];
  const attributes = attributesData?.data || [];
  
  // Fetch relations for all categories if they're not included in the tree response
  useEffect(() => {
    const fetchCategoryRelations = async () => {
      if (categories.length === 0) {
        setCategoriesWithRelations([]);
        return;
      }
      
      // Check if first category already has relations
      const firstCategory = categories[0];
      const hasRelations = firstCategory.categoryAudiences || firstCategory.categoryAttributes;
      
      if (hasRelations) {
        // Relations already included in response
        console.log("CategoryManager - Relations already included in API response");
        setCategoriesWithRelations(categories);
        return;
      }
      
      // Relations not included, fetch them for all categories
      console.log("CategoryManager - Relations not included, fetching for all categories...");
      try {
        const categoriesWithRelationsData = await Promise.all(
          categories.map(async (category) => {
            try {
              const [audiencesResponse, attributesResponse] = await Promise.all([
                categoryApi.getAudiences(category.id).catch((err) => {
                  console.error(`Error fetching audiences for category ${category.id}:`, err);
                  return { data: [] };
                }),
                categoryApi.getAttributes(category.id).catch((err) => {
                  console.error(`Error fetching attributes for category ${category.id}:`, err);
                  return { data: [] };
                }),
              ]);
              
              // Log the response structure for debugging (only for first category)
              if (category.id === 1) {
                console.log(`Category ${category.id} - Attributes response:`, {
                  attributesResponse,
                  attributesData: attributesResponse.data,
                  firstAttribute: attributesResponse.data?.[0],
                  attributesDataKeys: attributesResponse.data?.[0] ? Object.keys(attributesResponse.data[0]) : [],
                });
              }
              
              return {
                ...category,
                categoryAudiences: audiencesResponse.data || [],
                categoryAttributes: attributesResponse.data || [],
              };
            } catch (error) {
              console.error(`Error fetching relations for category ${category.id}:`, error);
              return category;
            }
          })
        );
        
        console.log("CategoryManager - Fetched relations for all categories:", {
          count: categoriesWithRelationsData.length,
          firstCategory: categoriesWithRelationsData[0] ? {
            id: categoriesWithRelationsData[0].id,
            name: categoriesWithRelationsData[0].name,
            categoryAudiencesLength: categoriesWithRelationsData[0].categoryAudiences?.length || 0,
            categoryAttributesLength: categoriesWithRelationsData[0].categoryAttributes?.length || 0,
          } : null,
        });
        
        setCategoriesWithRelations(categoriesWithRelationsData);
      } catch (error) {
        console.error("Error fetching category relations:", error);
        setCategoriesWithRelations(categories);
      }
    };
    
    fetchCategoryRelations();
  }, [categories]);
  
  // Use categories with relations if available, otherwise use original categories
  const displayCategories = categoriesWithRelations.length > 0 ? categoriesWithRelations : categories;
  
  // Debug: Log categories to check structure
  console.log("CategoryManager - Display Categories:", {
    count: displayCategories.length,
    firstCategory: displayCategories[0] ? {
      id: displayCategories[0].id,
      name: displayCategories[0].name,
      hasCategoryAudiences: !!displayCategories[0].categoryAudiences,
      categoryAudiencesLength: displayCategories[0].categoryAudiences?.length || 0,
      categoryAudiences: displayCategories[0].categoryAudiences,
      hasCategoryAttributes: !!displayCategories[0].categoryAttributes,
      categoryAttributesLength: displayCategories[0].categoryAttributes?.length || 0,
      categoryAttributes: displayCategories[0].categoryAttributes,
      categoryKeys: Object.keys(displayCategories[0] || {}),
    } : null,
  });

  // Category Form
  const categoryForm = useForm<CreateCategoryDTO>({
    defaultValues: {
      name: "",
      slug: "",
      parentId: null,
    },
  });

  // Handlers
  const handleCreateCategory = () => {
    setEditingCategory(null);
    categoryForm.reset({ name: "", slug: "", parentId: null });
    setIsCategoryDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    categoryForm.reset({
      name: category.name,
      slug: category.slug,
      parentId: category.parentId,
    });
    setIsCategoryDialogOpen(true);
  };

  const handleManageRelations = (category: Category) => {
    setManagingCategory(category);
    // Extract audience IDs - handle both nested object and ID-only cases
    const audienceIds = category.categoryAudiences?.map((ca) => 
      ca.audienceId || (ca.audience?.id) || ca.id
    ).filter((id): id is number => typeof id === 'number') || [];
    
    // Extract attribute IDs - handle both nested object and ID-only cases
    const attributeIds = category.categoryAttributes?.map((ca) => 
      ca.attributeId || (ca.attribute?.id) || ca.id
    ).filter((id): id is number => typeof id === 'number') || [];
    
    setSelectedAudiences(audienceIds);
    setSelectedAttributes(attributeIds);
    setIsRelationDialogOpen(true);
  };

  // Mutations
  const createCategoryMutation = useMutation({
    mutationFn: categoryApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Tạo danh mục thành công");
      setIsCategoryDialogOpen(false);
    },
    onError: () => {
      toast.error("Lỗi khi tạo danh mục");
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateCategoryDTO }) =>
      categoryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Cập nhật danh mục thành công");
      setIsCategoryDialogOpen(false);
    },
    onError: () => {
      toast.error("Lỗi khi cập nhật danh mục");
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: categoryApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Xóa danh mục thành công");
    },
    onError: () => {
      toast.error("Lỗi khi xóa danh mục");
    },
  });

  const addAudiencesMutation = useMutation({
    mutationFn: ({
      categoryId,
      audienceIds,
    }: {
      categoryId: number;
      audienceIds: number[];
    }) => categoryApi.addAudiences(categoryId, audienceIds),
    onError: (error) => {
      console.error("Error adding audiences:", error);
      toast.error("Lỗi khi cập nhật đối tượng");
    },
  });

  const addAttributesMutation = useMutation({
    mutationFn: ({
      categoryId,
      attributeIds,
    }: {
      categoryId: number;
      attributeIds: number[];
    }) => categoryApi.addAttributes(categoryId, attributeIds),
    onError: (error) => {
      console.error("Error adding attributes:", error);
      toast.error("Lỗi khi cập nhật thuộc tính");
    },
  });

  const onSubmitCategory = (data: CreateCategoryDTO) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data });
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  const handleSaveRelations = async () => {
    if (!managingCategory) return;

    try {
      // Gọi cả 2 mutations song song
      await Promise.all([
        addAudiencesMutation.mutateAsync({
          categoryId: managingCategory.id,
          audienceIds: selectedAudiences,
        }),
        addAttributesMutation.mutateAsync({
          categoryId: managingCategory.id,
          attributeIds: selectedAttributes,
        }),
      ]);

      // Đóng dialog và reset state
      setIsRelationDialogOpen(false);
      setManagingCategory(null);
      setSelectedAudiences([]);
      setSelectedAttributes([]);

      // Reload data
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Cập nhật quan hệ thành công");
    } catch (error) {
      // Error handled by mutations
      console.error("Error saving relations:", error);
    }
  };

  const handleDeleteCategory = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      deleteCategoryMutation.mutate(id);
    }
  };

  if (categoriesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Quản lý Danh mục</h2>
        <Button onClick={handleCreateCategory}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm danh mục
        </Button>
      </div>

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  ID
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Tên
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Slug
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Danh mục cha
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Đối tượng
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Thuộc tính
                </th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {categoriesError ? (
                <tr>
                  <td colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-red-500 font-semibold">
                        Đã xảy ra lỗi khi tải danh mục.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Vui lòng thử lại sau hoặc liên hệ quản trị viên.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : displayCategories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="h-24 text-center">
                    Không có dữ liệu.
                  </td>
                </tr>
              ) : (
                displayCategories.map((category) => (
                  <tr
                    key={category.id}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="p-4 align-middle">{category.id}</td>
                    <td className="p-4 align-middle font-medium">
                      {category.name}
                    </td>
                    <td className="p-4 align-middle">{category.slug}</td>
                    <td className="p-4 align-middle">
                      {category.parent?.name || "-"}
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex flex-wrap gap-1">
                        {category.categoryAudiences?.length ? (
                          category.categoryAudiences.map((ca, index) => {
                            // Handle both nested object and ID-only cases
                            const audienceName = ca.audience?.name || 
                              audiences.find(a => a.id === ca.audienceId)?.name || 
                              `Audience ID: ${ca.audienceId}`;
                            
                            return (
                              <Badge
                                key={`audience-${category.id}-${index}`}
                                variant="secondary"
                                className="text-xs"
                              >
                                {audienceName}
                              </Badge>
                            );
                          })
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex flex-wrap gap-1">
                        {category.categoryAttributes?.length ? (
                          category.categoryAttributes.map((ca, index) => {
                            // Log for debugging
                            if (index === 0) {
                              console.log(`Category ${category.id} - Attribute item:`, {
                                ca,
                                hasAttribute: !!ca.attribute,
                                hasAttributeId: !!ca.attributeId,
                                attributeId: ca.attributeId,
                                attributeName: ca.attribute?.name,
                                allKeys: Object.keys(ca),
                              });
                            }
                            
                            // Handle multiple possible structures:
                            // 1. ca.attribute.name (nested object)
                            // 2. ca.attributeId (ID only, need to find from attributes array)
                            // 3. ca.id (if ca is the attribute itself)
                            let attributeName: string | undefined;
                            
                            if (ca.attribute?.name) {
                              attributeName = ca.attribute.name;
                            } else if (ca.attributeId) {
                              attributeName = attributes.find(a => a.id === ca.attributeId)?.name;
                            } else if ((ca as any).name) {
                              // If ca itself is an attribute object
                              attributeName = (ca as any).name;
                            } else if (ca.id) {
                              // Try to find by ca.id as attributeId
                              attributeName = attributes.find(a => a.id === ca.id)?.name;
                            }
                            
                            if (!attributeName) {
                              console.warn(`Could not resolve attribute name for category ${category.id}:`, ca);
                              return null; // Don't render if we can't find the name
                            }
                            
                            return (
                              <Badge
                                key={`attribute-${category.id}-${index}`}
                                variant="outline"
                                className="text-xs"
                              >
                                {attributeName}
                              </Badge>
                            );
                          }).filter(Boolean) // Remove null entries
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleManageRelations(category)}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Dialog */}
      <Dialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Cập nhật thông tin danh mục"
                : "Tạo danh mục mới cho hệ thống"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={categoryForm.handleSubmit(onSubmitCategory)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">
                  Tên danh mục <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  {...categoryForm.register("name", {
                    required: "Tên là bắt buộc",
                  })}
                  placeholder="Giày chạy bộ, Quần áo..."
                  onChange={(e) => {
                    categoryForm.setValue("name", e.target.value);
                    categoryForm.setValue("slug", generateSlug(e.target.value));
                  }}
                />
                {categoryForm.formState.errors.name && (
                  <span className="text-sm text-red-500">
                    {categoryForm.formState.errors.name.message}
                  </span>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="slug">
                  Slug <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="slug"
                  {...categoryForm.register("slug", {
                    required: "Slug là bắt buộc",
                  })}
                  placeholder="giay-chay-bo, quan-ao..."
                  readOnly
                  className="bg-muted"
                />
                {categoryForm.formState.errors.slug && (
                  <span className="text-sm text-red-500">
                    {categoryForm.formState.errors.slug.message}
                  </span>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="parentId">Danh mục cha (nếu có)</Label>
                <Controller
                  name="parentId"
                  control={categoryForm.control}
                  render={({ field }) => (
                    <Select
                      value={field.value?.toString() || "none"}
                      onValueChange={(value) =>
                        field.onChange(value === "none" ? null : Number(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục cha" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Không có</SelectItem>
                        {categories
                          .filter((c) => c.id !== editingCategory?.id)
                          .map((category) => (
                            <SelectItem
                              key={category.id}
                              value={category.id.toString()}
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCategoryDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={
                  createCategoryMutation.isPending ||
                  updateCategoryMutation.isPending
                }
              >
                {createCategoryMutation.isPending ||
                updateCategoryMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : editingCategory ? (
                  "Cập nhật"
                ) : (
                  "Tạo mới"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Relations Dialog */}
      <Dialog
        open={isRelationDialogOpen}
        onOpenChange={setIsRelationDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quản lý quan hệ: {managingCategory?.name}</DialogTitle>
            <DialogDescription>
              Chọn đối tượng và thuộc tính cho danh mục này
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {/* Audiences */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Đối tượng</Label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded">
                {audiences.map((audience) => (
                  <div
                    key={audience.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`audience-${audience.id}`}
                      checked={selectedAudiences.includes(audience.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedAudiences([
                            ...selectedAudiences,
                            audience.id,
                          ]);
                        } else {
                          setSelectedAudiences(
                            selectedAudiences.filter((id) => id !== audience.id)
                          );
                        }
                      }}
                    />
                    <label
                      htmlFor={`audience-${audience.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {audience.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Attributes */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Thuộc tính</Label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded">
                {attributes.map((attribute) => (
                  <div
                    key={attribute.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`attribute-${attribute.id}`}
                      checked={selectedAttributes.includes(attribute.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedAttributes([
                            ...selectedAttributes,
                            attribute.id,
                          ]);
                        } else {
                          setSelectedAttributes(
                            selectedAttributes.filter(
                              (id) => id !== attribute.id
                            )
                          );
                        }
                      }}
                    />
                    <label
                      htmlFor={`attribute-${attribute.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {attribute.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRelationDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSaveRelations}
              disabled={
                addAudiencesMutation.isPending ||
                addAttributesMutation.isPending
              }
            >
              {addAudiencesMutation.isPending ||
              addAttributesMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Lưu"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
