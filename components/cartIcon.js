import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { themeColors } from '../theme'
import { useNavigation } from '@react-navigation/native'
import { useSelector } from 'react-redux';
import { selectCartItems, selectCartTotal } from '../slices/cartSlice';

// 1. รับ tableId จาก props (ถ้าไม่ส่งมา ให้ fallback เป็น 1)
export default function CartIcon({ tableId = 1 }) {
    const navigation = useNavigation();
    const cartItems = useSelector(selectCartItems);
    const cartTotal = useSelector(selectCartTotal);

    if(!cartItems.length) return null;

    return (
        // 2. ปรับ bottom-16 หรือ bottom-20 เพื่อไม่ให้ทับกับ bottomNav ด้านล่าง
        <View className="absolute bottom-16 w-full z-50">
            <TouchableOpacity
                // 3. แนบ { tableId } ส่งต่อไปยัง CartScreen
                onPress={() => navigation.navigate('Cart', { tableId })}
                style={{backgroundColor: themeColors.bgColor(1)}}
                className="flex-row justify-between items-center mx-5 rounded-full p-4 py-3 shadow-lg"
            >
                <View className="p-2 px-4 rounded-full" style={{backgroundColor: 'rgba(255,255,255,0.3)'}}>
                    <Text className="font-extrabold text-white text-lg">
                        {cartItems.length}
                    </Text>
                </View>
                <Text className="flex-1 text-center font-extrabold text-white text-lg">
                    View Cart
                </Text>
                <Text className="font-extrabold text-white text-lg">
                    ฿{cartTotal}
                </Text>
            </TouchableOpacity>
        </View>
    )
}