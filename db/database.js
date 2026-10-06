// db/database.js

export async function initializeDatabase(db) {
  // บังคับเปิด Foreign Keys ทุกครั้งที่เริ่มการเชื่อมต่อ
  await db.execAsync('PRAGMA foreign_keys = ON;');

  // สร้างตารางทั้งหมด
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS categories (
        category_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS food (
        food_id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        price INTEGER NOT NULL CHECK (price >= 0),
        is_available INTEGER NOT NULL DEFAULT 1 CHECK (is_available IN (0, 1)),
        FOREIGN KEY (category_id) REFERENCES categories (category_id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS tables (
        table_id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_number INTEGER NOT NULL UNIQUE CHECK (table_number > 0)
    );

    CREATE TABLE IF NOT EXISTS bills (
        bill_id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_id INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        closed_at DATETIME,
        FOREIGN KEY (table_id) REFERENCES tables (table_id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS orders (
        order_id INTEGER PRIMARY KEY AUTOINCREMENT,
        bill_id INTEGER NOT NULL,
        round_number INTEGER NOT NULL CHECK (round_number > 0),
        ordered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bill_id) REFERENCES bills (bill_id) ON DELETE CASCADE
    );

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

    CREATE INDEX IF NOT EXISTS idx_bills_table_status ON bills (table_id, status);
    CREATE INDEX IF NOT EXISTS idx_order_items_status_time ON order_items (item_status, created_at);
    CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);
  `);

  // ตรวจสอบและใส่ข้อมูลตั้งต้น (ไม่ใส่ซ้ำเมื่อเปิดแอปครั้งถัดไป)
  await seedInitialData(db);
}

async function seedInitialData(db) {
  const existingTables = await db.getFirstAsync('SELECT COUNT(*) as count FROM tables;');
  if (existingTables && existingTables.count > 0) {
    return; // มีข้อมูลแล้ว ไม่ต้องใส่ซ้ำ
  }

  await db.withTransactionAsync(async () => {
    // ใส่โต๊ะ 15 โต๊ะ
    for (let i = 1; i <= 15; i++) {
      await db.runAsync('INSERT INTO tables (table_number) VALUES (?);', [i]);
    }

    // 4 หมวดหมู่อาหาร
    const categories = ['อาหารจานเดียว', 'กับข้าวและต้ม', 'ของทานเล่น', 'เครื่องดื่มและของหวาน'];
    const catMap = {};
    for (const name of categories) {
      const res = await db.runAsync('INSERT INTO categories (name) VALUES (?);', [name]);
      catMap[name] = res.lastInsertRowId;
    }

    // 25+ เมนูอาหาร (ราคาเป็นจำนวนเต็มบาท)
    const menuList = [
      // 1. อาหารจานเดียว (6 เมนู)
      { cat: 'อาหารจานเดียว', name: 'ข้าวกะเพราหมูสับ', price: 60 },
      { cat: 'อาหารจานเดียว', name: 'ข้าวกะเพราเนื้อไข่ดาว', price: 85 },
      { cat: 'อาหารจานเดียว', name: 'ข้าวผัดปู', price: 75 },
      { cat: 'อาหารจานเดียว', name: 'ผัดไทยกุ้งสด', price: 80 },
      { cat: 'อาหารจานเดียว', name: 'ข้าวคะน้าหมูกรอบ', price: 70 },
      { cat: 'อาหารจานเดียว', name: 'ข้าวไข่เจียวหมูสับ', price: 50 },

      // 2. กับข้าวและต้ม (7 เมนู)
      { cat: 'กับข้าวและต้ม', name: 'ต้มยำกุ้งน้ำข้น', price: 150 },
      { cat: 'กับข้าวและต้ม', name: 'แกงส้มชะอมกุ้ง', price: 140 },
      { cat: 'กับข้าวและต้ม', name: 'แกงเขียวหวานไก่', price: 120 },
      { cat: 'กับข้าวและต้ม', name: 'ต้มข่าไก่', price: 120 },
      { cat: 'กับข้าวและต้ม', name: 'ผัดผักบุ้งไฟแดง', price: 80 },
      { cat: 'กับข้าวและต้ม', name: 'ปลาหมึกผัดไข่เค็ม', price: 160 },
      { cat: 'กับข้าวและต้ม', name: 'ข้าวสวย (โถ)', price: 60 },

      // 3. ของทานเล่น (6 เมนู)
      { cat: 'ของทานเล่น', name: 'ปีกไก่ทอดน้ำปลา', price: 95 },
      { cat: 'ของทานเล่น', name: 'ทอดมันกุ้ง', price: 120 },
      { cat: 'ของทานเล่น', name: 'หมูแดดเดียว', price: 90 },
      { cat: 'ของทานเล่น', name: 'เกี๊ยวซ่าทอด', price: 75 },
      { cat: 'ของทานเล่น', name: 'เฟรนช์ฟรายส์', price: 60 },
      { cat: 'ของทานเล่น', name: 'ยำวุ้นเส้นรวมมิตร', price: 110 },

      // 4. เครื่องดื่มและของหวาน (6 เมนู)
      { cat: 'เครื่องดื่มและของหวาน', name: 'น้ำเปล่า', price: 15 },
      { cat: 'เครื่องดื่มและของหวาน', name: 'น้ำแข็งแก้ว', price: 5 },
      { cat: 'เครื่องดื่มและของหวาน', name: 'ชาดำเย็น', price: 30 },
      { cat: 'เครื่องดื่มและของหวาน', name: 'ชามะนาว', price: 35 },
      { cat: 'เครื่องดื่มและของหวาน', name: 'ไอศกรีมกะทิ', price: 40 },
      { cat: 'เครื่องดื่มและของหวาน', name: 'บัวลอยน้ำขิง', price: 45 },
    ];

    for (const item of menuList) {
      // ตั้งให้ "ข้าวผัดปู" เป็น 0 (ของหมด) นอกนั้นเป็น 1
      const isAvailable = item.name === 'ข้าวผัดปู' ? 0 : 1;

      await db.runAsync(
        'INSERT INTO food (category_id, name, price, is_available) VALUES (?, ?, ?, ?);',
        [catMap[item.cat], item.name, item.price, isAvailable]
      );
    }
  });
}

/**
 * ปุ่มล้างข้อมูลการขายทั้งหมดกลับสู่สถานะเริ่มต้น (ตามเกณฑ์ 4.1)
 */
export async function resetSalesData(db) {
  await db.withTransactionAsync(async () => {
    // ลบ bills จะ CASCADE ไปลบ orders และ order_items ทั้งหมด
    await db.runAsync('DELETE FROM bills;');
  });
}