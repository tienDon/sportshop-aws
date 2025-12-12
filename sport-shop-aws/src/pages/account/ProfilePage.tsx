import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserAPI } from "@/services/userApi";
import Container from "@/components/ui/Container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, MapPin, Phone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/useAuthStore";

const ProfilePage = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [newPhone, setNewPhone] = useState("");

  // Fetch Addresses
  const { data: addresses, isLoading: isLoadingAddresses } = useQuery({
    queryKey: ["user-addresses"],
    queryFn: UserAPI.getAddresses,
  });

  // Fetch Phones
  const { data: phones, isLoading: isLoadingPhones } = useQuery({
    queryKey: ["user-phones"],
    queryFn: UserAPI.getPhones,
  });

  // Mutations
  const createAddressMutation = useMutation({
    mutationFn: UserAPI.createAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-addresses"] });
      setIsAddressDialogOpen(false);
      setNewAddress("");
      toast.success("Đã thêm địa chỉ mới");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Lỗi khi thêm địa chỉ");
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: UserAPI.deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-addresses"] });
      toast.success("Đã xóa địa chỉ");
    },
  });

  const createPhoneMutation = useMutation({
    mutationFn: UserAPI.createPhone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-phones"] });
      setIsPhoneDialogOpen(false);
      setNewPhone("");
      toast.success("Đã thêm số điện thoại mới");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Lỗi khi thêm số điện thoại"
      );
    },
  });

  const deletePhoneMutation = useMutation({
    mutationFn: UserAPI.deletePhone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-phones"] });
      toast.success("Đã xóa số điện thoại");
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Container>
        <h1 className="text-2xl font-bold mb-6">Thông tin tài khoản</h1>

        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-lg font-semibold mb-4">Thông tin cá nhân</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <div className="p-2 bg-gray-50 rounded border mt-1">
                {user?.email}
              </div>
            </div>
            <div>
              <Label>Họ tên</Label>
              <div className="p-2 bg-gray-50 rounded border mt-1">
                {user?.name ||
                  user?.full_name ||
                  user?.fullName ||
                  "Chưa cập nhật"}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Address Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="w-5 h-5" /> Sổ địa chỉ
              </h2>
              <Dialog
                open={isAddressDialogOpen}
                onOpenChange={setIsAddressDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" /> Thêm
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Thêm địa chỉ mới</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Địa chỉ chi tiết</Label>
                      <Input
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        placeholder="Số nhà, tên đường, phường/xã..."
                      />
                    </div>
                    <Button
                      onClick={() =>
                        createAddressMutation.mutate({
                          addressDetail: newAddress,
                          defaultAddress: addresses?.length === 0,
                        })
                      }
                      disabled={createAddressMutation.isPending || !newAddress}
                      className="w-full"
                    >
                      {createAddressMutation.isPending && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      Lưu địa chỉ
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {isLoadingAddresses ? (
              <p>Đang tải...</p>
            ) : (
              <div className="space-y-3">
                {addresses?.map((addr) => (
                  <div
                    key={addr.id}
                    className="flex justify-between items-center border p-3 rounded-md"
                  >
                    <div>
                      <p className="font-medium">{addr.addressDetail}</p>
                      {addr.defaultAddress && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          Mặc định
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        if (confirm("Bạn có chắc muốn xóa địa chỉ này?")) {
                          deleteAddressMutation.mutate(addr.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {addresses?.length === 0 && (
                  <p className="text-gray-500 text-sm">Chưa có địa chỉ nào.</p>
                )}
              </div>
            )}
          </div>

          {/* Phone Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Phone className="w-5 h-5" /> Số điện thoại
              </h2>
              <Dialog
                open={isPhoneDialogOpen}
                onOpenChange={setIsPhoneDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" /> Thêm
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Thêm số điện thoại mới</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Số điện thoại</Label>
                      <Input
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="0901234567"
                      />
                    </div>
                    <Button
                      onClick={() =>
                        createPhoneMutation.mutate({
                          phoneNumber: newPhone,
                          defaultPhone: phones?.length === 0,
                        })
                      }
                      disabled={createPhoneMutation.isPending || !newPhone}
                      className="w-full"
                    >
                      {createPhoneMutation.isPending && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      Lưu số điện thoại
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {isLoadingPhones ? (
              <p>Đang tải...</p>
            ) : (
              <div className="space-y-3">
                {phones?.map((phone) => (
                  <div
                    key={phone.id}
                    className="flex justify-between items-center border p-3 rounded-md"
                  >
                    <div>
                      <p className="font-medium">{phone.phoneNumber}</p>
                      {phone.defaultPhone && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          Mặc định
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        if (
                          confirm("Bạn có chắc muốn xóa số điện thoại này?")
                        ) {
                          deletePhoneMutation.mutate(phone.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {phones?.length === 0 && (
                  <p className="text-gray-500 text-sm">
                    Chưa có số điện thoại nào.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ProfilePage;
