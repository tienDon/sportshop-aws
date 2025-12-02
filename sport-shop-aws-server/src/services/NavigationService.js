import Category from "../models/Category.js";
import Attribute from "../models/Attribute.js";
import Brand from "../models/Brand.js";
import Sport from "../models/Sport.js";

class NavigationService {
  /**
   * Tạo dữ liệu navigation chính cho navbar
   * @returns {Array} Navigation items
   */
  async getMainNavigation() {
    try {
      // 1. Lấy các dữ liệu cơ bản
      const [genderAttribute, categories, brands, sports] = await Promise.all([
        this.getGenderAttribute(),
        this.getActiveCategories(),
        this.getActiveBrands(),
        this.getActiveSports(),
      ]);

      const navigation = [];

      // 2. Thêm navigation items theo thứ tự
      await this.addGenderNavItems(navigation, genderAttribute, categories);
      await this.addAccessoriesNavItem(navigation, categories);
      this.addBrandsNavItem(navigation, brands);
      this.addSportsNavItem(navigation, sports);

      return navigation;
    } catch (error) {
      throw new Error(`Lỗi tạo navigation: ${error.message}`);
    }
  }

  /**
   * Lấy Gender Attribute với values
   */
  async getGenderAttribute() {
    return await Attribute.findOne({ code: "gender" }).select("values");
  }

  /**
   * Lấy tất cả categories đang active
   */
  async getActiveCategories() {
    return await Category.find({ is_active: true })
      .select("_id name slug parent_id")
      .lean();
  }

  /**
   * Lấy tất cả brands đang active
   */
  async getActiveBrands() {
    return await Brand.find({ is_active: true })
      .select("_id name slug")
      .sort({ name: 1 })
      .lean();
  }

  /**
   * Lấy tất cả sports đang active
   */
  async getActiveSports() {
    return await Sport.find({ is_active: true })
      .select("_id name slug")
      .sort({ name: 1 })
      .lean();
  }

  /**
   * Thêm navigation items cho Gender (Nam, Nữ, Trẻ Em)
   */
  async addGenderNavItems(navigation, genderAttribute, categories) {
    if (!genderAttribute?.values) return;

    for (const genderValue of genderAttribute.values) {
      const genderNavItem = {
        id: genderValue._id.toString(),
        name: genderValue.value,
        slug: this.createSlugFromGender(genderValue.value),
        type: "GENDER",
        children: await this.buildGenderMegaMenu(categories, genderValue.value),
      };
      navigation.push(genderNavItem);
    }
  }

  /**
   * Thêm navigation item cho Phụ Kiện
   */
  async addAccessoriesNavItem(navigation, categories) {
    const phuKienCategory = categories.find(
      (cat) => cat.slug === "phu-kien" && !cat.parent_id
    );

    if (phuKienCategory) {
      navigation.push({
        id: phuKienCategory._id.toString(),
        name: "Phụ Kiện",
        slug: "phu-kien",
        type: "CATEGORY",
        children: await this.buildAccessoriesMegaMenu(
          categories,
          phuKienCategory._id
        ),
      });
    }
  }

  /**
   * Thêm navigation item cho Thương Hiệu
   */
  addBrandsNavItem(navigation, brands) {
    navigation.push({
      id: "STATIC_BRAND",
      name: "Thương Hiệu",
      slug: "thuong-hieu",
      type: "STATIC",
      children: [
        {
          id: "brands-column",
          name: "CÁC THƯƠNG HIỆU",
          items: brands.map((brand) => ({
            id: brand._id.toString(),
            name: brand.name,
            slug: brand.slug,
          })),
        },
      ],
    });
  }

  /**
   * Thêm navigation item cho Thể Thao
   */
  addSportsNavItem(navigation, sports) {
    navigation.push({
      id: "STATIC_SPORT",
      name: "Thể Thao",
      slug: "the-thao",
      type: "STATIC",
      children: [
        {
          id: "sports-column",
          name: "MÔN THỂ THAO",
          items: sports.map((sport) => ({
            id: sport._id.toString(),
            name: sport.name,
            slug: sport.slug,
          })),
        },
      ],
    });
  }

  /**
   * Tạo slug từ tên gender
   */
  createSlugFromGender(genderValue) {
    return genderValue
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[êếề]/g, "e")
      .replace(/[àáạảã]/g, "a")
      .replace(/[ưứừ]/g, "u");
  }

  /**
   * Xây dựng megamenu cho gender (Nam/Nữ/Trẻ Em)
   */
  async buildGenderMegaMenu(categories, genderValue) {
    const children = [];

    // Lấy các category cấp 1 (trừ phụ kiện)
    const rootCategories = categories.filter(
      (cat) => !cat.parent_id && cat.slug !== "phu-kien"
    );

    for (const rootCat of rootCategories) {
      const allSubCategories = this.getSubCategories(categories, rootCat._id);

      // Lọc subcategories theo giới tính
      const filteredSubCategories = this.filterCategoriesByGender(
        allSubCategories,
        genderValue
      );

      if (filteredSubCategories.length > 0) {
        children.push({
          id: `${genderValue
            .toLowerCase()
            .replace(/\s+/g, "-")}-${rootCat._id.toString()}`, // Unique ID
          name: rootCat.name.toUpperCase(),
          items: filteredSubCategories.map((sub) => ({
            id: sub._id.toString(),
            name: sub.name,
            slug: sub.slug,
          })),
        });
      }
    }

    return children;
  }

  /**
   * Xây dựng megamenu cho Phụ Kiện
   */
  async buildAccessoriesMegaMenu(categories, phuKienCategoryId) {
    const subCategories = this.getSubCategories(categories, phuKienCategoryId);

    // Group categories theo loại
    const groups = this.groupAccessoriesCategories(subCategories);
    const children = [];

    // Tạo columns cho từng group
    if (groups.tuiBalo.length > 0) {
      children.push(
        this.createAccessoryColumn(
          "tui-balo-group",
          "TÚI & BA LÔ",
          groups.tuiBalo
        )
      );
    }

    if (groups.muNon.length > 0) {
      children.push(
        this.createAccessoryColumn(
          "mu-non-group",
          "MŨ / NÓN & BĂNG ĐÔ",
          groups.muNon
        )
      );
    }

    if (groups.khac.length > 0) {
      children.push(
        this.createAccessoryColumn("khac-group", "KHÁC", groups.khac)
      );
    }

    return children;
  }

  /**
   * Lọc categories theo giới tính
   * @param {Array} categories - Danh sách categories
   * @param {String} genderValue - Giới tính (Nam, Nữ, Trẻ em)
   * @returns {Array} - Danh sách categories đã lọc
   */
  filterCategoriesByGender(categories, genderValue) {
    return categories.filter((category) => {
      const categoryName = category.name.toLowerCase();
      const categorySlug = category.slug.toLowerCase();

      // Mapping logic cho từng giới tính
      switch (genderValue) {
        case "Nam":
          return this.isMaleCategory(categoryName, categorySlug);
        case "Nữ":
          return this.isFemaleCategory(categoryName, categorySlug);
        case "Trẻ em":
          return this.isKidsCategory(categoryName, categorySlug);
        default:
          return true; // Nếu không xác định được, hiển thị tất cả
      }
    });
  }

  /**
   * Kiểm tra category có phù hợp với Nam không
   */
  isMaleCategory(categoryName, categorySlug) {
    // Loại bỏ các category chỉ dành cho nữ
    const femaleOnlyKeywords = [
      "áo tập nữ",
      "áo bra",
      "chân váy",
      "váy",
      "ao-tap-nu",
      "ao-bra",
      "chan-vay",
    ];

    return !femaleOnlyKeywords.some(
      (keyword) =>
        categoryName.includes(keyword) ||
        categorySlug.includes(keyword.replace(/\s+/g, "-"))
    );
  }

  /**
   * Kiểm tra category có phù hợp với Nữ không
   */
  isFemaleCategory(categoryName, categorySlug) {
    // Cho phép tất cả categories cho nữ (bao gồm cả unisex và female-specific)
    return true;
  }

  /**
   * Kiểm tra category có phù hợp với Trẻ em không
   */
  isKidsCategory(categoryName, categorySlug) {
    // Loại bỏ các category chỉ dành cho người lớn
    const adultOnlyKeywords = [
      "áo tập nữ",
      "áo bra",
      "quần lót",
      "chân váy",
      "ao-tap-nu",
      "ao-bra",
      "quan-lot",
      "chan-vay",
    ];

    return !adultOnlyKeywords.some(
      (keyword) =>
        categoryName.includes(keyword) ||
        categorySlug.includes(keyword.replace(/\s+/g, "-"))
    );
  }

  /**
   * Lấy subcategories của một category
   */
  getSubCategories(categories, parentId) {
    return categories.filter(
      (cat) => cat.parent_id && cat.parent_id.toString() === parentId.toString()
    );
  }

  /**
   * Group accessories categories theo loại
   */
  groupAccessoriesCategories(subCategories) {
    return {
      tuiBalo: subCategories.filter(
        (cat) => cat.slug.includes("ba-lo") || cat.slug.includes("tui")
      ),
      muNon: subCategories.filter(
        (cat) => cat.slug.includes("mu-") || cat.slug.includes("non")
      ),
      khac: subCategories.filter(
        (cat) =>
          !cat.slug.includes("ba-lo") &&
          !cat.slug.includes("tui") &&
          !cat.slug.includes("mu-") &&
          !cat.slug.includes("non")
      ),
    };
  }

  /**
   * Tạo column cho accessories
   */
  createAccessoryColumn(id, name, items) {
    return {
      id,
      name,
      items: items.map((item) => ({
        id: item._id.toString(),
        name: item.name,
        slug: item.slug,
      })),
    };
  }
}

export default new NavigationService();
