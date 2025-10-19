import * as ImageManipulator from 'expo-image-manipulator'
import { analytics } from './mixpanel'

export interface FuelDetectionResult {
  fuelLevel: number | null
  confidence: number
  method: 'ocr' | 'visual' | 'manual'
  rawText?: string[]
  detectedValues?: number[]
  error?: string
}

export interface FuelReading {
  value: number
  unit: string
  timestamp: Date
  confidence: number
  source: 'detected' | 'manual'
}

class FuelDetectionService {
  private fuelKeywords = [
    'fuel', 'gas', 'petrol', 'diesel', 'tank', 'level', 'gauge',
    'litres', 'liters', 'l', 'gal', 'gallons', 'full', 'empty'
  ]

  private fuelUnits = ['l', 'litres', 'liters', 'gal', 'gallons', '%', 'percent']

  private fuelPatterns = [
    // Pattern for "Fuel: 45L" or "Fuel Level: 45 Litres"
    /fuel[:\s]*(\d+(?:\.\d+)?)\s*(l|litres?|gal|gallons?)/i,
    // Pattern for "45L" or "45 Litres" near fuel keywords
    /(\d+(?:\.\d+)?)\s*(l|litres?|gal|gallons?)/i,
    // Pattern for percentage "Fuel: 75%" or "Tank: 75%"
    /(?:fuel|tank|level)[:\s]*(\d+(?:\.\d+)?)%/i,
    // Pattern for just percentage "75%"
    /(\d+(?:\.\d+)?)%/i,
    // Pattern for gauge readings like "F", "3/4", "1/2", "1/4", "E"
    /(?:f|full|3\/4|three.?quarters?|1\/2|half|1\/4|quarter|e|empty)/i,
  ]

  /**
   * Analyze dashboard photo to detect fuel level
   */
  async detectFuelLevel(imageUri: string): Promise<FuelDetectionResult> {
    try {
      analytics.track('Fuel Detection Started', {
        image_uri: imageUri.substring(0, 50) // Log partial URI for debugging
      })

      // First, try to enhance the image for better text recognition
      const enhancedImage = await this.enhanceImageForOCR(imageUri)
      
      // Attempt OCR-based detection
      const ocrResult = await this.detectFuelWithOCR(enhancedImage.uri)
      if (ocrResult.fuelLevel !== null && ocrResult.confidence > 0.7) {
        analytics.track('Fuel Detection Success', {
          method: 'ocr',
          confidence: ocrResult.confidence,
          fuel_level: ocrResult.fuelLevel
        })
        return ocrResult
      }

      // If OCR fails or low confidence, try visual analysis
      const visualResult = await this.detectFuelVisually(enhancedImage.uri)
      if (visualResult.fuelLevel !== null && visualResult.confidence > 0.5) {
        analytics.track('Fuel Detection Success', {
          method: 'visual',
          confidence: visualResult.confidence,
          fuel_level: visualResult.fuelLevel
        })
        return visualResult
      }

      // If both methods fail, return the best result
      const bestResult = ocrResult.confidence > visualResult.confidence ? ocrResult : visualResult
      
      analytics.track('Fuel Detection Completed', {
        method: bestResult.method,
        confidence: bestResult.confidence,
        fuel_level: bestResult.fuelLevel
      })

      return bestResult

    } catch (error) {
      analytics.track('Fuel Detection Failed', {
        error: error instanceof Error ? error.message : 'unknown'
      })
      
      return {
        fuelLevel: null,
        confidence: 0,
        method: 'ocr',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Enhance image for better OCR recognition
   */
  private async enhanceImageForOCR(imageUri: string) {
    try {
      // Resize image to optimal size for OCR
      const resized = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 1200 } }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      )

      // Apply contrast enhancement
      const enhanced = await ImageManipulator.manipulateAsync(
        resized.uri,
        [
          { resize: { width: 1200 } },
          // Note: More advanced image processing would require additional libraries
        ],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      )

      return enhanced
    } catch (error) {
      console.error('Image enhancement failed:', error)
      return { uri: imageUri }
    }
  }

  /**
   * Detect fuel level using OCR text recognition
   */
  private async detectFuelWithOCR(imageUri: string): Promise<FuelDetectionResult> {
    try {
      // For now, we'll simulate OCR since expo doesn't have built-in OCR
      // In a real implementation, you would use a service like:
      // - Google Vision API
      // - AWS Textract
      // - Azure Computer Vision
      // - Tesseract.js for React Native
      
      const mockOCRText = await this.simulateOCR(imageUri)
      const extractedValues = this.extractFuelValues(mockOCRText)
      
      if (extractedValues.length === 0) {
        return {
          fuelLevel: null,
          confidence: 0,
          method: 'ocr',
          rawText: mockOCRText,
          error: 'No fuel-related text detected'
        }
      }

      // Find the most likely fuel level value
      const bestMatch = this.selectBestFuelValue(extractedValues, mockOCRText)
      
      return {
        fuelLevel: bestMatch.value,
        confidence: bestMatch.confidence,
        method: 'ocr',
        rawText: mockOCRText,
        detectedValues: extractedValues.map(v => v.value)
      }

    } catch (error) {
      return {
        fuelLevel: null,
        confidence: 0,
        method: 'ocr',
        error: error instanceof Error ? error.message : 'OCR processing failed'
      }
    }
  }

  /**
   * Simulate OCR text extraction (replace with real OCR service)
   */
  private async simulateOCR(imageUri: string): Promise<string[]> {
    // This is a mock implementation
    // In a real app, you would send the image to an OCR service
    
    // Simulate different dashboard readings
    const mockReadings = [
      'FUEL LEVEL: 45L',
      'TANK: 3/4 FULL',
      'DIESEL: 32.5 Litres',
      'GAS GAUGE: 75%',
      'FUEL: 1/2',
      'PETROL: 28L',
      'TANK LEVEL: 60%',
      'FUEL GAUGE: F',
      'DIESEL TANK: 40 Litres',
      'GAS: 1/4',
    ]

    // Return a random mock reading
    const randomReading = mockReadings[Math.floor(Math.random() * mockReadings.length)]
    return [randomReading]
  }

  /**
   * Extract fuel values from OCR text
   */
  private extractFuelValues(textLines: string[]): Array<{value: number, unit: string, confidence: number}> {
    const values: Array<{value: number, unit: string, confidence: number}> = []
    
    textLines.forEach(line => {
      this.fuelPatterns.forEach(pattern => {
        const match = line.match(pattern)
        if (match) {
          const numericValue = parseFloat(match[1])
          const unit = match[2] || '%'
          
          // Convert gauge readings to percentages
          let fuelValue = numericValue
          let confidence = 0.8
          
          if (isNaN(numericValue)) {
            // Handle gauge readings
            const gaugeReading = match[0].toLowerCase()
            if (gaugeReading.includes('f') || gaugeReading.includes('full')) {
              fuelValue = 100
              confidence = 0.9
            } else if (gaugeReading.includes('3/4') || gaugeReading.includes('three')) {
              fuelValue = 75
              confidence = 0.8
            } else if (gaugeReading.includes('1/2') || gaugeReading.includes('half')) {
              fuelValue = 50
              confidence = 0.8
            } else if (gaugeReading.includes('1/4') || gaugeReading.includes('quarter')) {
              fuelValue = 25
              confidence = 0.8
            } else if (gaugeReading.includes('e') || gaugeReading.includes('empty')) {
              fuelValue = 0
              confidence = 0.9
            }
          }
          
          // Normalize to percentage if needed
          if (unit.toLowerCase().includes('l') || unit.toLowerCase().includes('gal')) {
            // For volume readings, we'd need tank capacity to convert to percentage
            // For now, assume it's a percentage of a typical tank
            confidence *= 0.7 // Lower confidence for volume readings
          }
          
          values.push({
            value: fuelValue,
            unit: unit,
            confidence: confidence
          })
        }
      })
    })
    
    return values
  }

  /**
   * Select the best fuel value from multiple detections
   */
  private selectBestFuelValue(
    values: Array<{value: number, unit: string, confidence: number}>,
    textLines: string[]
  ): {value: number, confidence: number} {
    if (values.length === 0) {
      return { value: 0, confidence: 0 }
    }
    
    if (values.length === 1) {
      return { value: values[0].value, confidence: values[0].confidence }
    }
    
    // Find value with highest confidence
    const bestMatch = values.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    )
    
    // Check if multiple values agree
    const similarValues = values.filter(v => 
      Math.abs(v.value - bestMatch.value) <= 5
    )
    
    if (similarValues.length > 1) {
      // Increase confidence if multiple similar values found
      bestMatch.confidence = Math.min(0.95, bestMatch.confidence + 0.1)
    }
    
    return { value: bestMatch.value, confidence: bestMatch.confidence }
  }

  /**
   * Detect fuel level using visual analysis (placeholder)
   */
  private async detectFuelVisually(imageUri: string): Promise<FuelDetectionResult> {
    // This would involve computer vision techniques to analyze the fuel gauge
    // For now, return a low-confidence result
    
    return {
      fuelLevel: null,
      confidence: 0.2,
      method: 'visual',
      error: 'Visual fuel detection not implemented'
    }
  }

  /**
   * Validate detected fuel level
   */
  validateFuelLevel(fuelLevel: number): {isValid: boolean, message?: string} {
    if (fuelLevel < 0 || fuelLevel > 100) {
      return {
        isValid: false,
        message: 'Fuel level must be between 0% and 100%'
      }
    }
    
    if (fuelLevel < 10) {
      return {
        isValid: true,
        message: 'Warning: Low fuel level detected'
      }
    }
    
    return { isValid: true }
  }

  /**
   * Convert fuel reading to standardized format
   */
  standardizeFuelReading(
    value: number, 
    unit: string, 
    tankCapacity?: number
  ): FuelReading {
    let percentage = value
    
    // Convert volume to percentage if tank capacity is known
    if (tankCapacity && (unit.includes('l') || unit.includes('gal'))) {
      percentage = (value / tankCapacity) * 100
    }
    
    return {
      value: Math.round(percentage * 100) / 100, // Round to 2 decimal places
      unit: '%',
      timestamp: new Date(),
      confidence: 0.8,
      source: 'detected'
    }
  }

  /**
   * Get fuel level status based on percentage
   */
  getFuelStatus(percentage: number): {
    status: 'full' | 'good' | 'low' | 'critical' | 'empty'
    color: string
    message: string
  } {
    if (percentage >= 75) {
      return {
        status: 'full',
        color: '#4ade80',
        message: 'Tank is full'
      }
    } else if (percentage >= 50) {
      return {
        status: 'good',
        color: '#22c55e',
        message: 'Good fuel level'
      }
    } else if (percentage >= 25) {
      return {
        status: 'low',
        color: '#f59e0b',
        message: 'Low fuel warning'
      }
    } else if (percentage >= 10) {
      return {
        status: 'critical',
        color: '#ef4444',
        message: 'Critical fuel level'
      }
    } else {
      return {
        status: 'empty',
        color: '#dc2626',
        message: 'Tank nearly empty'
      }
    }
  }
}

export const fuelDetectionService = new FuelDetectionService()
