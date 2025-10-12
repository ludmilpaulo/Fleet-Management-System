"use client";
import { useListVehiclesQuery, useCreateVehicleMutation } from '@/services/vehicles';
import { useState } from 'react';

type Vehicle = { id?: number; reg_number: string; make: string; model: string };

export default function VehiclesPage() {
  const [search, setSearch] = useState('');
  const { data, refetch, isLoading } = useListVehiclesQuery({ search });
  const [createVehicle, { isLoading: creating }] = useCreateVehicleMutation();

  const onCreate = async () => {
    const make = prompt('Make?'); if (!make) return;
    await createVehicle({ make, model: 'Unknown', reg_number: `DEV-${Math.random().toString(36).slice(2,6).toUpperCase()}` });
    refetch();
  };

  const vehicles = (() => {
    if (!data) return [];
    if (Array.isArray(data)) return data as Vehicle[];
    if (typeof data === 'object' && 'results' in data) return (data.results as Vehicle[]) || [];
    return [];
  })();

  return (
    <div className="p-6">
      <div className="flex gap-2 mb-4">
        <input className="border p-2 flex-1" placeholder="Search" value={search} onChange={(e)=>setSearch(e.target.value)} />
        <button className="border px-3" onClick={()=>refetch()}>Search</button>
        <button className="bg-black text-white px-3" onClick={onCreate} disabled={creating}>New</button>
      </div>
      {isLoading ? <p>Loading…</p> : (
        <table className="w-full text-sm">
          <thead>
            <tr><th className="text-left">Reg</th><th className="text-left">Make</th><th className="text-left">Model</th></tr>
          </thead>
          <tbody>
            {vehicles.map((v: Vehicle)=> (
              <tr key={v.id || v.reg_number} className="border-t">
                <td>{v.reg_number}</td>
                <td>{v.make}</td>
                <td>{v.model}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}


