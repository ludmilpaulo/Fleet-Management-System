import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { BleManager, Device, State } from 'react-native-ble-plx'

interface KeyTrackerScreenProps {
  navigation: any
}

interface BLEDevice {
  id: string
  name: string
  rssi: number
  lastSeen: Date
  isConnected: boolean
}

export default function KeyTrackerScreen({ navigation }: KeyTrackerScreenProps) {
  const [bleManager] = useState(() => new BleManager())
  const [isScanning, setIsScanning] = useState(false)
  const [devices, setDevices] = useState<BLEDevice[]>([])
  const [bluetoothState, setBluetoothState] = useState<State>('Unknown')
  const [selectedDevice, setSelectedDevice] = useState<BLEDevice | null>(null)

  useEffect(() => {
    // Initialize BLE manager
    const subscription = bleManager.onStateChange((state) => {
      setBluetoothState(state)
      if (state === 'PoweredOn') {
        console.log('Bluetooth is ready')
      } else {
        Alert.alert('Bluetooth Error', 'Please enable Bluetooth to use key tracking')
      }
    }, true)

    return () => {
      subscription.remove()
      bleManager.destroy()
    }
  }, [])

  const startScan = () => {
    if (bluetoothState !== 'PoweredOn') {
      Alert.alert('Bluetooth Error', 'Please enable Bluetooth first')
      return
    }

    setIsScanning(true)
    setDevices([])

    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('Scan error:', error)
        setIsScanning(false)
        return
      }

      if (device) {
        setDevices(prevDevices => {
          const existingIndex = prevDevices.findIndex(d => d.id === device.id)
          const newDevice: BLEDevice = {
            id: device.id,
            name: device.name || `Device ${device.id.slice(-4)}`,
            rssi: device.rssi || 0,
            lastSeen: new Date(),
            isConnected: false,
          }

          if (existingIndex >= 0) {
            const updatedDevices = [...prevDevices]
            updatedDevices[existingIndex] = newDevice
            return updatedDevices
          } else {
            return [...prevDevices, newDevice]
          }
        })
      }
    })

    // Stop scanning after 10 seconds
    setTimeout(() => {
      bleManager.stopDeviceScan()
      setIsScanning(false)
    }, 10000)
  }

  const stopScan = () => {
    bleManager.stopDeviceScan()
    setIsScanning(false)
  }

  const connectToDevice = async (device: BLEDevice) => {
    try {
      const connectedDevice = await bleManager.connectToDevice(device.id)
      await connectedDevice.discoverAllServicesAndCharacteristics()
      
      setDevices(prevDevices =>
        prevDevices.map(d =>
          d.id === device.id ? { ...d, isConnected: true } : d
        )
      )
      
      Alert.alert('Success', `Connected to ${device.name}`)
    } catch (error) {
      console.error('Connection error:', error)
      Alert.alert('Connection Error', 'Failed to connect to device')
    }
  }

  const disconnectFromDevice = async (device: BLEDevice) => {
    try {
      await bleManager.cancelDeviceConnection(device.id)
      
      setDevices(prevDevices =>
        prevDevices.map(d =>
          d.id === device.id ? { ...d, isConnected: false } : d
        )
      )
      
      Alert.alert('Success', `Disconnected from ${device.name}`)
    } catch (error) {
      console.error('Disconnection error:', error)
      Alert.alert('Disconnection Error', 'Failed to disconnect from device')
    }
  }

  const getRSSIColor = (rssi: number) => {
    if (rssi > -50) return '#4ade80' // Green - Very close
    if (rssi > -70) return '#fbbf24' // Yellow - Close
    if (rssi > -90) return '#f97316' // Orange - Far
    return '#ef4444' // Red - Very far
  }

  const getRSSIText = (rssi: number) => {
    if (rssi > -50) return 'Very Close'
    if (rssi > -70) return 'Close'
    if (rssi > -90) return 'Far'
    return 'Very Far'
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Key Tracker</Text>
            <Text style={styles.headerSubtitle}>Find your vehicle keys</Text>
          </View>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {/* Settings */}}
          >
            <Ionicons name="settings" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Bluetooth Status */}
        <View style={styles.statusContainer}>
          <View style={styles.statusRow}>
            <Ionicons
              name={bluetoothState === 'PoweredOn' ? 'bluetooth' : 'bluetooth-outline'}
              size={20}
              color={bluetoothState === 'PoweredOn' ? '#4ade80' : '#ef4444'}
            />
            <Text style={styles.statusText}>
              Bluetooth: {bluetoothState === 'PoweredOn' ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
        </View>

        {/* Scan Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.scanButton, isScanning && styles.scanButtonActive]}
            onPress={isScanning ? stopScan : startScan}
          >
            <Ionicons
              name={isScanning ? 'stop' : 'search'}
              size={24}
              color="white"
            />
            <Text style={styles.scanButtonText}>
              {isScanning ? 'Stop Scan' : 'Start Scan'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Devices List */}
        <ScrollView style={styles.devicesContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.devicesTitle}>
            Found Devices ({devices.length})
          </Text>
          
          {devices.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="bluetooth-outline" size={60} color="rgba(255,255,255,0.5)" />
              <Text style={styles.emptyText}>
                {isScanning ? 'Scanning for devices...' : 'No devices found'}
              </Text>
              <Text style={styles.emptySubtext}>
                {isScanning ? 'Make sure your key tracker is nearby and powered on' : 'Tap "Start Scan" to search for devices'}
              </Text>
            </View>
          ) : (
            <View style={styles.devicesList}>
              {devices.map((device) => (
                <View key={device.id} style={styles.deviceItem}>
                  <View style={styles.deviceInfo}>
                    <Text style={styles.deviceName}>{device.name}</Text>
                    <Text style={styles.deviceId}>ID: {device.id}</Text>
                    <View style={styles.deviceStatus}>
                      <View style={[
                        styles.rssiIndicator,
                        { backgroundColor: getRSSIColor(device.rssi) }
                      ]} />
                      <Text style={styles.rssiText}>
                        {device.rssi} dBm ({getRSSIText(device.rssi)})
                      </Text>
                    </View>
                    <Text style={styles.lastSeen}>
                      Last seen: {device.lastSeen.toLocaleTimeString()}
                    </Text>
                  </View>
                  
                  <View style={styles.deviceActions}>
                    {device.isConnected ? (
                      <TouchableOpacity
                        style={styles.disconnectButton}
                        onPress={() => disconnectFromDevice(device)}
                      >
                        <Ionicons name="close" size={20} color="white" />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.connectButton}
                        onPress={() => connectToDevice(device)}
                      >
                        <Ionicons name="link" size={20} color="white" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>How to use:</Text>
          <Text style={styles.instructionsText}>
            1. Make sure Bluetooth is enabled{'\n'}
            2. Tap "Start Scan" to search for devices{'\n'}
            3. Move closer to your key tracker{'\n'}
            4. Connect to your device when found
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
  },
  statusContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  controlsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    gap: 8,
  },
  scanButtonActive: {
    backgroundColor: '#ef4444',
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  devicesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  devicesTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 15,
    marginBottom: 5,
  },
  emptySubtext: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center',
  },
  devicesList: {
    gap: 15,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  deviceId: {
    color: 'white',
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 8,
  },
  deviceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  rssiIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  rssiText: {
    color: 'white',
    fontSize: 12,
    opacity: 0.8,
  },
  lastSeen: {
    color: 'white',
    fontSize: 11,
    opacity: 0.6,
  },
  deviceActions: {
    marginLeft: 15,
  },
  connectButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4ade80',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disconnectButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  instructionsTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  instructionsText: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
})
