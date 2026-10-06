// db/kitchen.js

// ดึงคิวอาหารเข้าครัว เรียงจากเก่าไปใหม่ (ก7, ก9)
export async function getKitchenQueue(db) {
  return await db.getAllAsync(`
    SELECT 
      oi.order_item_id,
      t.table_number,
      o.round_number,
      f.name AS food_name,
      oi.quantity,
      oi.note,
      oi.item_status,
      oi.created_at
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.order_id
    JOIN bills b ON o.bill_id = b.bill_id
    JOIN tables t ON b.table_id = t.table_id
    JOIN food f ON oi.food_id = f.food_id
    WHERE oi.item_status IN ('pending', 'cooking','served')
    ORDER BY oi.created_at ASC;
  `);
}

// อัปเดตสถานะของแต่ละจาน: pending -> cooking -> served (ก8)
export async function updateOrderItemStatus(db, orderItemId, nextStatus) {
  await db.runAsync(
    'UPDATE order_items SET item_status = ? WHERE order_item_id = ?;',
    [nextStatus, orderItemId]
  );
}