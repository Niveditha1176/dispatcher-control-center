import { z } from "zod";

export const driverSchema = z.object({
  id: z.string(),
  name: z.string(),
  homeLocality: z.string(),
  vehicleType: z.enum(["bike", "van"]),
  status: z.enum(["active", "idle", "offline"]),
  currentRoute: z.string(),
  dropsCompleted: z.number(),
  dropsTotal: z.number(),
  fuelConsumption: z.number(),
  phone: z.string(),
  avatar: z.string(),
  rating: z.number(),
  shiftStart: z.string(),
  shiftEnd: z.string(),
  hoursWorkedToday: z.number(),
  maxHoursPerDay: z.number(),
  vehicleCapacityKg: z.number(),
  currentLoadKg: z.number(),
  deliveryPoints: z.array(z.object({
    id: z.string(),
    address: z.string(),
    lat: z.number(),
    lng: z.number(),
    status: z.enum(["pending", "completed", "delayed"]),
    estimatedTime: z.string(),
    actualTime: z.string().optional(),
    deliveryWindow: z.string(),
  })),
});

export const insertDriverSchema = driverSchema.omit({ id: true });
export type InsertDriver = z.infer<typeof insertDriverSchema>;
export type Driver = z.infer<typeof driverSchema>;

export const fleetVehicleSchema = z.object({
  id: z.string(),
  type: z.enum(["bike", "van"]),
  licensePlate: z.string(),
  driverId: z.string(),
  driverName: z.string(),
  status: z.enum(["en-route", "idle", "maintenance"]),
  location: z.object({ lat: z.number(), lng: z.number() }),
  fuelLevel: z.number(),
  currentArea: z.string(),
});

export type FleetVehicle = z.infer<typeof fleetVehicleSchema>;

export const kpiDataSchema = z.object({
  onTimeRate: z.number(),
  dropsPerRoute: z.number(),
  totalDistance: z.number(),
  fuelSavings: z.number(),
  co2Reduction: z.number(),
});

export type KpiData = z.infer<typeof kpiDataSchema>;

export const notificationSchema = z.object({
  id: z.string(),
  type: z.enum(["late-delivery", "overtime-alert", "route-deviation", "vehicle-issue"]),
  severity: z.enum(["high", "medium", "low"]),
  driverName: z.string(),
  message: z.string(),
  timestamp: z.string(),
  acknowledged: z.boolean(),
});

export type Notification = z.infer<typeof notificationSchema>;

export const mapMarkerSchema = z.object({
  id: z.string(),
  type: z.enum(["bike", "van"]),
  driverName: z.string(),
  position: z.object({ lat: z.number(), lng: z.number() }),
  status: z.enum(["en-route", "idle", "maintenance"]),
});

export type MapMarker = z.infer<typeof mapMarkerSchema>;

export const urgentOrderInputSchema = z.object({
  orderDescription: z.string().min(1),
  deliveryAddress: z.string().min(1),
  deliveryLat: z.number(),
  deliveryLng: z.number(),
  packageDescription: z.string().min(1),
  packageWeightKg: z.number().positive(),
  requiredDeliveryTime: z.string().min(1),
  warehouseLat: z.number(),
  warehouseLng: z.number(),
});

export type UrgentOrderInput = z.infer<typeof urgentOrderInputSchema>;

export const driverCandidateSchema = z.object({
  driverId: z.string(),
  driverName: z.string(),
  avatar: z.string(),
  vehicleType: z.enum(["bike", "van"]),
  licensePlate: z.string(),
  distanceToWarehouseKm: z.number(),
  remainingCapacityKg: z.number(),
  remainingHours: z.number(),
  currentStopsCount: z.number(),
  rating: z.number(),
  estimatedPickupMin: z.number(),
  estimatedDeliveryMin: z.number(),
  oldEta: z.string(),
  newEta: z.string(),
  currentArea: z.string(),
  status: z.enum(["active", "idle", "offline"]),
});

export type DriverCandidate = z.infer<typeof driverCandidateSchema>;

export const leaveRequestSchema = z.object({
  id: z.string(),
  driverId: z.string(),
  driverName: z.string(),
  avatar: z.string(),
  leaveType: z.enum(["sick", "casual", "emergency", "personal"]),
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string(),
  submittedAt: z.string(),
  status: z.enum(["pending", "approved", "rejected"]),
});
export type LeaveRequest = z.infer<typeof leaveRequestSchema>;

export const overtimeRequestSchema = z.object({
  id: z.string(),
  driverId: z.string(),
  driverName: z.string(),
  avatar: z.string(),
  date: z.string(),
  scheduledEnd: z.string(),
  requestedEnd: z.string(),
  extraHours: z.number(),
  reason: z.string(),
  submittedAt: z.string(),
  status: z.enum(["pending", "approved", "rejected"]),
});
export type OvertimeRequest = z.infer<typeof overtimeRequestSchema>;

export const fuelBillSchema = z.object({
  id: z.string(),
  driverId: z.string(),
  driverName: z.string(),
  avatar: z.string(),
  vehiclePlate: z.string(),
  fuelType: z.enum(["petrol", "diesel"]),
  litres: z.number(),
  amountRs: z.number(),
  stationName: z.string(),
  date: z.string(),
  receiptImageUrl: z.string(),
  submittedAt: z.string(),
  status: z.enum(["pending", "approved", "rejected"]),
});
export type FuelBill = z.infer<typeof fuelBillSchema>;

export const podApprovalSchema = z.object({
  id: z.string(),
  driverId: z.string(),
  driverName: z.string(),
  avatar: z.string(),
  orderId: z.string(),
  customerName: z.string(),
  deliveryAddress: z.string(),
  photoUrl: z.string(),
  deliveredAt: z.string(),
  submittedAt: z.string(),
  status: z.enum(["pending", "approved", "rejected"]),
});
export type PODApproval = z.infer<typeof podApprovalSchema>;
