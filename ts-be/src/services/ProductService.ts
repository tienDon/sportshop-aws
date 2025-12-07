import { prisma } from "../lib/prisma.js";
import { Product } from "generated/prisma/client.js";

class ProductService {
  static async createProduct(productData: Product) {
    const newProduct = await prisma.product.create({
      data: productData,
    });
    return newProduct;
  }

  static async getProductsByQuery(filters: any, pagination: any) {
    const whereClause: any = {
      isActive: true, // Mặc định chỉ lấy sản phẩm đang active
    };

    // 1. Lọc theo Category Slug (Thông qua bảng trung gian ProductCategory)
    if (filters.category_slug) {
      whereClause.productCategories = {
        some: {
          category: {
            slug: filters.category_slug,
          },
        },
      };
    }

    // 2. Lọc theo Audience/Gender Slug (Thông qua bảng trung gian ProductAudience)
    if (filters.gender_slug) {
      whereClause.productAudiences = {
        some: {
          audience: {
            slug: filters.gender_slug,
          },
        },
      };
    }

    // 2.1 Lọc theo Brand Slug
    if (filters.brand_slug) {
      whereClause.brand = {
        slug: filters.brand_slug,
      };
    }

    // 2.2 Lọc theo Sport Slug
    if (filters.sport_slug) {
      whereClause.productSports = {
        some: {
          sport: {
            slug: filters.sport_slug,
          },
        },
      };
    }

    // 3. Tìm kiếm theo tên
    if (filters.q) {
      whereClause.name = {
        contains: filters.q,
        // mode: 'insensitive', // MySQL mặc định thường không phân biệt hoa thường, nếu dùng Postgres thì cần dòng này
      };
    }

    // 4. Lọc theo khoảng giá (basePrice)
    if (filters.min_price || filters.max_price) {
      whereClause.basePrice = {};
      if (filters.min_price) {
        whereClause.basePrice.gte = Number(filters.min_price);
      }
      if (filters.max_price) {
        whereClause.basePrice.lte = Number(filters.max_price);
      }
    }

    // 5. Query Database với Select (Chỉ lấy trường cần thiết)
    const limit = Number(pagination.limit) || 16;
    const page = Number(pagination.page) || 1;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        take: limit,
        skip: skip,
        orderBy: {
          createdAt: "desc", // Mặc định mới nhất trước
        },
        select: {
          id: true,
          name: true,
          slug: true,
          mainImageUrl: true,
          basePrice: true,
          badgeId: true,
          // Lấy tên Brand
          brand: {
            select: {
              name: true,
            },
          },
          // Lấy danh sách variants (để lấy color và size)
          variants: {
            select: {
              color: {
                select: {
                  name: true,
                  hexCode: true,
                },
              },
              size: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    // 6. Transform dữ liệu cho đẹp (Flatten structure)
    const transformedProducts = products.map((p) => {
      const colors = [...new Set(p.variants.map((v) => v.color.hexCode))];
      const sizes = [...new Set(p.variants.map((v) => v.size.name))];
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        mainImageUrl: p.mainImageUrl,
        basePrice: p.basePrice,
        badgeId: p.badgeId,
        brandName: p.brand?.name,
        colors,
        sizes,
      };
    });

    return {
      products: transformedProducts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async addAudienceToProduct(productId: number, audienceId: number) {
    // Kiểm tra product và audience có tồn tại không
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new Error("Product not found");
    }
    const audience = await prisma.audience.findUnique({
      where: { id: audienceId },
    });
    if (!audience) {
      throw new Error("Audience not found");
    }

    // Thêm audience vào product
    await prisma.productAudience.create({
      data: {
        productId,
        audienceId,
      },
    });

    // Trả về product đã được cập nhật
    return await prisma.product.findUnique({
      where: { id: productId },
      include: {
        productAudiences: {
          include: {
            audience: true,
          },
        },
      },
    });
  }

  static async addCategoryToProduct(productId: number, categoryId: number) {
    // Kiểm tra product và category có tồn tại không
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new Error("Product not found");
    }
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new Error("Category not found");
    }

    // Thêm category vào product
    await prisma.productCategory.create({
      data: {
        productId,
        categoryId,
      },
    });

    // Trả về product đã được cập nhật
    return await prisma.product.findUnique({
      where: { id: productId },
      include: {
        productCategories: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  static async addSportToProduct(productId: number, sportId: number) {
    // Kiểm tra product và sport có tồn tại không
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new Error("Product not found");
    }
    const sport = await prisma.sport.findUnique({
      where: { id: sportId },
    });
    if (!sport) {
      throw new Error("Sport not found");
    }

    // Thêm sport vào product
    await prisma.productSport.create({
      data: {
        productId,
        sportId,
      },
    });

    // Trả về product đã được cập nhật
    return await prisma.product.findUnique({
      where: { id: productId },
      include: {
        productSports: {
          include: {
            sport: true,
          },
        },
      },
    });
  }

  static async addVariantToProduct(
    productId: number,
    colorId: number,
    sizeId: number,
    price: number,
    stockQuantity: number,
    sku?: string
  ) {
    // Kiểm tra product có tồn tại không
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new Error("Product not found");
    }
    if (!sku) {
      sku = `SKU-${productId}-${product.slug}-${colorId}-${sizeId}`;
    }
    // Thêm variant vào product
    const existingVariant = await prisma.productVariant.findFirst({
      where: {
        productId,
        colorId,
        sizeId,
      },
    });
    if (existingVariant) {
      throw new Error("Variant already exists");
    }
    const newVariant = await prisma.productVariant.create({
      data: {
        colorId,
        sizeId,
        price,
        stockQuantity,
        sku,
        productId,
      },
    });
    return newVariant;
  }

  static async deleteVariantFromProduct(productId: number, variantId: number) {
    // Kiểm tra product có tồn tại không
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new Error("Product not found");
    }
    // Xóa variant khỏi product
    const deletedVariant = await prisma.productVariant.delete({
      where: {
        id: variantId,
      },
    });
    return deletedVariant;
  }

  static async getVariantsByProductId(productId: number) {
    // Kiểm tra product có tồn tại không
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new Error("Product not found");
    }
    const variants = await prisma.productVariant.findMany({
      where: { productId },
      include: {
        product: true,
      },
    });
    return variants;
  }

  static async addAttributeValueToProduct(
    productId: number,
    attributeValueId: number
  ) {
    // Kiểm tra product và attribute value có tồn tại không
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new Error("Product not found");
    }
    const attributeValue = await prisma.attributeValue.findUnique({
      where: { id: attributeValueId },
    });
    if (!attributeValue) {
      throw new Error("Attribute Value not found");
    }
    // Thêm attribute value vào product
    await prisma.productAttributeValue.create({
      data: {
        productId,
        attributeValueId,
      },
    });

    // Trả về product đã được cập nhật
    return await prisma.product.findUnique({
      where: { id: productId },
      include: {
        productAttributeValues: {
          include: {
            attributeValue: true,
          },
        },
      },
    });
  }

  static async updateVariantOfProduct(
    productId: number,
    variantId: number,
    colorId?: number,
    sizeId?: number,
    price?: number,
    stockQuantity?: number,
    sku?: string,
    imageUrls?: string[]
  ) {
    // Kiểm tra product có tồn tại không
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new Error("Product not found");
    }

    // Kiểm tra variant có tồn tại không
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
    });
    if (!variant) {
      throw new Error("Variant not found");
    }

    // Build data object dynamically
    const data: any = {};
    if (colorId !== undefined && !isNaN(colorId)) {
      const color = await prisma.color.findUnique({ where: { id: colorId } });
      if (!color) throw new Error("Color not found");
      data.color = { connect: { id: colorId } };
    }
    if (sizeId !== undefined && !isNaN(sizeId)) {
      const size = await prisma.size.findUnique({ where: { id: sizeId } });
      if (!size) throw new Error("Size not found");
      data.size = { connect: { id: sizeId } };
    }
    if (price !== undefined && !isNaN(price)) data.price = price;
    if (stockQuantity !== undefined && !isNaN(stockQuantity))
      data.stockQuantity = stockQuantity;
    if (sku !== undefined) data.sku = sku;
    if (imageUrls !== undefined) data.imageUrls = imageUrls;

    // Cập nhật variant
    const updatedVariant = await prisma.productVariant.update({
      where: { id: variantId },
      data: data,
    });

    return updatedVariant;
  }

  static async getAudiencesByProductId(productId: number) {
    // Kiểm tra product có tồn tại không
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new Error("Product not found");
    }
    const audiences = await prisma.productAudience.findMany({
      where: { productId },
      include: {
        audience: true,
      },
    });
    return audiences.map((pa) => pa.audience);
  }

  static async getCategoriesByProductId(productId: number) {
    // Kiểm tra product có tồn tại không
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new Error("Product not found");
    }
    const categories = await prisma.productCategory.findMany({
      where: { productId },
      include: {
        category: true,
      },
    });
    return categories.map((pc) => pc.category);
  }

  static async getProductBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        brand: true,
        variants: {
          include: {
            color: true,
            size: true,
          },
        },
        productAttributeValues: {
          include: {
            attributeValue: {
              include: {
                attribute: true,
              },
            },
          },
        },
      },
    });

    if (!product) return null;

    // 1. Colors
    const colorsMap = new Map();
    product.variants.forEach((v) => {
      if (!colorsMap.has(v.colorId)) {
        colorsMap.set(v.colorId, {
          id: v.color.id,
          name: v.color.name,
          hexCode: v.color.hexCode,
        });
      }
    });
    const colors = Array.from(colorsMap.values());

    // 2. Sizes
    const sizesSet = new Set(product.variants.map((v) => v.size.name));
    const sizes = Array.from(sizesSet);

    // 3. Attributes
    const attributesMap = new Map<string, string[]>();
    product.productAttributeValues.forEach((pav) => {
      const name = pav.attributeValue.attribute.name;
      const value = pav.attributeValue.value;
      if (!attributesMap.has(name)) {
        attributesMap.set(name, []);
      }
      // Avoid duplicates
      if (!attributesMap.get(name)?.includes(value)) {
        attributesMap.get(name)?.push(value);
      }
    });

    const attributes = Array.from(attributesMap.entries()).map(
      ([name, values]) => ({
        name,
        value: values,
      })
    );

    // 4. Variants
    const variants = product.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      price: v.price || product.basePrice,
      stockQuantity: v.stockQuantity,
      colorId: v.colorId,
      sizeName: v.size.name,
      imageUrls: v.imageUrls,
    }));

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      brandName: product.brand?.name,
      basePrice: product.basePrice,
      description: product.description,
      specifications: product.specifications,
      note: product.note,
      colors,
      sizes,
      attributes,
      variants,
    };
  }
}

export default ProductService;
