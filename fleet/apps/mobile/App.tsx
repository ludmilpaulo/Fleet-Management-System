import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Button, Image, Platform, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { api, tokenStore } from './src/api/client';

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [picked, setPicked] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [inspectionId, setInspectionId] = useState<number | null>(null);

  const login = async () => {
    const resp = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/accounts/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password })
    });
    const j = await resp.json();
    tokenStore.setAccess(j.access); tokenStore.setRefresh(j.refresh);
  };

  const loadVehicles = async () => {
    const r = await api('/fleet/vehicles');
    const j = await r.json();
    setVehicles(j.results ?? j);
  };

  const pickImage = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (perm.status !== 'granted') return;
    const res = await ImagePicker.launchCameraAsync({ quality: 0.6 });
    if (!res.canceled) setPicked(res.assets[0]);
  };

  const upload = async () => {
    if (!picked || !inspectionId) return;
    const contentType = picked.mimeType || 'image/jpeg';
    const sign = await api('/uploads/sign', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contentType }) }).then(r=>r.json());
    const body = new FormData();
    Object.entries(sign.fields).forEach(([k, v]) => body.append(k, String(v)));
    body.append('file', { uri: picked.uri, name: 'photo.jpg', type: contentType } as any);
    await fetch(sign.url, { method: 'POST', body });
    await api('/uploads/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ inspection_id: inspectionId, file_key: sign.key, part: 'FRONT', angle: 'WIDE', width: picked.width, height: picked.height, taken_at: new Date().toISOString() }) });
  };

  const startShift = async (vehicleId: number) => {
    const r = await api('/inspections/shifts/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vehicle_id: vehicleId }) });
    const j = await r.json();
    setInspectionId(j.id || j.shift_id || 1);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Text style={{ fontSize: 20, fontWeight: '600' }}>Login</Text>
        <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={{ borderWidth: 1, padding: 8 }} />
        <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, padding: 8 }} />
        <Button title="Sign in" onPress={login} />

        <View style={{ height: 1, backgroundColor: '#ddd', marginVertical: 16 }} />
        <Button title="Load vehicles" onPress={loadVehicles} />
        {vehicles.map(v => (
          <View key={v.id || v.reg_number} style={{ paddingVertical: 6 }}>
            <Text>{v.reg_number} — {v.make} {v.model}</Text>
            <Button title="Start shift" onPress={() => startShift(v.id)} />
          </View>
        ))}

        <View style={{ height: 1, backgroundColor: '#ddd', marginVertical: 16 }} />
        <Button title="Capture photo" onPress={pickImage} />
        {picked && (
          <>
            <Image source={{ uri: picked.uri }} style={{ width: 200, height: 120, marginTop: 8 }} />
            <Button title="Upload to S3 and confirm" onPress={upload} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
