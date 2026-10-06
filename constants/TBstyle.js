import { StyleSheet } from 'react-native';

export const TBstyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  screenSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  card: {
    flex: 1,
    margin: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    minHeight: 120,
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  cardSelected: {
    borderWidth: 1.5,
    borderColor: '#22c55e',
  },
  cardAvailable: {
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  cardPending: {
    borderWidth: 1.5,
    borderColor: '#f97316',
    backgroundColor: '#fffaf5',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tableNumberText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  badgeAvailable: {
    backgroundColor: '#dcfce7',
  },
  badgeTextAvailable: {
    color: '#15803d',
    fontSize: 12,
    fontWeight: '600',
  },
  badgePending: {
    backgroundColor: '#ffedd5',
  },
  badgeTextPending: {
    color: '#c2410c',
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    marginTop: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 2,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ea580c',
  },
  availableSubText: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: '5%',
    marginVertical: '5%',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});