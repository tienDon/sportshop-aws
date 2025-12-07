import { prisma } from "./src/lib/prisma.js";

async function main() {
  console.log("🌱 Seeding Audiences...");

  // 1. Create Audiences
  const audiences = [
    { name: "Nam", slug: "nam", sortOrder: 1 },
    { name: "Nữ", slug: "nu", sortOrder: 2 },
    { name: "Trẻ em", slug: "tre-em", sortOrder: 3 },
  ];

  for (const aud of audiences) {
    await prisma.audience.upsert({
      where: { slug: aud.slug },
      update: {},
      create: aud,
    });
  }

  console.log("✅ Audiences created.");

  // 2. Link Products to Audiences
  // Demo: Link tất cả sản phẩm hiện có vào "Nam" để test
  const namAudience = await prisma.audience.findUnique({
    where: { slug: "nam" },
  });

  if (namAudience) {
    const products = await prisma.product.findMany();
    console.log(
      `Found ${products.length} products. Linking to 'Nam' audience for demo...`
    );

    for (const p of products) {
      // Check if already linked
      const exists = await prisma.productAudience.findUnique({
        where: {
          productId_audienceId: {
            productId: p.id,
            audienceId: namAudience.id,
          },
        },
      });

      if (!exists) {
        await prisma.productAudience.create({
          data: {
            productId: p.id,
            audienceId: namAudience.id,
          },
        });
      }
    }
  }

  console.log("✅ Linked products to Audience 'Nam'.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
