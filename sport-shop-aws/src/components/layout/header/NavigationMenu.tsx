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
import {
  transformCategoriesToNavigation,
  getDropdownContent,
} from "@/utils/catalogUtils";
import { Skeleton } from "@/components/ui/skeleton";

const NavigationMenu = () => {
  const navigate = useNavigate();
  const { navigationData, loading, error } = useNavigation();

  // Loading skeleton
  if (loading) {
    return (
      <div className="flex items-center justify-center w-full">
        <div className="flex space-x-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-20" />
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

  // Transform API data to navigation structure
  const mainCategories = transformCategoriesToNavigation(
    navigationData.mainCategories.map((item) => item.category)
  );

  return (
    <div className="flex items-center justify-center w-full">
      <ShadcnNavMenu viewport={true} className="w-full">
        <NavigationMenuList className="flex items-center justify-center space-x-0">
          {mainCategories.map((category) => (
            <NavigationMenuItem key={category.title} className="relative">
              {category.hasDropdown ? (
                <>
                  <NavigationMenuTrigger
                    className="h-auto px-4 cursor-pointer py-6 text-lg font-medium text-black bg-transparent hover:bg-transparent data-[state=open]:bg-transparent data-active:bg-transparent focus:bg-transparent hover:text-red-500 transition-all duration-200 rounded-none"
                    onClick={() => {
                      // Only navigate if not "Thương Hiệu" category
                      console.log(category.title);
                      if (category.title === "Thương Hiệu") {
                        navigate("/brands");
                      } else navigate(category.href);
                    }}
                  >
                    {category.title}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="container mx-auto px-4 py-12 bg-white border shadow-lg">
                      <div className="grid grid-cols-3 gap-12">
                        {getDropdownContent(category.title, navigationData).map(
                          (section) => (
                            <div key={section.title} className="space-y-6">
                              <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-gray-200 pb-2">
                                {section.title}
                              </h3>
                              <ul className="space-y-3">
                                {section.items.map((item) => (
                                  <li key={item.href}>
                                    <NavigationMenuLink asChild>
                                      <Link
                                        to={item.href}
                                        className={`block text-sm hover:text-black transition-colors duration-200 py-1 ${
                                          item.featured
                                            ? "font-semibold text-black border-t border-gray-200 pt-3 mt-3"
                                            : "text-gray-700 hover:text-red-400"
                                        }`}
                                      >
                                        {item.name}
                                      </Link>
                                    </NavigationMenuLink>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </>
              ) : (
                <NavigationMenuLink asChild>
                  <Link
                    to={category.href}
                    className={`block px-4 py-6 text-lg font-medium bg-transparent hover:bg-transparent hover:text-red-500 transition-all duration-200 ${
                      category.isSpecial
                        ? "text-red-600 hover:text-red-700 hover:border-red-600"
                        : "text-black hover:text-yellow"
                    }`}
                  >
                    {category.title}
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
