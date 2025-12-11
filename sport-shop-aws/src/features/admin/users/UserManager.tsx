import { useQuery } from "@tanstack/react-query";
import { getUsersForAdmin, type AdminUser } from "@/services/userApi";
import { Loader2 } from "lucide-react";

export function UserManager() {
  // QUERY: Lấy danh sách Users
  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery<AdminUser[]>({
    queryKey: ["adminUsers"],
    queryFn: getUsersForAdmin,
  });

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
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="h-24 text-center">
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
                        {u.name || u.fullName || "—"}
                      </td>
                      <td className="p-4 align-middle">{u.email || "—"}</td>
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
