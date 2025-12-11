/**
 * Convert Vietnamese text to URL-friendly slug
 * @param text - Input text to convert
 * @returns URL-friendly slug
 *
 * @example
 * generateSlug("Áo Thun Nike Dri-FIT") // "ao-thun-nike-dri-fit"
 * generateSlug("Quần Short Adidas") // "quan-short-adidas"
 */
export function generateSlug(text: string): string {
  if (!text) return "";

  return (
    text
      .toLowerCase()
      // Normalize Vietnamese characters
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      // Replace đ/Đ specifically
      .replace(/đ/g, "d")
      .replace(/Đ/g, "d")
      // Remove special characters except spaces and hyphens
      .replace(/[^a-z0-9\s-]/g, "")
      // Replace multiple spaces with single hyphen
      .replace(/\s+/g, "-")
      // Replace multiple hyphens with single hyphen
      .replace(/-+/g, "-")
      // Remove leading/trailing hyphens
      .replace(/^-+|-+$/g, "")
      .trim()
  );
}

/**
 * Generate unique slug with suffix if needed
 * @param text - Input text to convert
 * @param existingSlugs - Array of existing slugs to check against
 * @returns Unique slug
 *
 * @example
 * generateUniqueSlug("Nike Air", ["nike-air"]) // "nike-air-1"
 * generateUniqueSlug("Nike Air", ["nike-air", "nike-air-1"]) // "nike-air-2"
 */
export function generateUniqueSlug(
  text: string,
  existingSlugs: string[]
): string {
  const baseSlug = generateSlug(text);

  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  let counter = 1;
  let uniqueSlug = `${baseSlug}-${counter}`;

  while (existingSlugs.includes(uniqueSlug)) {
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }

  return uniqueSlug;
}

/**
 * Validate if a string is a valid slug
 * @param slug - Slug to validate
 * @returns true if valid slug format
 *
 * @example
 * isValidSlug("ao-thun-nike") // true
 * isValidSlug("áo thun nike") // false
 * isValidSlug("ao_thun_nike") // false
 */
export function isValidSlug(slug: string): boolean {
  if (!slug) return false;

  // Valid slug: lowercase letters, numbers, and hyphens only
  // Cannot start or end with hyphen
  // Cannot have consecutive hyphens
  const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;

  return slugRegex.test(slug);
}

/**
 * Create slug from name with optional prefix
 * @param name - Name to convert
 * @param prefix - Optional prefix to add
 * @returns Slug with optional prefix
 *
 * @example
 * createSlugWithPrefix("Air Max", "nike") // "nike-air-max"
 * createSlugWithPrefix("Air Max") // "air-max"
 */
export function createSlugWithPrefix(name: string, prefix?: string): string {
  const slug = generateSlug(name);

  if (prefix) {
    const prefixSlug = generateSlug(prefix);
    return `${prefixSlug}-${slug}`;
  }

  return slug;
}
