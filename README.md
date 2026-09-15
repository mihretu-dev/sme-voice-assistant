# Voxide SME Voice Assistant | የኢትዮጵያ ንግድ ድምፅ ረዳት

A modern, high-performance web application tailored for Ethiopian Small and Medium Enterprises (SMEs) to record daily sales, manage inventory, and track expenses via voice streams and audio input.

Built with **React 18**, **Vite**, **Tailwind CSS**, and **Lucide React**.

---

## 🌟 Key Features

### 1. Core State Management & Aggregations
- **Real-Time Financial Tracking**: Live calculation of Total Daily Sales (ETB), Today's Expenses (ETB), and Net Cash Margin.
- **Inventory Catalog**: Pre-seeded with Ethiopian retail items (Sugar/ስኳር, Teff/ጤፍ, Cooking Oil/ዘይት, Coffee/ቡና, Soap/ሳሙና) with automated low-stock detection.
- **Audit Log / Recent Transactions**: Unified activity feed categorizing sales, expenses, and inventory restocks with timestamps and voice indicators.
- **Persistence**: Built-in state caching with `localStorage` and a 1-click **Reset Demo** button.

### 2. Voxide Audio Stream & Voice Logger
- **Interactive Microphone Trigger**: Prominent mic button featuring active pulsing rings (`animate-pulse-ring`), equalizer soundwaves, and state transitions (`idle` ➔ `listening` ➔ `processing` ➔ `success`).
- **Structured Payload Contract**:
  ```json
  {
    "action": "sale",
    "item": "Sugar",
    "quantity": 2,
    "amount": 260,
    "language": "en"
  }
  ```
  - `action`: `"sale" | "stock" | "expense"`
  - `item`: Name of the item or expense category (supports English & Amharic Unicode)
  - `quantity`: Number of units sold, restocked, or purchased
  - `amount`: Transaction value in Ethiopian Birr (ETB)
  - `language`: `"am" | "en"`
- **Simulation Fallbacks**:
  - **Quick Preset Chips**: Test Amharic & English voice commands instantly (e.g. *"5 ኪሎ ስኳር ተሸጠ 650 ብር"*, *"Sold 2kg Sugar for 260 ETB"*, *"Restocked 30kg Teff Flour"*).
  - **Natural Language Simulation**: Type freeform spoken transcripts into the simulation bar to test the regex/heuristic entity extractor.
  - **Raw JSON Inspector**: View and test custom JSON payloads directly against the application store.

### 3. Localization & Currency
- Native support for **Ethiopian Birr (ETB)**.
- Dual-language interface supporting **English** and **አማርኛ (Amharic)** with typography powered by *Plus Jakarta Sans* and *Noto Sans Ethiopic*.

---

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Run Local Development Server
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

---

## 📁 Project Structure

```
├── index.html                   # HTML entrypoint with Ethiopic & Jakarta fonts
├── package.json                 # Project dependencies & scripts
├── vite.config.js               # Vite configuration with @tailwindcss/vite
├── src/
│   ├── main.jsx                 # React root render
│   ├── App.jsx                  # Main dashboard layout
│   ├── index.css                # Tailwind CSS v4 directives & keyframe animations
│   ├── context/
│   │   └── BusinessContext.jsx  # Central store: inventory, sales, expenses, voice handler
│   ├── services/
│   │   └── voxideVoiceService.js # Voxide audio stream simulation, presets & parser
│   ├── utils/
│   │   └── formatters.js        # ETB currency & timestamp helpers
│   └── components/
│       ├── Header.jsx           # App navbar, language toggle, demo reset
│       ├── SummaryCards.jsx     # Sales, expenses, net cash & alert cards
│       ├── VoiceLogger.jsx      # Voice trigger button, pulse states & simulation
│       ├── InventoryTable.jsx   # Stock catalog with quick sell & restock actions
│       ├── TransactionHistory.jsx # Activity feed with tabs (All / Sales / Expenses / Stock)
│       ├── AddItemModal.jsx     # New product modal
│       └── NotificationToast.jsx # Floating toast feedback for voice actions
```
