# KunlexCity – PrimeNest Realty
### Luxury Real Estate Listing & Management Platform (Nigeria)
*"Find Your Place. Build Your Future."*

---

## 1. Executive Overview

**KunlexCity (PrimeNest Realty)** is an enterprise-grade, full-stack real estate listing, management, and AI advisory platform tailored for the high-end Nigerian property ecosystem (Lagos, Abuja FCT, and Port Harcourt).

The platform features:
- **Comprehensive Public Real Estate Portal**: Hero search engine with enclaves (Banana Island, Ikoyi, Maitama, Lekki Phase 1, Victoria Island, Guzape), price sliders (₦ Naira), specs filtering, image gallery, simulated Google Maps, and mortgage calculator.
- **PrimeNest AI Advisor**: Server-side Google Gemini 3.8 Flash (`gemini-3.8-flash`) integration grounded on the live property database. It never hallucinates unverified listings and provides property recommendations, side-by-side investment evaluations, and AI listing descriptions.
- **Role-Based Access Model**:
  - **Administrator (Full Access)**: Email `kunlex4star@gmail.com` with password `School42`. Only the Admin has full access to upload new properties (via picture file upload or URL option), manage listings, and review any Client/Buyer that has **Paid** or is **Pending to buy** the property.
  - **Client / Buyer**: Registered users who can browse, save favourites, schedule inspections, and place purchase orders.
  - **Guest Visitor**: Users can view properties as guest, but must register or sign in as Client/Buyer if they want to purchase or buy properties.

---

## 2. Credentials & Login

| Role | Email | Password | Access Details |
|---|---|---|---|
| **Administrator** | `kunlex4star@gmail.com` | `School42` | Full access to upload properties (file/URL) and track Paid / Pending buyers |
| **Client / Buyer** | `buyer.chinedu@investments.ng` | `Client123!` | Registered buyer account |
| **Guest Visitor** | None | None | Browse only; registration prompted when purchasing |

---

## 4. Environment Variables

Create `.env` using `.env.example`:

```bash
# Gemini AI (injected by AI Studio or set locally)
GEMINI_API_KEY="your-gemini-api-key"

# Port (default 3000)
PORT=3000

# JWT Secret
JWT_SECRET="primenest-kunlexcity-super-secret-jwt-key-2025"

# Optional PostgreSQL Connection URL (for Prisma migration in external production)
DATABASE_URL="postgresql://user:password@localhost:5432/primenest_db?schema=public"
```

---

## 5. Local Development Commands

```bash
# 1. Install dependencies
npm install

# 2. Run full-stack dev server (Express backend + Vite frontend on port 3000)
npm run dev

# 3. Build for production
npm run build

# 4. Start production server
npm start
```

---

## 6. Architecture & Security

- **Server-Side AI Grounding**: All Gemini API calls reside in `backend/src/services/geminiService.ts` via server endpoints `/api/gemini/*`. The API key is never exposed to the browser.
- **Relational Integrity**: `backend/prisma/schema.prisma` defines models for `User`, `Property`, `Inquiry`, `Appointment`, `Transaction`, `Tenancy`, `MaintenanceRequest`, `Favourite`, and `AuditLog`.
- **Title Perfection**: Verified Governor's Consent, C of O, and Survey Beacons registered for Nigerian luxury assets.
