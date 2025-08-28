# Airline Invoice Workflow Application

A full-stack application that simulates an airline invoice workflow with PDF download, parsing, and dashboard management.

## Features

- **Invoice Download**: Download PDF invoices from mocked airline portal
- **Invoice Parsing**: Extract structured data from PDFs (Invoice Number, Date, Airline, Amount, GSTIN)
- **Dashboard**: Real-time status tracking and management interface
- **REST API**: Complete backend API for all operations
- **Database**: SQLite storage for passengers and invoices

## Project Structure

```
/airline-invoice-app
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── services/
│   │   ├── downloader.py
│   │   └── parser.py
│   └── db/
│       ├── models.py
│       └── database.db
├── frontend/
│   ├── package.json
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│   └── public/
└── invoices/
```

## Quick Start

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Sample Data
Use the sample passenger data in the dashboard to test the workflow:
```json
[
  {"name": "John Doe", "pnr": "ABC123"},
  {"name": "Jane Smith", "pnr": "XYZ789"},
  {"name": "Bob Johnson", "pnr": "DEF456"}
]
```

## API Endpoints

- `GET /invoices` - List all invoices with statuses
- `GET /summary` - Airline-wise totals
- `POST /download/{pnr}` - Trigger invoice download
- `POST /parse/{pnr}` - Parse invoice data
- `GET /invoices/high-value?amount=10000` - High-value invoices

## Status Types

- **Download Status**: Pending | Success | Not Found | Error
- **Parse Status**: Pending | Success | Error 