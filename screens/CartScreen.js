import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { themeColors } from '../theme';
import * as Icon from "react-native-feather"
import { useNavigation, useRoute } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux';

import { removeFromCart, emptyCart, selectCartItems, selectCartTotal } from '../slices/cartSlice';

import { useSQLiteContext } from 'expo-sqlite';
import { submitOrderRound } from '../db/orders';
// [แก้]: เพิ่ม getOrCreateActiveBill มาใช้เปิด/หาบิลจริงของโต๊ะ แทนการ hardcode billId
import { getOrCreateActiveBill } from '../db/tables';

export default function CartScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const dispatch = useDispatch();
    const db = useSQLiteContext(); // เรียกใช้งานฐานข้อมูล SQLite

   
    const tableId = route.params?.tableId || 1;

    const cartItems = useSelector(selectCartItems);
    const cartTotal = useSelector(selectCartTotal);
    const [groupedItems, setGroupedItems] = useState({});
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const getCategoryEmoji = (categoryId) => {
        switch (categoryId) {
            case 1: return '🍛';
            case 2: return '🍲';
            case 3: return '🍟';
            case 4: return '🥤';
            default: return '🍽️';
        }
        };

    
    useEffect(() => {
        const items = cartItems.reduce((group, item) => {
            const key = `${item.food_id || item.id}_${item.note || ''}`;
            if(group[key]){
                group[key].push(item);
            }else{
                group[key] = [item];
            }
            return group;
        }, {});
        setGroupedItems(items);
    }, [cartItems]);

    // -------------------------------------------------------------
    // จัดการเมื่อกดปุ่ม Place Order (ก4)
    // -------------------------------------------------------------
    const handlePlaceOrder = async () => {
        if (cartItems.length === 0) {
            Alert.alert("แจ้งเตือน", "ไม่มีรายการอาหารในตะกร้า");
            return;
        }

        // [แก้]: ถ้ากำลังส่งออเดอร์อยู่ ห้ามกดซ้ำ
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const orderItemsPayload = Object.entries(groupedItems).map(([key, items]) => {
                const dish = items[0];
                return {
                    food_id: dish.food_id || dish.id,
                    price: dish.price,
                    quantity: items.length,
                    note: dish.note || ''
                };
            });

           
            const activeBill = await getOrCreateActiveBill(db, tableId);

            
            await submitOrderRound(db, activeBill.bill_id, orderItemsPayload);

            
            dispatch(emptyCart());

            Alert.alert("สำเร็จ", "ส่งรายการอาหารเข้าครัวเรียบร้อยแล้ว!", [
                { text: "ตกลง", onPress: () => navigation.navigate('kitchen') }
            ]);
        } catch (error) {
            console.error("Error submitting order:", error);
            Alert.alert("ผิดพลาด", "ไม่สามารถส่งออเดอร์ได้ กรุณาลองใหม่");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View className="bg-white flex-1 pt-10">
            {/* back button และ ส่วนหัว */}
            <View className="relative py-4 shadow-sm">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{backgroundColor: themeColors.bgColor(1)}}
                    className="absolute z-50 rounded-full p-2 shadow top-3 left-2"
                >
                    <Icon.ArrowLeft strokeWidth={3} stroke="white" />
                </TouchableOpacity>
                <View>
                    <Text className="text-center font-bold text-xl">ตะกร้าของคุณ</Text>
                    <Text className="text-center text-gray-500">ตรวจสอบรายการก่อนส่งเข้าครัว</Text>
                </View>
            </View>
            
            {/* แถบหัวบิล */}
            <View style={{backgroundColor: themeColors.bgColor(0.2)}} className="flex-row px-4 py-2 items-center">
                <Image source={require('../assets/images/fullStar.png')} className="w-12 h-12 rounded-full" />
                <Text className="flex-1 pl-4 font-bold text-gray-700">รายการสั่งอาหารรอบปัจจุบัน</Text>
            </View>

            {/* รายการอาหาร dishes */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 50 }}
                className="bg-white pt-5"
            >
                {
                    Object.entries(groupedItems).map(([key, items]) => {
                        let dish = items[0];
                        return (
                            <View 
                                key={key}
                                className="flex-row items-center gap-x-3 py-2 px-4 bg-white rounded-3xl mx-2 mb-3 shadow-md"
                            >
                                <Text className="font-bold" style={{color: themeColors.text}}>
                                    {items.length} x 
                                </Text>
                                <View className="h-12 w-12 rounded-full bg-orange-100 justify-center items-center">
                                    <Text style={{ fontSize: 24 }}>
                                        {getCategoryEmoji(dish.category_id)}
                                    </Text>
                                </View>
                                <View className="flex-1">
                                    <Text className="font-bold text-gray-700">{dish.name}</Text>
                                    {dish.note ? (
                                        <Text className="text-xs text-orange-600 mt-0.5">
                                            {dish.note}
                                        </Text>
                                    ) : null}
                                </View>
                                
                                <Text className="font-semibold text-base">฿{dish.price}</Text>
                                
                                <TouchableOpacity
                                    className="p-1 rounded-full"
                                    onPress={() => dispatch(removeFromCart({id: dish.id}))}
                                    style={{backgroundColor: themeColors.bgColor(1)}}
                                >
                                    <Icon.Minus strokeWidth={2} height={20} width={20} stroke="white" />
                                </TouchableOpacity>
                            </View>
                        )
                    })
                }
            </ScrollView>            

            {/* ส่วนสรุปราคารวมและปุ่ม Place Order */}
            <View style={{backgroundColor: themeColors.bgColor(0.2)}} className="p-6 px-8 rounded-t-3xl space-y-4">
                <View className="flex-row justify-between">
                    <Text className="text-gray-700 font-extrabold text-lg">ยอดรวมรอบนี้</Text>
                    <Text className="text-gray-700 font-extrabold text-lg">฿{cartTotal}</Text>
                </View>

                <View>
                    <TouchableOpacity 
                        onPress={handlePlaceOrder}
                        disabled={isSubmitting}
                        style={{backgroundColor: themeColors.bgColor(isSubmitting ? 0.5 : 1)}} 
                        className="p-3 rounded-full mt-2"
                    >
                        <Text className="text-white text-center font-bold text-lg">
                            {isSubmitting ? 'กำลังส่ง...' : 'Place Order (ส่งเข้าครัว)'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}
