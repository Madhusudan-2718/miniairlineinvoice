from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import asyncio

from db.models import get_db, Passenger, Invoice
from services.downloader import InvoiceDownloader
from services.parser import InvoiceParser
from pydantic import BaseModel

app = FastAPI(title="Airline Invoice Workflow API", version="1.0.0")

# CORS middleware
app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

# Mount static files for PDF access
invoices_dir = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "invoices"))
os.makedirs(invoices_dir, exist_ok=True)
app.mount("/invoices", StaticFiles(directory=invoices_dir), name="invoices")

# Helper to expose URL path for a stored PDF file
def to_pdf_url_path(pdf_fs_path: Optional[str]) -> Optional[str]:
    if not pdf_fs_path:
        return None
    # Always return URL as /invoices/<filename>
    filename = os.path.basename(pdf_fs_path)
    return f"/invoices/{filename}"

@app.get("/debug/invoices-dir")
async def debug_invoices_dir():
	try:
		files = []
		if os.path.isdir(invoices_dir):
			files = sorted(os.listdir(invoices_dir))
		return {"invoices_dir": invoices_dir, "files": files}
	except Exception as e:
		return {"invoices_dir": invoices_dir, "error": str(e)}

# Pydantic models
class PassengerData(BaseModel):
    name: str
    pnr: str

class InvoiceResponse(BaseModel):
    id: int
    pnr: str
    invoice_number: Optional[str]
    invoice_date: Optional[str]
    airline: Optional[str]
    amount: Optional[float]
    gstin: Optional[str]
    pdf_path: Optional[str]
    flag_for_review: bool
    created_at: str

class PassengerResponse(BaseModel):
    id: int
    name: str
    pnr: str
    download_status: str
    parse_status: str
    created_at: str

class SummaryResponse(BaseModel):
    airline: str
    total_amount: float
    invoice_count: int

# Initialize services
downloader = InvoiceDownloader()
parser = InvoiceParser()

@app.get("/")
async def root():
    return {"message": "Airline Invoice Workflow API"}

@app.get("/invoices", response_model=List[InvoiceResponse])
async def get_invoices(db: Session = Depends(get_db)):
    """Get all invoices with their statuses"""
    invoices = db.query(Invoice).all()
    return [
        InvoiceResponse(
            id=inv.id,
            pnr=inv.pnr,
            invoice_number=inv.invoice_number,
            invoice_date=inv.invoice_date.isoformat() if inv.invoice_date else None,
            airline=inv.airline,
            amount=inv.amount,
            gstin=inv.gstin,
            pdf_path=to_pdf_url_path(inv.pdf_path),
            flag_for_review=inv.flag_for_review,
            created_at=inv.created_at.isoformat()
        )
        for inv in invoices
    ]

@app.get("/passengers", response_model=List[PassengerResponse])
async def get_passengers(db: Session = Depends(get_db)):
    """Get all passengers with their statuses"""
    passengers = db.query(Passenger).all()
    return [
        PassengerResponse(
            id=p.id,
            name=p.name,
            pnr=p.pnr,
            download_status=p.download_status,
            parse_status=p.parse_status,
            created_at=p.created_at.isoformat()
        )
        for p in passengers
    ]

@app.get("/summary", response_model=List[SummaryResponse])
async def get_summary(db: Session = Depends(get_db)):
    """Get airline-wise summary"""
    from sqlalchemy import func
    
    summary = db.query(
        Invoice.airline,
        func.sum(Invoice.amount).label('total_amount'),
        func.count(Invoice.id).label('invoice_count')
    ).filter(
        Invoice.airline.isnot(None),
        Invoice.amount.isnot(None)
    ).group_by(Invoice.airline).all()
    
    return [
        SummaryResponse(
            airline=row.airline,
            total_amount=float(row.total_amount),
            invoice_count=row.invoice_count
        )
        for row in summary
    ]

@app.post("/download/{pnr}")
async def download_invoice(pnr: str, db: Session = Depends(get_db)):
    """Trigger invoice download for a specific PNR"""
    # Find passenger
    passenger = db.query(Passenger).filter(Passenger.pnr == pnr).first()
    if not passenger:
        raise HTTPException(status_code=404, detail=f"Passenger with PNR {pnr} not found")
    
    # Update status to pending
    passenger.download_status = "Pending"
    db.commit()
    
    # Download invoice
    result = await downloader.download_invoice(pnr, passenger.name)
    
    # Update passenger status
    passenger.download_status = result["status"]
    db.commit()
    
    # If download successful, create invoice record
    url_path = None
    if result["status"] == "Success" and result["pdf_path"]:
        # Check if invoice already exists
        existing_invoice = db.query(Invoice).filter(Invoice.pnr == pnr).first()
        if not existing_invoice:
            invoice = Invoice(
                pnr=pnr,
                pdf_path=result["pdf_path"]
            )
            db.add(invoice)
            db.commit()
            url_path = to_pdf_url_path(result["pdf_path"])
        else:
            # Update existing invoice path to latest generated PDF
            existing_invoice.pdf_path = result["pdf_path"]
            db.commit()
            url_path = to_pdf_url_path(existing_invoice.pdf_path)
    
    return {
        "pnr": pnr,
        "status": result["status"],
        "message": result["message"],
        "pdf_path": url_path
    }

@app.post("/parse/{pnr}")
async def parse_invoice(pnr: str, db: Session = Depends(get_db)):
    """Parse invoice for a specific PNR"""
    # Find passenger
    passenger = db.query(Passenger).filter(Passenger.pnr == pnr).first()
    if not passenger:
        raise HTTPException(status_code=404, detail=f"Passenger with PNR {pnr} not found")
    
    # Check if download was successful
    if passenger.download_status != "Success":
        raise HTTPException(status_code=400, detail="Invoice must be downloaded successfully before parsing")
    
    # Find invoice
    invoice = db.query(Invoice).filter(Invoice.pnr == pnr).first()
    if not invoice or not invoice.pdf_path:
        raise HTTPException(status_code=404, detail=f"Invoice PDF not found for PNR {pnr}")
    
    # Update status to pending
    passenger.parse_status = "Pending"
    db.commit()
    
    # Parse invoice
    result = await parser.parse_invoice(pnr, invoice.pdf_path)
    
    # Update passenger status
    passenger.parse_status = result["status"]
    db.commit()
    
    # Update invoice with parsed data
    if result["status"] == "Success" and result["data"]:
        data = result["data"]
        invoice.invoice_number = data["invoice_number"]
        invoice.invoice_date = data["invoice_date"]
        invoice.airline = data["airline"]
        invoice.amount = data["amount"]
        invoice.gstin = data["gstin"]
        invoice.raw_text = result["raw_text"]
        db.commit()
    
    return {
        "pnr": pnr,
        "status": result["status"],
        "message": result["message"],
        "data": result["data"]
    }

@app.get("/invoices/high-value")
async def get_high_value_invoices(amount: float = 10000, db: Session = Depends(get_db)):
    """Get invoices above a certain amount threshold"""
    invoices = db.query(Invoice).filter(
        Invoice.amount >= amount,
        Invoice.amount.isnot(None)
    ).all()
    
    return [
        InvoiceResponse(
            id=inv.id,
            pnr=inv.pnr,
            invoice_number=inv.invoice_number,
            invoice_date=inv.invoice_date.isoformat() if inv.invoice_date else None,
            airline=inv.airline,
            amount=inv.amount,
            gstin=inv.gstin,
            pdf_path=to_pdf_url_path(inv.pdf_path),
            flag_for_review=inv.flag_for_review,
            created_at=inv.created_at.isoformat()
        )
        for inv in invoices
    ]

@app.post("/passengers/bulk")
async def create_passengers(passengers: List[PassengerData], db: Session = Depends(get_db)):
    """Create multiple passengers from JSON data"""
    created_passengers = []
    
    for passenger_data in passengers:
        # Check if passenger already exists
        existing = db.query(Passenger).filter(Passenger.pnr == passenger_data.pnr).first()
        if existing:
            continue
        
        passenger = Passenger(
            name=passenger_data.name,
            pnr=passenger_data.pnr
        )
        db.add(passenger)
        created_passengers.append(passenger)
    
    db.commit()
    
    return {
        "message": f"Created {len(created_passengers)} new passengers",
        "passengers": [
            {
                "id": p.id,
                "name": p.name,
                "pnr": p.pnr,
                "download_status": p.download_status,
                "parse_status": p.parse_status
            }
            for p in created_passengers
        ]
    }

@app.put("/invoices/{invoice_id}/flag")
async def flag_invoice_for_review(invoice_id: int, flag: bool, db: Session = Depends(get_db)):
    """Flag an invoice for review"""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    invoice.flag_for_review = flag
    db.commit()
    
    return {"message": f"Invoice {invoice_id} {'flagged' if flag else 'unflagged'} for review"}

@app.get("/debug/invoice/{pnr}")
async def debug_invoice(pnr: str, db: Session = Depends(get_db)):
	invoice = db.query(Invoice).filter(Invoice.pnr == pnr).first()
	if not invoice:
		raise HTTPException(status_code=404, detail="Invoice not found")
	from services.parser import InvoiceParser
	parser_dbg = InvoiceParser()
	norm_text = None
	try:
		if invoice.pdf_path and os.path.exists(invoice.pdf_path):
			raw = parser_dbg._extract_text_from_pdf(invoice.pdf_path)
			norm_text = parser_dbg._normalize_text(raw)
	except Exception as e:
		norm_text = f"error: {e}"
	return {
		"pnr": pnr,
		"pdf_path": invoice.pdf_path,
		"raw_text_exists": invoice.raw_text is not None,
		"raw_text_preview": (invoice.raw_text or "")[0:500],
		"normalized_preview": (norm_text or "")[0:500]
	}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 