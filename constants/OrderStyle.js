import { StyleSheet } from 'react-native';

export const OrderStyle = StyleSheet.create({
    orderContainer: {
        flex: 1,
        backgroundColor: '#f8fafc',
        padding: 16,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    orderTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    cardOrder: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
})