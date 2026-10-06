import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import * as Icon from "react-native-feather"
import { themeColors } from '../theme'
import { useSQLiteContext } from 'expo-sqlite'
import { getKitchenQueue, updateOrderItemStatus } from '../db/kitchen'
import BottomNav from '../components/bottomNav'

const STATUS_ORDER = ['pending', 'cooking', 'served'];

const STATUS_LABELS = {
    pending: 'รอทำ',
    cooking: 'กำลังทำ',
    served: 'เสร็จสิ้น',
};

export default function KitchenScreen() {
    const db = useSQLiteContext();
    const [queue, setQueue] = useState([]);
    const [activeTab, setActiveTab] = useState('pending'); // แท็บที่กำลังเปิดดูอยู่

    const loadQueue = async () => {
        try {
            const data = await getKitchenQueue(db);
            setQueue(data);
        } catch (error) {
            console.error("Error loading kitchen queue:", error);
        }
    };

    useEffect(() => {
        loadQueue();
    }, [db]);

    const handleAdvanceStatus = async (item) => {
        const currentIndex = STATUS_ORDER.indexOf(item.item_status);
        const isLastStatus = currentIndex === -1 || currentIndex === STATUS_ORDER.length - 1;
        if (isLastStatus) return;

        const nextStatus = STATUS_ORDER[currentIndex + 1];

        try {
            await updateOrderItemStatus(db, item.order_item_id, nextStatus);
            await loadQueue();
        } catch (error) {
            console.error("Error updating order item status:", error);
        }
    };

    const itemsInActiveTab = queue.filter((item) => item.item_status === activeTab);

    return (
        <SafeAreaView className="bg-white flex-1">
            <StatusBar barStyle="dark-content" />
            <View className="py-4 shadow-sm border-b border-gray-100">
                <Text className="text-center font-bold text-xl">หน้าจอครัว</Text>
                <Text className="text-center text-gray-500 text-xs">รายการอาหารแยกตามโต๊ะ</Text>
            </View>

            {/* แถบแท็บสลับสถานะ */}
            <View className="flex-row justify-center px-3 py-2 bg-gray-50">
                {STATUS_ORDER.map((status) => {
                    const isActive = activeTab === status;
                    const count = queue.filter((item) => item.item_status === status).length;

                    return (
                        <TouchableOpacity
                            key={status}
                            onPress={() => setActiveTab(status)}
                            className="px-4 py-2 rounded-full mx-1"
                            style={{
                                backgroundColor: isActive ? themeColors.bgColor(1) : '#e5e7eb',
                            }}
                        >
                            <Text
                                className="font-semibold text-xs"
                                style={{ color: isActive ? 'white' : '#374151' }}
                            >
                                {STATUS_LABELS[status]} ({count})
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                className="px-4 pt-3 flex-1"
            >
                {itemsInActiveTab.length === 0 ? (
                    <View className="items-center justify-center py-20">
                        <Text className="text-gray-400">ไม่มีรายการในสถานะนี้</Text>
                    </View>
                ) : (
                    itemsInActiveTab.map((item) => {
                        const currentIndex = STATUS_ORDER.indexOf(item.item_status);
                        const isLastStatus = currentIndex === STATUS_ORDER.length - 1;

                        return (
                            <View
                                key={item.order_item_id}
                                className="relative bg-white rounded-2xl mb-3 p-4 shadow-sm border border-gray-100 flex-row items-center justify-between"
                            >
                                <View className="flex-1 pr-3">
                                    {/* ป้ายระบุหมายเลขโต๊ะชัดเจนสำหรับครัว */}
                                    <View className="flex-row items-center mb-1">
                                        <View className="bg-red-500 px-2 py-0.5 rounded-md mr-2">
                                            <Text className="font-bold text-white text-xs">
                                                โต๊ะ {item.table_number}
                                            </Text>
                                        </View>
                                        <Text className="text-xs text-gray-500">
                                            (รอบ {item.round_number})
                                        </Text>
                                    </View>

                                    <Text className="font-semibold text-base mt-1" style={{ color: themeColors.text }}>
                                        {item.quantity} x {item.food_name}
                                    </Text>
                                    {item.note ? (
                                        <Text className="text-xs text-orange-600 mt-0.5">
                                            หมายเหตุ: {item.note}
                                        </Text>
                                    ) : null}
                                </View>

                                {!isLastStatus && (
                                    <TouchableOpacity
                                        className="p-2.5 rounded-full"
                                        onPress={() => handleAdvanceStatus(item)}
                                        style={{ backgroundColor: themeColors.bgColor(1) }}
                                    >
                                        <Icon.Check strokeWidth={2.5} height={18} width={18} stroke="white" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        );
                    })
                )}
            </ScrollView>

            {/* แถบเมนูล่าง */}
            <BottomNav />
        </SafeAreaView>
    )
}