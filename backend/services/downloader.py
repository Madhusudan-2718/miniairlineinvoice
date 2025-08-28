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
        self.airlines = ["Air India", "IndiGo", "SpiceJet", "Vistara", "AirAsia"]
        self.airline_codes = ["AI", "6E", "SG", "UK", "I5"]
        
    async def download_invoice(self, pnr: str, passenger_name: str):
        """Simulate downloading invoice PDF from airline portal (deterministic success for demo)"""
        try:
            # Simulate network delay
            await asyncio.sleep(0.5)
            
            # Always success for demo stability
            pdf_path = await self._generate_mock_pdf(pnr, passenger_name)
            
            return {
                "status": "Success",
                "message": f"Invoice downloaded successfully for PNR: {pnr}",
                "pdf_path": pdf_path
            }
            
        except Exception as e:
            return {
                "status": "Error",
                "message": f"Error downloading invoice: {str(e)}",
                "pdf_path": None
            }
    
    async def _generate_mock_pdf(self, pnr: str, passenger_name: str):
        """Generate a mock PDF invoice"""
        airline = random.choice(self.airlines)
        airline_code = random.choice(self.airline_codes)
        invoice_number = f"INV-{airline_code}-{random.randint(10000, 99999)}"
        amount = round(random.uniform(5000, 50000), 2)
        gstin = f"{random.randint(10, 99)}AAAAA{random.randint(1000, 9999)}Z{random.randint(1, 9)}Z" if random.random() > 0.3 else None
        
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
            ['Date:', datetime.now().strftime('%Y-%m-%d')],
            ['Passenger Name:', passenger_name],
            ['PNR:', pnr],
            ['Airline:', airline],
            ['Amount:', f"₹{amount:,.2f}"],
        ]
        
        if gstin:
            data.append(['GSTIN:', gstin])
        
        table = Table(data, colWidths=[120, 300])
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