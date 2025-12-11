import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { audienceApi } from "@/services/audienceApi";
import type { Audience, CreateAudienceDTO } from "@/services/audienceApi";
import { generateSlug } from "@/utils/slugify";
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
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function AudienceManager() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAudience, setEditingAudience] = useState<Audience | null>(null);

  // Fetch Audiences
  const { data, isLoading, isError } = useQuery({
    queryKey: ["audiences"],
    queryFn: audienceApi.getAll,
  });

  const audiences = data?.data || [];

  // Form Handling
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAudienceDTO>({
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  // Open Create Dialog
  const handleCreate = () => {
    setEditingAudience(null);
    reset({ name: "", slug: "" });
    setIsDialogOpen(true);
  };

  // Open Edit Dialog
  const handleEdit = (audience: Audience) => {
    setEditingAudience(audience);
    reset({
      name: audience.name,
      slug: audience.slug,
    });
    setIsDialogOpen(true);
  };

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: audienceApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audiences"] });
      toast.success("Tạo đối tượng thành công");
      setIsDialogOpen(false);
    },
    onError: () => {
      toast.error("Lỗi khi tạo đối tượng");
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateAudienceDTO }) =>
      audienceApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audiences"] });
      toast.success("Cập nhật đối tượng thành công");
      setIsDialogOpen(false);
    },
    onError: () => {
      toast.error("Lỗi khi cập nhật đối tượng");
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: audienceApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audiences"] });
      toast.success("Xóa đối tượng thành công");
    },
    onError: () => {
      toast.error("Lỗi khi xóa đối tượng");
    },
  });

  const onSubmit = (data: CreateAudienceDTO) => {
    if (editingAudience) {
      updateMutation.mutate({ id: editingAudience.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa đối tượng này?")) {
      deleteMutation.mutate(id);
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
        <h2 className="text-2xl font-bold tracking-tight">Quản lý Đối tượng</h2>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm mới
        </Button>
      </div>

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  ID
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Tên
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Slug
                </th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {audiences.length === 0 ? (
                <tr>
                  <td colSpan={4} className="h-24 text-center">
                    Không có dữ liệu.
                  </td>
                </tr>
              ) : (
                audiences.map((audience) => (
                  <tr
                    key={audience.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle">{audience.id}</td>
                    <td className="p-4 align-middle font-medium">
                      {audience.name}
                    </td>
                    <td className="p-4 align-middle">{audience.slug}</td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(audience)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(audience.id)}
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

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAudience ? "Chỉnh sửa đối tượng" : "Thêm đối tượng mới"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">
                  Tên <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  {...register("name", { required: "Tên là bắt buộc" })}
                  placeholder="Nam, Nữ, Trẻ em..."
                  onChange={(e) => {
                    setValue("name", e.target.value);
                    setValue("slug", generateSlug(e.target.value));
                  }}
                />
                {errors.name && (
                  <span className="text-sm text-red-500">
                    {errors.name.message}
                  </span>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="slug">
                  Slug <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="slug"
                  {...register("slug", { required: "Slug là bắt buộc" })}
                  placeholder="nam, nu, tre-em..."
                  readOnly
                  className="bg-muted"
                />
                {errors.slug && (
                  <span className="text-sm text-red-500">
                    {errors.slug.message}
                  </span>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : editingAudience ? (
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
