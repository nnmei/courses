import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import * as Icon from "react-native-feather"
import { themeColors } from '../theme'

export default function BottomNav() {
    const navigation = useNavigation();
    const route = useRoute();

    // เช็คว่าอยู่หน้าโต๊ะ หรือ หน้าครัว
    const isTable = route.name === 'TableSelect' || route.name === 'Home';
    const isKitchen = route.name === 'kitchen';

    return (
        <View className="flex-row justify-around items-center bg-white py-3 border-t border-gray-200 shadow-lg">
            {/* ปุ่มโต๊ะ -> เด้งไปหน้าเลือกโต๊ะ */}
            <TouchableOpacity 
                onPress={() => navigation.navigate('TableSelect')}
                className="items-center flex-1"
            >
                <Icon.Grid 
                    width={22} 
                    height={22} 
                    stroke={isTable ? themeColors.bgColor(1) : 'gray'} 
                    strokeWidth={2} 
                />
                <Text 
                    className="text-xs mt-1 font-semibold"
                    style={{ color: isTable ? themeColors.bgColor(1) : 'gray' }}
                >
                    โต๊ะ
                </Text>
            </TouchableOpacity>

            {/* ปุ่มครัว -> เด้งไปหน้าจอครัว */}
            <TouchableOpacity 
                onPress={() => navigation.navigate('kitchen')}
                className="items-center flex-1"
            >
                <Icon.Coffee 
                    width={22} 
                    height={22} 
                    stroke={isKitchen ? themeColors.bgColor(1) : 'gray'} 
                    strokeWidth={2} 
                />
                <Text 
                    className="text-xs mt-1 font-semibold"
                    style={{ color: isKitchen ? themeColors.bgColor(1) : 'gray' }}
                >
                    ครัว
                </Text>
            </TouchableOpacity>
        </View>
    )
}