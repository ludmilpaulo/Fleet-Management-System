type InspectionType = {
  id: string;
  vehicle: VehicleType;
  timestamp: string;
  status: "passed" | "failed" | "pending";
  inspector: string;
  notes?: string;
};
