-- schema.sql
-- บังคับเปิด Foreign Keys
PRAGMA foreign_keys = ON;

-- 1. ตารางหมวดหมู่อาหาร
CREATE TABLE IF NOT EXISTS categories (
    category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

-- 2. ตารางรายการอาหาร
-- ราคาเป็น INTEGER ห้ามใช้ REAL ตามข้อห้ามข้อ 3
CREATE TABLE IF NOT EXISTS food (
    food_id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    price INTEGER NOT NULL CHECK (price >= 0),
    is_available INTEGER NOT NULL DEFAULT 1 CHECK (is_available IN (0, 1)),
    FOREIGN KEY (category_id) REFERENCES categories (category_id) ON DELETE RESTRICT
);

-- 3. ตารางโต๊ะอาหาร (15 โต๊ะ)
CREATE TABLE IF NOT EXISTS tables (
    table_id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_number INTEGER NOT NULL UNIQUE CHECK (table_number > 0)
);

-- 4. ตารางบิล (1 การนั่งทาน)
CREATE TABLE IF NOT EXISTS bills (
    bill_id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at DATETIME,
    FOREIGN KEY (table_id) REFERENCES tables (table_id) ON DELETE RESTRICT
);

-- 5. ตารางรอบการสั่งอาหาร (Orders)
CREATE TABLE IF NOT EXISTS orders (
    order_id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_id INTEGER NOT NULL,
    round_number INTEGER NOT NULL CHECK (round_number > 0),
    ordered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bill_id) REFERENCES bills (bill_id) ON DELETE CASCADE
);

-- 6. ตารางรายการอาหารในแต่ละรอบ (Order Items)
-- Snapshot ราคา ณ ตอนสั่งซื้อ เพื่อแก้ปัญหาราคาเปลี่ยนย้อนหลัง
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    food_id INTEGER NOT NULL,
    price INTEGER NOT NULL CHECK (price >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    note TEXT,
    item_status TEXT NOT NULL DEFAULT 'pending' CHECK (item_status IN ('pending', 'cooking', 'served', 'cancelled')),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders (order_id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES food (food_id) ON DELETE RESTRICT
);

-- สร้าง INDEX ตามข้อกำหนด 3.2 (อย่างน้อย 2 จุด)
-- Index 1: ค้นหาบิลที่เปิดค้างอยู่ของโต๊ะ
CREATE INDEX IF NOT EXISTS idx_bills_table_status ON bills (table_id, status);

-- Index 2: หน้าจอครัวดึงคิวเรียงตามเวลาและสถานะ
CREATE INDEX IF NOT EXISTS idx_order_items_status_time ON order_items (item_status, created_at);

-- Index 3: ค้นหารายการอาหารตาม order_id
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);