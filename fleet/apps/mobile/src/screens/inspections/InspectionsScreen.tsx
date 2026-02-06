import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { apiService, Inspection } from '../../services/apiService';
import * as Haptics from 'expo-haptics';

function getStatusColor(status: string): string {
  switch (status) {
    case 'PASS':
      return '#4ade80';
    case 'IN_PROGRESS':
      return '#f59e0b';
    case 'FAIL':
      return '#ef4444';
    case 'CANCELLED':
      return '#6b7280';
    default:
      return '#6b7280';
  }
}

export default function InspectionsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInspections = useCallback(async () => {
    try {
      const data = await apiService.getInspections();
      setInspections(data);
    } catch (e) {
      console.error('Failed to load inspections:', e);
      Alert.alert(t('common.error'), 'Failed to load inspections');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    fetchInspections();
  }, [fetchInspections]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchInspections();
  };

  const renderItem = ({ item }: { item: Inspection }) => {
    const vehicleLabel = item.vehicle_reg ?? '—';
    const date = item.started_at
      ? new Date(item.started_at).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—';
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          (navigation as any).navigate('InspectionDetail', { inspectionId: item.id });
        }}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.vehicleName}>{vehicleLabel}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '25' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.replace('_', ' ')}
            </Text>
          </View>
        </View>
        <Text style={styles.typeText}>{item.type === 'START' ? t('inspections.newInspection') : 'End'} – {item.type}</Text>
        <Text style={styles.dateText}>{date}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('inspections.title')}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            (navigation as any).navigate('InspectionForm');
          }}
        >
          <Ionicons name="add-circle" size={28} color="#4ade80" />
          <Text style={styles.addButtonText}>{t('inspections.newInspection')}</Text>
        </TouchableOpacity>
      </View>
      {loading && inspections.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4ade80" />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      ) : (
        <FlatList
          data={inspections}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={inspections.length === 0 ? styles.emptyList : styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4ade80" />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="clipboard-outline" size={56} color="#6b7280" />
              <Text style={styles.emptyText}>{t('inspections.title')} – none yet</Text>
              <Text style={styles.emptySubtext}>{t('inspections.newInspection')} to add one</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ade80',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyList: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  typeText: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#6b7280',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
});
