# Cost Saver App - Complete Project Documentation

## 🚀 Quick Start (IMPORTANT - READ THIS FIRST!)

**To start the app, simply double-click one of these files:**
- `START_APP.bat` (Basic Windows startup)
- `START_APP.ps1` (PowerShell with colored output - recommended)

The scripts will automatically:
- Check for required dependencies
- Clean up port 3000 if needed
- Start the development server
- Open your browser to http://localhost:3000

**To stop the server:** Press `Ctrl+C` in the terminal window

---

## 🎯 Project Overview

A modular cost-saving web application built with Next.js, TypeScript, Tailwind CSS, and Firebase. The MVP focuses on home energy insights with a scalable architecture for future expansion into broadband, insurance, flights, and other cost-saving categories.

## 📋 Table of Contents

1. [Quick Start](#quick-start-important-read-this-first)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Setup Instructions](#setup-instructions)
5. [Features Implemented](#features-implemented)
6. [API Integration](#api-integration)
7. [Calculation Logic](#calculation-logic)
8. [Usage Guide](#usage-guide)
9. [Future Roadmap](#future-roadmap)

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router with Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.x
- **Backend**: Firebase (Firestore + Authentication + Storage)
- **APIs**: OpenWeather API, Carbon Intensity API (planned)
- **Deployment**: Vercel (recommended)

---

## 📁 Project Structure

```
cost-saver-app/
├── app/
│   ├── page.tsx                    # Homepage with hero section
│   ├── onboarding/
│   │   └── page.tsx                # 4-step onboarding wizard
│   ├── dashboard/
│   │   └── page.tsx                # Original dashboard
│   ├── dashboard-v2/
│   │   └── page.tsx                # Enhanced dashboard (all spec features)
│   ├── settings/
│   │   └── page.tsx                # Settings page to update home details
│   └── api/
│       └── weather/
│           └── route.ts            # OpenWeather API integration
├── components/
│   └── DashboardCard.tsx           # Reusable modular card component
├── lib/
│   ├── firebase.ts                 # Firebase configuration
│   ├── firebaseHelpers.ts          # Firestore CRUD operations
│   └── energyModel.ts              # Complete energy calculation logic
├── types/
│   └── index.ts                    # TypeScript type definitions
├── utils/
│   ├── energyCalculations.ts       # Legacy calculations (kept for compatibility)
│   └── savingTips.ts               # Saving tips generator
├── .env.example                    # Environment variables template
└── SETUP_GUIDE.md                  # Quick setup instructions
```

---

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Firebase (if not already installed)

```bash
npm install firebase
```

### 3. Configure Environment Variables

Create `.env.local` in the root directory:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# OpenWeather API
OPENWEATHER_API_KEY=your-openweather-key
```

### 4. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Firestore Database**
4. Enable **Authentication** (Email/Password + Anonymous)
5. Copy your config to `.env.local`

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## ✅ Features Implemented

### Phase 1: Energy Module (MVP)

#### **User Inputs Collected**
- ✅ Postcode
- ✅ Home type (flat, terraced, semi-detached, detached)
- ✅ Number of occupants
- ✅ Heating type (gas, electricity, heat pump, mixed)

#### **External APIs Integrated**
- ✅ **OpenWeather API**: Current temperature, forecast, humidity, feels-like
- 🔄 **Carbon Intensity API**: Planned for grid intensity data
- 🔄 **Ofgem Tariff API**: Planned for tariff comparison

#### **Calculations Implemented** (in `lib/energyModel.ts`)

1. ✅ **Base Household Consumption Model**
2. ✅ **Heating Load Estimation**
3. ✅ **Daily Cost Estimation**
4. ✅ **24-Hour Heating Forecast**
5. ✅ **Weather Impact Explanation**
6. ✅ **Saving Suggestions**
7. ✅ **Weekly Analysis**
8. ✅ **Monthly Projection**
9. ✅ **Switch Recommendation Logic**

#### **UI Pages**

- ✅ **Homepage** (`/`)
- ✅ **Onboarding Wizard** (`/onboarding`)
- ✅ **Dashboard** (`/dashboard`)
- ✅ **Enhanced Dashboard** (`/dashboard-v2`) - All specification features
- ✅ **Settings Page** (`/settings`)

---

## 🌐 API Integration

### OpenWeather API (`/api/weather`)

**Request:**
```
GET /api/weather?postcode=SW1A1AA
```

**Response:**
```json
{
  "current": {
    "temperature": 10.5,
    "feelsLike": 8.2,
    "humidity": 75,
    "description": "partly cloudy"
  },
  "forecast": [...]
}
```

**Fallback**: Returns mock data if API key not configured.

---

## 🧮 Calculation Logic

### Energy Cost Formula

```
Daily Cost = Heating Cost + Electricity Cost + Standing Charge
```

### Heating Load (Degree-Day Method)

```
Heating kWh = (Base Temp - Outdoor Temp) × Demand Factor × Insulation Factor / Efficiency
```

### UK Energy Prices (2025)

- **Electricity**: £0.28/kWh
- **Gas**: £0.07/kWh
- **Standing Charges**: £0.53-£0.80/day

---

## 📖 Usage Guide

### For End Users

1. **Visit Homepage** → Click "Start Saving"
2. **Complete Onboarding** (postcode, home type, occupants, heating)
3. **View Dashboard** with personalized insights
4. **Update Details** via Settings page

### For Developers

#### Add a New Calculation Function

Edit `lib/energyModel.ts`:

```typescript
export function yourNewCalculation(inputs: any): any {
  // Your logic here
  return result;
}
```

#### Create a New Dashboard Section

Use the `DashboardCard` component:

```tsx
<DashboardCard
  title="Your Title"
  value="£123.45"
  variant="success"
>
  <YourCustomContent />
</DashboardCard>
```

---

## 🔮 Future Roadmap

### Phase 2: Broadband Module
- [ ] Broadband speed test integration
- [ ] Provider comparison API
- [ ] Switching recommendations

### Phase 3: Insurance Module
- [ ] Insurance comparison APIs
- [ ] Renewal reminders
- [ ] Multi-quote system

### Phase 4: Travel Module
- [ ] Flight price tracking
- [ ] Hotel deals
- [ ] Price drop alerts

### Phase 5: Subscription Management
- [ ] Bank statement parsing
- [ ] Subscription detection
- [ ] Cancellation assistant

---

## 📦 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

```bash
# Or use Vercel CLI
npm install -g vercel
vercel
```

---

## 🎉 Acknowledgments

- **UK Energy Prices**: Ofgem average rates (2025)
- **Weather Data**: OpenWeather API
- **Architecture**: Next.js best practices

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
