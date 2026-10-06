// components/dishRow.js
import { View, Text, TouchableOpacity, TextInput } from 'react-native' // นำ Image ออกได้เลย
import React, { useState, useEffect } from 'react'
import { themeColors } from '../theme'
import * as Icon from 'react-native-feather';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart, updateNoteForFood, selectCartItems } from '../slices/cartSlice';

// ฟังก์ชันแปลง category_id เป็นอีโมจิ
const getCategoryEmoji = (categoryId) => {
  switch (categoryId) {
    case 1: return '🍛'; // อาหารจานเดียว
    case 2: return '🍲'; // กับข้าวและต้ม
    case 3: return '🍟'; // ของทานเล่น
    case 4: return '🥤'; // เครื่องดื่มและของหวาน
    default: return '🍽️';
  }
};

export default function DishRow({item}) {
    const dispatch = useDispatch();
    const cartItems = useSelector(selectCartItems);
    const itemCount = cartItems.filter(cartItem => (cartItem.food_id || cartItem.id) === item.food_id).length;

    const [note, setNote] = useState('');
    const isOutOfStock = item.is_available === 0;

    const handleIncrease = () => {
        dispatch(addToCart({
            ...item,
            id: item.food_id,
            note: note.trim()
        }));
    }
    const handleDecrease = () => {
        dispatch(removeFromCart({id: item.food_id}))
    }

    useEffect(() => {
        if (itemCount > 0) {
            dispatch(updateNoteForFood({ food_id: item.food_id, note: note.trim() }));
        }
    }, [note]);
    
  return (
    <View className="flex-row items-center bg-white p-3 rounded-3xl shadow-2xl mb-3 mx-2">
        {/* เปลี่ยนจาก Image เป็นกล่องอีโมจิตรงนี้ */}
        <View 
            style={{ height: 80, width: 80 }} 
            className="bg-orange-50 rounded-2xl justify-center items-center mr-2 border border-orange-100"
        >
            <Text style={{ fontSize: 40 }}>
                {getCategoryEmoji(item.category_id)}
            </Text>
        </View>

        <View className="flex flex-1 space-y-3">
            <View className="pl-3">
                <Text className="text-xl" style={{ textDecorationLine: isOutOfStock ? 'line-through' : 'none', color: isOutOfStock ? 'gray' : 'black' }}>
                    {item.name} {isOutOfStock && <Text style={{ color: 'red', fontSize: 14 }}>(หมด)</Text>}
                </Text>
                <Text className="flex-row justify-between pl-3 items-center">{item.description}</Text>
            </View>
            <View className="flex-row justify-between pl-3 items-center">
                <Text className="text-gray-700 text-lg font-bold">
                    ฿{item.price}
                </Text>
                <View className="flex-row items-center">
                    <TouchableOpacity
                    onPress={handleDecrease}
                    disabled={!itemCount}
                        className="p-1 rounded-full"
                        style={{backgroundColor: themeColors.bgColor(1)}}
                    >
                    <Icon.Minus strokeWidth={2} height={20} width={20} stroke={'white'} />
                    </TouchableOpacity>
                    <Text className="px-3">
                        {itemCount}
                    </Text>
                    <TouchableOpacity
                        onPress={handleIncrease}
                        disabled={isOutOfStock}
                        className="p-1 rounded-full"
                        style={{backgroundColor: isOutOfStock ? '#ccc' : themeColors.bgColor(1)}}
                    >
                        <Icon.Plus strokeWidth={2} height={20} width={20} stroke={'white'} />
                    </TouchableOpacity>
                </View>
            </View>
            <View className="mt-3 pt-2 border-t border-gray-100">
                <TextInput
                    placeholder="หมายเหตุเพิ่มเติม เช่น ไม่ใส่ผักชี, เผ็ดน้อย..."
                    placeholderTextColor="gray"
                    value={note}
                    onChangeText={setNote}
                    className="bg-gray-100 rounded-xl px-3 py-1.5 text-sm text-gray-700"
                />
            </View>
        </View>
    </View>
  )
}
