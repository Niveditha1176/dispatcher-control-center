
# UrbanRoute — Last-Mile Delivery Optimization Platform

## Overview
UrbanRoute is an intelligent last-mile delivery optimization platform designed for urban logistics operations in Chennai, India. The platform provides dispatchers with a real-time control center to monitor drivers, manage fleet operations, optimize delivery routes, and handle administrative approvals — all with full English and Tamil language support.

Last-mile delivery is the most complex and expensive part of logistics operations, and UrbanRoute aims to improve efficiency, reduce operational costs, and increase delivery success rates through intelligent dispatch management.

---

##  Core Ideology
Last-mile delivery accounts for 40% of total delivery costs and is the most complex segment of the supply chain. Urban challenges like heavy traffic, narrow streets, tight delivery windows, and manual route planning lead to failed deliveries, wasted fuel, and inefficient operations.

UrbanRoute solves this by providing:
- AI-driven route optimization considering distance, traffic, vehicle capacity, driver hours, and delivery windows
- Real-time fleet visibility with live GPS tracking on an interactive map
- Smart driver matching for urgent orders based on proximity, capacity, and availability
- Home-based driver allocation to reduce commute time and increase area familiarity
- Rule breach monitoring for overtime violations, route deviations, late deliveries, and vehicle issues

---

##  Key Features

### 1. Dispatcher Control Center (/dashboard)
The main operations dashboard used by dispatch managers.

Includes:
- KPI Bar — On-time rate, drops per route, total distance, fuel & CO₂ savings
- Fleet List — Vehicle status (en-route, idle, maintenance), driver assignments, operating areas
- Live Map — Interactive Leaflet map centered on Chennai with real-time vehicle markers
- Driver Sidebar — Driver profile, delivery progress, route information
- Notifications Drawer — Alerts for late deliveries, overtime, route deviations, and vehicle issues
- Route Re-assignment Modal — Drag-and-drop interface to reassign delivery stops between drivers

---

### 2. Urgent Order Insertion (/urgent-order)
Allows dispatchers to insert urgent delivery orders dynamically.

Driver Ranking Criteria:
- Distance to warehouse
- Remaining vehicle capacity
- Available working hours
- Current pending stops
- Driver rating

The system displays estimated pickup time, delivery ETA, and route impact before assignment.

---

### 3. Admin Approval Center (/admin-approvals)
Administrative panel for managing driver and operational approvals.

| Module | Description |
|-------|-------------|
| Leave Requests | Sick leave, casual leave, emergency leave |
| Overtime Requests | Extra working hours with threshold alerts |
| Fuel Bills | Receipt image verification |
| Proof of Delivery | Contactless delivery verification images |

---

### 4. Landing Page (/)
Platform introduction page with platform overview, statistics, and features.

### 5. Admin Login (/login)
Username: admin  
Passcode: 1029  

Session stored in browser sessionStorage.

---

##  Bilingual Support (English & Tamil)
UrbanRoute supports full Tamil localization including driver names, Chennai area names, addresses, leave reasons, vehicle types, UI labels, and notifications.

Language preference is saved using localStorage.

---

##  Data & Geography
The platform uses Chennai-specific operational data including T. Nagar, Anna Nagar, Adyar, Velachery, Tambaram, Guindy, Porur, Perambur, Chromepet, and Kilpauk.

System includes:
- 10 drivers with realistic profiles
- 5 warehouse hubs across Chennai
- GPS delivery locations
- Auto-generated operational notifications every 2 minutes

---

## Technology Stack

| Layer | Technology |
|------|------------|
| Frontend | React 18, TypeScript, Vite |
| Routing | Wouter |
| State Management | TanStack React Query v5 |
| UI Components | shadcn/ui + Radix UI + Tailwind CSS |
| Icons | Lucide React |
| Map | Leaflet (OpenStreetMap tiles) |
| Drag & Drop | @hello-pangea/dnd |
| Backend | Node.js, Express 5, TypeScript |
| Data | In-memory storage |
| i18n | Custom React Context |

---

##  Local Installation

Prerequisites:
- Node.js v20 or later
- npm

Setup:
git clone <repository-url>
npm install

Create .env file:
SESSION_SECRET=any-random-secret-string

Run:
npm run dev

Open:
http://localhost:5000

---

## Project Structure
client/src/
server/
shared/
public/images/

---

##  API Endpoints
GET /api/kpis  
GET /api/drivers  
GET /api/fleet  
GET /api/notifications  
POST /api/urgent-order/assign  
POST /api/approvals/:type/:id/:action  

---

## Future Enhancements
- Database integration
- Machine learning traffic prediction
- Mobile driver application
- Live GPS tracking
- Cloud deployment

---

## License
Academic and demonstration purposes.
