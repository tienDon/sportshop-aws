import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { User } from "lucide-react";
import { Input } from "../ui/input";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "../ui/button";

const createAuthSchema = (isSignup: boolean) =>
  z.object({
    identifier: z
      .string()
      .nonempty("Vui lòng nhập email hoặc số điện thoại")
      .refine(
        (value) =>
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ||
          /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/.test(value),
        "Vui lòng nhập email hoặc số điện thoại hợp lệ"
      ),
    firstName: isSignup
      ? z.string().nonempty("Tên là bắt buộc")
      : z.string().optional(),
    lastName: isSignup
      ? z.string().nonempty("Họ là bắt buộc")
      : z.string().optional(),
  });

type AuthFormData = z.infer<ReturnType<typeof createAuthSchema>>;

const AuthFormDialog = ({
  handleSignup,
  isSignup,
}: {
  handleSignup: () => void;
  isSignup: boolean;
}) => {
  const { otpSent, setOtpSent } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormData>({
    resolver: zodResolver(createAuthSchema(isSignup)),
  });

  // Theo dõi sự thay đổi của otpSent
  useEffect(() => {
    console.log("🔄 otpSent đã thay đổi thành:", otpSent);
  }, [otpSent]);

  const onsubmit = async (data: AuthFormData) => {
    console.log("Form submitted with data:", data);

    try {
      const { requestOtp } = useAuthStore.getState();
      
      // Tạo tên đầy đủ cho signup
      const fullName = isSignup && data.firstName && data.lastName 
        ? `${data.firstName} ${data.lastName}` 
        : undefined;

      // Gọi API requestOtp
      await requestOtp(data.identifier, fullName);
      
      console.log("✅ OTP request successful");
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="header" className="cursor-pointer">
          <User className="h-5 w-5 text-gray-700" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onsubmit)}>
          <DialogHeader>
            <DialogTitle>Chào mừng bạn đến với Sport Shop</DialogTitle>
            <DialogDescription className="pb-2">
              {isSignup ? (
                <>
                  Bạn đã có tài khoản?{" "}
                  <span
                    className="cursor-pointer underline underline-offset-4 hover:text-blue-400 "
                    onClick={handleSignup}
                  >
                    Đăng nhập ngay!
                  </span>
                </>
              ) : (
                <>
                  Bạn chưa có tài khoản?{" "}
                  <span
                    className="cursor-pointer underline underline-offset-4 hover:text-blue-400"
                    onClick={handleSignup}
                  >
                    Đăng ký ngay!
                  </span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="identifier">Email hoặc số điện thoại</Label>
              <Input
                id="identifier"
                {...register("identifier")}
                placeholder="Nhập email hoặc số điện thoại của bạn"
              />
              {errors.identifier && (
                <p className="text-red-500 text-sm">
                  {errors.identifier.message}
                </p>
              )}
            </div>
            {isSignup && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="lastname" className="block text-sm">
                    Họ
                  </Label>
                  <Input
                    id="lastname"
                    {...register("lastName")}
                    type="text"
                    placeholder="Nguyen"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstname" className="block text-sm">
                    Tên
                  </Label>
                  <Input
                    id="firstname"
                    {...register("firstName")}
                    type="text"
                    placeholder="Van An"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-center pt-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang gửi..." : "Gửi otp"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthFormDialog;
