# CampusPay — Smart Student Expense & Group-Bill Splitting System

Built for SIH problem statement: **Smart Student Expense & Group-Bill Splitting System with OCR Receipt Parser**

Tech stack: **React.js** (frontend) · **Node.js/Express.js** (backend) · **MongoDB** (database) ·
**Google Cloud Vision API + Tesseract.js** (OCR) · **Firebase Auth** (auth) · **UPI Intent API** (settle-up)

## What's included

### Core MVP
- OCR receipt scanning (camera or gallery) with manual-correction UI
- Personal expense tracking with automatic keyword-based categorization
- Daily/weekly/monthly spending summaries + category budgets with 80%-usage alerts
- Group creation and 4 split methods: equal, custom, percentage, itemized
- Splitwise-style debt simplification ("who owes whom", minimized transactions)
- UPI deep-link generation for settle-up + mark-as-paid tracking

### Differentiators implemented
- **Itemized OCR tagging**: tap group members' names under each scanned receipt item to split by what they actually ordered
- **AI-based savings suggestions**: rule-based comparison of this month's category spend vs. 3-month average
- **Duplicate/fraud detection**: SHA-256 hash of each receipt image flags re-uploads within a group
- **Voice-based expense entry**: Web Speech API, "forty rupees on chai at the canteen" → parsed expense
- **Multi-currency**: per-user currency preference (for study-abroad students)
- Student-specific group type: "mess fund"

### Not yet implemented (noted honestly)
- Offline mode with local-storage sync (Tesseract.js OCR *can* run fully client-side to support this — see notes below — but the sync layer itself isn't built)
- Push notification reminders (currently: alerts only shown in-app on dashboard load)
- Semester budget planner UI (the data model supports arbitrary category budgets; a dedicated semester view isn't built)

## Project structure

```
sih-project/
├── backend/           # Express API
│   ├── config/         # MongoDB + Firebase Admin setup
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth verification, file upload
│   ├── models/          # Mongoose schemas
│   ├── routes/
│   ├── utils/            # OCR, split calculators, debt simplification, classifier, UPI links
│   └── server.js
└── frontend/           # React (Vite) app
    └── src/
        ├── components/   # Layout, badges, cards
        ├── context/       # Firebase auth context
        ├── pages/          # Dashboard, Scan, Expenses, Groups, Budgets, Settings
        └── services/        # Firebase client config, Axios API client
```

## Setup

### 1. MongoDB
Run locally (`mongod`) or create a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster and grab the connection string.

### 2. Firebase Admin credentials (backend)
Your frontend Firebase config is already wired in (`frontend/src/services/firebase.js`). The **backend** additionally needs a service account to verify tokens:
1. Firebase Console → your `expense-manager-c7384` project → ⚙️ Project Settings → Service Accounts
2. "Generate new private key" → downloads a JSON file
3. Copy `project_id`, `client_email`, and `private_key` from that file into `backend/.env` (see `.env.example`)

### 3. Google Cloud Vision (OCR)
Vision API needs a GCP project with billing enabled (it has a free monthly quota, which is enough for hackathon demo use).
1. [Enable the Vision API](https://console.cloud.google.com/apis/library/vision.googleapis.com) on a GCP project (can be the same one backing your Firebase project)
2. Create a service account with the "Cloud Vision AI User" role, download its JSON key
3. Save it as `backend/gcp-service-account.json` and point `GOOGLE_APPLICATION_CREDENTIALS` at it in `.env`

**If you skip this step**, the backend automatically falls back to **Tesseract.js** (works with zero config, no API key) — accuracy is lower but the app still functions end-to-end for your demo.

### 4. Install & run

```bash
# Backend
cd backend
cp .env.example .env   # fill in your values
npm install
npm run dev             # http://localhost:5000

# Frontend (separate terminal)
cd frontend
cp .env.example .env
npm install
npm run dev             # http://localhost:5173
```

## Notes on OCR accuracy & the manual-correction UI

OCR — especially Tesseract.js on phone-camera photos — will misread things sometimes. This is by design treated as a **first draft, not ground truth**: the scan flow (`/scan` page and the "Add bill" itemized flow) always routes through an editable review screen before anything is saved. Every field — merchant, date, total, tax, and each line item — is directly editable, and the app flags when the itemized total doesn't match the receipt total so mismatches are easy to catch. Judges testing this should see it handle a misread gracefully, not silently save wrong data.

## Extending offline mode

Tesseract.js runs entirely client-side (WASM), so the frontend could run OCR locally without hitting the backend at all when there's no connectivity. The natural extension: cache scanned-but-unsynced expenses in IndexedDB, then flush them to `/api/expenses` when `navigator.onLine` flips true. The `Expense` model and API are already shape-compatible with this — no backend changes needed, just a sync queue on the frontend.

## Debt simplification algorithm

`backend/utils/settleDebts.js` implements the same greedy "min cash flow" approach Splitwise uses: net every member's balance, then repeatedly match the largest creditor with the largest debtor until everyone's at zero. For a group of size *n*, this always produces at most *n − 1* transactions.
