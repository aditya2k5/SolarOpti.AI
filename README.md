# ☀️ SolarOpti.AI

**AI-powered solar PV system sizing platform** that combines machine learning yield prediction with textbook-accurate Renewable Energy engineering calculations to help Indian homeowners evaluate solar installations.

> Built as an engineering calculator + solar advisory tool — not just another generic web app.

---

## 🎯 What It Does

A user provides their **location**, **monthly electricity consumption**, and **roof details**. SolarOpti.AI runs a complete simulation and returns:

- ☀️ **Hourly solar yield** predicted by an ML model using real weather data
- 🧮 **7-step engineering numerical** (the exact formulas from RE courses)
- 💰 **Financial analysis** — bill before vs after solar, system cost, payback period
- 🔋 **Battery & inverter sizing** with step-by-step calculations
- ⚡ **Engineer Mode** — override any default assumption and see how results change

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│                    React Frontend                     │
│  3-Step Wizard → Leaflet Map → Recharts Graphs       │
│  Engineer Mode Toggle → Result Dashboard              │
└──────────────────┬───────────────────────────────────┘
                   │ POST /api/simulate
                   ▼
┌──────────────────────────────────────────────────────┐
│                  FastAPI Backend                      │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ Yield Engine │  │ Sizing Engine│  │Tariff Engine│ │
│  │              │  │              │  │             │ │
│  │ Open-Meteo   │  │ F1: Daily    │  │ 28 Indian   │ │
│  │ Weather API  │  │ F2: DC Energy│  │ States      │ │
│  │      +       │  │ F3: Array kWp│  │ Slab-based  │ │
│  │ ML Model     │  │ F4: Panels   │  │ Tariff      │ │
│  │ (Random      │  │ F5: Battery  │  │ Lookup      │ │
│  │  Forest)     │  │ F6: Bat. Ah  │  │      +      │ │
│  │      +       │  │ F7: Inverter │  │ Financial   │ │
│  │ PSH Calc     │  │              │  │ Calculator  │ │
│  └──────────────┘  └──────────────┘  └────────────┘ │
└──────────────────────────────────────────────────────┘
```

---

## 🧮 The 7 Engineering Formulas

These are the exact numerical solving steps from a Renewable Energy university course:

| Step | Formula | What It Calculates |
|------|---------|-------------------|
| F1 | `Daily = Monthly ÷ 30` | Daily energy consumption |
| F2 | `DC Energy = Daily AC ÷ Derate Factor` | Required DC energy after losses |
| F3 | `Array kWp = DC Energy ÷ PSH` | PV array size using Peak Sun Hours |
| F4 | `Panels = ⌈(Array kWp × Safety) ÷ Panel kWp⌉` | Number of solar panels |
| F5 | `Battery kWh = (Daily × Autonomy) ÷ (DoD × Efficiency)` | Battery storage required |
| F6 | `Battery Ah = (kWh × 1000) ÷ System Voltage` | Battery capacity in Ampere-hours |
| F7 | `Inverter kVA = Array kWp × Safety Factor` | Recommended inverter size |

Every calculation step is returned with the **formula**, **actual numbers plugged in**, and the **result** — like reading a solved numerical in a textbook.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS, Recharts, Leaflet |
| **Backend** | Python, FastAPI, Pydantic |
| **ML Model** | scikit-learn Random Forest |
| **Weather Data** | Open-Meteo API (free, no key required) |
| **Tariff Data** | 28 Indian states with slab-based residential rates |

---

## 📁 Project Structure

```
SolarOpti.AI/
├── backend/
│   └── app/
│       ├── main.py                          # FastAPI entry point
│       ├── api/routes/simulate.py           # Main simulation endpoint
│       ├── core/engineering_defaults.py      # Centralized assumptions
│       ├── schemas/
│       │   ├── requests.py                  # Input validation (Pydantic)
│       │   └── responses.py                 # Output schemas
│       └── services/
│           ├── yield_engine/
│           │   ├── weather_client.py        # Open-Meteo API client
│           │   ├── pv_model.py              # ML prediction + PSH
│           │   └── peak_solar_model.pkl     # Trained Random Forest
│           ├── sizing_engine/
│           │   ├── numerical_solver.py      # F1-F4 (Panel sizing)
│           │   ├── battery_solver.py        # F5-F6 (Battery sizing)
│           │   └── inverter_solver.py       # F7 (Inverter sizing)
│           └── tariff_engine/
│               ├── rate_lookup.py           # 28-state tariff data
│               └── financial_calc.py        # Bill comparison + payback
├── frontend/
│   └── src/
│       ├── App.jsx                          # Router + providers
│       ├── pages/
│       │   ├── GetStarted.jsx               # Main simulation wizard
│       │   ├── Auth.jsx                     # Authentication page
│       │   └── Index.jsx                    # Landing page
│       └── components/                      # UI components
├── ml-service/
│   ├── train_peak_model.py                  # Model training script
│   ├── dataset/                             # Training data (solar plant CSVs)
│   └── models/peak_solar_model.pkl          # Trained model
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux
pip install fastapi uvicorn httpx pandas scikit-learn joblib
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Test It
- **Health Check:** http://localhost:8000/api/health
- **API Docs (Swagger):** http://localhost:8000/docs
- **Frontend:** http://localhost:8080

---

## 📡 API Usage

### `POST /api/simulate`

**Request:**
```json
{
  "location": {
    "latitude": 10.85,
    "longitude": 76.27,
    "state": "Kerala"
  },
  "consumption": {
    "monthly_kwh": 450
  },
  "mode": "normal"
}
```

**Engineer Mode** — override any default:
```json
{
  "location": { "latitude": 10.85, "longitude": 76.27, "state": "Kerala" },
  "consumption": { "monthly_kwh": 450 },
  "mode": "engineer",
  "engineer_overrides": {
    "panel_wattage_w": 540,
    "derate_factor": 0.75,
    "autonomy_days": 2,
    "battery_dod": 0.85,
    "system_voltage_v": 48,
    "inverter_safety_factor": 1.30
  }
}
```

**Response includes:**
- `yield_output` — Hourly yield, PSH, daily & monthly generation
- `sizing_steps` — All 7 formulas with step-by-step calculation strings
- `final_recommendation` — Panel count, battery Ah, inverter kVA
- `financials` — Bill before/after solar, monthly savings, payback years
- `assumptions_used` — Every parameter with its source (`default_assumption` or `user_provided`)

---

## ⚡ Engineer Mode

Toggle it ON in the frontend to override:

| Parameter | Default | What It Controls |
|-----------|---------|-----------------|
| Panel Wattage | 450 W | Size of each solar panel |
| Derate Factor | 0.82 | System loss (dust, wiring, inverter) |
| Autonomy Days | 1 day | Days of battery backup |
| Battery DoD | 0.80 | Depth of discharge limit |
| System Voltage | 48 V | Battery bank voltage |
| Inverter Safety | 1.25× | Surge margin for inverter |

---

## 🇮🇳 Supported States

Tariff data for all 28 states and 8 UTs:

> Andaman & Nicobar, Andhra Pradesh, Arunachal Pradesh, Assam, Bihar, Chandigarh, Chhattisgarh, Dadra & Nagar Haveli, Daman & Diu, Delhi, Goa, Gujarat, Haryana, Himachal Pradesh, Jammu & Kashmir, Jharkhand, Karnataka, Kerala, Ladakh, Lakshadweep, Madhya Pradesh, Maharashtra, Manipur, Meghalaya, Mizoram, Nagaland, Odisha, Puducherry, Punjab, Rajasthan, Sikkim, Tamil Nadu, Telangana, Tripura, Uttar Pradesh, Uttarakhand, West Bengal

---

## 🤖 ML Model Details

- **Algorithm:** Random Forest (scikit-learn)
- **Training Data:** Real solar plant generation + weather sensor data
- **Input Features:** `hour`, `IRRADIATION`, `AMBIENT_TEMPERATURE`, `MODULE_TEMPERATURE`
- **Output:** Efficiency factor normalized to 1kW system
- **Hybrid Approach:** ML efficiency × Panel capacity × Derate factor = Real-world yield

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**Aditya** — 2nd Year, Electrical and Electronics Engineering

Built as an engineering project combining RE course numericals with modern full-stack development.

---

<p align="center">
  <b>⭐ Star this repo if you found it useful!</b>
</p>
