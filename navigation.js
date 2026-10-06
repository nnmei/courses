import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import CartScreen from './screens/CartScreen';
import TableSelectScreen from './screens/TableSelectScreen';
import OrderScreen from './screens/OrderScreen';
import KitchenScreen from './screens/Kitchenscreen';

const Stack = createNativeStackNavigator();

export default function Navigation() {
    return (
        <NavigationContainer>
            <Stack.Navigator 
                initialRouteName="TableSelect"
                screenOptions={{
                    headerShown: false
                }}
            >
                <Stack.Screen name="TableSelect" component={TableSelectScreen}/>
                <Stack.Screen name="Home" component={HomeScreen}/>
                <Stack.Screen name="Cart" component={CartScreen}/>
                <Stack.Screen name="Order" component={OrderScreen}/>
                <Stack.Screen name="kitchen" component={KitchenScreen}/>
            </Stack.Navigator>
        </NavigationContainer>
    )
}