import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import * as Location from 'expo-location'

interface LocationScreenProps {
  navigation: any
}

interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
  altitude: number | null
  speed: number | null
  heading: number | null
  timestamp: number
}

export default function LocationScreen({ navigation }: LocationScreenProps) {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [locationPermission, setLocationPermission] = useState<string>('unknown')
  const [address, setAddress] = useState<string>('')
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([])

  useEffect(() => {
    checkLocationPermission()
  }, [])

  const checkLocationPermission = async () => {
    const { status } = await Location.getForegroundPermissionsAsync()
    setLocationPermission(status)
    
    if (status !== 'granted') {
      Alert.alert(
        'Location Permission',
        'This app needs location permission to track your position. Please enable location services.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Settings', onPress: () => Location.requestForegroundPermissionsAsync() }
        ]
      )
    }
  }

  const startLocationTracking = async () => {
    if (locationPermission !== 'granted') {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for tracking')
        return
      }
      setLocationPermission(status)
    }

    setIsTracking(true)
    
    try {
      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      })
      
      const locationData: LocationData = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        accuracy: currentLocation.coords.accuracy || 0,
        altitude: currentLocation.coords.altitude,
        speed: currentLocation.coords.speed,
        heading: currentLocation.coords.heading,
        timestamp: currentLocation.timestamp,
      }
      
      setLocation(locationData)
      
      // Get address
      const addressResult = await Location.reverseGeocodeAsync({
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      })
      
      if (addressResult.length > 0) {
        const addr = addressResult[0]
        setAddress(`${addr.street || ''} ${addr.city || ''} ${addr.region || ''}`.trim())
      }
      
      // Add to history
      setLocationHistory(prev => [locationData, ...prev.slice(0, 9)]) // Keep last 10
      
    } catch (error) {
      console.error('Location error:', error)
      Alert.alert('Location Error', 'Failed to get current location')
    }
  }

  const stopLocationTracking = () => {
    setIsTracking(false)
  }

  const formatCoordinate = (coord: number) => {
    return coord.toFixed(6)
  }

  const formatAccuracy = (accuracy: number) => {
    if (accuracy < 10) return 'Excellent'
    if (accuracy < 50) return 'Good'
    if (accuracy < 100) return 'Fair'
    return 'Poor'
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy < 10) return '#4ade80'
    if (accuracy < 50) return '#fbbf24'
    if (accuracy < 100) return '#f97316'
    return '#ef4444'
  }

  const formatSpeed = (speed: number | null) => {
    if (!speed) return 'N/A'
    return `${(speed * 3.6).toFixed(1)} km/h`
  }

  const formatHeading = (heading: number | null) => {
    if (!heading) return 'N/A'
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    const index = Math.round(heading / 45) % 8
    return `${directions[index]} (${heading.toFixed(0)}°)`
  }

  const shareLocation = () => {
    if (!location) return
    
    const message = `My current location:\nLatitude: ${formatCoordinate(location.latitude)}\nLongitude: ${formatCoordinate(location.longitude)}\nAccuracy: ${location.accuracy.toFixed(1)}m\nAddress: ${address}`
    
    Alert.alert('Share Location', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Copy', onPress: () => {
        // In a real app, you'd copy to clipboard
        Alert.alert('Copied', 'Location copied to clipboard')
      }}
    ])
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
            <Text style={styles.headerTitle}>Location Tracking</Text>
            <Text style={styles.headerSubtitle}>Track your position</Text>
          </View>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={shareLocation}
            disabled={!location}
          >
            <Ionicons name="share" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Permission Status */}
        <View style={styles.statusContainer}>
          <View style={styles.statusRow}>
            <Ionicons
              name={locationPermission === 'granted' ? 'location' : 'location-outline'}
              size={20}
              color={locationPermission === 'granted' ? '#4ade80' : '#ef4444'}
            />
            <Text style={styles.statusText}>
              Location: {locationPermission === 'granted' ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.trackButton, isTracking && styles.trackButtonActive]}
            onPress={isTracking ? stopLocationTracking : startLocationTracking}
          >
            <Ionicons
              name={isTracking ? 'stop' : 'play'}
              size={24}
              color="white"
            />
            <Text style={styles.trackButtonText}>
              {isTracking ? 'Stop Tracking' : 'Get Location'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Current Location */}
        {location && (
          <ScrollView style={styles.locationContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Current Location</Text>
            
            <View style={styles.locationCard}>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={20} color="#4ade80" />
                <Text style={styles.locationLabel}>Coordinates</Text>
              </View>
              <Text style={styles.locationValue}>
                {formatCoordinate(location.latitude)}, {formatCoordinate(location.longitude)}
              </Text>
              
              <View style={styles.locationRow}>
                <Ionicons name="speedometer" size={20} color="#fbbf24" />
                <Text style={styles.locationLabel}>Accuracy</Text>
              </View>
              <View style={styles.accuracyContainer}>
                <View style={[
                  styles.accuracyIndicator,
                  { backgroundColor: getAccuracyColor(location.accuracy) }
                ]} />
                <Text style={styles.locationValue}>
                  {location.accuracy.toFixed(1)}m ({formatAccuracy(location.accuracy)})
                </Text>
              </View>
              
              {location.altitude && (
                <>
                  <View style={styles.locationRow}>
                    <Ionicons name="trending-up" size={20} color="#8b5cf6" />
                    <Text style={styles.locationLabel}>Altitude</Text>
                  </View>
                  <Text style={styles.locationValue}>
                    {location.altitude.toFixed(1)}m
                  </Text>
                </>
              )}
              
              {location.speed && (
                <>
                  <View style={styles.locationRow}>
                    <Ionicons name="car" size={20} color="#06b6d4" />
                    <Text style={styles.locationLabel}>Speed</Text>
                  </View>
                  <Text style={styles.locationValue}>
                    {formatSpeed(location.speed)}
                  </Text>
                </>
              )}
              
              {location.heading && (
                <>
                  <View style={styles.locationRow}>
                    <Ionicons name="compass" size={20} color="#f59e0b" />
                    <Text style={styles.locationLabel}>Heading</Text>
                  </View>
                  <Text style={styles.locationValue}>
                    {formatHeading(location.heading)}
                  </Text>
                </>
              )}
              
              <View style={styles.locationRow}>
                <Ionicons name="time" size={20} color="#6b7280" />
                <Text style={styles.locationLabel}>Timestamp</Text>
              </View>
              <Text style={styles.locationValue}>
                {new Date(location.timestamp).toLocaleString()}
              </Text>
            </View>

            {/* Address */}
            {address && (
              <View style={styles.addressCard}>
                <View style={styles.locationRow}>
                  <Ionicons name="home" size={20} color="#10b981" />
                  <Text style={styles.locationLabel}>Address</Text>
                </View>
                <Text style={styles.addressText}>{address}</Text>
              </View>
            )}

            {/* Location History */}
            {locationHistory.length > 0 && (
              <View style={styles.historyCard}>
                <Text style={styles.sectionTitle}>Recent Locations</Text>
                {locationHistory.slice(0, 5).map((loc, index) => (
                  <View key={index} style={styles.historyItem}>
                    <Text style={styles.historyTime}>
                      {new Date(loc.timestamp).toLocaleTimeString()}
                    </Text>
                    <Text style={styles.historyCoords}>
                      {formatCoordinate(loc.latitude)}, {formatCoordinate(loc.longitude)}
                    </Text>
                    <Text style={styles.historyAccuracy}>
                      {loc.accuracy.toFixed(1)}m
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        )}

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>How to use:</Text>
          <Text style={styles.instructionsText}>
            1. Enable location permissions{'\n'}
            2. Tap "Get Location" to get current position{'\n'}
            3. Move around to see location updates{'\n'}
            4. Share your location when needed
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
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    gap: 8,
  },
  trackButtonActive: {
    backgroundColor: '#ef4444',
  },
  trackButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  locationContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  locationCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    gap: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  locationValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 28,
  },
  accuracyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 28,
  },
  accuracyIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  addressCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  addressText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 28,
    lineHeight: 22,
  },
  historyCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  historyTime: {
    color: 'white',
    fontSize: 12,
    opacity: 0.8,
    flex: 1,
  },
  historyCoords: {
    color: 'white',
    fontSize: 12,
    flex: 2,
    textAlign: 'center',
  },
  historyAccuracy: {
    color: 'white',
    fontSize: 12,
    opacity: 0.8,
    flex: 1,
    textAlign: 'right',
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
