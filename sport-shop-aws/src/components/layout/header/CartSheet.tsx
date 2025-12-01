import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingBag } from "lucide-react";
import React from "react";
import { Link } from "react-router";

const CartSheet = () => {
  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
            <ShoppingBag className="h-5 w-5 text-gray-700" />
            {/* Badge for cart count */}
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xl rounded-full h-5 w-5 flex items-center justify-center">
              0
            </span>
          </button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="text-xl mt-4">
              Giỏ hàng của tôi (0)
            </SheetTitle>
          </SheetHeader>
          <SheetDescription className="pl-4">
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </SheetDescription>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default CartSheet;
