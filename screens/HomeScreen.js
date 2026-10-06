import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import * as Icon from 'react-native-feather';
import { themeColors } from '../theme';
import Categories from '../components/categories'
import { useSQLiteContext } from 'expo-sqlite'
import { getFoodByCategory } from '../db/menu'
import DishRow from '../components/dishRow';
import CartIcon from '../components/cartIcon';
import BottomNav from '../components/bottomNav';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
    const db = useSQLiteContext();
    const route = useRoute();
    const navigation = useNavigation();

    // รับค่าโต๊ะ (ถ้าไม่มีส่งมา ให้ fallback เป็นโต๊ะ 1)
    const tableId = route.params?.tableId || 1;
    const tableNumber = route.params?.tableNumber || tableId;

    const [activeCategory, setActiveCategory] = useState(null);
    const [dishes, setDishes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        async function loadDishes() {
            if (!activeCategory) return;
            try {
                const data = await getFoodByCategory(db, activeCategory);
                setDishes(data);
            } catch (error) {
                console.error("Error loading dishes:", error);
            }
        }
        loadDishes();
    }, [activeCategory, db]);

    // กรองเมนูตามคำค้นหา
    const filteredDishes = dishes.filter((dish) => {
        // 1. ถ้ายังไม่ได้พิมพ์ค้นหาอะไรเลย (ช่องค้นหาว่างเปล่า) -> ให้แสดงทุกรายการตามปกติ (โชว์ทั้งมีของและหมด)
        if (searchQuery.trim() === '') {
            return true;
        }

        // 2. ถ้าเริ่มมีการพิมพ์ค้นหา -> บังคับว่าต้องชื่อตรง และต้อง "มีของ" เท่านั้น (is_available === 1)
        const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase());
        const isAvailable = dish.is_available === 1;

        return matchesSearch && isAvailable;
    });

    return (
        <SafeAreaView className="bg-white flex-1">
            <StatusBar barStyle="dark-content" />

            {/* แถบหัวโต๊ะ */}
            <View className="flex-row items-center justify-between px-4 py-2 border-b border-gray-100">
                <TouchableOpacity 
                    onPress={() => navigation.navigate('TableSelect')}
                    className="flex-row items-center"
                >
                    <Icon.ArrowLeft stroke={themeColors.bgColor(1)} width={20} height={20} />
                    <Text className="ml-1 text-gray-600 font-semibold">เปลี่ยนโต๊ะ</Text>
                </TouchableOpacity>

                <View className="bg-orange-100 px-3 py-1 rounded-full">
                    <Text className="font-bold text-orange-600">
                        กำลังสั่ง: โต๊ะ {tableNumber}
                    </Text>
                </View>
            </View>

            {/* search bar (ใส่ value และ onChangeText ตรงนี้) */}
            <View className="flex-row items-center space-x-2 px-4 py-2">
                <View className="flex-row flex-1 items-center p-3 rounded-full border border-gray-300">
                    <Icon.Search height="22" width="22" stroke="gray" />
                    <TextInput 
                        placeholder='ค้นหารายการอาหาร...' 
                        className="ml-2 flex-1"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Icon.X height="18" width="18" stroke="gray" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* หมวดหมู่ & รายการอาหาร */}
            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 90 }}
            >
                <Categories 
                    activeCategory={activeCategory} 
                    setActiveCategory={setActiveCategory}
                />

                <View className="mt-4">
                    <Text className="px-4 text-xl font-bold text-gray-800 mb-3">
                        รายการอาหาร
                    </Text>
                    {
                        filteredDishes.map((dish) => (
                            <DishRow 
                                item={dish} 
                                key={dish.food_id} 
                            />
                        ))
                    }
                </View>
            </ScrollView>

            <CartIcon tableId={tableId} />
            <BottomNav />
        </SafeAreaView>
    )
}