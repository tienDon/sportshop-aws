import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUsersForAdmin,
  updateUserStatus,
  deleteUser,
  type AdminUser,
} from "@/services/userApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trash2, Eye, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";

export function UserManager() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  // 1. QUERY: Lấy danh sách Users
  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery<AdminUser[]>({
    queryKey: ["adminUsers"],
    queryFn: getUsersForAdmin,
  });

  // Debug log
  console.log("Admin users:", users);

  // 2. MUTATION: Cập nhật Trạng thái (Block/Unblock)
  const toggleStatusMutation = useMutation({
    mutationFn: (id: number) => updateUserStatus(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminUsers"] });
      toast.success("Cập nhật trạng thái thành công");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Cập nhật thất bại");
    },
  });

  // 3. MUTATION: Xóa User
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminUsers"] });
      toast.success("Xóa user thành công");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Xóa thất bại");
    },
  });

  // --- Logic để disable nút cụ thể ---
  const isToggling = toggleStatusMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Quản lý Khách hàng</h2>

      <div className="rounded-md border">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-red-500">
            Lỗi khi tải dữ liệu
          </div>
        ) : (
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-20">
                    ID
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Tên
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Email
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
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="h-24 text-center">
                      Không có dữ liệu.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <td className="p-4 align-middle">{u.id}</td>
                      <td className="p-4 align-middle">
                        {u.name || u.full_name || "—"}
                      </td>
                      <td className="p-4 align-middle">{u.email || "—"}</td>
                      <td className="p-4 align-middle text-center">
                        <Badge variant={u.isActive ? "default" : "secondary"}>
                          {u.isActive ? "Hoạt động" : "Đã khóa"}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/admin/users/${u.id}`)}
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleStatusMutation.mutate(u.id)}
                            disabled={isToggling}
                          >
                            {u.isActive ? "Khóa" : "Mở khóa"}
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (!confirm(`Xóa user ${u.email || u.id}?`))
                                return;
                              deleteMutation.mutate(u.id);
                            }}
                            disabled={isDeleting}
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
        )}
      </div>
    </div>
  );
}
