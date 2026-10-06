import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useSQLiteContext } from 'expo-sqlite'
import { getCategories } from '../db/menu'

export default function Categories({ activeCategory, setActiveCategory }) {
  const db = useSQLiteContext();
  const [categoriesList, setCategoriesList] = useState([]);

  useEffect(() => {
      async function loadData() {
        try {
          const data = await getCategories(db);
          setCategoriesList(data);
          if (data.length > 0 && !activeCategory) {
            setActiveCategory(data[0].category_id); // เลือกหมวดแรกเป็นค่าเริ่มต้น
          }
        } catch (error) {
          console.error("Error loading categories:", error);
        }
      }
      loadData();
    }, [db]);
  return (
    <View className="mt-4">
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="overflow-visible"
      contentContainerStyle={{
        paddingHorizontal: 15
      }}
    >
      {
        categoriesList.map((category) =>{
          const isActive = category.category_id === activeCategory;
          return (
            <View key={category.category_id} className="flex justify-center items-center mr-6">
              <TouchableOpacity
                onPress={() => setActiveCategory(category.category_id)}
                className={`p-2 px-4 rounded-full shadow ${isActive ? 'bg-orange-500' : 'bg-gray-200'}`}
              >
                <Text className={isActive ? 'text-white font-bold' : 'text-gray-700'}>{category.name}</Text>
              </TouchableOpacity>
            </View>
          )
        })
      }
    </ScrollView>
    </View>
  )
}