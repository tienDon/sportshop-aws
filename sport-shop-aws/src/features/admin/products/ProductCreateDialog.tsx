import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productAdminApi } from "@/services/productAdminApi";
import { brandApi } from "@/services/brandApi";
import { categoryApi } from "@/services/categoryApi";
import { audienceApi } from "@/services/audienceApi";
import { sportApi } from "@/services/sportApi";
import { generateSlug } from "@/utils/slugify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { toast } from "sonner";

interface ProductCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProductFormData {
  name: string;
  slug: string;
  brandId: number;
  basePrice: number;
  mainImageUrl: string;
  description: string;
  specifications: string;
  isActive: boolean;
  categoryIds: number[];
  audienceIds: number[];
  sportIds: number[];
}

export function ProductCreateDialog({
  isOpen,
  onClose,
}: ProductCreateDialogProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedAudiences, setSelectedAudiences] = useState<number[]>([]);
  const [selectedSports, setSelectedSports] = useState<number[]>([]);

  const form = useForm<ProductFormData>({
    defaultValues: {
      name: "",
      slug: "",
      brandId: 0,
      basePrice: 0,
      mainImageUrl: "",
      description: "",
      specifications: "",
      isActive: true,
      categoryIds: [],
      audienceIds: [],
      sportIds: [],
    },
  });

  // Fetch dropdown data
  const { data: brandsData } = useQuery({
    queryKey: ["brands"],
    queryFn: brandApi.getAll,
    enabled: isOpen,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryApi.getAll,
    enabled: isOpen && step >= 2,
  });

  const { data: audiencesData } = useQuery({
    queryKey: ["audiences"],
    queryFn: audienceApi.getAll,
    enabled: isOpen && step >= 2,
  });

  const { data: sportsData } = useQuery({
    queryKey: ["sports"],
    queryFn: sportApi.getAll,
    enabled: isOpen && step >= 2,
  });

  const brands = brandsData?.data?.brands || [];
  const categories = categoriesData?.data || [];
  const audiences = audiencesData?.data || [];
  const sports = sportsData?.data || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      // Step 1: Create product
      const productResponse = await productAdminApi.create({
        name: data.name,
        slug: data.slug,
        brandId: data.brandId,
        basePrice: data.basePrice,
        mainImageUrl: data.mainImageUrl,
        description: data.description,
        specifications: data.specifications,
        isActive: data.isActive,
      });

      const productId = productResponse.data.id;

      // Step 2: Add categories
      for (const categoryId of selectedCategories) {
        await productAdminApi.addCategory(productId, categoryId);
      }

      // Step 3: Add audiences
      for (const audienceId of selectedAudiences) {
        await productAdminApi.addAudience(productId, audienceId);
      }

      // Step 4: Add sports
      for (const sportId of selectedSports) {
        await productAdminApi.addSport(productId, sportId);
      }

      return productResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products-admin"] });
      toast.success("Tạo sản phẩm thành công");
      handleClose();
    },
    onError: () => {
      toast.error("Lỗi khi tạo sản phẩm");
    },
  });

  const handleClose = () => {
    form.reset();
    setStep(1);
    setSelectedCategories([]);
    setSelectedAudiences([]);
    setSelectedSports([]);
    onClose();
  };

  const handleNext = () => {
    if (step === 1) {
      // Validate step 1 fields
      const { name, slug, brandId, basePrice } = form.getValues();
      if (!name || !slug || !brandId || !basePrice) {
        toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = form.handleSubmit((data) => {
    createMutation.mutate(data);
  });

  const toggleCategory = (id: number) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const toggleAudience = (id: number) => {
    setSelectedAudiences((prev) =>
      prev.includes(id) ? prev.filter((aid) => aid !== id) : [...prev, id]
    );
  };

  const toggleSport = (id: number) => {
    setSelectedSports((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue("name", name);
    form.setValue("slug", generateSlug(name));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Tạo sản phẩm mới</DialogTitle>
          <DialogDescription>
            Bước {step}/3:{" "}
            {step === 1
              ? "Thông tin cơ bản"
              : step === 2
              ? "Phân loại"
              : "Xác nhận"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Thông tin cơ bản */}
          {step === 1 && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>
                  Tên sản phẩm <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...form.register("name", { required: true })}
                  placeholder="Áo Thun Nike Dri-FIT"
                  onChange={handleNameChange}
                />
              </div>

              <div className="grid gap-2">
                <Label>
                  Slug <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...form.register("slug", { required: true })}
                  placeholder="ao-thun-nike-dri-fit"
                  readOnly
                  className="bg-muted"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>
                    Thương hiệu <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="brandId"
                    control={form.control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select
                        value={field.value?.toString()}
                        onValueChange={(value) => field.onChange(Number(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn thương hiệu" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.map((brand) => (
                            <SelectItem
                              key={brand.id}
                              value={brand.id.toString()}
                            >
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>
                    Giá gốc <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    {...form.register("basePrice", {
                      required: true,
                      valueAsNumber: true,
                    })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>URL hình ảnh chính</Label>
                <Input
                  {...form.register("mainImageUrl")}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="grid gap-2">
                <Label>Mô tả</Label>
                <Textarea
                  {...form.register("description")}
                  placeholder="Mô tả sản phẩm..."
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label>Thông số kỹ thuật</Label>
                <Textarea
                  {...form.register("specifications")}
                  placeholder="Chất liệu: 100% Polyester..."
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label>Trạng thái</Label>
                <Controller
                  name="isActive"
                  control={form.control}
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
          )}

          {/* Step 2: Phân loại */}
          {step === 2 && (
            <div className="grid gap-6 py-4">
              {/* Categories */}
              <div className="space-y-3">
                <Label>Danh mục</Label>
                <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                  {categories.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Đang tải...</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map((cat) => (
                        <div
                          key={cat.id}
                          onClick={() => toggleCategory(cat.id)}
                          className={`p-2 border rounded cursor-pointer transition-colors ${
                            selectedCategories.includes(cat.id)
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{cat.name}</span>
                            {selectedCategories.includes(cat.id) && (
                              <Check className="w-4 h-4" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Đã chọn: {selectedCategories.length}
                </p>
              </div>

              {/* Audiences */}
              <div className="space-y-3">
                <Label>Đối tượng</Label>
                <div className="flex flex-wrap gap-2">
                  {audiences.map((aud) => (
                    <Badge
                      key={aud.id}
                      variant={
                        selectedAudiences.includes(aud.id)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => toggleAudience(aud.id)}
                    >
                      {aud.name}
                      {selectedAudiences.includes(aud.id) && (
                        <Check className="w-3 h-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Sports */}
              <div className="space-y-3">
                <Label>Môn thể thao</Label>
                <div className="flex flex-wrap gap-2">
                  {sports.map((sport) => (
                    <Badge
                      key={sport.id}
                      variant={
                        selectedSports.includes(sport.id)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => toggleSport(sport.id)}
                    >
                      {sport.name}
                      {selectedSports.includes(sport.id) && (
                        <Check className="w-3 h-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Xác nhận */}
          {step === 3 && (
            <div className="grid gap-4 py-4">
              <div className="border rounded-lg p-4 space-y-3">
                <h4 className="font-semibold">Thông tin cơ bản</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Tên:</span>{" "}
                    {form.getValues("name")}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Slug:</span>{" "}
                    {form.getValues("slug")}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Thương hiệu:</span>{" "}
                    {
                      brands.find((b) => b.id === form.getValues("brandId"))
                        ?.name
                    }
                  </div>
                  <div>
                    <span className="text-muted-foreground">Giá:</span>{" "}
                    {form.getValues("basePrice").toLocaleString("vi-VN")}đ
                  </div>
                  <div>
                    <span className="text-muted-foreground">Trạng thái:</span>{" "}
                    {form.getValues("isActive") ? "Hoạt động" : "Ẩn"}
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <h4 className="font-semibold">Phân loại</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Danh mục:</span>{" "}
                    {selectedCategories.length > 0
                      ? selectedCategories
                          .map(
                            (id) => categories.find((c) => c.id === id)?.name
                          )
                          .join(", ")
                      : "Chưa chọn"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Đối tượng:</span>{" "}
                    {selectedAudiences.length > 0
                      ? selectedAudiences
                          .map((id) => audiences.find((a) => a.id === id)?.name)
                          .join(", ")
                      : "Chưa chọn"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Môn thể thao:</span>{" "}
                    {selectedSports.length > 0
                      ? selectedSports
                          .map((id) => sports.find((s) => s.id === id)?.name)
                          .join(", ")
                      : "Chưa chọn"}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={handleBack}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Quay lại
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Hủy
              </Button>
              {step < 3 ? (
                <Button type="button" onClick={handleNext}>
                  Tiếp theo
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Tạo sản phẩm
                    </>
                  )}
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
