# Airline Invoice Workflow - Setup Instructions

## Prerequisites

- Python 3.8+ with pip
- Node.js 16+ with npm
- Git (optional)

## Quick Start

### Option 1: Using the provided scripts

**Windows:**
```bash
start.bat
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

### Option 2: Manual setup

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Application Features

### 1. Passenger Data Input
- Add passenger data via JSON format
- Sample data provided: `[{"name": "John Doe", "pnr": "ABC123"}]`
- Bulk passenger creation supported

### 2. Invoice Download Workflow
- **Download Status**: Pending | Success | Not Found | Error
- Simulates downloading PDFs from airline portals
- Generates mock PDF invoices for demonstration
- Stores PDFs in `/invoices` folder

### 3. Invoice Parsing
- **Parse Status**: Pending | Success | Error
- Extracts structured data from PDFs:
  - Invoice Number
  - Date
  - Airline
  - Amount
  - GSTIN (if available)
- Uses regex patterns for data extraction

### 4. Dashboard Features
- **Passenger Records Table**: Shows all passengers with download/parse statuses
- **Parsed Invoices Table**: Displays extracted invoice data
- **Airline Summary**: Shows airline-wise totals and statistics
- **Real-time Updates**: Automatic refresh after operations
- **PDF Viewer**: Open PDFs in new tab
- **Review Flags**: Mark invoices for review

### 5. API Endpoints

#### Backend API (FastAPI)
- `GET /passengers` - List all passengers
- `GET /invoices` - List all invoices
- `GET /summary` - Airline-wise summary
- `POST /passengers/bulk` - Create multiple passengers
- `POST /download/{pnr}` - Download invoice for PNR
- `POST /parse/{pnr}` - Parse invoice for PNR
- `GET /invoices/high-value?amount=10000` - High-value invoices
- `PUT /invoices/{id}/flag` - Flag invoice for review

## Database Schema

### Passengers Table
- `id` (Primary Key)
- `name` (String)
- `pnr` (String, Unique)
- `download_status` (String)
- `parse_status` (String)
- `created_at` (DateTime)
- `updated_at` (DateTime)

### Invoices Table
- `id` (Primary Key)
- `pnr` (String)
- `invoice_number` (String)
- `invoice_date` (DateTime)
- `airline` (String)
- `amount` (Float)
- `gstin` (String, Optional)
- `pdf_path` (String)
- `flag_for_review` (Boolean)
- `raw_text` (Text)
- `created_at` (DateTime)
- `updated_at` (DateTime)

## Workflow Demo

1. **Start the application** using the provided scripts
2. **Add passenger data** using the sample data or your own JSON
3. **Download invoices** by clicking the "Download" button for each passenger
4. **Parse invoices** by clicking the "Parse" button (only available after successful download)
5. **View results** in the Parsed Invoices table
6. **Check summary** for airline-wise statistics
7. **Open PDFs** by clicking "View PDF" links
8. **Flag invoices** for review using the flag buttons

## File Structure

```
/airline-invoice-app
├── backend/
│   ├── app.py                 # FastAPI main application
│   ├── requirements.txt       # Python dependencies
│   ├── services/
│   │   ├── downloader.py      # PDF download service
│   │   └── parser.py          # PDF parsing service
│   └── db/
│       ├── models.py          # Database models
│       └── database.db        # SQLite database
├── frontend/
│   ├── package.json           # Node.js dependencies
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── services/          # API services
│   │   └── App.jsx           # Main React app
│   └── public/
├── invoices/                  # PDF storage directory
├── start.bat                 # Windows startup script
├── start.sh                  # Unix/Linux startup script
└── README.md                 # Project documentation
```

## Troubleshooting

### Common Issues

1. **Backend not starting**: Check if port 8000 is available
2. **Frontend not starting**: Check if port 5173 is available
3. **Database errors**: Delete `backend/db/database.db` to reset
4. **PDF generation errors**: Ensure `invoices` directory exists
5. **CORS errors**: Check if backend is running on correct port

### Development Notes

- The application uses SQLite for simplicity
- PDF generation is mocked for demonstration
- All statuses are simulated with random delays
- CORS is configured for localhost development
- The frontend has a minor JSX syntax issue in DataInput component (non-critical)

## API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Technologies Used

- **Backend**: FastAPI, SQLAlchemy, PyPDF2, ReportLab
- **Frontend**: React, Vite, Tailwind CSS, Axios
- **Database**: SQLite
- **PDF Processing**: PyPDF2, ReportLab
- **Icons**: Lucide React 