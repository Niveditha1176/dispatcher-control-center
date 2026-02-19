import type {
  Driver,
  FleetVehicle,
  KpiData,
  Notification,
  MapMarker,
  UrgentOrderInput,
  DriverCandidate,
  LeaveRequest,
  OvertimeRequest,
  FuelBill,
  PODApproval,
} from "@shared/schema";

export interface IStorage {
  getKpis(): Promise<KpiData>;
  getDrivers(): Promise<Driver[]>;
  getFleet(): Promise<FleetVehicle[]>;
  getNotifications(): Promise<Notification[]>;
  getMarkers(): Promise<MapMarker[]>;
  acknowledgeNotification(id: string): Promise<Notification | null>;
  reassignDriver(driverId: string): Promise<{ driver: Driver; vehicle: FleetVehicle } | null>;
  transferDeliveryPoint(fromDriverId: string, toDriverId: string, pointId: string, insertIndex: number): Promise<{ fromDriver: Driver; toDriver: Driver } | null>;
  findUrgentDriverCandidates(input: UrgentOrderInput): Promise<DriverCandidate[]>;
  assignUrgentOrder(driverId: string, input: UrgentOrderInput): Promise<Driver | null>;
  getLeaveRequests(): Promise<LeaveRequest[]>;
  updateLeaveStatus(id: string, status: "approved" | "rejected"): Promise<LeaveRequest | null>;
  getOvertimeRequests(): Promise<OvertimeRequest[]>;
  updateOvertimeStatus(id: string, status: "approved" | "rejected"): Promise<OvertimeRequest | null>;
  getFuelBills(): Promise<FuelBill[]>;
  updateFuelBillStatus(id: string, status: "approved" | "rejected"): Promise<FuelBill | null>;
  getPodApprovals(): Promise<PODApproval[]>;
  updatePodStatus(id: string, status: "approved" | "rejected"): Promise<PODApproval | null>;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const seedKpis: KpiData = {
  onTimeRate: 93,
  dropsPerRoute: 13,
  totalDistance: 248,
  fuelSavings: 22,
  co2Reduction: 28,
};

const chennaiAreas: { name: string; lat: number; lng: number; nearby: string[] }[] = [
  { name: "T. Nagar", lat: 13.0418, lng: 80.2341, nearby: ["Kodambakkam", "Nungambakkam", "Mylapore"] },
  { name: "Anna Nagar", lat: 13.0850, lng: 80.2101, nearby: ["Kilpauk", "Perambur", "Ambattur"] },
  { name: "Adyar", lat: 13.0012, lng: 80.2565, nearby: ["Thiruvanmiyur", "Mylapore", "Guindy"] },
  { name: "Velachery", lat: 12.9816, lng: 80.2185, nearby: ["Guindy", "Adyar", "Chromepet"] },
  { name: "Mylapore", lat: 13.0368, lng: 80.2676, nearby: ["Adyar", "T. Nagar", "Royapettah"] },
  { name: "Tambaram", lat: 12.9249, lng: 80.1000, nearby: ["Chromepet", "Pallavaram", "Sholinganallur"] },
  { name: "Porur", lat: 13.0382, lng: 80.1564, nearby: ["Guindy", "Kodambakkam", "Ambattur"] },
  { name: "Guindy", lat: 13.0067, lng: 80.2206, nearby: ["Velachery", "Adyar", "T. Nagar"] },
  { name: "Chromepet", lat: 12.9516, lng: 80.1462, nearby: ["Tambaram", "Pallavaram", "Velachery"] },
  { name: "Perambur", lat: 13.1187, lng: 80.2332, nearby: ["Anna Nagar", "Kilpauk", "Royapettah"] },
  { name: "Thiruvanmiyur", lat: 12.9830, lng: 80.2594, nearby: ["Adyar", "Velachery", "Sholinganallur"] },
  { name: "Ambattur", lat: 13.1143, lng: 80.1548, nearby: ["Anna Nagar", "Porur", "Perambur"] },
  { name: "Sholinganallur", lat: 12.9010, lng: 80.2279, nearby: ["Thiruvanmiyur", "Velachery", "Tambaram"] },
  { name: "Kilpauk", lat: 13.0842, lng: 80.2428, nearby: ["Anna Nagar", "Perambur", "Egmore"] },
  { name: "Kodambakkam", lat: 13.0524, lng: 80.2247, nearby: ["T. Nagar", "Porur", "Nungambakkam"] },
  { name: "Nungambakkam", lat: 13.0569, lng: 80.2425, nearby: ["T. Nagar", "Kilpauk", "Kodambakkam"] },
  { name: "Egmore", lat: 13.0732, lng: 80.2609, nearby: ["Kilpauk", "Royapettah", "Nungambakkam"] },
  { name: "Royapettah", lat: 13.0540, lng: 80.2650, nearby: ["Mylapore", "Egmore", "T. Nagar"] },
  { name: "Pallavaram", lat: 12.9675, lng: 80.1505, nearby: ["Chromepet", "Tambaram", "Guindy"] },
];

function getAreaInfo(name: string) {
  return chennaiAreas.find((a) => a.name === name) ?? chennaiAreas[0];
}

const seedDrivers: Driver[] = [
  {
    id: "d1", name: "Murugan Selvam", homeLocality: "T. Nagar", vehicleType: "bike", status: "active",
    currentRoute: "T. Nagar Area", dropsCompleted: 9, dropsTotal: 14, fuelConsumption: 2.1,
    phone: "+91 98765 43210", avatar: "MS", rating: 4.6, shiftStart: "08:00 AM", shiftEnd: "05:00 PM",
    hoursWorkedToday: 5.2, maxHoursPerDay: 9, vehicleCapacityKg: 15, currentLoadKg: 6,
    deliveryPoints: [
      { id: "dp-d1-1", address: "12, G.N. Chetty Road, T. Nagar", lat: 13.0418, lng: 80.2341, status: "completed", estimatedTime: "09:00 AM", actualTime: "08:55 AM", deliveryWindow: "08:30 AM - 09:30 AM" },
      { id: "dp-d1-2", address: "45, Burkit Road, T. Nagar", lat: 13.0390, lng: 80.2300, status: "completed", estimatedTime: "09:30 AM", actualTime: "09:40 AM", deliveryWindow: "09:00 AM - 10:00 AM" },
      { id: "dp-d1-3", address: "7, North Usman Road, T. Nagar", lat: 13.0450, lng: 80.2320, status: "completed", estimatedTime: "10:00 AM", actualTime: "10:05 AM", deliveryWindow: "09:30 AM - 10:30 AM" },
      { id: "dp-d1-4", address: "22, Pondy Bazaar, T. Nagar", lat: 13.0400, lng: 80.2360, status: "pending", estimatedTime: "10:45 AM", deliveryWindow: "10:00 AM - 11:00 AM" },
      { id: "dp-d1-5", address: "88, Thyagaraya Road, T. Nagar", lat: 13.0430, lng: 80.2310, status: "pending", estimatedTime: "11:15 AM", deliveryWindow: "10:30 AM - 11:30 AM" },
    ],
  },
  {
    id: "d2", name: "Kavitha Lakshmi", homeLocality: "Anna Nagar", vehicleType: "van", status: "active",
    currentRoute: "Anna Nagar Area", dropsCompleted: 12, dropsTotal: 16, fuelConsumption: 8.4,
    phone: "+91 98765 43211", avatar: "KL", rating: 4.8, shiftStart: "07:30 AM", shiftEnd: "04:30 PM",
    hoursWorkedToday: 7.5, maxHoursPerDay: 9, vehicleCapacityKg: 500, currentLoadKg: 180,
    deliveryPoints: [
      { id: "dp-d2-1", address: "Shanthi Colony, 2nd Ave, Anna Nagar", lat: 13.0850, lng: 80.2101, status: "completed", estimatedTime: "08:30 AM", actualTime: "08:25 AM", deliveryWindow: "08:00 AM - 09:00 AM" },
      { id: "dp-d2-2", address: "Blue Star Bldg, 3rd Ave, Anna Nagar", lat: 13.0880, lng: 80.2120, status: "completed", estimatedTime: "09:15 AM", actualTime: "09:20 AM", deliveryWindow: "09:00 AM - 10:00 AM" },
      { id: "dp-d2-3", address: "Tower Park, Anna Nagar", lat: 13.0860, lng: 80.2090, status: "delayed", estimatedTime: "10:00 AM", actualTime: "10:35 AM", deliveryWindow: "09:30 AM - 10:30 AM" },
      { id: "dp-d2-4", address: "Roundtana, Anna Nagar", lat: 13.0840, lng: 80.2140, status: "pending", estimatedTime: "11:00 AM", deliveryWindow: "10:30 AM - 11:30 AM" },
    ],
  },
  {
    id: "d3", name: "Senthil Kumaran", homeLocality: "Adyar", vehicleType: "bike", status: "idle",
    currentRoute: "Adyar Area", dropsCompleted: 14, dropsTotal: 14, fuelConsumption: 1.8,
    phone: "+91 98765 43212", avatar: "SK", rating: 4.3, shiftStart: "06:00 AM", shiftEnd: "03:00 PM",
    hoursWorkedToday: 8.5, maxHoursPerDay: 9, vehicleCapacityKg: 15, currentLoadKg: 0,
    deliveryPoints: [],
  },
  {
    id: "d4", name: "Meenakshi Sundaram", homeLocality: "Velachery", vehicleType: "van", status: "active",
    currentRoute: "Velachery Area", dropsCompleted: 6, dropsTotal: 12, fuelConsumption: 9.2,
    phone: "+91 98765 43213", avatar: "MD", rating: 4.1, shiftStart: "08:00 AM", shiftEnd: "05:00 PM",
    hoursWorkedToday: 4.8, maxHoursPerDay: 9, vehicleCapacityKg: 500, currentLoadKg: 220,
    deliveryPoints: [
      { id: "dp-d4-1", address: "Phoenix Mall, Velachery", lat: 12.9816, lng: 80.2185, status: "completed", estimatedTime: "09:00 AM", actualTime: "09:10 AM", deliveryWindow: "08:30 AM - 09:30 AM" },
      { id: "dp-d4-2", address: "100 Ft Road, Velachery", lat: 12.9830, lng: 80.2200, status: "completed", estimatedTime: "09:45 AM", actualTime: "09:50 AM", deliveryWindow: "09:30 AM - 10:30 AM" },
      { id: "dp-d4-3", address: "Taramani Link Road, Velachery", lat: 12.9850, lng: 80.2220, status: "pending", estimatedTime: "10:30 AM", deliveryWindow: "10:00 AM - 11:00 AM" },
      { id: "dp-d4-4", address: "Vijaya Nagar, Velachery", lat: 12.9800, lng: 80.2170, status: "pending", estimatedTime: "11:15 AM", deliveryWindow: "11:00 AM - 12:00 PM" },
      { id: "dp-d4-5", address: "Bypass Road, Velachery", lat: 12.9780, lng: 80.2150, status: "delayed", estimatedTime: "12:00 PM", deliveryWindow: "11:30 AM - 12:30 PM" },
      { id: "dp-d4-6", address: "MRTS Station, Velachery", lat: 12.9790, lng: 80.2210, status: "pending", estimatedTime: "12:45 PM", deliveryWindow: "12:00 PM - 01:00 PM" },
    ],
  },
  {
    id: "d5", name: "Karthikeyan Rajan", homeLocality: "Mylapore", vehicleType: "bike", status: "offline",
    currentRoute: "\u2014", dropsCompleted: 0, dropsTotal: 0, fuelConsumption: 0,
    phone: "+91 98765 43214", avatar: "KR", rating: 3.9, shiftStart: "\u2014", shiftEnd: "\u2014",
    hoursWorkedToday: 0, maxHoursPerDay: 9, vehicleCapacityKg: 15, currentLoadKg: 0,
    deliveryPoints: [],
  },
  {
    id: "d6", name: "Tamilselvi Nadar", homeLocality: "Tambaram", vehicleType: "van", status: "active",
    currentRoute: "Tambaram Area", dropsCompleted: 10, dropsTotal: 18, fuelConsumption: 11.3,
    phone: "+91 98765 43215", avatar: "TN", rating: 4.5, shiftStart: "07:00 AM", shiftEnd: "04:00 PM",
    hoursWorkedToday: 6.3, maxHoursPerDay: 9, vehicleCapacityKg: 500, currentLoadKg: 150,
    deliveryPoints: [
      { id: "dp-d6-1", address: "East Tambaram Station Road", lat: 12.9249, lng: 80.1000, status: "completed", estimatedTime: "08:00 AM", actualTime: "07:55 AM", deliveryWindow: "07:30 AM - 08:30 AM" },
      { id: "dp-d6-2", address: "Selaiyur Main Road, Tambaram", lat: 12.9200, lng: 80.1050, status: "completed", estimatedTime: "08:45 AM", actualTime: "08:50 AM", deliveryWindow: "08:30 AM - 09:30 AM" },
      { id: "dp-d6-3", address: "GST Road, Near Tambaram", lat: 12.9280, lng: 80.0980, status: "pending", estimatedTime: "10:15 AM", deliveryWindow: "10:00 AM - 11:00 AM" },
      { id: "dp-d6-4", address: "Mudichur Road, Tambaram", lat: 12.9220, lng: 80.0960, status: "pending", estimatedTime: "11:00 AM", deliveryWindow: "10:30 AM - 11:30 AM" },
      { id: "dp-d6-5", address: "Perungalathur, Near Tambaram", lat: 12.9150, lng: 80.0940, status: "delayed", estimatedTime: "11:45 AM", deliveryWindow: "11:00 AM - 12:00 PM" },
    ],
  },
  {
    id: "d7", name: "Raghavan Pillai", homeLocality: "Guindy", vehicleType: "bike", status: "active",
    currentRoute: "Guindy Area", dropsCompleted: 7, dropsTotal: 11, fuelConsumption: 1.9,
    phone: "+91 98765 43216", avatar: "RP", rating: 4.7, shiftStart: "08:30 AM", shiftEnd: "05:30 PM",
    hoursWorkedToday: 4.0, maxHoursPerDay: 9, vehicleCapacityKg: 15, currentLoadKg: 5,
    deliveryPoints: [
      { id: "dp-d7-1", address: "SIDCO Industrial Estate, Guindy", lat: 13.0067, lng: 80.2206, status: "completed", estimatedTime: "09:00 AM", actualTime: "08:58 AM", deliveryWindow: "08:30 AM - 09:30 AM" },
      { id: "dp-d7-2", address: "Kathipara Junction, Guindy", lat: 13.0080, lng: 80.2180, status: "pending", estimatedTime: "10:30 AM", deliveryWindow: "10:00 AM - 11:00 AM" },
      { id: "dp-d7-3", address: "Raj Bhavan, Guindy", lat: 13.0050, lng: 80.2230, status: "pending", estimatedTime: "11:15 AM", deliveryWindow: "11:00 AM - 12:00 PM" },
      { id: "dp-d7-4", address: "Alandur Metro, Near Guindy", lat: 13.0030, lng: 80.2160, status: "pending", estimatedTime: "12:00 PM", deliveryWindow: "11:30 AM - 12:30 PM" },
    ],
  },
  {
    id: "d8", name: "Priya Dharshini", homeLocality: "Porur", vehicleType: "van", status: "active",
    currentRoute: "Porur Area", dropsCompleted: 5, dropsTotal: 13, fuelConsumption: 7.6,
    phone: "+91 98765 43217", avatar: "PD", rating: 4.4, shiftStart: "07:30 AM", shiftEnd: "04:30 PM",
    hoursWorkedToday: 5.8, maxHoursPerDay: 9, vehicleCapacityKg: 500, currentLoadKg: 200,
    deliveryPoints: [
      { id: "dp-d8-1", address: "Porur Junction, Porur", lat: 13.0382, lng: 80.1564, status: "completed", estimatedTime: "08:30 AM", actualTime: "08:35 AM", deliveryWindow: "08:00 AM - 09:00 AM" },
      { id: "dp-d8-2", address: "Arcot Road, Near Porur", lat: 13.0400, lng: 80.1540, status: "pending", estimatedTime: "10:00 AM", deliveryWindow: "09:30 AM - 10:30 AM" },
      { id: "dp-d8-3", address: "Mount Poonamallee Road, Porur", lat: 13.0360, lng: 80.1580, status: "pending", estimatedTime: "10:45 AM", deliveryWindow: "10:30 AM - 11:30 AM" },
      { id: "dp-d8-4", address: "Ramapuram Main Road", lat: 13.0340, lng: 80.1600, status: "delayed", estimatedTime: "11:30 AM", deliveryWindow: "11:00 AM - 12:00 PM" },
      { id: "dp-d8-5", address: "Valasaravakkam, Near Porur", lat: 13.0420, lng: 80.1520, status: "pending", estimatedTime: "12:15 PM", deliveryWindow: "12:00 PM - 01:00 PM" },
    ],
  },
  {
    id: "d9", name: "Balasubramanian K", homeLocality: "Perambur", vehicleType: "bike", status: "active",
    currentRoute: "Perambur Area", dropsCompleted: 11, dropsTotal: 15, fuelConsumption: 2.3,
    phone: "+91 98765 43218", avatar: "BK", rating: 4.2, shiftStart: "07:00 AM", shiftEnd: "04:00 PM",
    hoursWorkedToday: 6.5, maxHoursPerDay: 9, vehicleCapacityKg: 15, currentLoadKg: 4,
    deliveryPoints: [
      { id: "dp-d9-1", address: "Perambur Barracks Road", lat: 13.1187, lng: 80.2332, status: "completed", estimatedTime: "08:15 AM", actualTime: "08:10 AM", deliveryWindow: "08:00 AM - 09:00 AM" },
      { id: "dp-d9-2", address: "Kolathur Main Road", lat: 13.1200, lng: 80.2300, status: "pending", estimatedTime: "10:30 AM", deliveryWindow: "10:00 AM - 11:00 AM" },
      { id: "dp-d9-3", address: "Vyasarpadi, Near Perambur", lat: 13.1150, lng: 80.2370, status: "pending", estimatedTime: "11:15 AM", deliveryWindow: "11:00 AM - 12:00 PM" },
    ],
  },
  {
    id: "d10", name: "Lakshmi Priya", homeLocality: "Thiruvanmiyur", vehicleType: "van", status: "idle",
    currentRoute: "Thiruvanmiyur Area", dropsCompleted: 10, dropsTotal: 10, fuelConsumption: 6.8,
    phone: "+91 98765 43219", avatar: "LP", rating: 4.9, shiftStart: "06:30 AM", shiftEnd: "03:30 PM",
    hoursWorkedToday: 8.0, maxHoursPerDay: 9, vehicleCapacityKg: 500, currentLoadKg: 0,
    deliveryPoints: [],
  },
  {
    id: "d11", name: "Arjun Natarajan", homeLocality: "Chromepet", vehicleType: "bike", status: "active",
    currentRoute: "Chromepet Area", dropsCompleted: 3, dropsTotal: 12, fuelConsumption: 2.0,
    phone: "+91 98765 43220", avatar: "AN", rating: 3.8, shiftStart: "08:00 AM", shiftEnd: "05:00 PM",
    hoursWorkedToday: 3.5, maxHoursPerDay: 9, vehicleCapacityKg: 15, currentLoadKg: 7,
    deliveryPoints: [
      { id: "dp-d11-1", address: "GST Road, Chromepet", lat: 12.9516, lng: 80.1462, status: "completed", estimatedTime: "09:00 AM", actualTime: "09:05 AM", deliveryWindow: "08:30 AM - 09:30 AM" },
      { id: "dp-d11-2", address: "New Colony, Chromepet", lat: 12.9530, lng: 80.1440, status: "pending", estimatedTime: "10:00 AM", deliveryWindow: "09:30 AM - 10:30 AM" },
      { id: "dp-d11-3", address: "Radha Nagar, Chromepet", lat: 12.9500, lng: 80.1480, status: "pending", estimatedTime: "10:45 AM", deliveryWindow: "10:30 AM - 11:30 AM" },
      { id: "dp-d11-4", address: "Hastinapuram, Near Chromepet", lat: 12.9480, lng: 80.1500, status: "delayed", estimatedTime: "11:30 AM", deliveryWindow: "11:00 AM - 12:00 PM" },
      { id: "dp-d11-5", address: "Pallavaram Link Road", lat: 12.9550, lng: 80.1420, status: "pending", estimatedTime: "12:15 PM", deliveryWindow: "12:00 PM - 01:00 PM" },
    ],
  },
  {
    id: "d12", name: "Deepa Venkatesh", homeLocality: "Kilpauk", vehicleType: "van", status: "active",
    currentRoute: "Kilpauk Area", dropsCompleted: 8, dropsTotal: 14, fuelConsumption: 8.1,
    phone: "+91 98765 43221", avatar: "DV", rating: 4.5, shiftStart: "07:00 AM", shiftEnd: "04:00 PM",
    hoursWorkedToday: 6.0, maxHoursPerDay: 9, vehicleCapacityKg: 500, currentLoadKg: 170,
    deliveryPoints: [
      { id: "dp-d12-1", address: "Kilpauk Garden Road", lat: 13.0842, lng: 80.2428, status: "completed", estimatedTime: "08:00 AM", actualTime: "07:58 AM", deliveryWindow: "07:30 AM - 08:30 AM" },
      { id: "dp-d12-2", address: "Pulla Ave, Kilpauk", lat: 13.0860, lng: 80.2410, status: "completed", estimatedTime: "08:45 AM", actualTime: "08:50 AM", deliveryWindow: "08:30 AM - 09:30 AM" },
      { id: "dp-d12-3", address: "EVR Periyar Road, Kilpauk", lat: 13.0830, lng: 80.2450, status: "pending", estimatedTime: "10:15 AM", deliveryWindow: "10:00 AM - 11:00 AM" },
      { id: "dp-d12-4", address: "Amanjikarai, Near Kilpauk", lat: 13.0820, lng: 80.2400, status: "pending", estimatedTime: "11:00 AM", deliveryWindow: "10:30 AM - 11:30 AM" },
    ],
  },
];

const seedFleet: FleetVehicle[] = [
  { id: "v1", type: "bike", licensePlate: "TN-01-AB-1234", driverId: "d1", driverName: "Murugan Selvam", status: "en-route", location: { lat: 13.0418, lng: 80.2341 }, fuelLevel: 72, currentArea: "T. Nagar" },
  { id: "v2", type: "van", licensePlate: "TN-01-CD-5678", driverId: "d2", driverName: "Kavitha Lakshmi", status: "en-route", location: { lat: 13.0850, lng: 80.2101 }, fuelLevel: 45, currentArea: "Anna Nagar" },
  { id: "v3", type: "bike", licensePlate: "TN-01-EF-9012", driverId: "d3", driverName: "Senthil Kumaran", status: "idle", location: { lat: 13.0012, lng: 80.2565 }, fuelLevel: 88, currentArea: "Adyar" },
  { id: "v4", type: "van", licensePlate: "TN-01-GH-3456", driverId: "d4", driverName: "Meenakshi Sundaram", status: "en-route", location: { lat: 12.9816, lng: 80.2185 }, fuelLevel: 31, currentArea: "Velachery" },
  { id: "v5", type: "bike", licensePlate: "TN-01-IJ-7890", driverId: "d5", driverName: "Karthikeyan Rajan", status: "maintenance", location: { lat: 13.0368, lng: 80.2676 }, fuelLevel: 100, currentArea: "Mylapore" },
  { id: "v6", type: "van", licensePlate: "TN-01-KL-2345", driverId: "d6", driverName: "Tamilselvi Nadar", status: "en-route", location: { lat: 12.9249, lng: 80.1000 }, fuelLevel: 56, currentArea: "Tambaram" },
  { id: "v7", type: "bike", licensePlate: "TN-01-MN-6789", driverId: "d7", driverName: "Raghavan Pillai", status: "en-route", location: { lat: 13.0067, lng: 80.2206 }, fuelLevel: 64, currentArea: "Guindy" },
  { id: "v8", type: "van", licensePlate: "TN-01-OP-1122", driverId: "d8", driverName: "Priya Dharshini", status: "en-route", location: { lat: 13.0382, lng: 80.1564 }, fuelLevel: 52, currentArea: "Porur" },
  { id: "v9", type: "bike", licensePlate: "TN-01-QR-3344", driverId: "d9", driverName: "Balasubramanian K", status: "en-route", location: { lat: 13.1187, lng: 80.2332 }, fuelLevel: 78, currentArea: "Perambur" },
  { id: "v10", type: "van", licensePlate: "TN-01-ST-5566", driverId: "d10", driverName: "Lakshmi Priya", status: "idle", location: { lat: 12.9830, lng: 80.2594 }, fuelLevel: 41, currentArea: "Thiruvanmiyur" },
  { id: "v11", type: "bike", licensePlate: "TN-01-UV-7788", driverId: "d11", driverName: "Arjun Natarajan", status: "en-route", location: { lat: 12.9516, lng: 80.1462 }, fuelLevel: 83, currentArea: "Chromepet" },
  { id: "v12", type: "van", licensePlate: "TN-01-WX-9900", driverId: "d12", driverName: "Deepa Venkatesh", status: "en-route", location: { lat: 13.0842, lng: 80.2428 }, fuelLevel: 59, currentArea: "Kilpauk" },
];

const seedNotifications: Notification[] = [
  { id: "n1", type: "late-delivery", severity: "high", driverName: "Meenakshi Sundaram", message: "Delivery #4892 delayed by 22 minutes at Velachery drop point", timestamp: "2 min ago", acknowledged: false },
  { id: "n2", type: "overtime-alert", severity: "high", driverName: "Kavitha Lakshmi", message: "Exceeded 9-hour shift limit. Currently at 9h 34m", timestamp: "8 min ago", acknowledged: false },
  { id: "n3", type: "route-deviation", severity: "medium", driverName: "Murugan Selvam", message: "Deviated 1.2 km from planned route near Mount Road", timestamp: "15 min ago", acknowledged: false },
  { id: "n4", type: "vehicle-issue", severity: "low", driverName: "Karthikeyan Rajan", message: "Bike TN-01-IJ-7890 scheduled for maintenance today", timestamp: "1 hr ago", acknowledged: true },
  { id: "n5", type: "late-delivery", severity: "medium", driverName: "Tamilselvi Nadar", message: "Delivery #4901 at risk \u2014 traffic congestion on GST Road", timestamp: "1 hr ago", acknowledged: true },
];

const autoNotificationTemplates: { type: Notification["type"]; severity: Notification["severity"]; messages: string[] }[] = [
  { type: "late-delivery", severity: "high", messages: ["Delivery #{id} delayed by {min} minutes at {area} drop point", "Delivery #{id} missed time window \u2014 customer waiting at {area}", "Delivery #{id} running {min} minutes behind schedule near {area}"] },
  { type: "overtime-alert", severity: "high", messages: ["Approaching 10-hour shift limit. Currently at 9h {min}m", "Exceeded 9-hour shift limit. Currently at 9h {min}m", "Shift overtime warning \u2014 {min} minutes past scheduled end"] },
  { type: "route-deviation", severity: "medium", messages: ["Deviated {km} km from planned route near {road}", "Unplanned stop detected for {min} minutes near {road}", "Took alternate path \u2014 {km} km longer than optimal near {road}"] },
  { type: "vehicle-issue", severity: "low", messages: ["Fuel level below 15% \u2014 refueling recommended", "Tyre pressure warning triggered on vehicle", "Engine temperature above normal \u2014 monitoring required"] },
];

const autoAreas = ["Porur", "Guindy", "Chromepet", "Perambur", "Thiruvanmiyur", "Ambattur", "Sholinganallur", "Kilpauk", "T. Nagar", "Velachery", "Adyar", "Mylapore"];
const autoRoads = ["Mount Road", "GST Road", "Anna Salai", "OMR", "ECR", "Inner Ring Road", "Poonamallee High Road", "Cathedral Road"];
const autoDriverNames = ["Murugan Selvam", "Kavitha Lakshmi", "Senthil Kumaran", "Meenakshi Sundaram", "Karthikeyan Rajan", "Tamilselvi Nadar", "Raghavan Pillai", "Priya Dharshini", "Balasubramanian K", "Lakshmi Priya", "Arjun Natarajan", "Deepa Venkatesh"];

function generateNotification(counter: number): Notification {
  const template = autoNotificationTemplates[Math.floor(Math.random() * autoNotificationTemplates.length)];
  const msgTemplate = template.messages[Math.floor(Math.random() * template.messages.length)];
  const driverName = autoDriverNames[Math.floor(Math.random() * autoDriverNames.length)];
  const area = autoAreas[Math.floor(Math.random() * autoAreas.length)];
  const road = autoRoads[Math.floor(Math.random() * autoRoads.length)];
  const id = 5000 + counter;
  const min = Math.floor(Math.random() * 40) + 5;
  const km = (Math.random() * 2 + 0.5).toFixed(1);

  const message = msgTemplate
    .replace("{id}", String(id))
    .replace("{min}", String(min))
    .replace("{area}", area)
    .replace("{road}", road)
    .replace("{km}", km);

  return {
    id: `n-auto-${counter}`,
    type: template.type,
    severity: template.severity,
    driverName,
    message,
    timestamp: "Just now",
    acknowledged: false,
  };
}

const seedLeaveRequests: LeaveRequest[] = [
  { id: "lr-1", driverId: "d1", driverName: "Murugan Selvam", avatar: "MS", leaveType: "sick", startDate: "Feb 20, 2026", endDate: "Feb 21, 2026", reason: "Fever and body ache, need 2 days rest as per doctor advice", submittedAt: "Feb 18, 2026 08:30 AM", status: "pending" },
  { id: "lr-2", driverId: "d5", driverName: "Arun Prasad", avatar: "AP", leaveType: "casual", startDate: "Feb 22, 2026", endDate: "Feb 22, 2026", reason: "Family function at native place in Madurai", submittedAt: "Feb 17, 2026 06:45 PM", status: "pending" },
  { id: "lr-3", driverId: "d8", driverName: "Tamilselvi Nadar", avatar: "TN", leaveType: "emergency", startDate: "Feb 19, 2026", endDate: "Feb 19, 2026", reason: "Mother admitted to hospital in Tambaram, need to attend urgently", submittedAt: "Feb 18, 2026 07:15 AM", status: "pending" },
  { id: "lr-4", driverId: "d3", driverName: "Senthil Kumaran", avatar: "SK", leaveType: "personal", startDate: "Feb 25, 2026", endDate: "Feb 26, 2026", reason: "House registration work at sub-registrar office in Chromepet", submittedAt: "Feb 16, 2026 04:00 PM", status: "pending" },
  { id: "lr-5", driverId: "d10", driverName: "Deepa Venkatesh", avatar: "DV", leaveType: "sick", startDate: "Feb 19, 2026", endDate: "Feb 20, 2026", reason: "Dengue fever symptoms, doctor advised complete bed rest for 2 days", submittedAt: "Feb 18, 2026 09:00 AM", status: "pending" },
];

const seedOvertimeRequests: OvertimeRequest[] = [
  { id: "ot-1", driverId: "d2", driverName: "Kavitha Lakshmi", avatar: "KL", date: "Feb 18, 2026", scheduledEnd: "06:00 PM", requestedEnd: "09:00 PM", extraHours: 3, reason: "Delayed shipment from warehouse, 8 pending deliveries in Anna Nagar area need completion today", submittedAt: "Feb 18, 2026 04:30 PM", status: "pending" },
  { id: "ot-2", driverId: "d6", driverName: "Karthikeyan Rajan", avatar: "KR", date: "Feb 18, 2026", scheduledEnd: "05:00 PM", requestedEnd: "07:30 PM", extraHours: 2.5, reason: "Vehicle breakdown earlier today caused 2.5 hour delay, need extra time to complete remaining 5 drops", submittedAt: "Feb 18, 2026 03:15 PM", status: "pending" },
  { id: "ot-3", driverId: "d9", driverName: "Raghavan Pillai", avatar: "RP", date: "Feb 18, 2026", scheduledEnd: "06:00 PM", requestedEnd: "08:00 PM", extraHours: 2, reason: "Urgent medical supply delivery to 3 clinics in Guindy, cannot be postponed to tomorrow", submittedAt: "Feb 18, 2026 05:00 PM", status: "pending" },
  { id: "ot-4", driverId: "d7", driverName: "Priya Dharshini", avatar: "PD", date: "Feb 17, 2026", scheduledEnd: "05:30 PM", requestedEnd: "07:00 PM", extraHours: 1.5, reason: "Heavy traffic on OMR road delayed all afternoon deliveries by 90 minutes", submittedAt: "Feb 17, 2026 04:00 PM", status: "pending" },
];

const seedFuelBills: FuelBill[] = [
  { id: "fb-1", driverId: "d1", driverName: "Murugan Selvam", avatar: "MS", vehiclePlate: "TN-01-AB-1234", fuelType: "petrol", litres: 11.73, amountRs: 951, stationName: "Indian Oil, City Fuel Center, Noida", date: "Feb 18, 2026", receiptImageUrl: "/images/receipts/receipt-1.png", submittedAt: "Feb 18, 2026 09:15 AM", status: "pending" },
  { id: "fb-2", driverId: "d2", driverName: "Kavitha Lakshmi", avatar: "KL", vehiclePlate: "TN-01-CD-5678", fuelType: "petrol", litres: 38.23, amountRs: 3623, stationName: "Chauhan Traders, G.T. Road Uchani", date: "Feb 18, 2026", receiptImageUrl: "/images/receipts/receipt-2.png", submittedAt: "Feb 18, 2026 08:45 AM", status: "pending" },
  { id: "fb-3", driverId: "d5", driverName: "Arun Prasad", avatar: "AP", vehiclePlate: "TN-01-CB-2204", fuelType: "petrol", litres: 1.0, amountRs: 200, stationName: "Indian Oil, Radial Road, Pallavaram", date: "Feb 17, 2026", receiptImageUrl: "/images/receipts/receipt-3.png", submittedAt: "Feb 17, 2026 05:30 PM", status: "pending" },
  { id: "fb-4", driverId: "d9", driverName: "Raghavan Pillai", avatar: "RP", vehiclePlate: "TN-01-AN-3367", fuelType: "diesel", litres: 1.5, amountRs: 316, stationName: "Indian Oil, Valluvar Kottam High Road, Chennai", date: "Feb 18, 2026", receiptImageUrl: "/images/receipts/receipt-4.png", submittedAt: "Feb 18, 2026 10:00 AM", status: "pending" },
  { id: "fb-5", driverId: "d8", driverName: "Tamilselvi Nadar", avatar: "TN", vehiclePlate: "TN-01-KL-2345", fuelType: "petrol", litres: 11.73, amountRs: 951, stationName: "Indian Oil, City Fuel Center", date: "Feb 17, 2026", receiptImageUrl: "/images/receipts/receipt-1.png", submittedAt: "Feb 17, 2026 06:00 PM", status: "pending" },
  { id: "fb-6", driverId: "d7", driverName: "Priya Dharshini", avatar: "PD", vehiclePlate: "TN-01-OP-1122", fuelType: "petrol", litres: 38.23, amountRs: 3623, stationName: "Chauhan Traders, G.T. Road", date: "Feb 16, 2026", receiptImageUrl: "/images/receipts/receipt-2.png", submittedAt: "Feb 16, 2026 07:00 PM", status: "pending" },
];

const seedPodApprovals: PODApproval[] = [
  { id: "pod-1", driverId: "d1", driverName: "Murugan Selvam", avatar: "MS", orderId: "ORD-2026-4501", customerName: "Lakshmi Narayanan", deliveryAddress: "12, G.N. Chetty Road, T. Nagar", photoUrl: "/images/pod/delivery-1.png", deliveredAt: "Feb 18, 2026 09:00 AM", submittedAt: "Feb 18, 2026 09:02 AM", status: "pending" },
  { id: "pod-2", driverId: "d2", driverName: "Kavitha Lakshmi", avatar: "KL", orderId: "ORD-2026-4502", customerName: "Ramesh Babu", deliveryAddress: "78, 2nd Avenue, Anna Nagar", photoUrl: "/images/pod/delivery-2.png", deliveredAt: "Feb 18, 2026 08:30 AM", submittedAt: "Feb 18, 2026 08:32 AM", status: "pending" },
  { id: "pod-3", driverId: "d5", driverName: "Arun Prasad", avatar: "AP", orderId: "ORD-2026-4503", customerName: "Selvi Murugan", deliveryAddress: "34, Gandhi Road, Velachery", photoUrl: "/images/pod/delivery-1.png", deliveredAt: "Feb 17, 2026 04:15 PM", submittedAt: "Feb 17, 2026 04:17 PM", status: "pending" },
  { id: "pod-4", driverId: "d9", driverName: "Raghavan Pillai", avatar: "RP", orderId: "ORD-2026-4504", customerName: "Anand Kumar", deliveryAddress: "56, SIDCO Industrial Estate, Guindy", photoUrl: "/images/pod/delivery-2.png", deliveredAt: "Feb 18, 2026 10:30 AM", submittedAt: "Feb 18, 2026 10:32 AM", status: "pending" },
  { id: "pod-5", driverId: "d3", driverName: "Senthil Kumaran", avatar: "SK", orderId: "ORD-2026-4505", customerName: "Priya Sundaram", deliveryAddress: "22, Besant Avenue, Adyar", photoUrl: "/images/pod/delivery-1.png", deliveredAt: "Feb 18, 2026 11:00 AM", submittedAt: "Feb 18, 2026 11:02 AM", status: "pending" },
  { id: "pod-6", driverId: "d8", driverName: "Tamilselvi Nadar", avatar: "TN", orderId: "ORD-2026-4506", customerName: "Vignesh Raman", deliveryAddress: "89, Railway Station Road, Tambaram", photoUrl: "/images/pod/delivery-2.png", deliveredAt: "Feb 17, 2026 03:45 PM", submittedAt: "Feb 17, 2026 03:47 PM", status: "pending" },
  { id: "pod-7", driverId: "d7", driverName: "Priya Dharshini", avatar: "PD", orderId: "ORD-2026-4507", customerName: "Ganesh Iyer", deliveryAddress: "15, Trunk Road, Porur", photoUrl: "/images/pod/delivery-1.png", deliveredAt: "Feb 18, 2026 09:45 AM", submittedAt: "Feb 18, 2026 09:47 AM", status: "pending" },
];

export class MemStorage implements IStorage {
  private kpis: KpiData;
  private drivers: Driver[];
  private fleet: FleetVehicle[];
  private notifications: Notification[];
  private leaveRequests: LeaveRequest[];
  private overtimeRequests: OvertimeRequest[];
  private fuelBills: FuelBill[];
  private podApprovals: PODApproval[];
  private autoCounter = 0;

  constructor() {
    this.kpis = { ...seedKpis };
    this.drivers = seedDrivers.map((d) => ({ ...d, deliveryPoints: d.deliveryPoints.map((p) => ({ ...p })) }));
    this.fleet = seedFleet.map((f) => ({ ...f, location: { ...f.location } }));
    this.notifications = seedNotifications.map((n) => ({ ...n }));
    this.leaveRequests = seedLeaveRequests.map((l) => ({ ...l }));
    this.overtimeRequests = seedOvertimeRequests.map((o) => ({ ...o }));
    this.fuelBills = seedFuelBills.map((f) => ({ ...f }));
    this.podApprovals = seedPodApprovals.map((p) => ({ ...p }));

    setTimeout(() => {
      this.autoCounter++;
      const notif = generateNotification(this.autoCounter);
      this.notifications.unshift(notif);
    }, 10 * 1000);

    setInterval(() => {
      this.autoCounter++;
      const notif = generateNotification(this.autoCounter);
      this.notifications.unshift(notif);
    }, 2 * 60 * 1000);
  }

  async getKpis(): Promise<KpiData> { return this.kpis; }
  async getDrivers(): Promise<Driver[]> { return this.drivers; }
  async getFleet(): Promise<FleetVehicle[]> { return this.fleet; }
  async getNotifications(): Promise<Notification[]> { return this.notifications; }

  async getMarkers(): Promise<MapMarker[]> {
    return this.fleet.map((v) => ({
      id: v.id, type: v.type, driverName: v.driverName,
      position: v.location, status: v.status,
    }));
  }

  async acknowledgeNotification(id: string): Promise<Notification | null> {
    const notification = this.notifications.find((n) => n.id === id);
    if (!notification) return null;
    notification.acknowledged = true;
    return notification;
  }

  async reassignDriver(driverId: string): Promise<{ driver: Driver; vehicle: FleetVehicle } | null> {
    const driver = this.drivers.find((d) => d.id === driverId);
    if (!driver) return null;
    const vehicle = this.fleet.find((v) => v.driverId === driverId);
    const homeArea = getAreaInfo(driver.homeLocality);
    const currentAreaName = driver.currentRoute.replace(" Area", "");
    const nearbyOptions = [driver.homeLocality, ...homeArea.nearby].filter((a) => a !== currentAreaName);
    const selectedName = nearbyOptions[Math.floor(Math.random() * nearbyOptions.length)];
    const selectedArea = getAreaInfo(selectedName);
    const drops = Math.floor(Math.random() * 8) + 8;
    driver.currentRoute = `${selectedArea.name} Area`;
    driver.dropsCompleted = 0;
    driver.dropsTotal = drops;
    driver.status = "active";
    if (vehicle) {
      vehicle.currentArea = selectedArea.name;
      vehicle.location = { lat: selectedArea.lat, lng: selectedArea.lng };
      vehicle.status = "en-route";
    }
    return { driver, vehicle: vehicle ?? this.fleet[0] };
  }

  async transferDeliveryPoint(
    fromDriverId: string, toDriverId: string, pointId: string, insertIndex: number
  ): Promise<{ fromDriver: Driver; toDriver: Driver } | null> {
    const fromDriver = this.drivers.find((d) => d.id === fromDriverId);
    const toDriver = this.drivers.find((d) => d.id === toDriverId);
    if (!fromDriver || !toDriver) return null;
    const pointIndex = fromDriver.deliveryPoints.findIndex((p) => p.id === pointId);
    if (pointIndex === -1) return null;
    const [point] = fromDriver.deliveryPoints.splice(pointIndex, 1);
    toDriver.deliveryPoints.splice(insertIndex, 0, point);
    fromDriver.dropsTotal = fromDriver.deliveryPoints.length;
    fromDriver.dropsCompleted = fromDriver.deliveryPoints.filter((p) => p.status === "completed").length;
    toDriver.dropsTotal = toDriver.deliveryPoints.length;
    toDriver.dropsCompleted = toDriver.deliveryPoints.filter((p) => p.status === "completed").length;
    return { fromDriver, toDriver };
  }

  async findUrgentDriverCandidates(input: UrgentOrderInput): Promise<DriverCandidate[]> {
    const AVG_SPEED_KMH_BIKE = 25;
    const AVG_SPEED_KMH_VAN = 20;
    const STOP_TIME_MIN = 8;

    const candidates: DriverCandidate[] = [];

    for (const driver of this.drivers) {
      if (driver.status === "offline") continue;

      const vehicle = this.fleet.find((v) => v.driverId === driver.id);
      if (!vehicle) continue;
      if (vehicle.status === "maintenance") continue;

      const remainingCapacity = driver.vehicleCapacityKg - driver.currentLoadKg;
      if (remainingCapacity < input.packageWeightKg) continue;

      const remainingHours = driver.maxHoursPerDay - driver.hoursWorkedToday;

      const distToWarehouse = haversineKm(vehicle.location.lat, vehicle.location.lng, input.warehouseLat, input.warehouseLng);
      const distWarehouseToDelivery = haversineKm(input.warehouseLat, input.warehouseLng, input.deliveryLat, input.deliveryLng);

      const avgSpeed = driver.vehicleType === "bike" ? AVG_SPEED_KMH_BIKE : AVG_SPEED_KMH_VAN;
      const pickupTimeMin = Math.round((distToWarehouse / avgSpeed) * 60);
      const deliveryTimeMin = Math.round((distWarehouseToDelivery / avgSpeed) * 60) + STOP_TIME_MIN;
      const totalTripHours = (pickupTimeMin + deliveryTimeMin) / 60;

      if (remainingHours < totalTripHours) continue;

      const pendingStops = driver.deliveryPoints.filter((p) => p.status !== "completed");
      const lastPendingStop = pendingStops[pendingStops.length - 1];
      const oldEta = lastPendingStop?.estimatedTime ?? "No pending stops";

      const addedMin = pickupTimeMin + deliveryTimeMin;
      let newEtaStr = oldEta;
      if (lastPendingStop) {
        const match = lastPendingStop.estimatedTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (match) {
          let h = parseInt(match[1]);
          const m = parseInt(match[2]);
          const ampm = match[3].toUpperCase();
          if (ampm === "PM" && h !== 12) h += 12;
          if (ampm === "AM" && h === 12) h = 0;
          const totalMin = h * 60 + m + addedMin;
          const newH = Math.floor(totalMin / 60) % 24;
          const newM = totalMin % 60;
          const newAmpm = newH >= 12 ? "PM" : "AM";
          const displayH = newH % 12 === 0 ? 12 : newH % 12;
          newEtaStr = `${String(displayH).padStart(2, "0")}:${String(newM).padStart(2, "0")} ${newAmpm}`;
        }
      } else {
        const totalMin = addedMin;
        const h = Math.floor(totalMin / 60);
        const m = totalMin % 60;
        newEtaStr = `+${h}h ${m}m from now`;
      }

      candidates.push({
        driverId: driver.id,
        driverName: driver.name,
        avatar: driver.avatar,
        vehicleType: driver.vehicleType,
        licensePlate: vehicle.licensePlate,
        distanceToWarehouseKm: Math.round(distToWarehouse * 10) / 10,
        remainingCapacityKg: remainingCapacity,
        remainingHours: Math.round(remainingHours * 10) / 10,
        currentStopsCount: pendingStops.length,
        rating: driver.rating,
        estimatedPickupMin: pickupTimeMin,
        estimatedDeliveryMin: deliveryTimeMin,
        oldEta,
        newEta: newEtaStr,
        currentArea: vehicle.currentArea,
        status: driver.status,
      });
    }

    candidates.sort((a, b) => a.distanceToWarehouseKm - b.distanceToWarehouseKm);
    return candidates.slice(0, 5);
  }

  async assignUrgentOrder(driverId: string, input: UrgentOrderInput): Promise<Driver | null> {
    const driver = this.drivers.find((d) => d.id === driverId);
    if (!driver) return null;

    const newPointId = `dp-${driverId}-urgent-${Date.now()}`;
    driver.deliveryPoints.push({
      id: newPointId,
      address: input.deliveryAddress,
      lat: input.deliveryLat,
      lng: input.deliveryLng,
      status: "pending",
      estimatedTime: input.requiredDeliveryTime,
      deliveryWindow: `URGENT - ${input.requiredDeliveryTime}`,
    });

    driver.dropsTotal = driver.deliveryPoints.length;
    driver.currentLoadKg += input.packageWeightKg;
    if (driver.status === "idle") driver.status = "active";

    const vehicle = this.fleet.find((v) => v.driverId === driverId);
    if (vehicle && vehicle.status === "idle") vehicle.status = "en-route";

    return driver;
  }

  async getLeaveRequests(): Promise<LeaveRequest[]> { return this.leaveRequests; }
  async updateLeaveStatus(id: string, status: "approved" | "rejected"): Promise<LeaveRequest | null> {
    const req = this.leaveRequests.find((r) => r.id === id);
    if (!req) return null;
    req.status = status;
    return req;
  }

  async getOvertimeRequests(): Promise<OvertimeRequest[]> { return this.overtimeRequests; }
  async updateOvertimeStatus(id: string, status: "approved" | "rejected"): Promise<OvertimeRequest | null> {
    const req = this.overtimeRequests.find((r) => r.id === id);
    if (!req) return null;
    req.status = status;
    return req;
  }

  async getFuelBills(): Promise<FuelBill[]> { return this.fuelBills; }
  async updateFuelBillStatus(id: string, status: "approved" | "rejected"): Promise<FuelBill | null> {
    const bill = this.fuelBills.find((b) => b.id === id);
    if (!bill) return null;
    bill.status = status;
    return bill;
  }

  async getPodApprovals(): Promise<PODApproval[]> { return this.podApprovals; }
  async updatePodStatus(id: string, status: "approved" | "rejected"): Promise<PODApproval | null> {
    const pod = this.podApprovals.find((p) => p.id === id);
    if (!pod) return null;
    pod.status = status;
    return pod;
  }
}

export const storage = new MemStorage();
