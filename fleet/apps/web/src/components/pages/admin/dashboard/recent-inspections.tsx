'use client';

import React, { useEffect, useState } from "react";
import { BadgeCheck, CircleX, ClipboardClock, Loader2, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { apiClient, extractResults } from "@/lib/apiClient";
import { API_CONFIG } from "@/config/api";

interface InspectionRow {
  id: string | number;
  status: string;
  vehicle_reg?: string;
  vehicle_make_model?: string;
  driver_name?: string;
  started_at?: string;
  completed_at?: string;
}

const RecentInspections = () => {
  const [inspections, setInspections] = useState<InspectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchInspections = async () => {
      try {
        setLoading(true);
        const data = await apiClient(`${API_CONFIG.ENDPOINTS.INSPECTIONS.LIST}?page=1`);
        if (!isMounted) return;
        const results = extractResults<any>(data).slice(0, 10);
        const mapped = results.map((inspection) => ({
          id: inspection.id,
          status: inspection.status || "PENDING",
          vehicle_reg: inspection.vehicle_reg,
          vehicle_make_model: inspection.vehicle_make_model,
          driver_name: inspection.driver_name,
          started_at: inspection.started_at,
          completed_at: inspection.completed_at,
        }));
        setInspections(mapped);
        setError(null);
      } catch (err: any) {
        if (!isMounted) return;
        console.error("Failed to load inspections:", err);
        setError(err?.message || "Unable to load inspections right now.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchInspections();
    return () => {
      isMounted = false;
    };
  }, []);

  const getStatusIcon = (status: string) => {
    const normalized = status?.toLowerCase();
    if (normalized === "pass" || normalized === "passed") {
      return (
        <span className="text-green-500">
          <BadgeCheck />
        </span>
      );
    }
    if (normalized === "fail" || normalized === "failed") {
      return (
        <span className="text-red-500">
          <CircleX />
        </span>
      );
    }
    return (
      <span className="text-yellow-500">
        <ClipboardClock />
      </span>
    );
  };

  const formatTimestamp = (started?: string, completed?: string) => {
    const timestamp = completed || started;
    if (!timestamp) return "N/A";
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  return (
    <div>
      <h2>Recent inspections</h2>
      <div className="flex flex-col gap-2 my-8">
        {loading && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading inspections...
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        {!loading && !error && inspections.length === 0 && (
          <p className="text-sm text-gray-500">No inspections found.</p>
        )}
        {inspections.map((inspection) => (
          <div key={inspection.id} className="py-4 border-b last:border-0">
            <div className="flex items-center gap-4 mb-2">
              {getStatusIcon(inspection.status)}
              <div className="flex w-full justify-between items-center">
                <span>
                  <p className="font-semibold">
                    {inspection.vehicle_reg || "Vehicle"}{" "}
                    {inspection.vehicle_make_model ? `- ${inspection.vehicle_make_model}` : ""}
                  </p>
                  <p className="text-sm text-gray-600">
                    {inspection.driver_name ? `Driver: ${inspection.driver_name}` : "Driver not assigned"}
                  </p>
                </span>
                <p className="text-xs text-gray-500">
                  {formatTimestamp(inspection.started_at, inspection.completed_at)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentInspections;
