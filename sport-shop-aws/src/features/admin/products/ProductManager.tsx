import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productAdminApi } from "@/services/productAdminApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Loader2, Eye, Package, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { ProductCreateDialog } from "./ProductCreateDialog";

export function ProductManager() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch products
  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products-admin"],
    queryFn: productAdminApi.getAll,
  });

  // Handle both array and object response structures
  const products = Array.isArray(productsData)
    ? productsData
    : productsData?.data || [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: productAdminApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products-admin"] });
      toast.success("Xóa sản phẩm thành công");
    },
    onError: () => {
      toast.error("Lỗi khi xóa sản phẩm");
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Quản lý Sản phẩm</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm sản phẩm
        </Button>
      </div>

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-20">
                  ID
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Hình ảnh
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Tên sản phẩm
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Thương hiệu
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Giá gốc
                </th>
                <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">
                  Biến thể
                </th>
                <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">
                  Trạng thái
                </th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="h-24 text-center">
                    Không có dữ liệu.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="p-4 align-middle">{product.id}</td>
                    <td className="p-4 align-middle">
                      {product.mainImageUrl ? (
                        <img
                          src={product.mainImageUrl}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                          <Package className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{product.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {product.slug}
                        </span>
                        {product.badge && (
                          <Badge
                            variant="secondary"
                            className="text-xs w-fit"
                            style={{ backgroundColor: product.badge.color }}
                          >
                            {product.badge.name}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      {(product as any).brandName || product.brand?.name || "—"}
                    </td>
                    <td className="p-4 align-middle">
                      {Number(product.basePrice).toLocaleString("vi-VN")}đ
                    </td>
                    <td className="p-4 align-middle text-center">
                      <Badge variant="outline">
                        {product._count?.variants || 
                         (product as any).variants?.length || 
                         0}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle text-center">
                      <Badge
                        variant={
                          product.isActive !== false ? "default" : "secondary"
                        }
                      >
                        {product.isActive !== false ? "Hoạt động" : "Ẩn"}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            navigate(`/admin/products/${product.slug}`)
                          }
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            navigate(`/admin/products/${product.slug}`)
                          }
                          title="Chỉnh sửa"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product.id)}
                          title="Xóa"
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

      {/* Create Dialog */}
      <ProductCreateDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />
    </div>
  );
}
