"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Upload, X, Fuel, Gauge } from 'lucide-react';
import { useCompleteInspectionMutation } from '@/services/inspections';
import { useSignUploadMutation as useUploadSign, useConfirmUploadMutation as useUploadConfirm } from '@/services/uploads';

interface InspectionFormProps {
  inspectionId: number;
  onComplete?: () => void;
}

interface PhotoUpload {
  file: File;
  preview: string;
  type: 'fuel_level' | 'odometer';
}

export default function InspectionForm({ inspectionId, onComplete }: InspectionFormProps) {
  const [fuelLevel, setFuelLevel] = useState<number | ''>('');
  const [odometerKm, setOdometerKm] = useState<number | ''>('');
  const [status, setStatus] = useState<'PASS' | 'FAIL'>('PASS');
  const [photos, setPhotos] = useState<PhotoUpload[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Vehicle Inspection - Fuel & Odometer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Fuel Level Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Fuel className="h-4 w-4" />
              <Label htmlFor="fuel-level" className="text-base font-medium">
                Fuel Level (%)
              </Label>
            </div>
            <Input
              id="fuel-level"
              type="number"
              min="0"
              max="100"
              value={fuelLevel}
              onChange={(e) => setFuelLevel(e.target.value ? Number(e.target.value) : '')}
              placeholder="Enter fuel level percentage (0-100)"
              className="w-full"
            />
            
            {/* Fuel Level Photo */}
            <div className="space-y-2">
              <Label>Fuel Gauge Photo (Required)</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handlePhotoUpload('fuel_level')}
                  className="flex items-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  {fuelPhoto ? 'Retake Photo' : 'Take Photo'}
                </Button>
                {fuelPhoto && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removePhoto('fuel_level')}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Remove
                  </Button>
                )}
              </div>
              
              {fuelPhoto && (
                <div className="mt-2">
                  <img
                    src={fuelPhoto.preview}
                    alt="Fuel gauge"
                    className="w-full max-w-md h-48 object-cover rounded-lg border"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    File: {fuelPhoto.file.name} ({(fuelPhoto.file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              )}
              
              <input
                ref={fuelPhotoRef}
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoChange(e, 'fuel_level')}
                className="hidden"
              />
            </div>
          </div>

          {/* Odometer Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              <Label htmlFor="odometer" className="text-base font-medium">
                Odometer Reading (KM)
              </Label>
            </div>
            <Input
              id="odometer"
              type="number"
              min="0"
              value={odometerKm}
              onChange={(e) => setOdometerKm(e.target.value ? Number(e.target.value) : '')}
              placeholder="Enter current odometer reading in kilometers"
              className="w-full"
            />
            
            {/* Odometer Photo */}
            <div className="space-y-2">
              <Label>Odometer Photo (Required)</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handlePhotoUpload('odometer')}
                  className="flex items-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  {odometerPhoto ? 'Retake Photo' : 'Take Photo'}
                </Button>
                {odometerPhoto && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removePhoto('odometer')}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Remove
                  </Button>
                )}
              </div>
              
              {odometerPhoto && (
                <div className="mt-2">
                  <img
                    src={odometerPhoto.preview}
                    alt="Odometer"
                    className="w-full max-w-md h-48 object-cover rounded-lg border"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    File: {odometerPhoto.file.name} ({(odometerPhoto.file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              )}
              
              <input
                ref={odometerPhotoRef}
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoChange(e, 'odometer')}
                className="hidden"
              />
            </div>
          </div>

          {/* Inspection Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-base font-medium">
              Inspection Status
            </Label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'PASS' | 'FAIL')}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="PASS">Pass</option>
              <option value="FAIL">Fail</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || fuelLevel === '' || odometerKm === '' || !fuelPhoto || !odometerPhoto}
              className="w-full"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Completing Inspection...
                </div>
              ) : (
                'Complete Inspection'
              )}
            </Button>
          </div>

          {/* Requirements Notice */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Required for Inspection Completion:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Fuel level percentage (0-100)</li>
              <li>• Odometer reading in kilometers</li>
              <li>• Clear photo of fuel gauge</li>
              <li>• Clear photo of odometer display</li>
              <li>• Inspection status (Pass/Fail)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
