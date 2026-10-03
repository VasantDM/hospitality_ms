# Grand Vista Resort & Hotel PMS (Hospitality Management System)

An all-in-one, next-generation **Hospitality & Property Management System (PMS)** with an integrated **Restaurant & Bar Point of Sale (POS)** and **Public Guest Booking Portal**, built specifically for **Hotels, Luxury Resorts, and Dining Establishments**.

---

## 🌟 Core Features & Modules

### 1. 🏨 Front Office & Room Matrix
- **Visual Room Matrix:** Live grid of physical rooms and luxury villas filtered by resort wings (Beachfront, Hilltop Villas, Main Resort, Skyline Tower).
- **Express Check-In & Check-Out:** 1-click check-in allocating rooms and opening guest master folios; checkout automatically flags rooms as dirty for housekeeping.
- **Double-Booking Prevention:** Atomic date-range collision detection.

### 2. 🍽️ Restaurant & Dining POS (F&B)
- **Interactive Tables & Zones:** Main Dining Hall, Poolside Terrace, Rooftop Sunset Lounge, Sunset Bar.
- **Digital Menu & KOT:** Real-time Kitchen Order Tickets (KOT) workflow (*In-Kitchen → Preparing → Served → Paid*).
- **Automated Room Charge Routing:** Seamlessly route food & cocktail bills directly to the guest's Master Hotel Folio with zero manual reconciliation.

### 3. 🧹 Housekeeping & Facilities Maintenance
- **Cleanliness Queue:** Real-time status transitions (*Pending Cleaning → In-Progress → Clean → Supervisor Inspected*).
- **Maintenance Tickets:** Engineering dispatch for HVAC, plumbing, electrical, and audio-visual issues with emergency priority flags.

### 4. 💳 Master Folios, Invoicing & Tax Ledger
- **Consolidated Guest Ledger:** Automatically unifies Room Charges + F&B Dining + Spa/Activities + 12% Occupancy Tax - Advance Deposits.
- **Multiple Settlement Methods:** Credit/Debit Cards, UPI, Cash, Corporate Bank Wire.
- **Printable Tax Invoices:** Formatted itemized tax invoices with receipt verification.

### 5. 📊 Executive Analytics & Night Audit
- Real-time calculation of **Occupancy Rate (%)**, **ADR (Average Daily Rate)**, **RevPAR (Revenue per Available Room)**, and **7-Day Revenue Trend Breakdown**.

### 6. 🌐 Public Guest Booking Engine
- Direct customer-facing booking engine with suite showcase, date/guest selector, instant cost calculations, and celebration confirmation.

---

## 🚀 Getting Started

### Project Directory Structure
```
C:\hospitality_MS/
├── backend/                  # FastAPI Python backend
│   ├── app/
│   │   ├── core/             # Database & Security configs
│   │   ├── models/           # SQLAlchemy Data Models
│   │   ├── schemas/          # Pydantic Schemas
│   │   ├── routers/          # REST API Endpoints
│   │   ├── services/         # Database Seeder & Business Logic
│   │   ├── main.py           # FastAPI Entry Point
│   ├── run.py
│   ├── requirements.txt
├── frontend/                 # React + Vite + Tailwind/Modern CSS
│   ├── src/
│   │   ├── components/       # Navbar, Sidebar, Modals, StatCards
│   │   ├── context/          # Auth & Role Switcher Context
│   │   ├── pages/            # Dashboard, FrontDesk, POS, Billing, Housekeeping, GuestPortal
│   │   ├── services/         # Axios API Client
│   │   ├── index.css         # Luxury Resort Theme Design System
│   │   ├── App.jsx
│   ├── package.json
```

---

## 🏃 Running the Application

### 1. Start Backend (FastAPI)
```powershell
cd C:\hospitality_MS\backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- **API URL:** `http://127.0.0.1:8000`
- **Interactive Swagger Docs:** `http://127.0.0.1:8000/api/v1/docs`

### 2. Start Frontend (React + Vite)
```powershell
cd C:\hospitality_MS\frontend
npm run dev
```
- **Live Web App:** `http://127.0.0.1:5173`

---

## 👥 Demo User Roles (Instant Switcher in Sidebar)

| Role | Name | Email | Default Access |
|---|---|---|---|
| **General Manager / Admin** | Alexander Wright | `admin@grandvista.com` | Full Administrative & Financial Access |
| **Front Desk Supervisor** | Sarah Jenkins | `frontdesk@grandvista.com` | Front Desk Matrix, Bookings, Check-Ins/Outs |
| **F&B Captain** | Marco Rossi | `waiter@grandvista.com` | Restaurant POS, Table Orders, KOT |
| **Housekeeping Lead** | Elena Rodriguez | `housekeeping@grandvista.com` | Cleanliness Tasks & Maintenance Tickets |
