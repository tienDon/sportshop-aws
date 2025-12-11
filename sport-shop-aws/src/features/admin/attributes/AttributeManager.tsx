import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attributeApi } from "@/services/attributeApi";
import type {
  Attribute,
  AttributeValue,
  CreateAttributeDTO,
  CreateAttributeValueDTO,
} from "@/services/attributeApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Pencil,
  Trash2,
  Plus,
  Loader2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function AttributeManager() {
  const queryClient = useQueryClient();
  const [isAttributeDialogOpen, setIsAttributeDialogOpen] = useState(false);
  const [isValueDialogOpen, setIsValueDialogOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(
    null
  );
  const [editingValue, setEditingValue] = useState<AttributeValue | null>(null);
  const [selectedAttribute, setSelectedAttribute] = useState<Attribute | null>(
    null
  );
  const [expandedAttributes, setExpandedAttributes] = useState<Set<number>>(
    new Set()
  );

  // Fetch Attributes with Values
  const { data, isLoading, isError } = useQuery({
    queryKey: ["attributes-with-values"],
    queryFn: () => attributeApi.getWithValues(),
  });

  const attributes = data?.data || [];

  // Attribute Form
  const attributeForm = useForm<CreateAttributeDTO>({
    defaultValues: {
      name: "",
      code: "",
    },
  });

  // Value Form
  const valueForm = useForm<CreateAttributeValueDTO>({
    defaultValues: {
      value: "",
      sortOrder: 0,
    },
  });

  // Toggle expand/collapse
  const toggleExpand = (attributeId: number) => {
    const newExpanded = new Set(expandedAttributes);
    if (newExpanded.has(attributeId)) {
      newExpanded.delete(attributeId);
    } else {
      newExpanded.add(attributeId);
    }
    setExpandedAttributes(newExpanded);
  };

  // Attribute Handlers
  const handleCreateAttribute = () => {
    setEditingAttribute(null);
    attributeForm.reset({ name: "", code: "" });
    setIsAttributeDialogOpen(true);
  };

  const handleEditAttribute = (attribute: Attribute) => {
    setEditingAttribute(attribute);
    attributeForm.reset({
      name: attribute.name,
      code: attribute.code,
    });
    setIsAttributeDialogOpen(true);
  };

  // Value Handlers
  const handleCreateValue = (attribute: Attribute) => {
    setSelectedAttribute(attribute);
    setEditingValue(null);
    valueForm.reset({ value: "", sortOrder: 0 });
    setIsValueDialogOpen(true);
  };

  const handleEditValue = (attribute: Attribute, value: AttributeValue) => {
    setSelectedAttribute(attribute);
    setEditingValue(value);
    valueForm.reset({
      value: value.value,
      sortOrder: value.sortOrder,
    });
    setIsValueDialogOpen(true);
  };

  // Mutations
  const createAttributeMutation = useMutation({
    mutationFn: attributeApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attributes-with-values"] });
      toast.success("Tạo thuộc tính thành công");
      setIsAttributeDialogOpen(false);
    },
    onError: () => {
      toast.error("Lỗi khi tạo thuộc tính");
    },
  });

  const updateAttributeMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateAttributeDTO }) =>
      attributeApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attributes-with-values"] });
      toast.success("Cập nhật thuộc tính thành công");
      setIsAttributeDialogOpen(false);
    },
    onError: () => {
      toast.error("Lỗi khi cập nhật thuộc tính");
    },
  });

  const deleteAttributeMutation = useMutation({
    mutationFn: attributeApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attributes-with-values"] });
      toast.success("Xóa thuộc tính thành công");
    },
    onError: () => {
      toast.error("Lỗi khi xóa thuộc tính");
    },
  });

  const createValueMutation = useMutation({
    mutationFn: ({
      attributeId,
      data,
    }: {
      attributeId: number;
      data: CreateAttributeValueDTO;
    }) => attributeApi.createValue(attributeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attributes-with-values"] });
      toast.success("Tạo giá trị thành công");
      setIsValueDialogOpen(false);
    },
    onError: () => {
      toast.error("Lỗi khi tạo giá trị");
    },
  });

  const updateValueMutation = useMutation({
    mutationFn: ({
      valueId,
      data,
    }: {
      valueId: number;
      data: CreateAttributeValueDTO;
    }) => attributeApi.updateValue(valueId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attributes-with-values"] });
      toast.success("Cập nhật giá trị thành công");
      setIsValueDialogOpen(false);
    },
    onError: () => {
      toast.error("Lỗi khi cập nhật giá trị");
    },
  });

  const deleteValueMutation = useMutation({
    mutationFn: attributeApi.deleteValue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attributes-with-values"] });
      toast.success("Xóa giá trị thành công");
    },
    onError: () => {
      toast.error("Lỗi khi xóa giá trị");
    },
  });

  const onSubmitAttribute = (data: CreateAttributeDTO) => {
    if (editingAttribute) {
      updateAttributeMutation.mutate({ id: editingAttribute.id, data });
    } else {
      createAttributeMutation.mutate(data);
    }
  };

  const onSubmitValue = (data: CreateAttributeValueDTO) => {
    if (!selectedAttribute) return;

    if (editingValue) {
      updateValueMutation.mutate({ valueId: editingValue.id, data });
    } else {
      createValueMutation.mutate({ attributeId: selectedAttribute.id, data });
    }
  };

  const handleDeleteAttribute = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa thuộc tính này?")) {
      deleteAttributeMutation.mutate(id);
    }
  };

  const handleDeleteValue = (valueId: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa giá trị này?")) {
      deleteValueMutation.mutate(valueId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-500">
        Đã xảy ra lỗi khi tải dữ liệu.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          Quản lý Thuộc tính
        </h2>
        <Button onClick={handleCreateAttribute}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm thuộc tính
        </Button>
      </div>

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          {attributes.length === 0 ? (
            <div className="h-96 flex items-center justify-center text-muted-foreground">
              Không có dữ liệu.
            </div>
          ) : (
            <div className="divide-y">
              {attributes.map((attribute) => {
                const isExpanded = expandedAttributes.has(attribute.id);
                const values = attribute.values || [];

                return (
                  <div key={attribute.id} className="p-4">
                    {/* Attribute Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => toggleExpand(attribute.id)}
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </Button>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              {attribute.name}
                            </span>
                            <Badge variant="secondary">{attribute.code}</Badge>
                            <Badge variant="outline">
                              {values.length} giá trị
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCreateValue(attribute)}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Thêm giá trị
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditAttribute(attribute)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteAttribute(attribute.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    {/* Values List */}
                    {isExpanded && values.length > 0 && (
                      <div className="mt-4 ml-11 space-y-2">
                        {values.map((value) => (
                          <div
                            key={value.id}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-muted-foreground w-8">
                                #{value.sortOrder}
                              </span>
                              <span className="font-medium">{value.value}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  handleEditValue(attribute, value)
                                }
                              >
                                <Pencil className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleDeleteValue(value.id)}
                              >
                                <Trash2 className="w-3 h-3 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {isExpanded && values.length === 0 && (
                      <div className="mt-4 ml-11 p-4 text-center text-sm text-muted-foreground bg-muted/50 rounded-lg">
                        Chưa có giá trị nào. Nhấn "Thêm giá trị" để tạo mới.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Attribute Dialog */}
      <Dialog
        open={isAttributeDialogOpen}
        onOpenChange={setIsAttributeDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAttribute ? "Chỉnh sửa thuộc tính" : "Thêm thuộc tính"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={attributeForm.handleSubmit(onSubmitAttribute)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">
                  Tên thuộc tính <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  {...attributeForm.register("name", {
                    required: "Tên là bắt buộc",
                  })}
                  placeholder="Chất liệu, Cổ áo..."
                />
                {attributeForm.formState.errors.name && (
                  <span className="text-sm text-red-500">
                    {attributeForm.formState.errors.name.message}
                  </span>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="code">
                  Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="code"
                  {...attributeForm.register("code", {
                    required: "Code là bắt buộc",
                  })}
                  placeholder="material, neckline..."
                />
                {attributeForm.formState.errors.code && (
                  <span className="text-sm text-red-500">
                    {attributeForm.formState.errors.code.message}
                  </span>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAttributeDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={
                  createAttributeMutation.isPending ||
                  updateAttributeMutation.isPending
                }
              >
                {createAttributeMutation.isPending ||
                updateAttributeMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : editingAttribute ? (
                  "Cập nhật"
                ) : (
                  "Tạo mới"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Value Dialog */}
      <Dialog open={isValueDialogOpen} onOpenChange={setIsValueDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingValue ? "Chỉnh sửa giá trị" : "Thêm giá trị mới"}
              {selectedAttribute && (
                <span className="block text-sm font-normal text-muted-foreground mt-1">
                  Thuộc tính: {selectedAttribute.name}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={valueForm.handleSubmit(onSubmitValue)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="value">
                  Giá trị <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="value"
                  {...valueForm.register("value", {
                    required: "Giá trị là bắt buộc",
                  })}
                  placeholder="Cotton, Polyester, Cổ tròn..."
                />
                {valueForm.formState.errors.value && (
                  <span className="text-sm text-red-500">
                    {valueForm.formState.errors.value.message}
                  </span>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="sortOrder">Thứ tự sắp xếp</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  {...valueForm.register("sortOrder", { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsValueDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={
                  createValueMutation.isPending || updateValueMutation.isPending
                }
              >
                {createValueMutation.isPending ||
                updateValueMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : editingValue ? (
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
