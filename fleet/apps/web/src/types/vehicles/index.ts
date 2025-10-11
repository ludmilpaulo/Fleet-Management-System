type VehicleType = {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  status: "active" | "inactive" | "maintenance";
  location?: {
    lat: number;
    lng: number;
  };
  lastInspectionDate?: string;
  mileage?: number;
  licensePlate?: string;
};
