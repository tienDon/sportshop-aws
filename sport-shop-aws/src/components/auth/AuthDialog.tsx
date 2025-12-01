import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "@/store/useAuthStore";
import AuthFormDialog from "./AuthFormDialog";
import AuthOtpDialog from "./AuthOtpDialog";
import { User } from "lucide-react";
import { Button } from "../ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const AuthDialog = () => {
  const { user, setOtpSent, otpSent, loading, clearState } = useAuthStore();
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);

  // Debug user state changes
  console.log("AuthDialog render - user:", user, "otpSent:", otpSent);

  const handleSignup = () => {
    setIsSignup((prev) => !prev);
  };

  // Helper function để reset về form login
  const resetToLoginForm = () => {
    clearState();
    setIsSignup(false);
  };

  const handleLogout = () => {
    console.log("Logout clicked - User before:", user);
    clearState();

    // Delay navigation để đảm bảo state được clear
    setTimeout(() => {
      console.log("After clearState - User:", useAuthStore.getState().user);
      toast.success("Đăng xuất thành công!");
      navigate("/");
    }, 50);
  };

  return (
    <>
      {/* <button
        onClick={handleOnClick}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <User className="h-5 w-5 text-gray-700" />
      </button> */}

      {user ? (
        <>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="header" className="cursor-pointer">
                <User className="h-5 w-5 text-gray-700" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mt-3.5 mr-10">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuItem>Team</DropdownMenuItem>
              <DropdownMenuItem>Subscription</DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={handleLogout}
                className="cursor-pointer"
              >
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : (
        <>
          {!otpSent ? (
            <AuthFormDialog handleSignup={handleSignup} isSignup={isSignup} />
          ) : (
            <>
              <AuthOtpDialog otpSent={otpSent} />
            </>
          )}
        </>
      )}
    </>
  );
};

export default AuthDialog;
