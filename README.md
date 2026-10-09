# Sovereign Courier Security (SCS Global)

Enterprise-grade international security courier platform engineered for high-value bullion transport, diplomatic pouch movement, fine art transit, confidential document delivery, and vault storage under 256-bit encrypted chain of custody.

---

## 🚀 Key Features

### 1. Brand & Design
- **Corporate Security Aesthetic**: Deep navy (`#0B132B`), gold/amber accent (`#D4AF37`), clean white theme with built-in dark mode toggle.
- **Multi-Language Support**: English 🇬🇧, French 🇫🇷, Arabic 🇦🇪, Spanish 🇪🇸, Chinese 🇨🇳.
- **Multi-Currency Converter**: USD ($), EUR (€), GBP (£), AED (AED), JPY (¥), CAD (CA$), CHF (CHF).

### 2. High-Security Check-Digit Tracking (`SCS-2026-XXXXXXXXXX`)
- **Luhn-36 Checksum Algorithm**: Detects single-character and transposition typos with $>99.8\%$ mathematical confidence.
- **Public Multi-Tracking**: Track up to 10 shipments simultaneously without logging in.
- **Passcode Protection**: High-value shipments protected by security passcode (Demo: `VIP2026`).
- **Barcode & QR Code Waybills**: Optical Code-128 barcode and QR code verification links.
- **Proof of Delivery (POD)**: Digital signature canvas, photo upload preview, OTP verification, timestamp, and GPS coordinates.

### 3. Live Telemetry Map & Replay Scrubber
- **Interactive Leaflet Map**: Custom SVG markers for origin vaults, airports, and destination hubs.
- **Multi-Leg Journey**: Supports road (armored truck 🚚), air (security flight ✈️), and sea (armed vessel 🚢) legs.
- **Live Vehicle Telemetry**: Animated moving vehicle marker displaying real-time speed, heading, geofences, and live ETA updates.
- **Replay Scrubber Controls**: Play, pause, and speed multiplier (1x, 2x, 5x).
- **Privacy Mode**: Switch between Authorized Exact GPS and Masked Public Regional view.

### 4. Interactive Portals & Applications
- **Customer Portal (`/portal`)**: Dashboard, step-by-step Create Shipment wizard, Bulk CSV batch uploader, Saved Address Book, CSV Manifest Export, and API Keys / Webhooks manager.
- **Admin Operations Control (`/admin`)**: Role-based access (Super Admin, Ops Manager, Dispatcher, Security Officer, Finance), Live Fleet Control Board, Master Shipment Registry, Incident Audit Logs, Recharts Financial Analytics, and Vault Barcode Scanner simulator.
- **Courier / Driver Mobile App PWA (`/courier`)**: Mobile-first interface with task list, turn-by-turn navigation links, handover barcode scanner, digital signature capture, photo POD, Red SOS Panic button with 5s emergency beaconing, and offline mode indicator.

---

## 🛠️ Setup & Running Instructions

### Prerequisites
- Node.js (v18+)
- npm / yarn / pnpm

### Installation

```bash
# Navigate to the project workspace
cd C:\Users\User\.gemini\antigravity\scratch\scs-global

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Key Route Sitemap
- `/` - Public Home Page (Hero multi-tracking, instant quote, services)
- `/track` - Public Tracking & Live Interactive Map (`?tn=SCS-2026-0000000001`)
- `/quote` - Shipping Rate Estimator & PDF Generator
- `/services` - Armored Transit & Diplomatic Pouch Catalog
- `/coverage` - Global Hub Map & 28 Armed Vault Directory
- `/security` - Security Standards & ISO Compliance
- `/portal` - Client Portal (Create Shipment, CSV Upload, History)
- `/admin` - Ops Dashboard (Fleet Map, Incident Control, Analytics)
- `/courier` - Courier Mobile PWA (Scanner, Signature POD, SOS Panic)

---

## 🧪 Quick Testing Credentials & Demo Tracking IDs

- **Active Multi-Leg Playback Demo**: `SCS-2026-0000000001` (Zurich Vault → London Hub → NYC High Security Vault)
  - Passcode: `VIP2026`
- **Delivered Cash-in-Transit Demo**: `SCS-2026-89A7B2C1X4` (Paris → Dubai, Recipient Signature & Photo POD)
- **Diplomatic Pouch Demo**: `SCS-2026-9912001A89` (London → Tokyo, Vienna Convention Immunity)
- **Customs Hold Demo**: `SCS-2026-47F1902K33` (Singapore → San Francisco, Customs Audit Hold)

---

## 📄 License & Underwriting
Protected by Sovereign Courier Security (SCS Global) Inc. All cargo underwritten by Lloyd's of London up to $500,000,000 per manifest.
# Shipment email notifications

Admin sign-in uses an HTTP-only server session. Configure the administrator credentials and a random session secret as server environment variables in `.env.local` for local development and in the deployment provider for production. Do not commit `.env.local` or put secrets in source code.

- `SCS_ADMIN_USERNAME`: administrator username
- `SCS_ADMIN_PASSWORD`: administrator password
- `SCS_ADMIN_SESSION_SECRET`: random secret used to sign admin sessions

Admin shipment registration also emails the recipient using Resend. Configure:

- `RESEND_API_KEY`: a Resend API key
- `RESEND_FROM_EMAIL`: a sender address on a domain verified with Resend
- `NEXT_PUBLIC_APP_URL`: the public app URL used to build tracking links

See `.env.example` for the expected format. Without the email settings, shipments are still registered, but the admin page reports that the notification was not sent.
