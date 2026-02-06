import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { apiService, Vehicle } from '../../services/apiService';
import * as Haptics from 'expo-haptics';

const STATUS_OPTIONS: Vehicle['status'][] = ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'RETIRED'];
const FUEL_OPTIONS: Vehicle['fuel_type'][] = ['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID'];
const TRANSMISSION_OPTIONS: Vehicle['transmission'][] = ['MANUAL', 'AUTOMATIC'];

export default function AddVehicleScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [saving, setSaving] = useState(false);
  const [reg_number, setRegNumber] = useState('');
  const [vin, setVin] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');
  const [mileage, setMileage] = useState('0');
  const [fuel_type, setFuelType] = useState<Vehicle['fuel_type']>('PETROL');
  const [engine_size, setEngineSize] = useState('');
  const [transmission, setTransmission] = useState<Vehicle['transmission']>('MANUAL');
  const [status, setStatus] = useState<Vehicle['status']>('ACTIVE');

  const handleSave = async () => {
    const reg = reg_number.trim();
    if (!reg) {
      Alert.alert(t('common.error'), t('vehicles.licensePlate') + ' is required');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSaving(true);
    try {
      await apiService.createVehicle({
        reg_number: reg,
        vin: vin.trim() || undefined,
        make: make.trim() || 'Unknown',
        model: model.trim() || 'Unknown',
        year: year ? parseInt(year, 10) : undefined,
        color: color.trim() || '',
        mileage: parseInt(mileage, 10) || 0,
        fuel_type,
        engine_size: engine_size.trim() || '',
        transmission,
        status,
      });
      Alert.alert(t('common.success'), t('vehicles.addVehicle') + ' – ' + reg, [
        { text: t('common.done'), onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      const msg = e?.message || 'Failed to create vehicle';
      Alert.alert(t('common.error'), msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.goBack();
            }}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('vehicles.addVehicle')}</Text>
        </View>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Input
            label={t('vehicles.licensePlate')}
            placeholder="e.g. ABC-1234"
            value={reg_number}
            onChangeText={setRegNumber}
            leftIcon="car-outline"
            autoCapitalize="characters"
          />
          <Input
            label="VIN (optional)"
            placeholder="Vehicle Identification Number"
            value={vin}
            onChangeText={setVin}
            leftIcon="barcode-outline"
          />
          <Input
            label={t('vehicles.make')}
            placeholder="e.g. Toyota"
            value={make}
            onChangeText={setMake}
            leftIcon="construct-outline"
          />
          <Input
            label={t('vehicles.model')}
            placeholder="e.g. Corolla"
            value={model}
            onChangeText={setModel}
            leftIcon="car-sport-outline"
          />
          <Input
            label={t('vehicles.year')}
            placeholder="e.g. 2022"
            value={year}
            onChangeText={setYear}
            keyboardType="numeric"
            leftIcon="calendar-outline"
          />
          <Input
            label={t('vehicles.status') + ' / ' + t('vehicles.color')}
            placeholder="e.g. White"
            value={color}
            onChangeText={setColor}
            leftIcon="color-palette-outline"
          />
          <Input
            label={t('dashboard.vehicles') + ' – mileage (km)'}
            placeholder="0"
            value={mileage}
            onChangeText={setMileage}
            keyboardType="numeric"
            leftIcon="speedometer-outline"
          />
          <View style={styles.pickerRow}>
            <Text style={styles.pickerLabel}>{t('vehicles.status')}</Text>
            <View style={styles.chipRow}>
              {STATUS_OPTIONS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, status === s && styles.chipActive]}
                  onPress={() => setStatus(s)}
                >
                  <Text style={[styles.chipText, status === s && styles.chipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.pickerRow}>
            <Text style={styles.pickerLabel}>Fuel</Text>
            <View style={styles.chipRow}>
              {FUEL_OPTIONS.map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.chip, fuel_type === f && styles.chipActive]}
                  onPress={() => setFuelType(f)}
                >
                  <Text style={[styles.chipText, fuel_type === f && styles.chipTextActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.pickerRow}>
            <Text style={styles.pickerLabel}>Transmission</Text>
            <View style={styles.chipRow}>
              {TRANSMISSION_OPTIONS.map((tr) => (
                <TouchableOpacity
                  key={tr}
                  style={[styles.chip, transmission === tr && styles.chipActive]}
                  onPress={() => setTransmission(tr)}
                >
                  <Text style={[styles.chipText, transmission === tr && styles.chipTextActive]}>
                    {tr}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <Input
            label="Engine size (optional)"
            placeholder="e.g. 2.0L"
            value={engine_size}
            onChangeText={setEngineSize}
            leftIcon="settings-outline"
          />
          <Button
            title={saving ? t('common.loading') : t('common.save')}
            onPress={handleSave}
            loading={saving}
            disabled={saving}
            fullWidth
            style={styles.saveButton}
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
  keyboard: {
    flex: 1,
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
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  pickerRow: {
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  chipActive: {
    backgroundColor: '#4ade80',
  },
  chipText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#111',
  },
  saveButton: {
    marginTop: 16,
  },
});
