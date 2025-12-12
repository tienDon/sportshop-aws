import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router";
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
import { sizeApi, type Size } from "@/services/sizeApi";
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
  const params = useParams();

  // Extract slug from URL path
  // URL format: /admin/products/{slug}
  // With route /admin/*, params["*"] = "products/{slug}"
  const slugFromParams = params["*"]?.split("/")?.[1];
  const match = location.pathname.match(/\/admin\/products\/([^/?#]+)/);
  const slugFromMatch = match ? decodeURIComponent(match[1]) : null;
  const slug = slugFromParams ? decodeURIComponent(slugFromParams) : slugFromMatch;

  // Debug: Log slug extraction
  console.log("Slug extraction debug:", {
    pathname: location.pathname,
    params: params["*"],
    slugFromParams,
    slugFromMatch,
    finalSlug: slug,
  });
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
  const { 
    data: productData, 
    isLoading, 
    isError,
    error 
  } = useQuery({
    queryKey: ["product-detail", slug],
    queryFn: () => {
      console.log("Fetching product with slug:", slug);
      return productAdminApi.getById(slug!);
    },
    enabled: !!slug,
    retry: 1,
  });

  // Log error if any
  if (isError) {
    console.error("❌ Error fetching product:", error);
    console.error("Error details:", {
      slug,
      errorMessage: (error as any)?.message,
      errorResponse: (error as any)?.response?.data,
      errorStatus: (error as any)?.response?.status,
    });
  }

  // Extract product from response
  // API returns { success: boolean; data: Product[] } (array)
  // But for single product by slug, we take the first element
  let product = Array.isArray(productData?.data) 
    ? productData.data[0] 
    : productData?.data;

  // Normalize product relations if backend returns different structure
  // Backend might return 'categories', 'audiences', 'sports' instead of 'productCategories', etc.
  if (product) {
    const productAny = product as any;
    
    // If backend returns 'categories' instead of 'productCategories', normalize it
    if (!product.productCategories && productAny.categories && Array.isArray(productAny.categories)) {
      product.productCategories = productAny.categories.map((cat: any) => ({
        productId: product.id,
        categoryId: cat.id,
        isPrimary: cat.isPrimary || false,
        category: {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
        },
      }));
    }
    
    // If backend returns 'audiences' instead of 'productAudiences', normalize it
    if (!product.productAudiences && productAny.audiences && Array.isArray(productAny.audiences)) {
      product.productAudiences = productAny.audiences.map((aud: any) => ({
        productId: product.id,
        audienceId: aud.id,
        audience: {
          id: aud.id,
          name: aud.name,
          slug: aud.slug,
        },
      }));
    }
    
    // If backend returns 'sports' instead of 'productSports', normalize it
    if (!product.productSports && productAny.sports && Array.isArray(productAny.sports)) {
      product.productSports = productAny.sports.map((sport: any) => ({
        productId: product.id,
        sportId: sport.id,
        sport: {
          id: sport.id,
          name: sport.name,
          slug: sport.slug,
        },
      }));
    }
  }
  
  // Debug: Log product to check structure
  console.log("Product data debug:", {
    productData: JSON.stringify(productData, null, 2),
    product: JSON.stringify(product, null, 2),
    hasProduct: !!product,
    productId: product?.id,
    productSlug: product?.slug,
    productName: product?.name,
    productType: typeof product,
    productIsArray: Array.isArray(product),
    productKeys: product ? Object.keys(product) : [],
    // Check relations
    hasProductCategories: !!product?.productCategories,
    productCategoriesLength: product?.productCategories?.length || 0,
    productCategories: product?.productCategories,
    hasProductAudiences: !!product?.productAudiences,
    productAudiencesLength: product?.productAudiences?.length || 0,
    productAudiences: product?.productAudiences,
    hasProductSports: !!product?.productSports,
    productSportsLength: product?.productSports?.length || 0,
    productSports: product?.productSports,
    // Check for alternative field names
    hasCategories: 'categories' in (product || {}),
    hasAudiences: 'audiences' in (product || {}),
    hasSports: 'sports' in (product || {}),
    categories: (product as any)?.categories,
    audiences: (product as any)?.audiences,
    sports: (product as any)?.sports,
    isLoading,
    slug,
  });

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

  // Normalize all data to arrays
  const colors = (() => {
    if (!colorsData) return [];
    if (Array.isArray(colorsData)) return colorsData;
    return colorsData.data || [];
  })();
  
  const sizes: Size[] = (() => {
    if (!sizesData) return [];
    if (Array.isArray(sizesData)) return sizesData as Size[];
    if (Array.isArray(sizesData.data)) return sizesData.data as Size[];
    const sizesDataAny = sizesData as any;
    if (sizesDataAny.sizes && Array.isArray(sizesDataAny.sizes)) return sizesDataAny.sizes as Size[];
    return [];
  })();
  
  const categories = (() => {
    if (!categoriesData) return [];
    if (Array.isArray(categoriesData)) return categoriesData;
    return categoriesData.data || [];
  })();
  
  const audiences = (() => {
    if (!audiencesData) return [];
    if (Array.isArray(audiencesData)) return audiencesData;
    return audiencesData.data || [];
  })();
  
  const sports = (() => {
    if (!sportsData) return [];
    if (Array.isArray(sportsData)) return sportsData;
    return sportsData.data || [];
  })();
  
  const attributes = (() => {
    if (!attributesData) return [];
    if (Array.isArray(attributesData)) return attributesData;
    return attributesData.data || [];
  })();

  // Product update form
  const productForm = useForm({
    defaultValues: {
      name: "",
      slug: "",
      basePrice: 0,
      description: "",
      specifications: "",
      mainImageUrl: "",
      isActive: true,
    },
  });

  // Reset form when product data is loaded
  useEffect(() => {
    if (product) {
      console.log("Resetting form with product data:", {
        mainImageUrl: product.mainImageUrl,
        hasMainImageUrl: !!product.mainImageUrl,
        mainImageUrlType: typeof product.mainImageUrl,
      });
      productForm.reset({
        name: product.name || "",
        slug: product.slug || "",
        basePrice: product.basePrice || 0,
        description: product.description || "",
        specifications: product.specifications || "",
        mainImageUrl: product.mainImageUrl || "",
        isActive: product.isActive ?? true,
      });
      // Log form values after reset
      console.log("Form values after reset:", productForm.getValues());
    }
  }, [product, productForm]);

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
      productAdminApi.update(product!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-detail", slug] });
      toast.success("Cập nhật sản phẩm thành công");
    },
    onError: () => {
      toast.error("Lỗi khi cập nhật sản phẩm");
    },
  });

  // Variant mutations
  const createVariantMutation = useMutation({
    mutationFn: (data: CreateVariantDTO) =>
      productAdminApi.createVariant(product!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-detail", slug] });
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
    }) => productAdminApi.updateVariant(product!.id, variantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-detail", slug] });
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
      productAdminApi.deleteVariant(product!.id, variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-detail", slug] });
      toast.success("Xóa biến thể thành công");
    },
    onError: () => {
      toast.error("Lỗi khi xóa biến thể");
    },
  });

  // Relation mutations
  const addCategoryMutation = useMutation({
    mutationFn: (categoryId: number) => {
      if (!product?.id) {
        throw new Error("Product ID is not available");
      }
      console.log("Adding category:", { productId: product.id, categoryId });
      return productAdminApi.addCategory(product.id, categoryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-detail", slug] });
      toast.success("Thêm danh mục thành công");
      setIsAddingCategory(false);
      setSelectedCategoryId(0);
    },
    onError: (error: any) => {
      console.error("Error adding category:", error);
      console.error("Error response:", error?.response?.data);
      toast.error(`Lỗi khi thêm danh mục: ${error?.response?.data?.message || error.message || "Unknown error"}`);
    },
  });

  const removeCategoryMutation = useMutation({
    mutationFn: (categoryId: number) => {
      if (!product?.id) {
        throw new Error("Product ID is not available");
      }
      return productAdminApi.removeCategory(product.id, categoryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-detail", slug] });
      toast.success("Xóa danh mục thành công");
    },
    onError: () => {
      toast.error("Lỗi khi xóa danh mục");
    },
  });

  const addAudienceMutation = useMutation({
    mutationFn: (audienceId: number) => {
      if (!product?.id) {
        throw new Error("Product ID is not available");
      }
      console.log("Adding audience:", { productId: product.id, audienceId });
      return productAdminApi.addAudience(product.id, audienceId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-detail", slug] });
      toast.success("Thêm đối tượng thành công");
      setIsAddingAudience(false);
      setSelectedAudienceId(0);
    },
    onError: (error: any) => {
      console.error("Error adding audience:", error);
      console.error("Error response:", error?.response?.data);
      toast.error(`Lỗi khi thêm đối tượng: ${error?.response?.data?.message || error.message || "Unknown error"}`);
    },
  });

  const removeAudienceMutation = useMutation({
    mutationFn: (audienceId: number) => {
      if (!product?.id) {
        throw new Error("Product ID is not available");
      }
      return productAdminApi.removeAudience(product.id, audienceId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-detail", slug] });
      toast.success("Xóa đối tượng thành công");
    },
    onError: () => {
      toast.error("Lỗi khi xóa đối tượng");
    },
  });

  const addSportMutation = useMutation({
    mutationFn: (sportId: number) => {
      if (!product?.id) {
        throw new Error("Product ID is not available");
      }
      console.log("Adding sport:", { productId: product.id, sportId });
      return productAdminApi.addSport(product.id, sportId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-detail", slug] });
      toast.success("Thêm môn thể thao thành công");
      setIsAddingSport(false);
      setSelectedSportId(0);
    },
    onError: (error: any) => {
      console.error("Error adding sport:", error);
      console.error("Error response:", error?.response?.data);
      toast.error(`Lỗi khi thêm môn thể thao: ${error?.response?.data?.message || error.message || "Unknown error"}`);
    },
  });

  const removeSportMutation = useMutation({
    mutationFn: (sportId: number) => {
      if (!product?.id) {
        throw new Error("Product ID is not available");
      }
      return productAdminApi.removeSport(product.id, sportId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-detail", slug] });
      toast.success("Xóa môn thể thao thành công");
    },
    onError: () => {
      toast.error("Lỗi khi xóa môn thể thao");
    },
  });

  const addAttributeValueMutation = useMutation({
    mutationFn: (attributeValueId: number) => {
      if (!product?.id) {
        throw new Error("Product ID is not available");
      }
      console.log("Adding attribute value:", { productId: product.id, attributeValueId });
      return productAdminApi.addAttributeValue(product.id, attributeValueId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-detail", slug] });
      toast.success("Thêm thuộc tính thành công");
    },
    onError: (error: any) => {
      console.error("Error adding attribute value:", error);
      console.error("Error response:", error?.response?.data);
      toast.error(`Lỗi khi thêm thuộc tính: ${error?.response?.data?.message || error.message || "Unknown error"}`);
    },
  });

  const removeAttributeValueMutation = useMutation({
    mutationFn: (attributeValueId: number) => {
      if (!product?.id) {
        throw new Error("Product ID is not available");
      }
      return productAdminApi.removeAttributeValue(product.id, attributeValueId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-detail", slug] });
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
    
    // Find sizeId from sizeName if sizeId is not available
    let sizeId = variant.sizeId;
    if (!sizeId && variant.sizeName) {
      const foundSize = sizes.find((s) => s.name === variant.sizeName);
      if (foundSize) {
        sizeId = foundSize.id;
        console.log("Found sizeId from sizeName:", { sizeName: variant.sizeName, sizeId });
      } else {
        console.warn("Could not find sizeId for sizeName:", variant.sizeName);
      }
    }
    
    variantForm.reset({
      colorId: variant.colorId,
      sizeId: sizeId || 0,
      price: Number(variant.price),
      stockQuantity: variant.stockQuantity,
      sku: variant.sku || "",
      imageUrls: urls,
    });
    
    console.log("Edit variant form reset:", {
      variant: {
        id: variant.id,
        colorId: variant.colorId,
        sizeId: variant.sizeId,
        sizeName: variant.sizeName,
        foundSizeId: sizeId,
      },
      formValues: variantForm.getValues(),
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
    console.log("⚠️ Product not found:", {
      slug,
      isLoading,
      isError,
      error,
      productData,
    });
    
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-lg text-muted-foreground">
          {isError 
            ? `Lỗi khi tải sản phẩm: ${(error as any)?.response?.data?.message || (error as any)?.message || "Unknown error"}` 
            : isLoading 
            ? "Đang tải..." 
            : "Không tìm thấy sản phẩm"}
        </p>
        {isError && (
          <p className="text-sm text-muted-foreground">
            Slug: {slug}
          </p>
        )}
        <Button onClick={() => navigate("/admin/products")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6 min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
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
      <Tabs defaultValue="info" className="w-full flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-4 flex-shrink-0">
          <TabsTrigger value="info">Thông tin</TabsTrigger>
          <TabsTrigger value="variants">
            Biến thể ({product.variants?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="relations">Phân loại</TabsTrigger>
          <TabsTrigger value="attributes">Thuộc tính</TabsTrigger>
        </TabsList>

        {/* Tab: Thông tin sản phẩm */}
        <TabsContent value="info" className="space-y-4 flex-1 overflow-y-auto min-h-0">
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
              <Input 
                {...productForm.register("mainImageUrl")} 
                placeholder="https://example.com/image.jpg"
              />
              {/* Debug: Show current form value */}
              
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
                {(product as any).brandName || product.brand?.name || "—"}
              </div>
              <div>
                <span className="text-muted-foreground">Badge:</span>{" "}
                {product.badge?.name || "-"}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Biến thể */}
        <TabsContent value="variants" className="space-y-4 flex-1 overflow-y-auto min-h-0">
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
                      colSpan={7}
                      className="p-8 text-center text-muted-foreground"
                    >
                      Chưa có biến thể nào
                    </td>
                  </tr>
                ) : (
                  product.variants.map((variant) => {
                    // Fallback: Find color from colors array if variant.color is not available
                    // Backend may not include color/size objects in variant response
                    const color = variant.color || colors.find((c) => c.id === variant.colorId);
                    const size = variant.size || sizes.find((s) => s.id === variant.sizeId);
                    
                    // Debug: Log variant structure
                    console.log(`Variant ${variant.id}:`, {
                      sizeName: variant.sizeName,
                      sizeId: variant.sizeId,
                      size: variant.size,
                      hasSizeName: 'sizeName' in variant,
                      variantKeys: Object.keys(variant),
                    });
                    
                    // Debug: Log if color/size not found
                    if (!color && variant.colorId) {
                      console.warn(`Color not found for variant ${variant.id}, colorId: ${variant.colorId}`, {
                        colorsAvailable: colors.length,
                        colorIds: colors.map((c) => c.id),
                      });
                    }
                    if (!size && variant.sizeId && !variant.sizeName) {
                      console.warn(`Size not found for variant ${variant.id}, sizeId: ${variant.sizeId}`, {
                        sizesAvailable: sizes.length,
                        sizeIds: sizes.map((s) => s.id),
                      });
                    }
                    
                    return (
                      <tr key={variant.id} className="border-b hover:bg-muted/50">
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
                        <td className="p-3">
                          {variant.sizeName || size?.name || (variant.sizeId ? `Size ID: ${variant.sizeId}` : "—")}
                        </td>
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

        {/* Tab: Phân loại (Categories, Audiences, Sports) */}
        <TabsContent value="relations" className="space-y-6 flex-1 overflow-y-auto min-h-0">
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
                  onClick={() => {
                    if (product?.id) {
                      addCategoryMutation.mutate(selectedCategoryId);
                    } else {
                      toast.error("Vui lòng đợi sản phẩm tải xong");
                    }
                  }}
                  disabled={
                    selectedCategoryId === 0 || 
                    addCategoryMutation.isPending ||
                    isLoading ||
                    !product?.id
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
                    onClick={() => {
                      if (product?.id) {
                        removeCategoryMutation.mutate(pc.categoryId);
                      } else {
                        toast.error("Vui lòng đợi sản phẩm tải xong");
                      }
                    }}
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
                  onClick={() => {
                    if (product?.id) {
                      addAudienceMutation.mutate(selectedAudienceId);
                    } else {
                      toast.error("Vui lòng đợi sản phẩm tải xong");
                    }
                  }}
                  disabled={
                    selectedAudienceId === 0 || 
                    addAudienceMutation.isPending ||
                    isLoading ||
                    !product?.id
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
                    onClick={() => {
                      if (product?.id) {
                        removeAudienceMutation.mutate(pa.audienceId);
                      } else {
                        toast.error("Vui lòng đợi sản phẩm tải xong");
                      }
                    }}
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
                  onClick={() => {
                    if (product?.id) {
                      addSportMutation.mutate(selectedSportId);
                    } else {
                      toast.error("Vui lòng đợi sản phẩm tải xong");
                    }
                  }}
                  disabled={
                    selectedSportId === 0 || 
                    addSportMutation.isPending ||
                    isLoading ||
                    !product?.id
                  }
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
                    onClick={() => {
                      if (product?.id) {
                        removeSportMutation.mutate(ps.sportId);
                      } else {
                        toast.error("Vui lòng đợi sản phẩm tải xong");
                      }
                    }}
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
        <TabsContent value="attributes" className="space-y-4 flex-1 overflow-y-auto min-h-0">
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
                              isAdded || 
                              addAttributeValueMutation.isPending ||
                              !product?.id
                            }
                            onClick={() => {
                              if (product?.id) {
                                addAttributeValueMutation.mutate(val.id);
                              } else {
                                toast.error("Vui lòng đợi sản phẩm tải xong");
                              }
                            }}
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
                          onClick={() => {
                            if (product?.id) {
                              removeAttributeValueMutation.mutate(
                                pav.attributeValueId
                              );
                            } else {
                              toast.error("Vui lòng đợi sản phẩm tải xong");
                            }
                          }}
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
                  render={({ field }) => {
                    const currentValue = field.value?.toString() || "0";
                    console.log("Size Select - Current field value:", {
                      fieldValue: field.value,
                      currentValue,
                      sizesAvailable: sizes.length,
                    });
                    return (
                      <Select
                        value={currentValue === "0" ? undefined : currentValue}
                        onValueChange={(value) => {
                          console.log("Size Select - Value changed:", value);
                          field.onChange(Number(value));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn kích thước" />
                        </SelectTrigger>
                        <SelectContent>
                          {sizes.map((size: Size) => (
                            <SelectItem key={size.id} value={size.id.toString()}>
                              {size.name} {size.chartType ? `(${size.chartType})` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    );
                  }}
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
