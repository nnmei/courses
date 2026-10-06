// db/orders.js

/**
 * ส่งรายการอาหาร 1 รอบการสั่ง โดยใช้ Transaction เดียว (ตามข้อ 3.2 ข้อ 6)
 * cartItems: [{ food_id, price, quantity, note }]
 */
export async function submitOrderRound(db, billId, cartItems) {
  if (!cartItems || cartItems.length === 0) return null;

  return await db.withTransactionAsync(async () => {
    // 1. หารอบถัดไปของบิลนี้
    const row = await db.getFirstAsync(
      'SELECT COALESCE(MAX(round_number), 0) + 1 AS next_round FROM orders WHERE bill_id = ?;',
      [billId]
    );
    const roundNumber = row.next_round;

    // 2. สร้าง record รอบการสั่ง
    const orderRes = await db.runAsync(
      'INSERT INTO orders (bill_id, round_number) VALUES (?, ?);',
      [billId, roundNumber]
    );
    const orderId = orderRes.lastInsertRowId;

    // 3. บันทึกแต่ละรายการอาหาร พร้อม Snapshot ราคา
    for (const item of cartItems) {
      await db.runAsync(
        `INSERT INTO order_items (order_id, food_id, price, quantity, note, item_status)
         VALUES (?, ?, ?, ?, ?, 'pending');`,
        [orderId, item.food_id, item.price, item.quantity, item.note || '']
      );
    }

    return { orderId, roundNumber };
  });
}

/**
 * คำนวณยอดรวมทั้งบิลโดยใช้คำสั่ง SQL (ห้ามวนลูปบวกใน JS ตามข้อ 3.2 ข้อ 5)
 */
export async function getBillTotal(db, billId) {
  const result = await db.getFirstAsync(
    `SELECT COALESCE(SUM(oi.price * oi.quantity), 0) AS total_amount
     FROM order_items oi
     JOIN orders o ON oi.order_id = o.order_id
     WHERE o.bill_id = ? AND oi.item_status != 'cancelled';`,
    [billId]
  );
  return result ? result.total_amount : 0;
}

/**
 * ดึงรายการสั่งทั้งหมดของบิล แยกตามรอบ เพื่อนำไปแสดงในหน้าสรุปบิล (ก6)
 */
export async function getBillDetails(db, billId) {
  return await db.getAllAsync(
    `SELECT 
      o.round_number,
      oi.order_item_id,
      f.name AS food_name,
      oi.price,
      oi.quantity,
      (oi.price * oi.quantity) AS item_total,
      oi.note,
      oi.item_status
    FROM orders o
    JOIN order_items oi ON o.order_id = oi.order_id
    JOIN food f ON oi.food_id = f.food_id
    WHERE o.bill_id = ?
    ORDER BY o.round_number ASC, oi.order_item_id ASC;`,
    [billId]
  );
}

/**
 * ยกเลิกรายการอาหาร (เฉพาะกรณีที่สถานะยังเป็น pending เท่านั้น)
 */
export async function cancelOrderItem(db, orderItemId) {
  // ตรวจสอบสถานะก่อนว่ายังเป็น pending หรือไม่
  const item = await db.getFirstAsync(
    'SELECT item_status FROM order_items WHERE order_item_id = ?;',
    [orderItemId]
  );

  if (!item) {
    throw new Error('ไม่พบรายการอาหาร');
  }

  if (item.item_status !== 'pending') {
    throw new Error('ไม่สามารถยกเลิกได้ เนื่องจากครัวเริ่มทำหรือเสิร์ฟแล้ว');
  }

  // อัปเดตสถานะเป็น cancelled
  await db.runAsync(
    "UPDATE order_items SET item_status = 'cancelled' WHERE order_item_id = ?;",
    [orderItemId]
  );
}