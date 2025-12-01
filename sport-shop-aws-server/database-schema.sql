-- Sport Shop Database Schema (Inspired by SuperSports.com.vn)
-- Created based on analysis of SuperSports Vietnam website

-- Categories table (hierarchical structure)
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    parent_id INT NULL,
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id)
);

-- Brands table
CREATE TABLE brands (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    logo_url VARCHAR(500),
    description TEXT,
    website_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sports/Activities table
CREATE TABLE sports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    description TEXT,
    short_description VARCHAR(1000),
    sku VARCHAR(100) UNIQUE NOT NULL,
    brand_id INT NOT NULL,
    category_id INT NOT NULL,
    sport_id INT,
    gender ENUM('men', 'women', 'kids', 'unisex') NOT NULL,
    
    -- Pricing
    original_price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2),
    discount_percentage INT DEFAULT 0,
    
    -- Inventory
    stock_quantity INT DEFAULT 0,
    min_stock_level INT DEFAULT 0,
    
    -- Status
    status ENUM('draft', 'active', 'inactive', 'out_of_stock') DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT FALSE,
    is_bestseller BOOLEAN DEFAULT FALSE,
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    
    -- Ratings
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INT DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (brand_id) REFERENCES brands(id),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (sport_id) REFERENCES sports(id),
    INDEX idx_category_brand (category_id, brand_id),
    INDEX idx_gender_sport (gender, sport_id),
    INDEX idx_status_featured (status, is_featured)
);

-- Product variants (colors, sizes)
CREATE TABLE product_variants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    name VARCHAR(255) NOT NULL, -- e.g., "Đen - Size 42"
    color_name VARCHAR(100),
    color_code VARCHAR(7), -- hex color
    size VARCHAR(50),
    sku VARCHAR(100) UNIQUE NOT NULL,
    
    -- Pricing (can override product price)
    price DECIMAL(10,2),
    sale_price DECIMAL(10,2),
    
    -- Inventory
    stock_quantity INT DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Product images
CREATE TABLE product_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    variant_id INT NULL, -- NULL means it's for the main product
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
);

-- Collections (like SuperSports' curated collections)
CREATE TABLE collections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    type ENUM('manual', 'automatic', 'seasonal', 'promotion') DEFAULT 'manual',
    is_active BOOLEAN DEFAULT TRUE,
    start_date DATE NULL,
    end_date DATE NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products in collections
CREATE TABLE collection_products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    collection_id INT NOT NULL,
    product_id INT NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_collection_product (collection_id, product_id)
);

-- Users table (Updated for OTP authentication)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NULL, -- Can be null if user signs up with phone only
    phone VARCHAR(20) UNIQUE NULL,  -- Can be null if user signs up with email only
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    
    -- Status
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    role ENUM('customer', 'admin', 'staff') DEFAULT 'customer',
    
    -- Preferences
    preferred_language VARCHAR(5) DEFAULT 'vi',
    newsletter_subscribed BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Ensure at least one contact method exists
    CONSTRAINT check_contact_method CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- OTP verification table
CREATE TABLE otp_verifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    identifier VARCHAR(255) NOT NULL, -- email or phone
    identifier_type ENUM('email', 'phone') NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    purpose ENUM('signup', 'signin', 'password_reset', 'profile_update') NOT NULL,
    user_id INT NULL, -- NULL for signup, set for existing users
    
    -- Status and timing
    is_used BOOLEAN DEFAULT FALSE,
    is_expired BOOLEAN DEFAULT FALSE,
    attempts_count INT DEFAULT 0,
    max_attempts INT DEFAULT 3,
    
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_identifier_purpose (identifier, purpose),
    INDEX idx_expires_at (expires_at)
);

-- User sessions table (for managing login sessions with refresh tokens)
CREATE TABLE user_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    access_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE NOT NULL,
    device_info VARCHAR(500),
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- Token expiration
    access_token_expires_at TIMESTAMP NOT NULL,
    refresh_token_expires_at TIMESTAMP NOT NULL,
    
    -- Session status
    is_active BOOLEAN DEFAULT TRUE,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_access_token (access_token),
    INDEX idx_refresh_token (refresh_token),
    INDEX idx_user_active (user_id, is_active),
    INDEX idx_refresh_expires (refresh_token_expires_at)
);

-- User addresses
CREATE TABLE user_addresses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM('shipping', 'billing', 'both') DEFAULT 'shipping',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    company VARCHAR(255),
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL DEFAULT 'Vietnam',
    phone VARCHAR(20),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Orders
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Customer info (for guest checkout)
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    
    -- Pricing
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- Status
    status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    
    -- Addresses (stored as JSON for flexibility)
    shipping_address JSON NOT NULL,
    billing_address JSON,
    
    -- Notes
    customer_notes TEXT,
    admin_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Order items
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    variant_id INT NULL,
    
    -- Product info at time of purchase
    product_name VARCHAR(500) NOT NULL,
    variant_name VARCHAR(255),
    sku VARCHAR(100) NOT NULL,
    
    -- Pricing
    unit_price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (variant_id) REFERENCES product_variants(id)
);

-- Shopping cart
CREATE TABLE cart_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL, -- NULL for guest sessions
    session_id VARCHAR(255), -- For guest users
    product_id INT NOT NULL,
    variant_id INT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
);

-- Wishlist
CREATE TABLE wishlists (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id)
);

-- Product reviews
CREATE TABLE product_reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    order_id INT NULL, -- Reference to verify purchase
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    review_text TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    helpful_votes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    UNIQUE KEY unique_user_product_review (user_id, product_id, order_id)
);

-- Blog posts (like SuperSports news and tips)
CREATE TABLE blog_posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    content LONGTEXT NOT NULL,
    excerpt TEXT,
    featured_image VARCHAR(500),
    category ENUM('news', 'promotions', 'fashion_tips', 'sports_guide') NOT NULL,
    author_id INT,
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    
    -- Status
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Engagement
    views_count INT DEFAULT 0,
    
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (author_id) REFERENCES users(id)
);

-- Promotions and discounts
CREATE TABLE promotions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    code VARCHAR(50) UNIQUE, -- NULL for automatic promotions
    type ENUM('percentage', 'fixed_amount', 'free_shipping') NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    minimum_order_amount DECIMAL(10,2) DEFAULT 0,
    usage_limit INT NULL, -- NULL for unlimited
    usage_count INT DEFAULT 0,
    
    -- Conditions
    applicable_to ENUM('all', 'category', 'brand', 'product') DEFAULT 'all',
    condition_ids JSON NULL, -- Store IDs based on applicable_to
    
    -- Timing
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Newsletter subscribers
CREATE TABLE newsletter_subscribers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Insert sample data based on SuperSports
INSERT INTO brands (name, slug) VALUES 
('Nike', 'nike'),
('Adidas', 'adidas'),
('Under Armour', 'under-armour'),
('Columbia', 'columbia'),
('HOKA', 'hoka'),
('Speedo', 'speedo'),
('ASICS', 'asics'),
('PUMA', 'puma'),
('On Running', 'on-running'),
('Crocs', 'crocs'),
('Teva', 'teva');

INSERT INTO sports (name, slug) VALUES 
('Chạy bộ', 'chay-bo'),
('Thời trang thể thao', 'thoi-trang-the-thao'),
('Luyện tập', 'luyen-tap'),
('Ngoài trời', 'ngoai-troi'),
('Bóng đá', 'bong-da'),
('Bơi lội', 'boi-loi'),
('Bóng rổ', 'bong-ro'),
('Golf', 'golf'),
('Tennis', 'tennis'),
('Yoga', 'yoga');

-- Main categories
INSERT INTO categories (name, slug, parent_id) VALUES 
('Nam', 'nam', NULL),
('Nữ', 'nu', NULL),
('Trẻ em', 'tre-em', NULL),
('Phụ kiện', 'phu-kien', NULL);

-- Sub categories for Men
INSERT INTO categories (name, slug, parent_id) VALUES 
('Giày Nam', 'giay-nam', 1),
('Quần áo Nam', 'quan-ao-nam', 1);

-- Sub categories for Women  
INSERT INTO categories (name, slug, parent_id) VALUES 
('Giày Nữ', 'giay-nu', 2),
('Quần áo Nữ', 'quan-ao-nu', 2);

-- Collections
INSERT INTO collections (name, slug, type) VALUES 
('Hàng Mới Về', 'hang-moi-ve', 'manual'),
('Black Friday', 'black-friday', 'promotion'),
('Best Sellers', 'best-sellers', 'automatic'),
('Nike Collection', 'nike-collection', 'manual'),
('Running Gear', 'running-gear', 'manual');