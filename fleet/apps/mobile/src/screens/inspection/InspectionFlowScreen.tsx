import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'

const INSPECTION_PARTS = [
  { id: 'FRONT', name: 'Front', icon: 'car-outline', completed: false },
  { id: 'REAR', name: 'Rear', icon: 'car-outline', completed: false },
  { id: 'LEFT', name: 'Left Side', icon: 'car-outline', completed: false },
  { id: 'RIGHT', name: 'Right Side', icon: 'car-outline', completed: false },
  { id: 'ROOF', name: 'Roof', icon: 'car-outline', completed: false },
  { id: 'INTERIOR', name: 'Interior', icon: 'car-outline', completed: false },
  { id: 'DASHBOARD', name: 'Dashboard', icon: 'speedometer-outline', completed: false },
  { id: 'ODOMETER', name: 'Odometer', icon: 'speedometer-outline', completed: false },
  { id: 'WINDSHIELD', name: 'Windshield', icon: 'car-outline', completed: false },
  { id: 'TYRES', name: 'Tyres', icon: 'ellipse-outline', completed: false },
  { id: 'LIGHTS', name: 'Lights', icon: 'bulb-outline', completed: false },
  { id: 'ENGINE', name: 'Engine', icon: 'settings-outline', completed: false },
]

const CAMERA_ANGLES = [
  { id: 'WIDE', name: 'Wide Shot', description: 'Full view of the part' },
  { id: 'CLOSEUP', name: 'Close-up', description: 'Detailed view' },
  { id: 'PANEL', name: 'Panel Detail', description: 'Panel-specific view' },
  { id: 'TYRE', name: 'Tyre Detail', description: 'Tyre-specific view' },
  { id: 'DAMAGE', name: 'Damage', description: 'Any damage found' },
  { id: 'GENERAL', name: 'General', description: 'General condition' },
]

export default function InspectionFlowScreen() {
  const navigation = useNavigation()
  const [currentPartIndex, setCurrentPartIndex] = useState(0)
  const [currentAngleIndex, setCurrentAngleIndex] = useState(0)
  const [completedParts, setCompletedParts] = useState<Set<string>>(new Set())
  const [photos, setPhotos] = useState<Array<{part: string, angle: string, uri: string}>>([])

  const currentPart = INSPECTION_PARTS[currentPartIndex]
  const currentAngle = CAMERA_ANGLES[currentAngleIndex]

  const handleTakePhoto = () => {
    navigation.navigate('InspectionCamera', {
      inspectionId: 1, // This would come from props or state
      part: currentPart.id,
      angle: currentAngle.id,
    })
  }

  const handleSkipAngle = () => {
    if (currentAngleIndex < CAMERA_ANGLES.length - 1) {
      setCurrentAngleIndex(currentAngleIndex + 1)
    } else {
      // Move to next part
      handleNextPart()
    }
  }

  const handleNextPart = () => {
    if (currentPartIndex < INSPECTION_PARTS.length - 1) {
      setCurrentPartIndex(currentPartIndex + 1)
      setCurrentAngleIndex(0)
    } else {
      // Inspection complete
      Alert.alert(
        'Inspection Complete',
        'All parts have been inspected. Review your photos and submit the inspection.',
        [
          { text: 'Review Photos', onPress: () => navigation.navigate('InspectionReview') },
          { text: 'Submit', onPress: handleSubmitInspection }
        ]
      )
    }
  }

  const handleSubmitInspection = () => {
    Alert.alert('Success', 'Inspection submitted successfully!')
    navigation.goBack()
  }

  const progress = ((currentPartIndex + 1) / INSPECTION_PARTS.length) * 100

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
            <Text style={styles.headerTitle}>Vehicle Inspection</Text>
            <Text style={styles.headerSubtitle}>
              {currentPartIndex + 1} of {INSPECTION_PARTS.length}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {/* Menu */}}
          >
            <Ionicons name="menu" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}% Complete</Text>
        </View>

        {/* Current Part Info */}
        <View style={styles.partInfo}>
          <View style={styles.partIcon}>
            <Ionicons name={currentPart.icon as any} size={40} color="white" />
          </View>
          <Text style={styles.partName}>{currentPart.name}</Text>
          <Text style={styles.partDescription}>
            Capture {currentAngle.name.toLowerCase()} photos
          </Text>
        </View>

        {/* Angle Selection */}
        <ScrollView style={styles.angleContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.angleTitle}>Camera Angle: {currentAngle.name}</Text>
          <Text style={styles.angleDescription}>{currentAngle.description}</Text>
          
          <View style={styles.angleGrid}>
            {CAMERA_ANGLES.map((angle, index) => (
              <TouchableOpacity
                key={angle.id}
                style={[
                  styles.angleButton,
                  index === currentAngleIndex && styles.angleButtonActive
                ]}
                onPress={() => setCurrentAngleIndex(index)}
              >
                <Text style={[
                  styles.angleButtonText,
                  index === currentAngleIndex && styles.angleButtonTextActive
                ]}>
                  {angle.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkipAngle}
          >
            <Ionicons name="arrow-forward" size={20} color="#667eea" />
            <Text style={styles.skipButtonText}>Skip Angle</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.captureButton}
            onPress={handleTakePhoto}
          >
            <Ionicons name="camera" size={24} color="white" />
            <Text style={styles.captureButtonText}>Take Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Parts Checklist */}
        <View style={styles.checklistContainer}>
          <Text style={styles.checklistTitle}>Inspection Progress</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.checklist}>
              {INSPECTION_PARTS.map((part, index) => (
                <View
                  key={part.id}
                  style={[
                    styles.checklistItem,
                    index === currentPartIndex && styles.checklistItemCurrent,
                    completedParts.has(part.id) && styles.checklistItemCompleted
                  ]}
                >
                  <Ionicons
                    name={
                      completedParts.has(part.id)
                        ? 'checkmark-circle'
                        : index === currentPartIndex
                        ? 'ellipse'
                        : 'ellipse-outline'
                    }
                    size={16}
                    color={
                      completedParts.has(part.id)
                        ? '#4ade80'
                        : index === currentPartIndex
                        ? '#667eea'
                        : 'rgba(255,255,255,0.5)'
                    }
                  />
                  <Text style={[
                    styles.checklistText,
                    index === currentPartIndex && styles.checklistTextCurrent,
                    completedParts.has(part.id) && styles.checklistTextCompleted
                  ]}>
                    {part.name}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
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
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  progressText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  partInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  partIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  partName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  partDescription: {
    color: 'white',
    fontSize: 16,
    opacity: 0.8,
    textAlign: 'center',
  },
  angleContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  angleTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  angleDescription: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 20,
  },
  angleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  angleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  angleButtonActive: {
    backgroundColor: 'white',
  },
  angleButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  angleButtonTextActive: {
    color: '#667eea',
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 15,
  },
  skipButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 25,
    backgroundColor: 'white',
    gap: 8,
  },
  skipButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
  captureButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 25,
    backgroundColor: '#4ade80',
    gap: 8,
  },
  captureButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  checklistContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  checklistTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  checklist: {
    flexDirection: 'row',
    gap: 15,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  checklistItemCurrent: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  checklistItemCompleted: {
    backgroundColor: 'rgba(74, 222, 128, 0.3)',
  },
  checklistText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '500',
  },
  checklistTextCurrent: {
    color: 'white',
  },
  checklistTextCompleted: {
    color: '#4ade80',
  },
})
