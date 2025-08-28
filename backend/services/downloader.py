import os
import random
import time
from datetime import datetime
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
import aiofiles

class InvoiceDownloader:
    def __init__(self):
        # Save PDFs under project-level invoices directory
        self.invoices_dir = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "..", "invoices"))
        os.makedirs(self.invoices_dir, exist_ok=True)
        
        # Mock airline data for simulation
        self.airlines = ["Air India", "IndiGo", "SpiceJet", "Vistara", "AirAsia", "Thai Airways"]
        self.airline_codes = {"Air India": "AI", "IndiGo": "6E", "SpiceJet": "SG", "Vistara": "UK", "AirAsia": "I5", "Thai Airways": "TG"}
        # metadata_store: optional map pnr -> dict with fields
        self.metadata_store = {}
        
    async def download_invoice(self, pnr: str, passenger_name: str):
        """Generate a mock PDF using seeded metadata when available."""
        try:
            await asyncio.sleep(0.2)
            pdf_path = await self._generate_mock_pdf(pnr, passenger_name)
            return {"status": "Success", "message": f"Invoice downloaded successfully for PNR: {pnr}", "pdf_path": pdf_path}
        except Exception as e:
            return {"status": "Error", "message": f"Error downloading invoice: {str(e)}", "pdf_path": None}
    
    async def _generate_mock_pdf(self, pnr: str, passenger_name: str):
        """Generate a mock PDF invoice"""
        meta = self.metadata_store.get(pnr, {})
        airline = meta.get('Airline') or random.choice(self.airlines)
        airline_code = self.airline_codes.get(airline, 'TG')
        invoice_number = meta.get('Invoice Number') or f"INV-{airline_code}-{random.randint(10000, 99999)}"
        amount = meta.get('Amount') if meta.get('Amount') is not None else round(random.uniform(5000, 50000), 2)
        gstin = meta.get('GSTIN')
        invoice_date = meta.get('Date') or datetime.now().strftime('%Y-%m-%d')
        passenger_display = meta.get('Name') or passenger_name
        
        # Create PDF filename
        filename = f"invoice_{pnr}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        pdf_path = os.path.join(self.invoices_dir, filename)
        
        # Generate PDF content
        doc = SimpleDocTemplate(pdf_path, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []
        
        # Title
        title = Paragraph(f"INVOICE - {airline}", styles['Title'])
        story.append(title)
        story.append(Paragraph("<br/>", styles['Normal']))
        
        # Invoice details
        data = [
            ['Invoice Number:', invoice_number],
            ['Date:', invoice_date],
            ['Passenger Name:', passenger_display],
            ['PNR:', pnr],
            ['Airline:', airline],
            ['Amount:', f"₹{float(amount):,.2f}"],
        ]
        
        if gstin:
            data.append(['GSTIN:', gstin])
        
        table = Table(data, colWidths=[140, 320])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.grey),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('BACKGROUND', (1, 0), (1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(table)
        doc.build(story)
        
        return pdf_path

# Import asyncio for async operations
import asyncio 