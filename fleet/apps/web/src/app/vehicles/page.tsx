"use client";
import { useState } from 'react';
import {
  useVehiclesQuery,
  useCreateVehicleMutation,
  type Vehicle,
} from '@/services/vehicles';

export default function VehiclesPage() {
  const [search, setSearch] = useState('');
  const { data, loading, refetch } = useVehiclesQuery(search || undefined);
  const [createVehicle, { loading: creating }] = useCreateVehicleMutation();

  const onCreate = async () => {
    const make = prompt('Make?');
    if (!make) return;
    await createVehicle({
      variables: {
        make,
        model: 'Unknown',
        regNumber: `DEV-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      },
    });
    refetch();
  };

  const vehicles: Vehicle[] = data?.vehicles ?? [];

  return (
    <div className="p-6">
      <div className="flex gap-2 mb-4">
        <input
          className="border p-2 flex-1"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="border px-3" onClick={() => refetch()}>
          Search
        </button>
        <button
          className="bg-black text-white px-3"
          onClick={onCreate}
          disabled={creating}
        >
          New
        </button>
      </div>
      {loading ? (
        <p>Loading…</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left">Reg</th>
              <th className="text-left">Make</th>
              <th className="text-left">Model</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v: Vehicle) => (
              <tr key={v.id || v.regNumber} className="border-t">
                <td>{v.regNumber}</td>
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


