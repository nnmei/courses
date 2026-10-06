import { View, Text, TouchableOpacity } from 'react-native';
import { TBstyle } from '../constants/TBstyle';

const hasPendingBill = (status) => {
  return status === 'pending' || status === 'occupied' || status === 'unpaid';
};

export const CardTable = ({ item, isSelected, onSelect }) => {
  const isPending = hasPendingBill(item.status);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[
        TBstyle.card,
        isPending ? TBstyle.cardPending : TBstyle.cardAvailable,
        // เพิ่มสไตล์เมื่อโต๊ะถูกเลือก (ให้มีผลทับสไตล์ก่อนหน้า)
        isSelected && TBstyle.cardSelected,
      ]}
      onPress={() => onSelect(item.id)}
    >
      <View style={TBstyle.cardHeader}>
        <Text style={[TBstyle.tableNumberText, isSelected && TBstyle.tableNumberTextSelected]}>
          โต๊ะ {item.id}
        </Text>

        <View
          style={[
            TBstyle.badge,
            isPending ? TBstyle.badgePending : TBstyle.badgeAvailable,
          ]}
        >
          <Text
            style={[
              TBstyle.badgeText,
              isPending ? TBstyle.badgeTextPending : TBstyle.badgeTextAvailable,
            ]}
          >
            {isPending ? 'มีบิลค้าง' : 'ว่าง'}
          </Text>
        </View>
      </View>

      <View style={TBstyle.cardBody}>
        {isPending ? (
          <View>
            <Text style={TBstyle.detailLabel}>ยอดค้างชำระ</Text>
            <Text style={TBstyle.amountText}>
              {item.total ? `฿${item.total.toLocaleString()}` : 'รอคิดเงิน'}
            </Text>
          </View>
        ) : (
          <View>
            <Text style={TBstyle.detailLabel}>สถานะ</Text>
            <Text style={TBstyle.availableSubText}>พร้อมให้บริการ</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};