"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Upload, X, Fuel, Gauge, CheckCircle, AlertCircle } from 'lucide-react';
import { useCompleteInspectionMutation } from '@/services/inspections';
import { useSignUploadMutation as useUploadSign, useConfirmUploadMutation as useUploadConfirm } from '@/services/uploads';

interface MobileInspectionFormProps {
  inspectionId: number;
  onComplete?: () => void;
}

interface PhotoUpload {
  file: File;
  preview: string;
  type: 'fuel_level' | 'odometer';
}

export default function MobileInspectionForm({ inspectionId, onComplete }: MobileInspectionFormProps) {
  const [fuelLevel, setFuelLevel] = useState<number | ''>('');
  const [odometerKm, setOdometerKm] = useState<number | ''>('');
  const [status, setStatus] = useState<'PASS' | 'FAIL'>('PASS');
  const [photos, setPhotos] = useState<PhotoUpload[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const fuelPhotoRef = useRef<HTMLInputElement>(null);
  const odometerPhotoRef = useRef<HTMLInputElement>(null);

  const [completeInspection] = useCompleteInspectionMutation();
  const [signUpload] = useUploadSign();
  const [confirmUpload] = useUploadConfirm();

  const handlePhotoUpload = (type: 'fuel_level' | 'odometer') => {
    const inputRef = type === 'fuel_level' ? fuelPhotoRef : odometerPhotoRef;
    inputRef.current?.click();
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'fuel_level' | 'odometer') => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Remove existing photo of same type
    setPhotos(prev => prev.filter(p => p.type !== type));

    // Add new photo
    const preview = URL.createObjectURL(file);
    setPhotos(prev => [...prev, { file, preview, type }]);
  };

  const removePhoto = (type: 'fuel_level' | 'odometer') => {
    setPhotos(prev => prev.filter(p => p.type !== type));
  };

  const uploadPhoto = async (photo: PhotoUpload, inspectionId: number): Promise<string | null> => {
    try {
      // Step 1: Sign upload
      const signResponse = await signUpload({ contentType: photo.file.type }).unwrap() as {
        url: string;
        fields: Record<string, string>;
        key: string;
      };

      // Step 2: Upload to S3
      const formData = new FormData();
      Object.entries(signResponse.fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append('file', photo.file);

      await fetch(signResponse.url, {
        method: 'POST',
        body: formData,
      });

      // Step 3: Confirm upload
      await confirmUpload({
        inspection_id: inspectionId,
        file_key: signResponse.key,
        part: photo.type === 'fuel_level' ? 'FUEL_GAUGE' : 'ODOMETER',
        angle: 'STRAIGHT',
        width: 1280,
        height: 720,
        taken_at: new Date().toISOString(),
      }).unwrap();

      return signResponse.key;
    } catch (error) {
      console.error('Photo upload failed:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (fuelLevel === '' || odometerKm === '') {
      alert('Please enter both fuel level and odometer readings');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Upload photos first
      let fuelPhotoKey: string | null = null;
      let odometerPhotoKey: string | null = null;

      for (const photo of photos) {
        const key = await uploadPhoto(photo, inspectionId);
        if (photo.type === 'fuel_level') {
          fuelPhotoKey = key;
        } else if (photo.type === 'odometer') {
          odometerPhotoKey = key;
        }
      }

      // Complete inspection with readings and photo keys
      await completeInspection({
        id: inspectionId,
        status,
        fuel_level: Number(fuelLevel),
        odometer_km: Number(odometerKm),
        fuel_level_photo: fuelPhotoKey || undefined,
        odometer_photo: odometerPhotoKey || undefined,
      }).unwrap();

      alert('Inspection completed successfully!');
      onComplete?.();
    } catch (error) {
      console.error('Inspection completion failed:', error);
      alert('Failed to complete inspection. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fuelPhoto = photos.find(p => p.type === 'fuel_level');
  const odometerPhoto = photos.find(p => p.type === 'odometer');

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center space-x-2">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step <= currentStep 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {step < currentStep ? <CheckCircle className="h-4 w-4" /> : step}
            </div>
            {step < 3 && (
              <div className={`w-8 h-0.5 mx-2 ${
                step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Fuel className="h-12 w-12 mx-auto text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Fuel Level Reading</h3>
              <p className="text-gray-600">Enter the current fuel level percentage</p>
            </div>
            
            <div className="space-y-4">
              <Label htmlFor="fuel-level" className="text-base font-medium">
                Fuel Level (%)
              </Label>
              <Input
                id="fuel-level"
                type="number"
                min="0"
                max="100"
                value={fuelLevel}
                onChange={(e) => setFuelLevel(e.target.value ? Number(e.target.value) : '')}
                placeholder="Enter fuel level (0-100)"
                className="w-full text-lg text-center"
              />
            </div>

            <div className="space-y-4">
              <Label>Fuel Gauge Photo</Label>
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handlePhotoUpload('fuel_level')}
                  className="w-full flex items-center justify-center gap-2 h-12"
                >
                  <Camera className="h-5 w-5" />
                  {fuelPhoto ? 'Retake Photo' : 'Take Fuel Gauge Photo'}
                </Button>
                
                {fuelPhoto && (
                  <div className="space-y-2">
                    <img
                      src={fuelPhoto.preview}
                      alt="Fuel gauge"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removePhoto('fuel_level')}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Remove Photo
                    </Button>
                  </div>
                )}
                
                <input
                  ref={fuelPhotoRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => handlePhotoChange(e, 'fuel_level')}
                  className="hidden"
                />
              </div>
            </div>

            <Button
              onClick={nextStep}
              disabled={fuelLevel === '' || !fuelPhoto}
              className="w-full"
            >
              Next: Odometer Reading
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Gauge className="h-12 w-12 mx-auto text-green-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Odometer Reading</h3>
              <p className="text-gray-600">Enter the current odometer reading in kilometers</p>
            </div>
            
            <div className="space-y-4">
              <Label htmlFor="odometer" className="text-base font-medium">
                Odometer (KM)
              </Label>
              <Input
                id="odometer"
                type="number"
                min="0"
                value={odometerKm}
                onChange={(e) => setOdometerKm(e.target.value ? Number(e.target.value) : '')}
                placeholder="Enter odometer reading"
                className="w-full text-lg text-center"
              />
            </div>

            <div className="space-y-4">
              <Label>Odometer Photo</Label>
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handlePhotoUpload('odometer')}
                  className="w-full flex items-center justify-center gap-2 h-12"
                >
                  <Camera className="h-5 w-5" />
                  {odometerPhoto ? 'Retake Photo' : 'Take Odometer Photo'}
                </Button>
                
                {odometerPhoto && (
                  <div className="space-y-2">
                    <img
                      src={odometerPhoto.preview}
                      alt="Odometer"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removePhoto('odometer')}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Remove Photo
                    </Button>
                  </div>
                )}
                
                <input
                  ref={odometerPhotoRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => handlePhotoChange(e, 'odometer')}
                  className="hidden"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={prevStep}
                variant="outline"
                className="flex-1"
              >
                Previous
              </Button>
              <Button
                onClick={nextStep}
                disabled={odometerKm === '' || !odometerPhoto}
                className="flex-1"
              >
                Next: Final Review
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Final Review</h3>
              <p className="text-gray-600">Review your inspection details before submitting</p>
            </div>
            
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Inspection Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fuel Level:</span>
                    <span className="font-medium">{fuelLevel}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Odometer:</span>
                    <span className="font-medium">{odometerKm} KM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${status === 'PASS' ? 'text-green-600' : 'text-red-600'}`}>
                      {status}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Label>Photos Taken:</Label>
                <div className="grid grid-cols-2 gap-3">
                  {fuelPhoto && (
                    <div className="text-center">
                      <img
                        src={fuelPhoto.preview}
                        alt="Fuel gauge"
                        className="w-full h-24 object-cover rounded-lg border mb-2"
                      />
                      <p className="text-xs text-gray-600">Fuel Gauge</p>
                    </div>
                  )}
                  {odometerPhoto && (
                    <div className="text-center">
                      <img
                        src={odometerPhoto.preview}
                        alt="Odometer"
                        className="w-full h-24 object-cover rounded-lg border mb-2"
                      />
                      <p className="text-xs text-gray-600">Odometer</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-base font-medium">
                  Final Status
                </Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'PASS' | 'FAIL')}
                  className="w-full p-3 border border-gray-300 rounded-md text-base"
                >
                  <option value="PASS">✅ Pass</option>
                  <option value="FAIL">❌ Fail</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={prevStep}
                variant="outline"
                className="flex-1"
              >
                Previous
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </div>
                ) : (
                  'Complete Inspection'
                )}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              Vehicle Inspection
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderStepIndicator()}
            {renderStepContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
