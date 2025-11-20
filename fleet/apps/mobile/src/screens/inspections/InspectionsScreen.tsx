import React, { useState, useEffect } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

import { Card } from '../../components/ui/Card'
import { apiService, Inspection } from '../../services/apiService'
import { useAppSelector } from '../../store/hooks'

export default function InspectionsScreen() {
  const insets = useSafeAreaInsets()
  const { user } = useAppSelector((state) => state.auth)
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  // Calculate bottom padding to avoid tab bar overlap
  const bottomPadding = 100 + Math.max(insets.bottom, 0)

  useEffect(() => {
    loadInspections()
  }, [])

  const loadInspections = async () => {
    try {
      setLoading(true)
      const data = await apiService.getInspections()
      
      // Filter inspections for current user if they're a driver
      const filtered = user?.role === 'driver' 
        ? data.filter((insp: Inspection) => {
            const inspectorId = typeof insp.created_by === 'object' ? insp.created_by.id : insp.created_by
            return inspectorId.toString() === user?.id?.toString()
          })
        : data
      
      // Sort by date (most recent first)
      const sorted = filtered.sort((a, b) => {
        const dateA = new Date(a.started_at || a.created_at).getTime()
        const dateB = new Date(b.started_at || b.created_at).getTime()
        return dateB - dateA
      })
      
      setInspections(sorted)
    } catch (error: any) {
      console.error('Failed to load inspections:', error)
      Alert.alert('Error', 'Failed to load inspections. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    loadInspections()
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PASS':
      case 'PASSED':
      case 'COMPLETED': 
        return '#4ade80'
      case 'IN_PROGRESS':
        return '#f59e0b'
      case 'FAIL':
      case 'FAILED':
        return '#ef4444'
      case 'CANCELLED':
        return '#6b7280'
      default: 
        return '#6b7280'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PASS': return 'Passed'
      case 'PASSED': return 'Passed'
      case 'FAIL': return 'Failed'
      case 'FAILED': return 'Failed'
      case 'IN_PROGRESS': return 'In Progress'
      case 'CANCELLED': return 'Cancelled'
      default: return status || 'Unknown'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'START': return 'Pre-Trip'
      case 'END': return 'Post-Trip'
      default: return type || 'Inspection'
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Unknown date'
    }
  }

  const renderInspection = ({ item }: { item: Inspection }) => {
    const statusColor = getStatusColor(item.status)
    const statusLabel = getStatusLabel(item.status)
    const typeLabel = getTypeLabel(item.type)
    
    return (
      <Card style={styles.inspectionCard}>
        <View style={styles.inspectionHeader}>
          <View style={styles.inspectionInfo}>
            <Text style={styles.vehicleName}>{typeLabel} Inspection</Text>
            <Text style={styles.inspectionDate}>
              {formatDate(item.started_at || item.created_at)}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>
        </View>
        
        {item.address && (
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color="#6b7280" />
            <Text style={styles.detailText}>{item.address}</Text>
          </View>
        )}
        
        {item.notes && (
          <Text style={styles.notes} numberOfLines={2}>
            {item.notes}
          </Text>
        )}
        
        <View style={styles.footer}>
          <View style={styles.footerItem}>
            <Ionicons name="list-outline" size={14} color="#6b7280" />
            <Text style={styles.footerText}>
              {item.items?.length || 0} items
            </Text>
          </View>
          {item.photos && item.photos.length > 0 && (
            <View style={styles.footerItem}>
              <Ionicons name="camera-outline" size={14} color="#6b7280" />
              <Text style={styles.footerText}>
                {item.photos.length} photo{item.photos.length !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>
      </Card>
    )
  }

  if (loading && inspections.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#3b82f6', '#8b5cf6']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Inspections</Text>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading inspections...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#3b82f6', '#8b5cf6']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Inspections</Text>
        <Text style={styles.headerSubtitle}>{inspections.length} inspection{inspections.length !== 1 ? 's' : ''}</Text>
      </LinearGradient>
      
      <FlatList
        data={inspections}
        renderItem={renderInspection}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        contentContainerStyle={{ paddingBottom: bottomPadding, padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#3b82f6"
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <Ionicons name="shield-outline" size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>No inspections found</Text>
            <Text style={styles.emptySubtext}>
              Inspections will appear here once they are created
            </Text>
          </Card>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  list: {
    flex: 1,
  },
  inspectionCard: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
  },
  inspectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  inspectionInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  inspectionDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  notes: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 16,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
})
