import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StatusBar, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { TBstyle } from '../constants/TBstyle';
import { CardTable } from '../components/cardTable';
import BottomNav from '../components/bottomNav';
import { getAllTablesWithStatus } from '../db/tables';
import { resetSalesData } from '../db/database';

export default function TableSelectScreen() {
  const navigation = useNavigation();
  const db = useSQLiteContext();

  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);

  // ดึงข้อมูลใหม่ทุกครั้งที่สลับกลับมาหน้านี้
  useFocusEffect(
    useCallback(() => {
      async function loadData() {
        try {
          const data = await getAllTablesWithStatus(db);
          setTables(data);
          // อัปเดตข้อมูลโต๊ะที่เลือกไว้ถ้ามี
          setSelectedTable(prev => prev ? data.find(t => t.table_id === prev.table_id) || null : null);
        } catch (error) {
          console.error("Error loading tables:", error);
        }
      }
      loadData();
    }, [db])
  );

  const handleSelectTable = (table) => {
    setSelectedTable(prev => prev?.table_id === table.table_id ? null : table);
  };

  // ก1: ไปหน้าสั่งอาหาร
  const handleStartOrder = () => {
    if (!selectedTable) {
      Alert.alert('แจ้งเตือน', 'กรุณาแตะเลือกโต๊ะอาหารก่อนดำเนินการต่อ');
      return;
    }
    navigation.navigate('Home', { 
      tableId: selectedTable.table_id,
      tableNumber: selectedTable.table_number 
    });
  };

  // ก1 & ก6: ถ้าโต๊ะมีบิลเปิดอยู่แล้ว สามารถกดเข้าดูสรุปบิลเดิมได้
  const handleViewBill = () => {
    if (!selectedTable || !selectedTable.bill_id) return;
    navigation.navigate('Order', {
      tableId: selectedTable.table_id,
      tableNumber: selectedTable.table_number,
      billId: selectedTable.bill_id
    });
  };

  return (
    <SafeAreaView style={TBstyle.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      <View style={TBstyle.header}>
        <Text style={TBstyle.screenTitle}>สถานะโต๊ะอาหาร (15 โต๊ะ)</Text>
        <TouchableOpacity
            onPress={async () => {
              await resetSalesData(db);
              const data = await getAllTablesWithStatus(db);
              setTables(data);
              setSelectedTable(null);
            }}
          >
            <Text style={{ color: '#ef4444', fontWeight: 'bold' }}>ล้างข้อมูล</Text>
        </TouchableOpacity>
        <Text style={TBstyle.screenSubtitle}>
          แตะเลือกโต๊ะเพื่อสั่งอาหาร หรือดูบิลที่ค้างอยู่
        </Text>
      </View>

      <FlatList
        data={tables}
        keyExtractor={(item) => item.table_id.toString()}
        numColumns={2}
        extraData={selectedTable}
        contentContainerStyle={TBstyle.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <CardTable
            item={{
              id: item.table_number,
              status: item.current_status,
              total: item.total_amount
            }}
            isSelected={selectedTable?.table_id === item.table_id}
            onSelect={() => handleSelectTable(item)}
          />
        )}
      />

      {/* แถบปุ่มสั่งอาหาร / ดูบิล */}
      <View className="px-4 pb-2 flex-row space-x-2">
        {selectedTable?.bill_id ? (
          <TouchableOpacity 
            style={[TBstyle.button, { backgroundColor: '#ea580c', flex: 1, marginHorizontal: 4 }]}
            onPress={handleViewBill}
          >
            <Text style={TBstyle.buttonText}>ดูสรุปบิล</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity 
          style={[
            TBstyle.button, 
            { flex: 1, marginHorizontal: 4 },
            !selectedTable && { opacity: 0.6 }
          ]}
          onPress={handleStartOrder}
        >
          <Text style={TBstyle.buttonText}>
            {selectedTable ? `สั่งอาหาร โต๊ะ ${selectedTable.table_number}` : 'เลือกโต๊ะ'}
          </Text>
        </TouchableOpacity>
      </View>
      {/* เพิ่มส่วนดูประวัติบิลเก่า */}
      {selectedTable && (
        <TouchableOpacity
          style={{ paddingVertical: 10, alignItems: 'center' }}
          onPress={async () => {
            try {
              const closedBills = await db.getAllAsync(
                "SELECT bill_id, closed_at FROM bills WHERE table_id = ? AND status = 'closed' ORDER BY closed_at DESC LIMIT 5;",
                [selectedTable.table_id]
              );

              if (!closedBills || closedBills.length === 0) {
                Alert.alert('แจ้งเตือน', `โต๊ะ ${selectedTable.table_number} ยังไม่มีประวัติบิลที่ปิดแล้ว`);
                return;
              }

              const buttons = closedBills.map((b) => ({
                text: `บิล #${b.bill_id} (${new Date(b.closed_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })})`,
                onPress: () => {
                  navigation.navigate('Order', {
                    tableId: selectedTable.table_id,
                    tableNumber: selectedTable.table_number,
                    billId: b.bill_id,
                    isHistory: true,
                  });
                }
              }));
              buttons.push({ text: 'ยกเลิก', style: 'cancel' });

              Alert.alert('เลือกประวัติบิลเก่า', `ประวัติบิลของโต๊ะ ${selectedTable.table_number}`, buttons);
            } catch (err) {
              console.error(err);
            }
          }}
        >
          <Text style={{ color: '#ea580c', fontSize: 13, textDecorationLine: 'underline' }}>
            ดูประวัติบิลเก่า (โต๊ะ {selectedTable.table_number})
          </Text>
        </TouchableOpacity>
      )}

      <BottomNav />
    </SafeAreaView>
  );
}