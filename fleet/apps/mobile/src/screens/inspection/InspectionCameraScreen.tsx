import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  SafeAreaView,
} from 'react-native'
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import * as Location from 'expo-location'
import * as ImageManipulator from 'expo-image-manipulator'

const { width, height } = Dimensions.get('window')

interface InspectionCameraScreenProps {
  navigation: any
  route: {
    params: {
      inspectionId: number
      part: string
      angle: string
    }
  }
}

const INSPECTION_PARTS = [
  'FRONT', 'REAR', 'LEFT', 'RIGHT', 'ROOF', 'INTERIOR', 
  'DASHBOARD', 'ODOMETER', 'WINDSHIELD', 'TYRES', 'LIGHTS', 'ENGINE'
]

const CAMERA_ANGLES = ['WIDE', 'CLOSEUP', 'PANEL', 'TYRE', 'DAMAGE', 'GENERAL']

export default function InspectionCameraScreen({ navigation, route }: InspectionCameraScreenProps) {
  const [permission, requestPermission] = useCameraPermissions()
  const [facing, setFacing] = useState<CameraType>('back')
  const [location, setLocation] = useState<Location.LocationObject | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const cameraRef = useRef<CameraView>(null)

  const { inspectionId, part, angle } = route.params

  useEffect(() => {
    getCurrentLocation()
  }, [])

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required for inspections')
        return
      }

      const location = await Location.getCurrentPositionAsync({})
      setLocation(location)
    } catch (error) {
      console.error('Error getting location:', error)
    }
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'))
  }

  const takePicture = async () => {
    if (!cameraRef.current) return

    setIsCapturing(true)
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        exif: true,
      })

      // Resize and compress the image
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 1920 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      )

      // Navigate to photo confirmation screen
      navigation.navigate('InspectionPhotoConfirm', {
        inspectionId,
        part,
        angle,
        photoUri: manipulatedImage.uri,
        location: location?.coords,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Error taking picture:', error)
      Alert.alert('Error', 'Failed to take picture')
    } finally {
      setIsCapturing(false)
    }
  }

  if (!permission) {
    return <View />
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.gradient}
        >
          <View style={styles.permissionContainer}>
            <Ionicons name="camera-outline" size={80} color="white" />
            <Text style={styles.permissionTitle}>Camera Permission Required</Text>
            <Text style={styles.permissionText}>
              We need access to your camera to capture inspection photos
            </Text>
            <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
              <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        mode="picture"
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
            <Text style={styles.headerTitle}>Inspection Photo</Text>
            <Text style={styles.headerSubtitle}>{part} - {angle}</Text>
          </View>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={toggleCameraFacing}
          >
            <Ionicons name="camera-reverse" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Camera Overlay */}
        <View style={styles.overlay}>
          {/* Focus Frame */}
          <View style={styles.focusFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Capture {part}</Text>
            <Text style={styles.instructionsText}>
              Position the {part.toLowerCase()} within the frame and ensure good lighting
            </Text>
          </View>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
              onPress={takePicture}
              disabled={isCapturing}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => {/* Flash toggle */}}
            >
              <Ionicons name="flash-off" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Location Status */}
          <View style={styles.locationStatus}>
            <Ionicons 
              name={location ? "location" : "location-outline"} 
              size={16} 
              color={location ? "#4ade80" : "#fbbf24"} 
            />
            <Text style={styles.locationText}>
              {location ? 'Location captured' : 'Getting location...'}
            </Text>
          </View>
        </View>
      </CameraView>
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
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    marginBottom: 10,
  },
  permissionText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.9,
  },
  permissionButton: {
    backgroundColor: 'white',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
  camera: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
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
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusFrame: {
    width: width * 0.8,
    height: width * 0.6,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: 'white',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: -100,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  instructionsTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  instructionsText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  bottomControls: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ef4444',
  },
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 5,
  },
})
