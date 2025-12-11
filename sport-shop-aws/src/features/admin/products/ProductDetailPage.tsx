import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { generateSlug } from "@/utils/slugify";
import {
  productAdminApi,
  type Product,
  type ProductVariant,
  type CreateVariantDTO,
  type UpdateVariantDTO,
} from "@/services/productAdminApi";
import { colorApi } from "@/services/colorApi";
import { sizeApi } from "@/services/sizeApi";
import { categoryApi } from "@/services/categoryApi";
import { audienceApi } from "@/services/audienceApi";
import { sportApi } from "@/services/sportApi";
import {
  attributeApi,
  type Attribute,
  type AttributeValue,
} from "@/services/attributeApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Pencil, Trash2, ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

export function ProductDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Extract ID from URL path
  const match = location.pathname.match(/\/admin\/products\/(\d+)/);
  const id = match ? match[1] : null;
  const [isVariantDialogOpen, setIsVariantDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(
    null
  );
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingAudience, setIsAddingAudience] = useState(false);
  const [isAddingSport, setIsAddingSport] = useState(false);
  const [isAddingAttribute, setIsAddingAttribute] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);
  const [selectedAudienceId, setSelectedAudienceId] = useState<number>(0);
  const [selectedSportId, setSelectedSportId] = useState<number>(0);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // Fetch product details
  const { data: productData, isLoading } = useQuery({
    queryKey: ["product-detail", id],
    queryFn: () => productAdminApi.getById(Number(id)),
    enabled: !!id,
  });

  const product = productData?.data;

  // Fetch colors and sizes
  const { data: colorsData } = useQuery({
    queryKey: ["colors"],
    queryFn: colorApi.getAll,
  });

  const { data: sizesData } = useQuery({
    queryKey: ["sizes"],
    queryFn: () => sizeApi.getAll(),
  });

  // Fetch categories, audiences, sports
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryApi.getAll,
  });

  const { data: audiencesData } = useQuery({
    queryKey: ["audiences"],
    queryFn: audienceApi.getAll,
  });

  const { data: sportsData } = useQuery({
    queryKey: ["sports"],
    queryFn: sportApi.getAll,
  });

  const { data: attributesData } = useQuery({
    queryKey: ["attributes-with-values"],
    queryFn: () => attributeApi.getWithValues(),
  });

  const colors = colorsData?.data || [];
  const sizes = Array.isArray(sizesData?.data) ? sizesData.data : [];
  const categories = categoriesData?.data || [];
  const audiences = audiencesData?.data || [];
  const sports = sportsData?.data || [];
  const attributes =
    (attributesData as { data: Attribute[] } | undefined)?.data || [];

  // Product update form
  const productForm = useForm({
    defaultValues: {
      name: product?.name || "",
      slug: product?.slug || "",
      basePrice: product?.basePrice || 0,
      description: product?.description || "",
      specifications: product?.specifications || "",
      mainImageUrl: product?.mainImageUrl || "",
      isActive: product?.isActive ?? true,
    },
  });

  // Variant form
  const variantForm = useForm<CreateVariantDTO>({
    defaultValues: {
      colorId: 0,
      sizeId: 0,
      price: 0,
      stockQuantity: 0,
      sku: "",
      imageUrls: [],
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      productAdminApi.update(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-detail", id] });
      toast.success("Cập nhật sản phẩm thành công");
    },
    onError: () => {
      toast.error("Lỗi khi cập nhật sản phẩm");
    },
  });

  // Variant mutations
  const createVariantMutation = useMutation({
    mutationFn: (data: CreateVariantDTO) =>
      productAdminApi.createVariant(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-detail", id] });
      toast.success("Tạo biến thể thành công");
      setIsVariantDialogOpen(false);
      variantForm.reset();
    },
    onError: () => {
      toast.error("Lỗi khi tạo biến thể");
    },
  });

  const updateVariantMutation = useMutation({
    mutationFn: ({
      variantId,
      data,
    }: {
      variantId: number;
      data: UpdateVariantDTO;
    }) => productAdminApi.updateVariant(Number(id), variantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-detail", id] });
      toast.success("Cập nhật biến thể thành công");
      setIsVariantDialogOpen(false);
      setEditingVariant(null);
      variantForm.reset();
    },
    onError: () => {
      toast.error("Lỗi khi cập nhật biến thể");
    },
  });

  const deleteVariantMutation = useMutation({
    mutationFn: (variantId: number) =>
      productAdminApi.deleteVariant(Number(id), variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-detail", id] });
      toast.success("Xóa biến thể thành công");
    },
    onError: () => {
      toast.error("Lỗi khi xóa biến thể");
    },
  });

  // Relation mutations
  const addCategoryMutation = useMutation({
    mutationFn: (categoryId: number) =>
      productAdminApi.addCategory(Number(id), categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-detail", id] });
      toast.success("Thêm danh mục thành công");
      setIsAddingCategory(false);
      setSelectedCategoryId(0);
    },
    onError: () => {
      toast.error("Lỗi khi thêm danh mục");
    },
  });

  const removeCategoryMutation = useMutation({
    mutationFn: (categoryId: number) =>
      productAdminApi.removeCategory(Number(id), categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-detail", id] });
      toast.success("Xóa danh mục thành công");
    },
    onError: () => {
      toast.error("Lỗi khi xóa danh mục");
    },
  });

  const addAudienceMutation = useMutation({
    mutationFn: (audienceId: number) =>
      productAdminApi.addAudience(Number(id), audienceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-detail", id] });
      toast.success("Thêm đối tượng thành công");
      setIsAddingAudience(false);
      setSelectedAudienceId(0);
    },
    onError: () => {
      toast.error("Lỗi khi thêm đối tượng");
    },
  });

  const removeAudienceMutation = useMutation({
    mutationFn: (audienceId: number) =>
      productAdminApi.removeAudience(Number(id), audienceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-detail", id] });
      toast.success("Xóa đối tượng thành công");
    },
    onError: () => {
      toast.error("Lỗi khi xóa đối tượng");
    },
  });

  const addSportMutation = useMutation({
    mutationFn: (sportId: number) =>
      productAdminApi.addSport(Number(id), sportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-detail", id] });
      toast.success("Thêm môn thể thao thành công");
      setIsAddingSport(false);
      setSelectedSportId(0);
    },
    onError: () => {
      toast.error("Lỗi khi thêm môn thể thao");
    },
  });

  const removeSportMutation = useMutation({
    mutationFn: (sportId: number) =>
      productAdminApi.removeSport(Number(id), sportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-detail", id] });
      toast.success("Xóa môn thể thao thành công");
    },
    onError: () => {
      toast.error("Lỗi khi xóa môn thể thao");
    },
  });

  const addAttributeValueMutation = useMutation({
    mutationFn: (attributeValueId: number) =>
      productAdminApi.addAttributeValue(Number(id), attributeValueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-detail", id] });
      toast.success("Thêm thuộc tính thành công");
    },
    onError: () => {
      toast.error("Lỗi khi thêm thuộc tính");
    },
  });

  const removeAttributeValueMutation = useMutation({
    mutationFn: (attributeValueId: number) =>
      productAdminApi.removeAttributeValue(Number(id), attributeValueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-detail", id] });
      toast.success("Xóa thuộc tính thành công");
    },
    onError: () => {
      toast.error("Lỗi khi xóa thuộc tính");
    },
  });

  // Handlers
  const handleCreateVariant = () => {
    setEditingVariant(null);
    setImageUrls([]);
    variantForm.reset({
      colorId: 0,
      sizeId: 0,
      price: Number(product?.basePrice) || 0,
      stockQuantity: 0,
      sku: "",
      imageUrls: [],
    });
    setIsVariantDialogOpen(true);
  };

  const handleEditVariant = (variant: ProductVariant) => {
    setEditingVariant(variant);
    const urls = variant.imageUrls || [];
    setImageUrls(urls);
    variantForm.reset({
      colorId: variant.colorId,
      sizeId: variant.sizeId,
      price: Number(variant.price),
      stockQuantity: variant.stockQuantity,
      sku: variant.sku || "",
      imageUrls: urls,
    });
    setIsVariantDialogOpen(true);
  };

  const handleDeleteVariant = (variantId: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa biến thể này?")) {
      deleteVariantMutation.mutate(variantId);
    }
  };

  const onSubmitVariant = (data: CreateVariantDTO) => {
    const variantData = {
      ...data,
      imageUrls: imageUrls.filter((url) => url.trim() !== ""),
    };
    if (editingVariant) {
      updateVariantMutation.mutate({
        variantId: editingVariant.id,
        data: variantData,
      });
    } else {
      createVariantMutation.mutate(variantData);
    }
  };

  const onSubmitProduct = (data: Partial<Product>) => {
    updateProductMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-lg text-muted-foreground">Không tìm thấy sản phẩm</p>
        <Button onClick={() => navigate("/admin/products")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/products")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {product.name}
            </h2>
            <p className="text-sm text-muted-foreground">{product.slug}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info">Thông tin</TabsTrigger>
          <TabsTrigger value="variants">
            Biến thể ({product.variants?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="relations">Phân loại</TabsTrigger>
          <TabsTrigger value="attributes">Thuộc tính</TabsTrigger>
        </TabsList>

        {/* Tab: Thông tin sản phẩm */}
        <TabsContent value="info" className="space-y-4">
          <form
            onSubmit={productForm.handleSubmit(onSubmitProduct)}
            className="space-y-4 border rounded-lg p-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tên sản phẩm</Label>
                <Input
                  {...productForm.register("name")}
                  onChange={(e) => {
                    productForm.setValue("name", e.target.value);
                    productForm.setValue("slug", generateSlug(e.target.value));
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  {...productForm.register("slug")}
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label>Giá gốc</Label>
                <Input
                  type="number"
                  {...productForm.register("basePrice", {
                    valueAsNumber: true,
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Controller
                  name="isActive"
                  control={productForm.control}
                  render={({ field }) => (
                    <Select
                      value={field.value ? "true" : "false"}
                      onValueChange={(value) =>
                        field.onChange(value === "true")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Hoạt động</SelectItem>
                        <SelectItem value="false">Ẩn</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>URL hình ảnh chính</Label>
              <Input {...productForm.register("mainImageUrl")} />
            </div>
            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Textarea {...productForm.register("description")} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Thông số kỹ thuật</Label>
              <Textarea {...productForm.register("specifications")} rows={3} />
            </div>
            <Button type="submit" disabled={updateProductMutation.isPending}>
              {updateProductMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </form>

          <div className="border rounded-lg p-6 space-y-2">
            <h4 className="font-semibold">Thông tin khác</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Thương hiệu:</span>{" "}
                {product.brand.name}
              </div>
              <div>
                <span className="text-muted-foreground">Badge:</span>{" "}
                {product.badge?.name || "-"}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Biến thể */}
        <TabsContent value="variants" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Quản lý các biến thể màu sắc và kích thước
            </p>
            <Button onClick={handleCreateVariant} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Thêm biến thể
            </Button>
          </div>

          <div className="border rounded-lg">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="p-3 text-left">Màu</th>
                  <th className="p-3 text-left">Size</th>
                  <th className="p-3 text-right">Giá</th>
                  <th className="p-3 text-right">Tồn kho</th>
                  <th className="p-3 text-left">SKU</th>
                  <th className="p-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {!product.variants || product.variants.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-muted-foreground"
                    >
                      Chưa có biến thể nào
                    </td>
                  </tr>
                ) : (
                  product.variants.map((variant) => (
                    <tr key={variant.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded border"
                            style={{
                              backgroundColor: variant.color.hexCode,
                            }}
                          />
                          <span>{variant.color.name}</span>
                        </div>
                      </td>
                      <td className="p-3">{variant.size.name}</td>
                      <td className="p-3 text-right">
                        {Number(variant.price).toLocaleString("vi-VN")}đ
                      </td>
                      <td className="p-3 text-right">
                        <Badge
                          variant={
                            variant.stockQuantity > 0 ? "default" : "secondary"
                          }
                        >
                          {variant.stockQuantity}
                        </Badge>
                      </td>
                      <td className="p-3">{variant.sku || "-"}</td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditVariant(variant)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteVariant(variant.id)}
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
        </TabsContent>

        {/* Tab: Phân loại (Categories, Audiences, Sports) */}
        <TabsContent value="relations" className="space-y-6">
          {/* Categories */}
          <div className="border rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Danh mục</h4>
              <Button
                size="sm"
                onClick={() => setIsAddingCategory(!isAddingCategory)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm danh mục
              </Button>
            </div>

            {isAddingCategory && (
              <div className="flex gap-2">
                <Select
                  value={selectedCategoryId.toString()}
                  onValueChange={(value) =>
                    setSelectedCategoryId(Number(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => addCategoryMutation.mutate(selectedCategoryId)}
                  disabled={
                    !selectedCategoryId || addCategoryMutation.isPending
                  }
                >
                  Thêm
                </Button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {product.productCategories?.map((pc) => (
                <Badge
                  key={pc.categoryId}
                  variant="secondary"
                  className="gap-2"
                >
                  {pc.category.name}
                  <button
                    onClick={() => removeCategoryMutation.mutate(pc.categoryId)}
                    className="hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              )) || (
                <p className="text-sm text-muted-foreground">
                  Chưa có danh mục
                </p>
              )}
            </div>
          </div>

          {/* Audiences */}
          <div className="border rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Đối tượng</h4>
              <Button
                size="sm"
                onClick={() => setIsAddingAudience(!isAddingAudience)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm đối tượng
              </Button>
            </div>

            {isAddingAudience && (
              <div className="flex gap-2">
                <Select
                  value={selectedAudienceId.toString()}
                  onValueChange={(value) =>
                    setSelectedAudienceId(Number(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn đối tượng" />
                  </SelectTrigger>
                  <SelectContent>
                    {audiences.map((aud) => (
                      <SelectItem key={aud.id} value={aud.id.toString()}>
                        {aud.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => addAudienceMutation.mutate(selectedAudienceId)}
                  disabled={
                    !selectedAudienceId || addAudienceMutation.isPending
                  }
                >
                  Thêm
                </Button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {product.productAudiences?.map((pa) => (
                <Badge key={pa.audienceId} variant="outline" className="gap-2">
                  {pa.audience.name}
                  <button
                    onClick={() => removeAudienceMutation.mutate(pa.audienceId)}
                    className="hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              )) || (
                <p className="text-sm text-muted-foreground">
                  Chưa có đối tượng
                </p>
              )}
            </div>
          </div>

          {/* Sports */}
          <div className="border rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Môn thể thao</h4>
              <Button
                size="sm"
                onClick={() => setIsAddingSport(!isAddingSport)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm môn thể thao
              </Button>
            </div>

            {isAddingSport && (
              <div className="flex gap-2">
                <Select
                  value={selectedSportId.toString()}
                  onValueChange={(value) => setSelectedSportId(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn môn thể thao" />
                  </SelectTrigger>
                  <SelectContent>
                    {sports.map((sport) => (
                      <SelectItem key={sport.id} value={sport.id.toString()}>
                        {sport.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => addSportMutation.mutate(selectedSportId)}
                  disabled={!selectedSportId || addSportMutation.isPending}
                >
                  Thêm
                </Button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {product.productSports?.map((ps) => (
                <Badge key={ps.sportId} variant="outline" className="gap-2">
                  {ps.sport.name}
                  <button
                    onClick={() => removeSportMutation.mutate(ps.sportId)}
                    className="hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              )) || (
                <p className="text-sm text-muted-foreground">
                  Chưa có môn thể thao
                </p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tab: Thuộc tính */}
        <TabsContent value="attributes" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Các thuộc tính của sản phẩm
            </p>
            <Button
              size="sm"
              onClick={() => setIsAddingAttribute(!isAddingAttribute)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm thuộc tính
            </Button>
          </div>

          {isAddingAttribute && (
            <div className="border rounded-lg p-4 space-y-4">
              <h5 className="font-semibold text-sm">Chọn thuộc tính để thêm</h5>
              <div className="space-y-4">
                {attributes.map((attr: Attribute) => (
                  <div key={attr.id} className="space-y-2">
                    <Label className="text-sm font-medium">{attr.name}</Label>
                    <div className="flex flex-wrap gap-2">
                      {attr.values?.map((val: AttributeValue) => {
                        const isAdded = product.productAttributeValues?.some(
                          (pav) => pav.attributeValueId === val.id
                        );
                        return (
                          <Button
                            key={val.id}
                            type="button"
                            size="sm"
                            variant={isAdded ? "secondary" : "outline"}
                            disabled={
                              isAdded || addAttributeValueMutation.isPending
                            }
                            onClick={() =>
                              addAttributeValueMutation.mutate(val.id)
                            }
                          >
                            {isAdded && "✓ "}
                            {val.value}
                          </Button>
                        );
                      })}
                      {(!attr.values || attr.values.length === 0) && (
                        <p className="text-xs text-muted-foreground italic">
                          Chưa có giá trị nào
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!product.productAttributeValues ||
          product.productAttributeValues.length === 0 ? (
            <div className="border rounded-lg p-8 text-center text-muted-foreground">
              <p className="mb-2">Chưa có thuộc tính nào</p>
              <p className="text-xs">
                Click "Thêm thuộc tính" để chọn thuộc tính cho sản phẩm
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Group by attribute */}
              {Object.entries(
                product.productAttributeValues.reduce(
                  (
                    acc: Record<string, typeof product.productAttributeValues>,
                    pav
                  ) => {
                    const attrName = pav.attributeValue.attribute.name;
                    if (!acc[attrName]) {
                      acc[attrName] = [];
                    }
                    acc[attrName].push(pav);
                    return acc;
                  },
                  {}
                )
              ).map(([attrName, values]) => (
                <div key={attrName} className="border rounded-lg p-4">
                  <h5 className="font-semibold text-sm mb-3">{attrName}</h5>
                  <div className="flex flex-wrap gap-2">
                    {values.map((pav) => (
                      <Badge
                        key={pav.attributeValueId}
                        variant="secondary"
                        className="gap-2"
                      >
                        {pav.attributeValue.value}
                        <button
                          onClick={() =>
                            removeAttributeValueMutation.mutate(
                              pav.attributeValueId
                            )
                          }
                          className="hover:text-red-500"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Variant Create/Edit Dialog */}
      <Dialog open={isVariantDialogOpen} onOpenChange={setIsVariantDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingVariant ? "Chỉnh sửa biến thể" : "Thêm biến thể mới"}
            </DialogTitle>
            <DialogDescription>
              Chọn màu sắc, kích thước và nhập thông tin biến thể
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={variantForm.handleSubmit(onSubmitVariant)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>
                  Màu sắc <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="colorId"
                  control={variantForm.control}
                  rules={{ required: "Vui lòng chọn màu" }}
                  render={({ field }) => (
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn màu" />
                      </SelectTrigger>
                      <SelectContent>
                        {colors.map((color) => (
                          <SelectItem
                            key={color.id}
                            value={color.id.toString()}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded border"
                                style={{ backgroundColor: color.hexCode }}
                              />
                              {color.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="grid gap-2">
                <Label>
                  Kích thước <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="sizeId"
                  control={variantForm.control}
                  rules={{ required: "Vui lòng chọn kích thước" }}
                  render={({ field }) => (
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn kích thước" />
                      </SelectTrigger>
                      <SelectContent>
                        {sizes.map((size) => (
                          <SelectItem key={size.id} value={size.id.toString()}>
                            {size.name} + {size.chartType}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="grid gap-2">
                <Label>
                  Giá <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  {...variantForm.register("price", {
                    required: "Vui lòng nhập giá",
                    valueAsNumber: true,
                  })}
                  placeholder="0"
                />
              </div>

              <div className="grid gap-2">
                <Label>
                  Số lượng tồn kho <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  {...variantForm.register("stockQuantity", {
                    required: "Vui lòng nhập số lượng",
                    valueAsNumber: true,
                  })}
                  placeholder="0"
                />
              </div>

              <div className="grid gap-2">
                <Label>SKU (Mã sản phẩm)</Label>
                <Input
                  {...variantForm.register("sku")}
                  placeholder="VD: NIKE-AIR-BLK-42"
                />
              </div>

              <div className="grid gap-2">
                <Label>Hình ảnh sản phẩm</Label>
                <div className="space-y-2">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={url}
                        onChange={(e) => {
                          const newUrls = [...imageUrls];
                          newUrls[index] = e.target.value;
                          setImageUrls(newUrls);
                        }}
                        placeholder="https://example.com/image.jpg"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newUrls = imageUrls.filter(
                            (_, i) => i !== index
                          );
                          setImageUrls(newUrls);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setImageUrls([...imageUrls, ""])}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm URL hình ảnh
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsVariantDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={
                  createVariantMutation.isPending ||
                  updateVariantMutation.isPending
                }
              >
                {createVariantMutation.isPending ||
                updateVariantMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : editingVariant ? (
                  "Cập nhật"
                ) : (
                  "Tạo mới"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
