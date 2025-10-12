"use client";
import { useStartShiftMutation, useEndShiftMutation, useCreateInspectionMutation, useCompleteInspectionMutation } from '@/services/inspections';
import { useState } from 'react';

export default function InspectionsPage() {
  const [vehicleId, setVehicleId] = useState('');
  const [shiftId, setShiftId] = useState<number | null>(null);
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
    await createInspection({ shift_id: shiftId, type });
  };
  const onComplete = async () => {
    const id = Number(prompt('Inspection id?') || '');
    if (!id) return;
    await completeInspection({ id, status: 'PASS' });
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex gap-2 items-center">
        <input className="border p-2" placeholder="Vehicle ID" value={vehicleId} onChange={(e)=>setVehicleId(e.target.value)} />
        <button className="bg-black text-white px-3" onClick={onStartShift} disabled={!vehicleId}>Start shift</button>
        <button className="border px-3" onClick={onEndShift} disabled={!shiftId}>End shift</button>
      </div>
      <div className="flex gap-2">
        <button className="border px-3" onClick={()=>onCreateInspection('START')} disabled={!shiftId}>Create START inspection</button>
        <button className="border px-3" onClick={()=>onCreateInspection('END')} disabled={!shiftId}>Create END inspection</button>
        <button className="border px-3" onClick={onComplete}>Complete inspection</button>
      </div>
      <div>
        <p className="text-sm text-gray-600">Shift ID: {shiftId ?? '—'}</p>
      </div>
    </div>
  );
}


