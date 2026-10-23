# Grand Vista Resort & Hotel PMS — Complete End-to-End User Flow & Operational Guide

---

## 📖 Executive Summary
The **Grand Vista Resort & Hotel PMS** is an enterprise hospitality platform connecting customer-facing bookings, front desk operations, food & beverage dining POS, housekeeping room turns, master guest folios, and executive night audit analytics.

This document outlines **how each user enters the system**, **the exact sequential process they follow**, **how data flows between departments**, and **how automatic system triggers work**.

---

## 👥 System Actors & Personas

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            HOSPITALITY ACTORS                               │
├──────────────────────┬──────────────────────────────────────────────────────┤
│ 1. Public Guest      │ Browses suites, books dates, pays deposits.          │
│ 2. Front Desk        │ Express check-in/out, room allocation, keycards.     │
│ 3. F&B Captain       │ Table seating, KOT kitchen tickets, room billing.    │
│ 4. Housekeeping Lead │ Room cleaning status, supervisor inspection, repairs.│
│ 5. Billing / Finance │ Consolidated folios, tax calculations, settlements.  │
│ 6. General Manager   │ Executive KPIs, ADR/RevPAR analytics, night audit.   │
└──────────────────────┴──────────────────────────────────────────────────────┘
```

---

## 🗺️ Master System Flowchart

```mermaid
flowchart TD
    %% Guest Booking
    A["🌐 1. Guest visits Public Portal"] --> B["Selects Dates & Suite Category"]
    B --> C["System checks atomic room availability"]
    C --> D["Guest confirms reservation"]
    D --> E[("Database: Reservation created (confirmed)\n+ Open Folio initialized with Room & Tax")]

    %% Front Desk Check-in
    E --> F["🏨 2. Guest arrives at Front Desk"]
    F --> G["Front Desk clicks 'Express Check-In'"]
    G --> H["Room status -> OCCUPIED\nClean status -> CLEAN\nActual Check-In timestamp recorded"]

    %% Stay activities
    H --> I["🍽️ 3. Guest dines at Restaurant POS"]
    I --> J["Waiter inputs Table Order (KOT)"]
    J --> K{"Payment Method?"}
    K -- "Cash / Card" --> L["Order marked PAID"]
    K -- "Charge to Room" --> M["Auto-routed to Guest's Master Folio\nAppended to Folio Items"]

    %% Housekeeping & Maintenance
    H --> N["🧹 4. Housekeeping & Maintenance during stay"]
    N --> O["Maintenance issue reported?"]
    O -- Yes (Emergency) --> P["Room status -> OUT OF ORDER\nMaintenance Ticket created"]
    O -- Resolved --> Q["Room restored to AVAILABLE"]

    %% Check-out
    H --> R["💳 5. Guest Check-Out at Front Desk"]
    M --> R
    R --> S["Billing: Review Master Folio\n(Room + Tax + Dining + Incidentals)"]
    S --> T["Settle Outstanding Balance (Card/UPI/Cash)"]
    T --> U["Folio status -> SETTLED\nReservation status -> CHECKED OUT"]
    U --> V["⚡ AUTOMATIC SYSTEM TRIGGER:\nRoom status -> AVAILABLE\nRoom clean status -> DIRTY\nHousekeeping Task AUTO-GENERATED"]
    
    %% Cleaning turn
    V --> W["🧹 6. Housekeeper picks up Dirty Room"]
    W --> X["Status: Pending -> In-Progress -> Clean"]
    X --> Y["Supervisor inspects room -> INSPECTED"]
    Y --> Z["✨ Room 100% Ready for next Guest Check-In"]

    %% Analytics
    U & T & L --> AA["📊 7. Executive Dashboard & Night Audit"]
    AA --> AB["Real-time Occupancy %, ADR, RevPAR updated"]
```

---

## 🔄 Detailed Phase-by-Phase Process Flows

---

### Phase 1: The Public Guest Journey (Booking & Reservation)

#### Flow Summary
A prospective traveler visits the website, discovers available luxury villas or suites, selects travel dates, reviews calculated taxes, and reserves their stay.

```mermaid
sequenceDiagram
    autonumber
    actor Guest as 🌐 Public Guest
    participant Portal as Guest Portal (UI)
    participant API as Reservations API
    participant DB as SQLite / PostgreSQL Database

    Guest->>Portal: Enters Check-In & Check-Out dates + Guest count
    Portal->>API: GET /api/v1/rooms/categories
    API->>DB: Query active categories & pricing
    DB-->>Portal: List of categories (Ocean Suite, Pool Villa, etc.)
    Guest->>Portal: Selects Suite & clicks 'Book This Suite'
    Guest->>Portal: Enters Personal Details (Name, Email, Phone, ID Proof)
    Portal->>API: POST /api/v1/reservations
    Note over API: Atomic check: Is room booked between Check-In & Check-Out?
    API->>DB: Save Guest record
    API->>DB: Save Reservation (Status: Confirmed, Code: GV-XXXXXX)
    API->>DB: Create Open Master Folio
    API->>DB: Post Room Charge + 12% Occupancy Tax items to Folio
    API-->>Portal: Booking Confirmation (Code & Total Estimated Cost)
    Portal-->>Guest: Confetti Celebration & Reservation Summary
```

#### Step-by-Step Breakdown:
1. **Portal Visit**: Guest lands on `http://localhost:5173/` and enters the **Guest Portal**.
2. **Date & Suite Search**:
   - Guest inputs Check-In Date and Check-Out Date.
   - The UI computes number of nights dynamically.
   - Shows live room cards with photos, square footage, bed configuration, and amenities.
3. **Collision Detection**:
   - The backend validates that `check_in_date < check_out_date`.
   - Checks `ReservationRoom` records to guarantee the room is not already allocated for those dates.
4. **Automated Folio Generation**:
   - Upon reservation confirmation, the system creates an initial **Master Folio** (`status='open'`).
   - Line items added automatically:
     - `Room Charge: #101 (Deluxe Ocean Suite) - 3 Night(s)`
     - `Resort Occupancy Tax & Service (12%)`
5. **Guest Output**: Guest receives a unique booking reference code (e.g. `GV-K83D2A`).

---

### Phase 2: Front Desk Operations (Check-In & Check-Out)

#### Flow Summary
The guest arrives at the resort. Front Desk locates the booking, verifies identification, allocates keycards, executes 1-click Express Check-In, and later manages Express Check-Out.

```mermaid
sequenceDiagram
    autonumber
    actor FD as 🚪 Front Desk Supervisor
    participant UI as Front Desk Matrix (UI)
    participant API as Reservations & Rooms API
    participant DB as Database

    FD->>UI: Views Room Matrix Grid (Filtered by Wing / Zone)
    Guest->>FD: Presents Booking Code or Name
    FD->>UI: Locates Reservation in Check-In Queue
    FD->>UI: Clicks 'Check-In Guest'
    UI->>API: POST /api/v1/reservations/{id}/check-in
    API->>DB: Reservation status -> 'checked_in'
    API->>DB: ReservationRoom actual_check_in -> now()
    API->>DB: Room status -> 'occupied', clean_status -> 'clean'
    API-->>UI: Updated Reservation & Room status
    UI-->>FD: Room turns Blue (Occupied) in Room Matrix

    Note over FD,UI: ... Guest Stays at Resort ...

    Guest->>FD: Requests Check-Out
    FD->>UI: Clicks 'Check-Out Guest'
    UI->>API: POST /api/v1/reservations/{id}/check-out
    API->>DB: Reservation status -> 'checked_out'
    API->>DB: ReservationRoom actual_check_out -> now()
    API->>DB: Room status -> 'available', clean_status -> 'dirty'
    API->>DB: Folio status -> 'settled'
    API->>DB: AUTO-CREATE Housekeeping Task (priority: 'high', type: 'post_checkout')
    API-->>UI: Check-Out Complete
    UI-->>FD: Room turns Yellow (Dirty) in Matrix, task dispatched to Housekeeping
```

#### Step-by-Step Breakdown:
1. **Front Desk Room Matrix**:
   - Live grid displays all rooms color-coded:
     - 🟢 **Available** (Clean & unreserved)
     - 🔵 **Occupied** (Guest in-house)
     - 🟣 **Reserved** (Confirmed booking awaiting arrival)
     - 🔴 **Out of Order** (Maintenance emergency)
     - 🟡 **Dirty** (Awaiting housekeeping turn)
2. **Express Check-In Execution**:
   - Front Desk supervisor clicks **"Check In"**.
   - Room is marked `occupied`.
   - Keycard code is recorded.
3. **Express Check-Out & Auto-Trigger**:
   - When **"Check Out"** is clicked, the system:
     - Sets room status to `available`.
     - Automatically flags room cleanliness as `dirty`.
     - **Instantly dispatches a priority cleaning ticket** into the Housekeeping Lead's queue without manual phone calls or paper slips.

---

### Phase 3: Restaurant & Bar POS (Dining & Room Charges)

#### Flow Summary
In-house and walk-in guests order meals or cocktails at dining tables or by the pool. Orders are tracked via digital Kitchen Order Tickets (KOT) and can be paid directly or routed to the room folio.

```mermaid
sequenceDiagram
    autonumber
    actor Waiter as 🍽️ F&B Waiter / Captain
    actor Kitchen as 👨‍🍳 Chef / Kitchen Team
    participant POS as Restaurant POS (UI)
    participant API as Restaurant API
    participant FolioAPI as Folios API
    participant DB as Database

    Waiter->>POS: Selects Table (e.g. Table T-04 - Poolside Terrace)
    POS->>POS: Table turns Amber (Occupied)
    Waiter->>POS: Selects Menu Items (Wagyu Steak, Cocktails, Desserts)
    Waiter->>POS: Toggles 'Charge to Room?' -> Selects Room #101
    Waiter->>POS: Clicks 'Send to Kitchen'
    POS->>API: POST /api/v1/restaurant/orders
    API->>DB: Order created (Status: 'in_kitchen', Order #: ORD-XXXXX)
    API->>DB: OrderItems created with unit prices & quantities
    Note over API,DB: Auto-routing check: Is Room #101 checked in?
    API->>DB: Locate active Folio for Room #101
    API->>DB: Append FolioItem: 'Dining (ORD-XXXXX): 3 item(s)' ($142.50)
    API-->>POS: KOT Ticket Generated

    Kitchen->>POS: Views ticket in Kitchen Queue
    Kitchen->>POS: Clicks 'Start Preparing' (Status -> 'preparing')
    Kitchen->>POS: Clicks 'Mark Served' (Status -> 'served')
    Waiter->>POS: Clicks 'Mark Paid' (Status -> 'paid')
```

#### Step-by-Step Breakdown:
1. **Table Map Selection**:
   - Waiter views tables organized by zone:
     - *Main Dining Hall*, *Poolside Terrace*, *Rooftop Sunset Lounge*, *Sunset Bar*.
2. **Ordering & Digital KOT**:
   - Waiter adds dishes with quantities and preparation notes.
   - 8% F&B sales tax is automatically computed.
3. **Automated Room Charge Routing (Zero Reconciliation)**:
   - When **"Charge to Room"** is checked, the backend matches the room number with the checked-in guest's active master folio.
   - The total amount is posted directly to the guest's hotel bill in real time.
   - Front Desk instantly sees the dining charge if the guest asks for their balance.
4. **Kitchen Order Ticket Workflow**:
   - `in_kitchen` ➔ `preparing` ➔ `served` ➔ `paid`.

---

### Phase 4: Housekeeping & Facilities Maintenance

#### Flow Summary
Housekeeping staff manage cleanliness turnovers, while engineering logs repair tickets. Emergency maintenance automatically quarantines rooms to prevent double-booking damaged assets.

```mermaid
sequenceDiagram
    autonumber
    actor HK as 🧹 Housekeeper
    actor Sup as 📋 Supervisor
    actor Eng as 🔧 Maintenance Engineer
    participant UI as Housekeeping & Maintenance (UI)
    participant API as Housekeeping API
    participant DB as Database

    Note over UI: Task auto-created from Check-Out
    HK->>UI: Sees task: 'Express checkout clean for Room #101' (Status: Pending)
    HK->>UI: Clicks 'Start Cleaning'
    UI->>API: PATCH /api/v1/housekeeping/tasks/{id} (status: 'in_progress')
    API->>DB: Task status -> 'in_progress'

    HK->>UI: Completes cleaning & clicks 'Mark Completed'
    UI->>API: PATCH /api/v1/housekeeping/tasks/{id} (status: 'completed')
    API->>DB: Task completed_at -> now()
    API->>DB: Room clean_status -> 'clean'

    Sup->>UI: Inspects room & clicks 'Approve & Inspect'
    UI->>API: PATCH /api/v1/housekeeping/tasks/{id} (status: 'inspected')
    API->>DB: Room clean_status -> 'inspected'
    Note over API,DB: Room is now green in Front Desk matrix!

    %% Maintenance Emergency
    HK->>UI: Notices broken AC unit in Room #204
    HK->>UI: Creates Maintenance Ticket (Category: HVAC, Priority: Emergency)
    UI->>API: POST /api/v1/housekeeping/maintenance
    API->>DB: MaintenanceRequest created
    API->>DB: Room status -> 'out_of_order' (Auto-quarantined)
    Eng->>UI: Fixes HVAC and clicks 'Resolve Ticket'
    UI->>API: PATCH /api/v1/housekeeping/maintenance/{id} (status: 'resolved')
    API->>DB: Ticket resolved_at -> now()
    API->>DB: Room status -> restored to 'available'
```

#### Cleanliness Queue States:
| State | Badge Color | Meaning |
|---|---|---|
| **Dirty** | 🟡 Yellow | Guest checked out or daily turnover pending. |
| **In Progress** | 🔵 Blue | Housekeeper is actively servicing the room. |
| **Clean** | 🟢 Green | Room cleaned, awaiting final inspection. |
| **Inspected** | 🟢 Deep Green | Supervisor approved. 100% ready for check-in. |

#### Maintenance Priority Logic:
- **Low / Medium / High**: Logged for engineer dispatch; room remains available.
- **Emergency Priority**: System **automatically overrides room status to `out_of_order`**, blocking Front Desk from checking anyone into that room until the engineer marks the ticket `resolved`.

---

### Phase 5: Master Folios, Invoicing & Financial Settlement

#### Flow Summary
Every charge incurred across all resort departments (room stay, dining, minibar, spa, occupancy taxes) consolidates into a single unified guest folio.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CONSOLIDATED MASTER FOLIO                       │
├────────────────────────────────────────────────────────────────────────┤
│  + Room Charges (# Nights x Base Rate)                                 │
│  + F&B Dining & Room Service (Auto-routed from POS)                    │
│  + Spa & Incidental Add-ons                                            │
│  + 12% Resort Occupancy Tax & Service Charge                           │
│  ────────────────────────────────────────────────────────────────────  │
│  = TOTAL ACCUMULATED CHARGES                                           │
│  - Less: Advance Deposits & Recorded Payments                          │
│  ────────────────────────────────────────────────────────────────────  │
│  = BALANCE DUE (Must reach $0.00 to complete check-out settlement)     │
└────────────────────────────────────────────────────────────────────────┘
```

#### Settlement Methods Supported:
- 💳 **Credit / Debit Card** (Visa, MasterCard, Amex)
- 📱 **UPI / QR Code Scan**
- 💵 **Cash at Desk**
- 🏦 **Corporate Bank Wire Transfer**

#### Invoicing:
- One-click **"Print Receipt / Invoice"** formats an official receipt complete with receipt number, guest passport/ID details, itemized breakdown, tax registration, and payment reference numbers.

---

### Phase 6: Executive Analytics & Night Audit

#### Flow Summary
General Managers, Revenue Directors, and Night Auditors monitor real-time property performance through live operational metrics and 7-day revenue trend charts.

```mermaid
graph LR
    subgraph RawData ["Property Activity Data"]
        R1["Occupied Rooms"]
        R2["Available Rooms"]
        R3["Room Charges Today"]
        R4["Restaurant Orders Today"]
    end

    subgraph Engines ["Formulas & KPI Computations"]
        K1["Occupancy Rate = (Occupied / Total) * 100"]
        K2["ADR = Room Revenue / Occupied Rooms"]
        K3["RevPAR = ADR * Occupancy Rate"]
        K4["Total Daily Gross = Room Rev + F&B Rev + Other"]
    end

    subgraph DashboardView ["Executive Dashboard Display"]
        D1["📊 Occupancy Gauge (e.g. 78.5%)"]
        D2["💵 ADR Metric Card (e.g. $285.00)"]
        D3["📈 RevPAR Card (e.g. $223.72)"]
        D4["📉 7-Day Revenue Stacked Bar Chart"]
    end

    R1 & R2 --> K1 --> D1
    R1 & R3 --> K2 --> D2
    K1 & K2 --> K3 --> D3
    R3 & R4 --> K4 --> D4
```

---

## 🔐 Staff Role Permissions Matrix

The PMS includes an instant role-switcher at the bottom of the navigation sidebar:

| Feature / Screen | 👑 General Manager (`admin`) | 🚪 Front Desk Supervisor (`frontdesk`) | 🍽️ F&B Captain (`waiter`) | 🧹 Housekeeping Lead (`housekeeping`) |
|---|:---:|:---:|:---:|:---:|
| **Executive Dashboard & KPIs** | ✅ Full Access | ❌ Restricted | ❌ Restricted | ❌ Restricted |
| **Room Matrix & Check-in/out** | ✅ Full Access | ✅ Primary Tool | ❌ Restricted | 👁️ View Only |
| **New Booking Creation** | ✅ Full Access | ✅ Primary Tool | ❌ Restricted | ❌ Restricted |
| **Restaurant POS & Table Map** | ✅ Full Access | 👁️ View Folio Charges | ✅ Primary Tool | ❌ Restricted |
| **Kitchen Order Tickets (KOT)** | ✅ Full Access | ❌ Restricted | ✅ Primary Tool | ❌ Restricted |
| **Housekeeping Clean Queue** | ✅ Full Access | 👁️ View Clean Status | ❌ Restricted | ✅ Primary Tool |
| **Maintenance Engineering** | ✅ Full Access | ✅ Report Tickets | ❌ Restricted | ✅ Manage & Resolve |
| **Master Folio & Billing** | ✅ Full Access | ✅ Settle & Print | 👁️ View Room Charge | ❌ Restricted |
| **Public Guest Portal** | ✅ Accessible | ✅ Accessible | ✅ Accessible | ✅ Accessible |

---

## ⚡ Cross-Department Trigger Reference Table

This table illustrates what happens across the entire property when an action occurs in one department:

| Initial Action Taken | Primary Module | Triggered Side Effect | Impacted Department |
|---|---|---|---|
| Guest creates reservation online | Public Portal | Creates Reservation + Pre-allocates Master Folio with room charge + 12% tax | Front Desk & Accounting |
| Front desk clicks "Check-In" | Front Desk | Room status changed to `occupied`; Check-in timestamp recorded | Housekeeping & Operations |
| Waiter selects "Charge to Room" | Restaurant POS | Dining bill appended to guest's hotel bill immediately | Front Desk & Billing |
| Front desk clicks "Check-Out" | Front Desk | Room set to `available`, clean status set to `dirty`; Folio marked `settled` | Front Desk & Accounting |
| Check-out completion | System Trigger | **Auto-creates high priority cleaning task** in queue | Housekeeping |
| Housekeeper marks "Complete" | Housekeeping | Room clean status updated to `clean` | Front Desk Matrix |
| Supervisor marks "Inspected" | Housekeeping | Room clean status updated to `inspected` (Ready for arrival) | Front Desk Matrix |
| Emergency repair ticket logged | Housekeeping / Eng | Room status forced to `out_of_order`; cannot be booked | Front Desk & Reservations |
| Engineer marks ticket "Resolved" | Maintenance | Room status restored to `available` | Front Desk Matrix |
