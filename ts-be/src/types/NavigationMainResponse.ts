// Định nghĩa một item menu có khả năng đệ quy
interface NavMenuItem {
  /** Tên hiển thị của mục menu (Ví dụ: "Nam", "Áo", "Nike") */
  name: string;

  /** Slug dùng để điều hướng (Ví dụ: "nam", "ao", "nike") */
  slug: string;

  /** * Các mục con lồng ghép (Nếu có).
   * Dùng cho Category, Brand, Sport.
   */
  items?: NavMenuItem[];
}

/** * Cấu trúc phản hồi cuối cùng: Một mảng các mục menu cấp cao nhất.
 */
type NavigationMainResponse = NavMenuItem[];
