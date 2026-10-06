import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { getBillDetails, getBillTotal, cancelOrderItem } from '../db/orders';
import { closeBill } from '../db/tables';
import { OrderStyle } from '../constants/OrderStyle';

const STATUS_TH = { pending: 'รอทำ', cooking: 'กำลังทำ', served: 'เสิร์ฟแล้ว', cancelled: 'ยกเลิกแล้ว' };

export default function OrderScreen({ route, navigation }) {
  const db = useSQLiteContext();
  const { tableId, billId, tableNumber } = route.params || {};
  const [billItems, setBillItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const loadBillData = async () => {
    if (!billId) return;
    setBillItems(await getBillDetails(db, billId));
    setTotalAmount(await getBillTotal(db, billId));
  };

  useEffect(() => { loadBillData(); }, [billId]);

  const handleCancelItem = (item) => {
    Alert.alert('ยืนยันยกเลิก', `ยกเลิก "${item.food_name}" หรือไม่?`, [
      { text: 'ย้อนกลับ', style: 'cancel' },
      {
        text: 'ยืนยัน', style: 'destructive', onPress: async () => {
          try {
            await cancelOrderItem(db, item.order_item_id);
            loadBillData();
          } catch (err) {
            Alert.alert('ผิดพลาด', err.message);
          }
        }
      }
    ]);
  };

  const handleCloseBill = () => {
    Alert.alert('ยืนยันปิดบิล', `ปิดบิลโต๊ะ ${tableNumber} ยอด ${totalAmount.toLocaleString()} บาท?`, [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'ปิดบิล', style: 'destructive', onPress: async () => {
          await closeBill(db, billId);
          Alert.alert('สำเร็จ', 'ปิดบิลเรียบร้อยแล้ว', [{ text: 'ตกลง', onPress: () => navigation.navigate('TableSelect') }]);
        }
      }
    ]);
  };

  return (
    <View style={OrderStyle.orderContainer}>
      <View style={OrderStyle.orderHeader}>
        <Text style={OrderStyle.orderTitle}>บิลโต๊ะที่ {tableNumber}</Text>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {billItems.map((item) => {
          const isCancelled = item.item_status === 'cancelled';
          return (
            <View key={item.order_item_id} style={[OrderStyle.cardOrder, isCancelled && { opacity: 0.5, backgroundColor: '#f1f5f9' }, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', textDecorationLine: isCancelled ? 'line-through' : 'none' }}>{item.food_name}</Text>
                <Text>รอบที่ {item.round_number} | จำนวน {item.quantity} จาน</Text>
                <Text style={{ textDecorationLine: isCancelled ? 'line-through' : 'none' }}>ราคา: {item.item_total} บาท ({STATUS_TH[item.item_status] || item.item_status})</Text>
              </View>

              {item.item_status === 'pending' && (
                <TouchableOpacity onPress={() => handleCancelItem(item)} style={{ backgroundColor: '#fee2e2', padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#fca5a5' }}>
                  <Text style={{ color: '#dc2626', fontWeight: 'bold', fontSize: 12 }}>ยกเลิก</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* สรุปยอดรวมและปุ่มจัดการ */}
      <View style={{ paddingVertical: 16, borderTopWidth: 1, borderColor: '#e2e8f0' }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>ยอดรวมทั้งหมด: {totalAmount.toLocaleString()} บาท</Text>
        
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {/* ปุ่มสั่งอาหารเพิ่ม */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Home', { tableId, tableNumber })}
            style={{ flex: 1, backgroundColor: '#ea580c', padding: 14, borderRadius: 8, alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>+ สั่งเพิ่ม</Text>
          </TouchableOpacity>

          {/* ปุ่มปิดบิล */}
          <TouchableOpacity
            onPress={handleCloseBill}
            style={{ flex: 1, backgroundColor: '#ef4444', padding: 14, borderRadius: 8, alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>ปิดบิล / คิดเงิน</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}