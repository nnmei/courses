// db/menu.js

// ดึงหมวดหมู่ทั้งหมด
export async function getCategories(db) {
  return await db.getAllAsync('SELECT * FROM categories ORDER BY category_id ASC;');
}

// ดึงรายการอาหารตามหมวดหมู่
export async function getFoodByCategory(db, categoryId) {
  return await db.getAllAsync(
    'SELECT * FROM food WHERE category_id = ? ORDER BY food_id ASC;',
    [categoryId]
  );
}

// ดึงอาหารทั้งหมด
export async function getAllFood(db) {
  return await db.getAllAsync(
    'SELECT f.*, c.name as category_name FROM food f JOIN categories c ON f.category_id = c.category_id ORDER BY f.category_id, f.food_id;'
  );
}