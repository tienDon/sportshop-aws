# Schema Response

``
interface NavItem {
id: string; // ID của mục (có thể là Attribute ID, Brand ID, hoặc Category ID)
name: string; // Tên hiển thị trên Navbar
slug: string; // Slug để tạo URL (ví dụ: 'nam', 'phu-kien')
type: 'GENDER' | 'BRAND' | 'CATEGORY' | 'STATIC'; // Loại dữ liệu
children?: NavColumn[]; // Dữ liệu cho Megamenu (nếu có)
}

interface NavColumn {
id: string; // ID của mục (Category ID, Sport ID)
name: string; // Tên cột chính
items: NavLink[]; // Các liên kết con trong cột
}

interface NavLink {
id: string;
name: string;
slug: string; // Slug để liên kết trực tiếp
}
``

## Sample JSON

`
[
// 1. MỤC GIỚI TÍNH: NAM (Lấy từ Attribute Value: MaleValueId)
{
"id": "656910a7240c4a4f8d752c24", // MaleValueId
"name": "Nam",
"slug": "nam",
"type": "GENDER",
"children": [ // Dữ liệu của Megamenu Nam (Lấy từ Category Cấp 1)
{
"id": "656910a7240c4a4f8d752c40", // Ao ID
"name": "ÁO",
"items": [
{"id": "...", "name": "Áo Thun", "slug": "ao-thun"},
{"id": "...", "name": "Áo Polo", "slug": "ao-polo"}
]
},
{
"id": "656910a7240c4a4f8d752c41", // Quan ID
"name": "QUẦN",
"items": [
{"id": "...", "name": "Quần Ngắn", "slug": "quan-ngan"},
{"id": "...", "name": "Quần Dài", "slug": "quan-dai"}
]
},
// ... thêm các cột Giày Thể Thao, Giày Dép TT, Phụ Kiện (tất cả đều phải lọc Gender=Nam)
]
},

// 2. MỤC GIỚI TÍNH: NỮ (Lấy từ Attribute Value: FemaleValueId)
{
"id": "656910a7240c4a4f8d752c2a", // FemaleValueId
"name": "Nữ",
"slug": "nu",
"type": "GENDER",
"children": [
// ... Tương tự như Nam, nhưng có thể có các danh mục con khác (ví dụ: Áo Tập Nữ / Áo Bra)
]
},

// 3. MỤC PHỤ KIỆN (Lấy từ Category ID: PhuKien)
{
"id": "656910a7240c4a4f8d752c44", // PhuKien ID
"name": "Phụ Kiện",
"slug": "phu-kien",
"type": "CATEGORY",
"children": [
{
"id": "...",
"name": "TÚI & BA LÔ",
"items": [
{"id": "...", "name": "Ba Lô", "slug": "ba-lo"}
]
},
// ... Mũ / Nón, Khác
]
},

// 4. MỤC THỂ THAO (Lấy từ Sport Collection)
{
"id": "STATIC_SPORT",
"name": "Thể Thao",
"slug": "the-thao",
"type": "STATIC", // Hoặc Sport Collection Root
"children": [
{
"id": "...",
"name": "MÔN THỂ THAO",
"items": [
{"id": "656910a7240c4a4f8d752c21", "name": "Chạy Bộ", "slug": "chay-bo"},
{"id": "656910a7240c4a4f8d752c22", "name": "Tập Luyện", "slug": "tap-luyen"}
]
}
]
},

// 5. MỤC THƯƠNG HIỆU (Lấy từ Brand Collection)
{
"id": "STATIC_BRAND",
"name": "Thương Hiệu",
"slug": "thuong-hieu",
"type": "STATIC", // Hoặc Brand Collection Root
"children": [
{
"id": "...",
"name": "CÁC THƯƠNG HIỆU",
"items": [
{"id": "656910a7240c4a4f8d752c1a", "name": "Under Armour", "slug": "under-armour"},
// ... Nike, Adidas, Puma
]
}
]
}
]
`
GET /api/v1/navigation/main
