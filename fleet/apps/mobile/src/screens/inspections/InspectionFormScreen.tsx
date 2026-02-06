import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { apiService, Vehicle, Inspection } from '../../services/apiService';
import * as Haptics from 'expo-haptics';

type InspectionType = 'START' | 'END';

export default function InspectionFormScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [inspectionType, setInspectionType] = useState<InspectionType>('START');
  const [notes, setNotes] = useState('');
  const [weather, setWeather] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await apiService.getVehicles();
        if (!cancelled) setVehicles(list);
      } catch (e) {
        if (!cancelled) Alert.alert(t('common.error'), 'Failed to load vehicles');
      } finally {
        if (!cancelled) setLoadingVehicles(false);
      }
    })();
    return () => { cancelled = true; };
  }, [t]);

  const handleCreate = async () => {
    if (!selectedVehicleId) {
      Alert.alert(t('common.error'), 'Please select a vehicle');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSaving(true);
    try {
      const shift = await apiService.startShift(selectedVehicleId, undefined, undefined, undefined);
      await apiService.createInspection({
        shift: shift.id,
        type: inspectionType,
        notes: notes.trim() || undefined,
        weather_conditions: weather.trim() || undefined,
      });
      Alert.alert(
        t('common.success'),
        `${t('inspections.newInspection')} created`,
        [{ text: t('common.done'), onPress: () => navigation.goBack() }]
      );
    } catch (e: any) {
      const msg = e?.message || 'Failed to create inspection';
      Alert.alert(t('common.error'), msg);
    } finally {
      setSaving(false);
    }
  };

  if (loadingVehicles) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4ade80" />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.goBack();
          }}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('inspections.newInspection')}</Text>
      </View>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionLabel}>{t('inspections.inspectionType')}</Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[styles.typeChip, inspectionType === 'START' && styles.typeChipActive]}
              onPress={() => setInspectionType('START')}
            >
              <Text style={[styles.typeChipText, inspectionType === 'START' && styles.typeChipTextActive]}>
                Start of shift
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeChip, inspectionType === 'END' && styles.typeChipActive]}
              onPress={() => setInspectionType('END')}
            >
              <Text style={[styles.typeChipText, inspectionType === 'END' && styles.typeChipTextActive]}>
                End of shift
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionLabel}>{t('vehicles.title')}</Text>
          {vehicles.length === 0 ? (
            <Text style={styles.hint}>No vehicles. Add one from the Vehicles tab.</Text>
          ) : (
            <View style={styles.vehicleList}>
              {vehicles.map((v) => (
                <TouchableOpacity
                  key={v.id}
                  style={[styles.vehicleOption, selectedVehicleId === v.id && styles.vehicleOptionActive]}
                  onPress={() => setSelectedVehicleId(v.id)}
                >
                  <Text style={styles.vehicleReg}>{v.reg_number}</Text>
                  <Text style={styles.vehicleMake}>{v.make} {v.model}{v.year ? ` (${v.year})` : ''}</Text>
                  {selectedVehicleId === v.id && (
                    <Ionicons name="checkmark-circle" size={22} color="#4ade80" style={styles.checkIcon} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Input
            label={t('inspections.notes')}
            placeholder="Optional notes"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
          />
          <Input
            label="Weather (optional)"
            placeholder="e.g. Clear, 22°C"
            value={weather}
            onChangeText={setWeather}
          />

          <Button
            title={saving ? t('common.loading') : t('inspections.submit')}
            onPress={handleCreate}
            loading={saving}
            disabled={saving || vehicles.length === 0}
            fullWidth
            style={styles.submitBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backBtn: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  keyboard: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
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
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 10,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  typeChip: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  typeChipActive: {
    backgroundColor: 'rgba(74, 222, 128, 0.25)',
    borderWidth: 1,
    borderColor: '#4ade80',
  },
  typeChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  typeChipTextActive: {
    color: '#4ade80',
  },
  vehicleList: {
    marginBottom: 20,
  },
  vehicleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 8,
  },
  vehicleOptionActive: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderWidth: 1,
    borderColor: '#4ade80',
  },
  vehicleReg: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginRight: 8,
  },
  vehicleMake: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  checkIcon: {
    marginLeft: 8,
  },
  hint: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 20,
  },
  submitBtn: {
    marginTop: 16,
  },
});
