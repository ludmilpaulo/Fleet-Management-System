import React from 'react'
import { View, Text, StyleSheet, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const mockInspections = [
  { id: '1', vehicle: 'Truck-001', type: 'Pre-trip', status: 'Pending', date: '2024-01-15' },
  { id: '2', vehicle: 'Van-003', type: 'Weekly', status: 'Completed', date: '2024-01-14' },
  { id: '3', vehicle: 'Car-005', type: 'Monthly', status: 'In Progress', date: '2024-01-13' },
]

export default function InspectionsScreen() {
  const renderInspection = ({ item }) => (
    <View style={styles.inspectionCard}>
      <View style={styles.inspectionHeader}>
        <Text style={styles.vehicleName}>{item.vehicle}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.inspectionType}>{item.type} Inspection</Text>
      <Text style={styles.inspectionDate}>Due: {item.date}</Text>
    </View>
  )

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#4ade80'
      case 'In Progress': return '#f59e0b'
      case 'Pending': return '#ef4444'
      default: return '#6b7280'
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Inspections</Text>
        
        <FlatList
          data={mockInspections}
          renderItem={renderInspection}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
  },
  list: {
    flex: 1,
  },
  inspectionCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  inspectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  inspectionType: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 4,
  },
  inspectionDate: {
    fontSize: 12,
    color: '#6b7280',
  },
})
