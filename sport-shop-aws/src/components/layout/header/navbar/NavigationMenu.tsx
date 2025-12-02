import { Link, useNavigate } from "react-router";
import {
  NavigationMenu as ShadcnNavMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { useNavigation } from "@/hooks/useCatalog";
import { Skeleton } from "@/components/ui/skeleton";

const NavigationMenu = () => {
  const navigate = useNavigate();
  const { navigationData, loading, error } = useNavigation();

  // Loading skeleton
  if (loading) {
    return (
      <div className="flex items-center justify-center w-full">
        <div className="flex space-x-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-24" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    console.error("Navigation error:", error);
    return (
      <div className="flex items-center justify-center w-full">
        <p className="text-red-500 text-sm">Không thể tải menu navigation</p>
      </div>
    );
  }

  // No data state
  if (!navigationData) {
    return null;
  }

  const getLinkHref = (parentSlug: string, itemSlug: string) => {
    if (parentSlug === "thuong-hieu") return `/brands/${itemSlug}`;
    if (parentSlug === "the-thao") return `/collections?sport=${itemSlug}`;
    return `/collections/${parentSlug}/${itemSlug}`;
  };

  const getParentHref = (navItem: any) => {
    if (navItem.slug === "thuong-hieu") return "/brands";
    if (navItem.slug === "the-thao") return "/collections?type=sport";
    return `/collections/${navItem.slug}`;
  };

  return (
    <div className="flex items-center justify-center w-full">
      <ShadcnNavMenu viewport={true} className="w-full">
        <NavigationMenuList className="flex items-center justify-center space-x-0">
          {/* 1. Hàng Mới (Static) */}
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link
                to="/collections/new-arrivals"
                className="block px-4 py-6 text-lg font-medium text-black hover:text-red-500 transition-all duration-200 bg-transparent hover:bg-transparent"
              >
                Hàng Mới
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          {/* 2. Dynamic Items from API */}
          {navigationData.map((navItem) => (
            <NavigationMenuItem key={navItem.id} className="relative">
              {navItem.children && navItem.children.length > 0 ? (
                <>
                  <NavigationMenuTrigger
                    className="h-auto px-4 cursor-pointer py-6 text-lg font-medium text-black bg-transparent hover:bg-transparent data-[state=open]:bg-transparent data-active:bg-transparent focus:bg-transparent hover:text-red-500 transition-all duration-200 rounded-none"
                    onClick={() => navigate(getParentHref(navItem))}
                  >
                    {navItem.name}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-full px-8 py-8 bg-white">
                      <div
                        className="grid gap-8 container mx-auto"
                        style={{
                          gridTemplateColumns: `repeat(${navItem.children.length}, minmax(0, 1fr))`,
                        }}
                      >
                        {navItem.children.map((column) => (
                          <div key={column.id} className="space-y-4">
                            {/* Level 2: Header (Chữ bự hơn chút) */}
                            <h3 className="text-base font-bold text-black uppercase tracking-wider border-b border-gray-200 pb-2">
                              {column.name}
                            </h3>
                            {/* Level 3: Links */}
                            <ul className="space-y-2">
                              {column.items
                                .filter(
                                  (item) =>
                                    !["Ưu Đãi", "Hàng Mới"].includes(item.name)
                                )
                                .map((item) => (
                                  <li key={item.id}>
                                    <NavigationMenuLink asChild>
                                      <Link
                                        to={getLinkHref(
                                          navItem.slug,
                                          item.slug
                                        )}
                                        className="block text-sm text-gray-600 hover:text-red-500 transition-colors"
                                      >
                                        {item.name}
                                      </Link>
                                    </NavigationMenuLink>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </>
              ) : (
                <NavigationMenuLink asChild>
                  <Link
                    to={getParentHref(navItem)}
                    className="block px-4 py-6 text-lg font-medium text-black hover:text-red-500 transition-all duration-200 bg-transparent hover:bg-transparent"
                  >
                    {navItem.name}
                  </Link>
                </NavigationMenuLink>
              )}
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </ShadcnNavMenu>
    </div>
  );
};

export default NavigationMenu;
