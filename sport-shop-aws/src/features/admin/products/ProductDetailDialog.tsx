import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  productAdminApi,
  type Product,
  type ProductVariant,
  type CreateVariantDTO,
  type UpdateVariantDTO,
} from "@/services/productAdminApi";
import { colorApi } from "@/services/colorApi";
import { sizeApi, type Size } from "@/services/sizeApi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";

interface ProductDetailDialogProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailDialog({
  product,
  isOpen,
  onClose,
}: ProductDetailDialogProps) {
  const queryClient = useQueryClient();
  const [isVariantDialogOpen, setIsVariantDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(
    null
  );

  // Fetch colors and sizes
  const { data: colorsData } = useQuery({
    queryKey: ["colors"],
    queryFn: colorApi.getAll,
    enabled: isOpen,
  });

  const { data: sizesData } = useQuery({
    queryKey: ["sizes"],
    queryFn: () => sizeApi.getAll(),
    enabled: isOpen,
  });

  const colors = colorsData?.data || [];
  
  // Normalize sizes data - handle multiple response structures
  const sizes: Size[] = (() => {
    if (!sizesData) {
      console.log("ProductDetailDialog: sizesData is null/undefined");
      return [];
    }
    if (Array.isArray(sizesData)) {
      console.log("ProductDetailDialog: sizesData is array", sizesData.length);
      return sizesData as Size[];
    }
    if (Array.isArray(sizesData.data)) {
      console.log("ProductDetailDialog: sizesData.data is array", sizesData.data.length);
      return sizesData.data as Size[];
    }
    const sizesDataAny = sizesData as any;
    if (sizesDataAny.sizes && Array.isArray(sizesDataAny.sizes)) {
      console.log("ProductDetailDialog: sizesDataAny.sizes is array", sizesDataAny.sizes.length);
      return sizesDataAny.sizes as Size[];
    }
    console.warn("ProductDetailDialog: Could not normalize sizes data", sizesData);
    return [];
  })();
  
  // Debug: Log sizes for troubleshooting
  console.log("ProductDetailDialog: Final sizes array", {
    length: sizes.length,
    sizes: sizes.map(s => ({ id: s.id, name: s.name, chartType: s.chartType })),
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

  // Product update form
  const productForm = useForm({
    defaultValues: {
      name: product?.name || "",
      slug: product?.slug || "",
      basePrice: product?.basePrice || 0,
      description: product?.description || "",
      isActive: product?.isActive ?? true,
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: (data: Partial<Product>) =>
      productAdminApi.update(product?.id || 0, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products-admin"] });
      toast.success("Cập nhật sản phẩm thành công");
    },
    onError: () => {
      toast.error("Lỗi khi cập nhật sản phẩm");
    },
  });

  // Create variant mutation
  const createVariantMutation = useMutation({
    mutationFn: (data: CreateVariantDTO) =>
      productAdminApi.createVariant(product?.id || 0, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products-admin"] });
      toast.success("Tạo biến thể thành công");
      setIsVariantDialogOpen(false);
      variantForm.reset();
      // Reload product detail
      if (product) {
        productAdminApi.getById(product.id).then(() => {
          // Update product in parent if needed
        });
      }
    },
    onError: () => {
      toast.error("Lỗi khi tạo biến thể");
    },
  });

  // Update variant mutation
  const updateVariantMutation = useMutation({
    mutationFn: ({
      variantId,
      data,
    }: {
      variantId: number;
      data: UpdateVariantDTO;
    }) => productAdminApi.updateVariant(product?.id || 0, variantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products-admin"] });
      toast.success("Cập nhật biến thể thành công");
      setIsVariantDialogOpen(false);
      setEditingVariant(null);
      variantForm.reset();
    },
    onError: () => {
      toast.error("Lỗi khi cập nhật biến thể");
    },
  });

  // Delete variant mutation
  const deleteVariantMutation = useMutation({
    mutationFn: (variantId: number) =>
      productAdminApi.deleteVariant(product?.id || 0, variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products-admin"] });
      toast.success("Xóa biến thể thành công");
    },
    onError: () => {
      toast.error("Lỗi khi xóa biến thể");
    },
  });

  const handleCreateVariant = () => {
    setEditingVariant(null);
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
    variantForm.reset({
      colorId: variant.colorId,
      sizeId: variant.sizeId,
      price: Number(variant.price),
      stockQuantity: variant.stockQuantity,
      sku: variant.sku || "",
      imageUrls: variant.imageUrls || [],
    });
    setIsVariantDialogOpen(true);
  };

  const handleDeleteVariant = (variantId: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa biến thể này?")) {
      deleteVariantMutation.mutate(variantId);
    }
  };

  const onSubmitVariant = (data: CreateVariantDTO) => {
    if (editingVariant) {
      updateVariantMutation.mutate({
        variantId: editingVariant.id,
        data,
      });
    } else {
      createVariantMutation.mutate(data);
    }
  };

  const onSubmitProduct = (data: Partial<Product>) => {
    updateProductMutation.mutate(data);
  };

  if (!product) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Chi tiết sản phẩm: {product.name}
            </DialogTitle>
            <DialogDescription>
              Quản lý thông tin sản phẩm và các biến thể
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Thông tin</TabsTrigger>
              <TabsTrigger value="variants">
                Biến thể ({product.variants?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="attributes">Thuộc tính</TabsTrigger>
            </TabsList>

            {/* Tab: Thông tin sản phẩm */}
            <TabsContent value="info" className="space-y-4">
              <form
                onSubmit={productForm.handleSubmit(onSubmitProduct)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tên sản phẩm</Label>
                    <Input {...productForm.register("name")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug</Label>
                    <Input {...productForm.register("slug")} />
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
                  <Label>Mô tả</Label>
                  <Textarea {...productForm.register("description")} rows={4} />
                </div>
                <Button
                  type="submit"
                  disabled={updateProductMutation.isPending}
                >
                  {updateProductMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    "Lưu thay đổi"
                  )}
                </Button>
              </form>

              <div className="border-t pt-4 space-y-2">
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
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Danh mục:</span>{" "}
                    {product.productCategories?.map((pc) => (
                      <Badge
                        key={pc.categoryId}
                        variant="secondary"
                        className="ml-1"
                      >
                        {pc.category.name}
                      </Badge>
                    )) || "-"}
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Đối tượng:</span>{" "}
                    {product.productAudiences?.map((pa) => (
                      <Badge
                        key={pa.audienceId}
                        variant="outline"
                        className="ml-1"
                      >
                        {pa.audience.name}
                      </Badge>
                    )) || "-"}
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
                      <th className="p-3 text-left">Hình ảnh</th>
                      <th className="p-3 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!product.variants || product.variants.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="p-8 text-center text-muted-foreground"
                        >
                          Chưa có biến thể nào
                        </td>
                      </tr>
                    ) : (
                      product.variants.map((variant) => {
                        // Fallback: Find color from colors array if variant.color is not available
                        // Backend may return colorId but not color object
                        const color = variant.color || colors.find((c) => c.id === variant.colorId);
                        
                        return (
                          <tr
                            key={variant.id}
                            className="border-b hover:bg-muted/50"
                          >
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                {color ? (
                                  <>
                                    <div
                                      className="w-6 h-6 rounded border"
                                      style={{
                                        backgroundColor: color.hexCode || "#000000",
                                      }}
                                    />
                                    <span>{color.name || "—"}</span>
                                  </>
                                ) : (
                                  <span className="text-muted-foreground">
                                    {variant.colorId ? `Color ID: ${variant.colorId}` : "—"}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3">{variant.sizeName + " " + sizes.find((s) => s.id === variant.sizeId)?.chartType || variant.size?.name + " " + sizes.find((s) => s.id === variant.sizeId)?.chartType  || "—"}</td>
                            <td className="p-3 text-right">
                              {Number(variant.price).toLocaleString("vi-VN")}đ
                            </td>
                            <td className="p-3 text-right">
                              <Badge
                                variant={
                                  variant.stockQuantity > 0
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {variant.stockQuantity}
                              </Badge>
                            </td>
                            <td className="p-3">{variant.sku || "-"}</td>
                            <td className="p-3">
                              {variant.imageUrls && variant.imageUrls.length > 0 ? (
                                <div className="flex gap-1">
                                  {variant.imageUrls.slice(0, 3).map((url, idx) => (
                                    <img
                                      key={idx}
                                      src={url}
                                      alt={`Variant ${variant.id} image ${idx + 1}`}
                                      className="w-10 h-10 object-cover rounded border"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = "none";
                                      }}
                                    />
                                  ))}
                                  {variant.imageUrls.length > 3 && (
                                    <div className="w-10 h-10 flex items-center justify-center bg-muted rounded border text-xs">
                                      +{variant.imageUrls.length - 3}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">—</span>
                              )}
                            </td>
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
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* Tab: Thuộc tính */}
            <TabsContent value="attributes" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Các thuộc tính của sản phẩm
              </p>
              {!product.productAttributeValues ||
              product.productAttributeValues.length === 0 ? (
                <div className="border rounded-lg p-8 text-center text-muted-foreground">
                  Chưa có thuộc tính nào
                </div>
              ) : (
                <div className="grid gap-3">
                  {product.productAttributeValues.map((pav) => (
                    <div
                      key={pav.attributeValueId}
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <div>
                        <span className="font-medium">
                          {pav.attributeValue.attribute.name}:
                        </span>{" "}
                        {pav.attributeValue.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

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
                        {sizes.length === 0 ? (
                          <SelectItem value="" disabled>
                            Không có kích thước nào
                          </SelectItem>
                        ) : (
                          sizes.map((size) => (
                            <SelectItem key={size.id} value={size.id.toString()}>
                              {size.name} {size.chartType ? `(${size.chartType})` : ""}
                            </SelectItem>
                          ))
                        )}
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
    </>
  );
}
