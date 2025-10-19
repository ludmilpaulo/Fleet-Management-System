import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Camera, CameraType, FlashMode } from 'expo-camera'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import * as ImageManipulator from 'expo-image-manipulator'
import { apiService } from '../../services/apiService'
import { fuelDetectionService, FuelDetectionResult } from '../../services/fuelDetectionService'
import { analytics } from '../../services/mixpanel'

const { width, height } = Dimensions.get('window')

interface CameraScreenProps {
  onPhotoTaken?: (photoUri: string) => void
  onFuelDetected?: (result: FuelDetectionResult) => void
  inspectionId?: number
  part?: string
  vehicleId?: number
  mode?: 'inspection' | 'fuel' | 'general'
}

export default function CameraScreen({ 
  onPhotoTaken, 
  onFuelDetected, 
  inspectionId, 
  part, 
  vehicleId, 
  mode = 'general' 
}: CameraScreenProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [type, setType] = useState(CameraType.back)
  const [flashMode, setFlashMode] = useState(FlashMode.off)
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [zoom, setZoom] = useState(0)
  const [isAnalyzingFuel, setIsAnalyzingFuel] = useState(false)
  const [fuelResult, setFuelResult] = useState<FuelDetectionResult | null>(null)
  const [showFuelResult, setShowFuelResult] = useState(false)
  
  const cameraRef = useRef<Camera>(null)
  const fadeAnim = useRef(new Animated.Value(1)).current
  const scaleAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    getCameraPermissions()
    
    // Animate camera controls
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const getCameraPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync()
    setHasPermission(status === 'granted')
    
    analytics.track('Camera Permission Requested', {
      granted: status === 'granted'
    })
  }

  const toggleCameraType = () => {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back))
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    
    analytics.track('Camera Type Toggled', {
      new_type: type === CameraType.back ? 'front' : 'back'
    })
  }

  const toggleFlash = () => {
    setFlashMode(current => {
      const modes = [FlashMode.off, FlashMode.on, FlashMode.auto]
      const currentIndex = modes.indexOf(current)
      const nextIndex = (currentIndex + 1) % modes.length
      return modes[nextIndex]
    })
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    
    analytics.track('Flash Mode Toggled', {
      mode: flashMode
    })
  }

  const handleZoom = (direction: 'in' | 'out') => {
    const newZoom = direction === 'in' 
      ? Math.min(zoom + 0.1, 1)
      : Math.max(zoom - 0.1, 0)
    setZoom(newZoom)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing) return

    setIsCapturing(true)
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      
      // Animate capture effect
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start()

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
      })

      // Compress and optimize the image
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 1024 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      )

      setCapturedPhoto(manipulatedImage.uri)
      
      analytics.track('Photo Captured', {
        inspection_id: inspectionId,
        part: part,
        camera_type: type,
        flash_mode: flashMode
      })

      // If we have inspection context, upload immediately
      if (inspectionId && part) {
        await uploadPhoto(manipulatedImage.uri, inspectionId, part)
      }

      // If in fuel mode, analyze fuel level
      if (mode === 'fuel' && vehicleId) {
        await analyzeFuelLevel(manipulatedImage.uri)
      }

      // Notify parent component
      if (onPhotoTaken) {
        onPhotoTaken(manipulatedImage.uri)
      }

    } catch (error) {
      console.error('Error taking picture:', error)
      Alert.alert('Error', 'Failed to take picture. Please try again.')
      
      analytics.track('Photo Capture Failed', {
        error: error instanceof Error ? error.message : 'unknown'
      })
    } finally {
      setIsCapturing(false)
    }
  }

  const uploadPhoto = async (uri: string, inspectionId: number, part: string) => {
    try {
      await apiService.uploadPhoto(uri, inspectionId, part)
      Alert.alert('Success', 'Photo uploaded successfully!')
      
      analytics.track('Photo Uploaded', {
        inspection_id: inspectionId,
        part: part
      })
    } catch (error) {
      console.error('Error uploading photo:', error)
      Alert.alert('Error', 'Failed to upload photo. Please try again.')
    }
  }

  const analyzeFuelLevel = async (photoUri: string) => {
    setIsAnalyzingFuel(true)
    
    try {
      const result = await fuelDetectionService.detectFuelLevel(photoUri)
      setFuelResult(result)
      setShowFuelResult(true)
      
      if (result.fuelLevel !== null) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        
        // Upload fuel reading to backend
        if (vehicleId) {
          await uploadFuelReading(photoUri, result)
        }
        
        onFuelDetected?.(result)
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
      }
      
      analytics.track('Fuel Analysis Completed', {
        fuel_level: result.fuelLevel,
        confidence: result.confidence,
        method: result.method,
        vehicle_id: vehicleId
      })
    } catch (error) {
      console.error('Error analyzing fuel level:', error)
      Alert.alert('Analysis Error', 'Failed to analyze fuel level')
      analytics.track('Fuel Analysis Failed', {
        error: error instanceof Error ? error.message : 'unknown'
      })
    } finally {
      setIsAnalyzingFuel(false)
    }
  }

  const uploadFuelReading = async (photoUri: string, result: FuelDetectionResult) => {
    try {
      await apiService.uploadFuelReading(photoUri, vehicleId!, result)
    } catch (error) {
      console.error('Error uploading fuel reading:', error)
      analytics.track('Fuel Reading Upload Failed', {
        error: error instanceof Error ? error.message : 'unknown'
      })
    }
  }

  const retakePhoto = () => {
    setCapturedPhoto(null)
    setFuelResult(null)
    setShowFuelResult(false)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const getFuelStatusColor = (level: number | null) => {
    if (level === null) return '#6b7280'
    if (level >= 75) return '#4ade80'
    if (level >= 50) return '#22c55e'
    if (level >= 25) return '#f59e0b'
    if (level >= 10) return '#ef4444'
    return '#dc2626'
  }

  const getFuelStatusText = (level: number | null) => {
    if (level === null) return 'Unknown'
    if (level >= 75) return 'Full'
    if (level >= 50) return 'Good'
    if (level >= 25) return 'Low'
    if (level >= 10) return 'Critical'
    return 'Empty'
  }

  const getFlashIcon = () => {
    switch (flashMode) {
      case FlashMode.on: return 'flash'
      case FlashMode.auto: return 'flash-outline'
      default: return 'flash-off'
    }
  }

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-off" size={64} color="#ef4444" />
          <Text style={styles.permissionTitle}>Camera Access Denied</Text>
          <Text style={styles.permissionText}>
            Please enable camera access in your device settings to use this feature.
          </Text>
          <TouchableOpacity style={styles.settingsButton} onPress={getCameraPermissions}>
            <Text style={styles.settingsButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cameraContainer}>
        <Camera
          ref={cameraRef}
          style={styles.camera}
          type={type}
          flashMode={flashMode}
          zoom={zoom}
        >
          {/* Top Controls */}
          <Animated.View style={[styles.topControls, { opacity: fadeAnim }]}>
            <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
              <Ionicons name={getFlashIcon()} size={24} color="#ffffff" />
            </TouchableOpacity>
            
            <View style={styles.zoomControls}>
              <TouchableOpacity 
                style={styles.zoomButton} 
                onPress={() => handleZoom('out')}
                disabled={zoom <= 0}
              >
                <Ionicons name="remove" size={20} color="#ffffff" />
              </TouchableOpacity>
              
              <View style={styles.zoomBar}>
                <View style={[styles.zoomIndicator, { left: `${zoom * 100}%` }]} />
              </View>
              
              <TouchableOpacity 
                style={styles.zoomButton} 
                onPress={() => handleZoom('in')}
                disabled={zoom >= 1}
              >
                <Ionicons name="add" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.controlButton} onPress={toggleCameraType}>
              <Ionicons name="camera-reverse" size={24} color="#ffffff" />
            </TouchableOpacity>
          </Animated.View>

          {/* Camera Focus Indicator */}
          <View style={styles.focusIndicator} />

          {/* Bottom Controls */}
          <Animated.View style={[styles.bottomControls, { opacity: fadeAnim }]}>
            <View style={styles.captureControls}>
              <TouchableOpacity style={styles.galleryButton}>
                <Ionicons name="images" size={24} color="#ffffff" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
                onPress={takePicture}
                disabled={isCapturing}
              >
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                  <LinearGradient
                    colors={['#4ade80', '#22c55e']}
                    style={styles.captureButtonGradient}
                  >
                    <View style={styles.captureButtonInner} />
                  </LinearGradient>
                </Animated.View>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.optionsButton}>
                <Ionicons name="options" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Context Information */}
          {(inspectionId || part || mode === 'fuel') && (
            <View style={styles.contextInfo}>
              <Text style={styles.contextText}>
                {mode === 'fuel' ? 'Point camera at fuel gauge' : ''}
                {inspectionId ? `Inspection #${inspectionId}` : ''}
                {part ? ` • ${part}` : ''}
              </Text>
            </View>
          )}
        </Camera>
      </View>

      {/* Captured Photo Preview */}
      {capturedPhoto && (
        <View style={styles.photoPreview}>
          <Text style={styles.previewTitle}>Photo Captured</Text>
          <View style={styles.previewActions}>
            <TouchableOpacity style={styles.retakeButton} onPress={retakePhoto}>
              <Ionicons name="refresh" size={20} color="#ffffff" />
              <Text style={styles.retakeButtonText}>Retake</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.useButton} 
              onPress={() => {
                if (onPhotoTaken) {
                  onPhotoTaken(capturedPhoto)
                }
                setCapturedPhoto(null)
              }}
            >
              <Ionicons name="checkmark" size={20} color="#ffffff" />
              <Text style={styles.useButtonText}>Use Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Fuel Detection Result Modal */}
      {showFuelResult && fuelResult && (
        <View style={styles.fuelResultModal}>
          <View style={styles.fuelResultContainer}>
            <View style={styles.fuelResultHeader}>
              <Ionicons name="analytics" size={32} color="#4ade80" />
              <Text style={styles.fuelResultTitle}>Fuel Level Detected</Text>
            </View>

            <View style={styles.fuelResultContent}>
              <View style={styles.fuelLevelContainer}>
                <Text style={styles.fuelLevelText}>
                  {fuelResult.fuelLevel !== null ? `${fuelResult.fuelLevel}%` : 'Unknown'}
                </Text>
                <View style={[
                  styles.fuelStatusBadge,
                  { backgroundColor: getFuelStatusColor(fuelResult.fuelLevel) }
                ]}>
                  <Text style={styles.fuelStatusText}>
                    {getFuelStatusText(fuelResult.fuelLevel)}
                  </Text>
                </View>
              </View>

              <View style={styles.confidenceContainer}>
                <Text style={styles.confidenceLabel}>Confidence:</Text>
                <View style={styles.confidenceBar}>
                  <View 
                    style={[
                      styles.confidenceFill,
                      { width: `${(fuelResult.confidence || 0) * 100}%` }
                    ]}
                  />
                </View>
                <Text style={styles.confidenceText}>
                  {Math.round((fuelResult.confidence || 0) * 100)}%
                </Text>
              </View>

              {fuelResult.rawText && fuelResult.rawText.length > 0 && (
                <View style={styles.detectedTextContainer}>
                  <Text style={styles.detectedTextLabel}>Detected Text:</Text>
                  {fuelResult.rawText.map((text, index) => (
                    <Text key={index} style={styles.detectedText}>
                      "{text}"
                    </Text>
                  ))}
                </View>
              )}

              {fuelResult.error && (
                <View style={styles.errorContainer}>
                  <Ionicons name="warning" size={20} color="#ef4444" />
                  <Text style={styles.errorText}>{fuelResult.error}</Text>
                </View>
              )}
            </View>

            <View style={styles.fuelResultActions}>
              <TouchableOpacity 
                onPress={() => {
                  setShowFuelResult(false)
                  setFuelResult(null)
                }} 
                style={styles.closeFuelResultButton}
              >
                <Text style={styles.closeFuelResultButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
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
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#a0a0a0',
    textAlign: 'center',
    marginBottom: 30,
  },
  settingsButton: {
    backgroundColor: '#4ade80',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  settingsButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  topControls: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  zoomButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  zoomBar: {
    width: 60,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginHorizontal: 10,
    position: 'relative',
  },
  zoomIndicator: {
    position: 'absolute',
    top: -2,
    width: 8,
    height: 8,
    backgroundColor: '#4ade80',
    borderRadius: 4,
  },
  focusIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 60,
    height: 60,
    marginTop: -30,
    marginLeft: -30,
    borderWidth: 2,
    borderColor: '#4ade80',
    borderRadius: 30,
    opacity: 0.7,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  captureControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  captureButtonGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  optionsButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contextInfo: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  contextText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  photoPreview: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  previewActions: {
    flexDirection: 'row',
    gap: 20,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retakeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  useButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ade80',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  useButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  fuelResultModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fuelResultContainer: {
    backgroundColor: '#1f2937',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    maxWidth: 400,
  },
  fuelResultHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  fuelResultTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  fuelResultContent: {
    marginBottom: 25,
  },
  fuelLevelContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  fuelLevelText: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  fuelStatusBadge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  fuelStatusText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confidenceContainer: {
    marginBottom: 20,
  },
  confidenceLabel: {
    color: '#a0a0a0',
    fontSize: 16,
    marginBottom: 8,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#4ade80',
  },
  confidenceText: {
    color: '#ffffff',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'right',
  },
  detectedTextContainer: {
    marginBottom: 15,
  },
  detectedTextLabel: {
    color: '#a0a0a0',
    fontSize: 14,
    marginBottom: 5,
  },
  detectedText: {
    color: '#ffffff',
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  fuelResultActions: {
    alignItems: 'center',
  },
  closeFuelResultButton: {
    backgroundColor: '#4ade80',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeFuelResultButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
})
