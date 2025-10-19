import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
  Animated,
  Modal,
} from 'react-native'
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import * as ImageManipulator from 'expo-image-manipulator'
import { fuelDetectionService, FuelDetectionResult } from '../../services/fuelDetectionService'
import { apiService } from '../../services/apiService'
import { analytics } from '../../services/mixpanel'

const { width, height } = Dimensions.get('window')

interface DashboardCameraScreenProps {
  onFuelDetected?: (result: FuelDetectionResult) => void
  onClose?: () => void
  vehicleId?: number
}

export default function DashboardCameraScreen({ 
  onFuelDetected, 
  onClose, 
  vehicleId 
}: DashboardCameraScreenProps) {
  const [facing, setFacing] = useState<CameraType>('back')
  const [permission, requestPermission] = useCameraPermissions()
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [fuelResult, setFuelResult] = useState<FuelDetectionResult | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('off')
  const [zoom, setZoom] = useState(0)
  
  const cameraRef = useRef<CameraView>(null)
  const captureAnimation = useRef(new Animated.Value(1)).current
  const resultAnimation = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (showResult) {
      Animated.spring(resultAnimation, {
        toValue: 1,
        useNativeDriver: true,
      }).start()
    } else {
      Animated.spring(resultAnimation, {
        toValue: 0,
        useNativeDriver: true,
      }).start()
    }
  }, [showResult])

  if (!permission) {
    return <View />
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'))
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const toggleFlash = () => {
    const modes: Array<'off' | 'on' | 'auto'> = ['off', 'on', 'auto']
    const currentIndex = modes.indexOf(flashMode)
    const nextIndex = (currentIndex + 1) % modes.length
    setFlashMode(modes[nextIndex])
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const adjustZoom = (direction: 'in' | 'out') => {
    const newZoom = direction === 'in' 
      ? Math.min(zoom + 0.1, 1) 
      : Math.max(zoom - 0.1, 0)
    setZoom(newZoom)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const capturePhoto = async () => {
    if (!cameraRef.current || isCapturing) return

    setIsCapturing(true)
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)

    // Capture animation
    Animated.sequence([
      Animated.timing(captureAnimation, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(captureAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
      })

      if (photo?.uri) {
        setCapturedPhoto(photo.uri)
        await analyzeFuelLevel(photo.uri)
        analytics.track('Dashboard Photo Captured', {
          vehicle_id: vehicleId,
          photo_uri: photo.uri.substring(0, 50)
        })
      }
    } catch (error) {
      console.error('Error capturing photo:', error)
      Alert.alert('Error', 'Failed to capture photo')
      analytics.track('Photo Capture Failed', {
        error: error instanceof Error ? error.message : 'unknown'
      })
    } finally {
      setIsCapturing(false)
    }
  }

  const analyzeFuelLevel = async (photoUri: string) => {
    setIsAnalyzing(true)
    
    try {
      const result = await fuelDetectionService.detectFuelLevel(photoUri)
      setFuelResult(result)
      setShowResult(true)
      
      if (result.fuelLevel !== null) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        
        // Upload photo and fuel data to backend
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
      setIsAnalyzing(false)
    }
  }

  const uploadFuelReading = async (photoUri: string, result: FuelDetectionResult) => {
    try {
      // Upload photo to telemetry system
      const formData = new FormData()
      formData.append('vehicle', vehicleId!.toString())
      formData.append('type', 'fuel_level')
      formData.append('image', {
        uri: photoUri,
        name: `fuel-${vehicleId}-${Date.now()}.jpg`,
        type: 'image/jpeg',
      } as any)

      formData.append('data', JSON.stringify({
        fuel_level: result.fuelLevel,
        confidence: result.confidence,
        detection_method: result.method,
        timestamp: new Date().toISOString(),
        raw_text: result.rawText,
        detected_values: result.detectedValues,
      }))

      await apiService.post('/telemetry/fuel-readings/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      analytics.track('Fuel Reading Uploaded', {
        vehicle_id: vehicleId,
        fuel_level: result.fuelLevel,
        confidence: result.confidence
      })
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
    setShowResult(false)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const confirmFuelReading = () => {
    if (fuelResult && fuelResult.fuelLevel !== null) {
      onFuelDetected?.(fuelResult)
      onClose?.()
    }
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

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flashMode}
        zoom={zoom}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'transparent', 'rgba(0,0,0,0.7)']}
          style={styles.overlay}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Dashboard Camera</Text>
              <TouchableOpacity onPress={toggleFlash} style={styles.flashButton}>
                <Ionicons 
                  name={flashMode === 'off' ? 'flash-off' : flashMode === 'on' ? 'flash' : 'flash-outline'} 
                  size={24} 
                  color="#ffffff" 
                />
              </TouchableOpacity>
            </View>

            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>Point camera at fuel gauge</Text>
              <Text style={styles.instructionsText}>
                Ensure the fuel level indicator is clearly visible
              </Text>
            </View>

            {/* Controls */}
            <View style={styles.controlsContainer}>
              <View style={styles.controlRow}>
                <TouchableOpacity 
                  onPress={() => adjustZoom('out')} 
                  style={styles.controlButton}
                  disabled={zoom <= 0}
                >
                  <Ionicons name="remove" size={24} color="#ffffff" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={capturePhoto} 
                  style={styles.captureButton}
                  disabled={isCapturing || isAnalyzing}
                >
                  <Animated.View style={[styles.captureButtonInner, { transform: [{ scale: captureAnimation }] }]}>
                    {isCapturing || isAnalyzing ? (
                      <ActivityIndicator color="#ffffff" size="large" />
                    ) : (
                      <Ionicons name="camera" size={32} color="#ffffff" />
                    )}
                  </Animated.View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => adjustZoom('in')} 
                  style={styles.controlButton}
                  disabled={zoom >= 1}
                >
                  <Ionicons name="add" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity onPress={toggleCameraFacing} style={styles.flipButton}>
                <Ionicons name="camera-reverse" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </CameraView>

      {/* Fuel Detection Result Modal */}
      <Modal
        visible={showResult}
        transparent
        animationType="fade"
        onRequestClose={() => setShowResult(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.resultContainer,
              { transform: [{ scale: resultAnimation }] }
            ]}
          >
            <View style={styles.resultHeader}>
              <Ionicons name="analytics" size={32} color="#4ade80" />
              <Text style={styles.resultTitle}>Fuel Level Detected</Text>
            </View>

            {fuelResult && (
              <View style={styles.resultContent}>
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
            )}

            <View style={styles.resultActions}>
              <TouchableOpacity 
                onPress={retakePhoto} 
                style={styles.retakeButton}
              >
                <Ionicons name="refresh" size={20} color="#6b7280" />
                <Text style={styles.retakeButtonText}>Retake</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={confirmFuelReading} 
                style={styles.confirmButton}
                disabled={!fuelResult || fuelResult.fuelLevel === null}
              >
                <LinearGradient
                  colors={['#4ade80', '#22c55e']}
                  style={styles.confirmButtonGradient}
                >
                  <Ionicons name="checkmark" size={20} color="#ffffff" />
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 20,
  },
  permissionText: {
    color: '#ffffff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#4ade80',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  permissionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  closeButton: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  flashButton: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  instructionsContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  instructionsTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  instructionsText: {
    color: '#a0a0a0',
    fontSize: 16,
    textAlign: 'center',
  },
  controlsContainer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  controlButton: {
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
    marginHorizontal: 20,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4ade80',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipButton: {
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resultContainer: {
    backgroundColor: '#1f2937',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    maxWidth: 400,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resultTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  resultContent: {
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
  resultActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    flex: 0.45,
    justifyContent: 'center',
  },
  retakeButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  confirmButton: {
    flex: 0.45,
    borderRadius: 10,
    overflow: 'hidden',
  },
  confirmButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
})
