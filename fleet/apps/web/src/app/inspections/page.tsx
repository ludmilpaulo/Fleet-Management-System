"use client";
import { useStartShiftMutation, useEndShiftMutation, useCreateInspectionMutation, useCompleteInspectionMutation } from '@/services/inspections';
import { useState } from 'react';
import InspectionForm from '@/components/inspection/InspectionForm';
import MobileInspectionForm from '@/components/inspection/MobileInspectionForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function InspectionsPage() {
  const [vehicleId, setVehicleId] = useState('');
  const [shiftId, setShiftId] = useState<number | null>(null);
  const [currentInspectionId, setCurrentInspectionId] = useState<number | null>(null);
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [startShift] = useStartShiftMutation();
  const [endShift] = useEndShiftMutation();
  const [createInspection] = useCreateInspectionMutation();
  const [completeInspection] = useCompleteInspectionMutation();

  const onStartShift = async () => {
    const v = Number(vehicleId); if (!v) return;
    const res = await startShift({ vehicle_id: v }).unwrap() as { id?: number; shift_id?: number };
    setShiftId(res.id || res.shift_id || 1);
  };
  const onEndShift = async () => {
    if (!shiftId) return;
    await endShift({ id: shiftId });
    setShiftId(null);
  };
  const onCreateInspection = async (type: 'START'|'END') => {
    if (!shiftId) return;
    const result = await createInspection({ shift_id: shiftId, type }).unwrap() as { id?: number };
    const inspectionId = result.id || 1; // Use result id or fallback
    setCurrentInspectionId(inspectionId);
    setShowInspectionForm(true);
  };
  
  const onComplete = async () => {
    const id = Number(prompt('Inspection id?') || '');
    if (!id) return;
    await completeInspection({ id, status: 'PASS' });
  };

  const handleInspectionComplete = () => {
    setShowInspectionForm(false);
    setCurrentInspectionId(null);
    alert('Inspection completed successfully!');
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  if (showInspectionForm && currentInspectionId) {
    return isMobile ? (
      <MobileInspectionForm 
        inspectionId={currentInspectionId} 
        onComplete={handleInspectionComplete} 
      />
    ) : (
      <InspectionForm 
        inspectionId={currentInspectionId} 
        onComplete={handleInspectionComplete} 
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Inspection Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 items-center flex-wrap">
            <input 
              className="border p-2 rounded flex-1 min-w-[200px]" 
              placeholder="Vehicle ID" 
              value={vehicleId} 
              onChange={(e)=>setVehicleId(e.target.value)} 
            />
            <Button 
              onClick={onStartShift} 
              disabled={!vehicleId}
              className="bg-black text-white"
            >
              Start Shift
            </Button>
            <Button 
              onClick={onEndShift} 
              disabled={!shiftId}
              variant="outline"
            >
              End Shift
            </Button>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={()=>onCreateInspection('START')} 
              disabled={!shiftId}
              variant="outline"
            >
              Create START Inspection
            </Button>
            <Button 
              onClick={()=>onCreateInspection('END')} 
              disabled={!shiftId}
              variant="outline"
            >
              Create END Inspection
            </Button>
            <Button 
              onClick={onComplete}
              variant="outline"
            >
              Complete Inspection (Legacy)
            </Button>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Current Status:</h3>
            <p className="text-sm text-gray-600">Shift ID: {shiftId ?? '—'}</p>
            <p className="text-sm text-gray-600">Vehicle ID: {vehicleId || '—'}</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">New Inspection Process:</h3>
            <p className="text-sm text-blue-800">
              Click "Create START Inspection" or "Create END Inspection" to begin the enhanced inspection process 
              with fuel level and odometer photo capture.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


