import React from "react";
import { BadgeCheck, CircleX, ClipboardClock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const RecentInspections = () => {
  return (
    <div>
      <h2>Recent inspections</h2>
      <div className="flex flex-col gap-2 my-8">
        {inspectionData.map((inspection) => (
          <div key={inspection.id} className="py-4 border-b last:border-0">
            <div className="flex items-center gap-4 mb-2">
              {inspection.status === "passed" ? (
                <span className="text-green-500">
                  <BadgeCheck />
                </span>
              ) : inspection.status === "failed" ? (
                <span className="text-red-500">
                  <CircleX />
                </span>
              ) : (
                <span className="text-yellow-500">
                  <ClipboardClock />
                </span>
              )}
              <div className="flex w-full justify-between items-center">
                <span>
                  <p className="font-semibold">
                    {inspection.vehicle.name} -{" "}
                    {inspection.vehicle?.licensePlate}
                  </p>
                  <p> {inspection.inspector}</p>
                </span>
                <p>
                  {formatDistanceToNow(new Date(inspection.timestamp), {
                    addSuffix: true,
                  })}
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

const inspectionData: InspectionType[] = [
  {
    id: "1",
    vehicle: {
      id: "v1",
      name: "Toyota Corolla",
      make: "Toyota",
      model: "Corolla",
      year: 2020,
      status: "active",
      licensePlate: "ABC-1234",
    },
    timestamp: "2025-10-09T10:00:00Z",
    status: "passed",
    inspector: "John Doe",
    notes: "All systems functional.",
  },
  {
    id: "2",
    vehicle: {
      id: "v2",
      name: "Honda Civic",
      make: "Honda",
      model: "Civic",
      year: 2021,
      status: "active",
      licensePlate: "XYZ-5678",
    },
    timestamp: "2025-10-02T14:30:00Z",
    status: "failed",
    inspector: "Jane Smith",
    notes: "Brake issues detected.",
  },
  {
    id: "3",
    vehicle: {
      id: "v3",
      name: "Ford Mustang",
      make: "Ford",
      model: "Mustang",
      year: 2019,
      status: "maintenance",
      licensePlate: "MUS-2021",
    },
    timestamp: "2025-10-11T09:15:00Z",
    status: "pending",
    inspector: "Mike Johnson",
    notes: "Inspection scheduled.",
  },
  {
    id: "4",
    vehicle: {
      id: "v4",
      name: "Chevrolet Malibu",
      make: "Chevrolet",
      model: "Malibu",
      year: 2022,
      status: "active",
      licensePlate: "CHE-2022",
    },
    timestamp: "2025-10-10T10:00:00Z",
    status: "passed",
    inspector: "John Doe",
    notes: "All systems functional.",
  },
  {
    id: "5",
    vehicle: {
      id: "v5",
      name: "Nissan Altima",
      make: "Nissan",
      model: "Altima",
      year: 2020,
      status: "active",
      licensePlate: "ALT-2020",
    },
    timestamp: "2025-10-07T14:30:00Z",
    status: "failed",
    inspector: "Jane Smith",
    notes: "Brake issues detected.",
  },
];
