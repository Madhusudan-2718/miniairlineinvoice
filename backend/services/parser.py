import re
import PyPDF2
import os
from datetime import datetime
from typing import Dict, Optional

class InvoiceParser:
	def __init__(self):
		self.invoices_dir = "../../invoices"
	
	async def parse_invoice(self, pnr: str, pdf_path: str) -> Dict:
		"""Parse PDF invoice and extract structured data"""
		try:
			if not os.path.exists(pdf_path):
				return {
					"status": "Error",
					"message": f"PDF file not found: {pdf_path}",
					"data": None
				}
			
			# Extract text from PDF
			raw_text = self._extract_text_from_pdf(pdf_path)
			
			# Normalize text for stable parsing
			norm = self._normalize_text(raw_text)
			
			# Parse structured data
			parsed_data = self._parse_invoice_data(norm, pnr)
			
			return {
				"status": "Success",
				"message": f"Invoice parsed successfully for PNR: {pnr}",
				"data": parsed_data,
				"raw_text": raw_text
			}
			
		except Exception as e:
			return {
				"status": "Error",
				"message": f"Error parsing invoice: {str(e)}",
				"data": None,
				"raw_text": None
			}
	
	def _extract_text_from_pdf(self, pdf_path: str) -> str:
		"""Extract text content from PDF file"""
		text = ""
		try:
			with open(pdf_path, 'rb') as file:
				pdf_reader = PyPDF2.PdfReader(file)
				for page in pdf_reader.pages:
					text += page.extract_text() or ""
		except Exception as e:
			raise Exception(f"Failed to extract text from PDF: {str(e)}")
		
		return text
	
	def _normalize_text(self, text: str) -> str:
		# Collapse multiple spaces, unify newlines as spaces for simpler regex, keep word boundaries
		text = text.replace('\r', ' ').replace('\n', ' ')
		text = re.sub(r"\s+", " ", text).strip()
		return text
	
	def _parse_invoice_data(self, text: str, pnr: str) -> Dict:
		"""Parse structured data from invoice text"""
		# Initialize with default values
		data = {
			"invoice_number": None,
			"invoice_date": None,
			"airline": None,
			"amount": None,
			"gstin": None
		}
		
		# Invoice Number (support numeric or INV- formats)
		invoice_patterns = [
			r'Invoice\s*Number[:#]?\s*([0-9]{6,})',
			r'(INV-[A-Z0-9]+-\d{3,})'
		]
		for pattern in invoice_patterns:
			m = re.search(pattern, text, re.IGNORECASE)
			if m:
				data["invoice_number"] = m.group(1)
				break
		
		# Date
		date_patterns = [
			r'Date[:]?!?\s*(\d{4}-\d{2}-\d{2})',
			r'Date[:]?!?\s*(\d{2}/\d{2}/\d{4})',
			r'(\d{2}-\d{2}-\d{4})'
		]
		for pattern in date_patterns:
			m = re.search(pattern, text)
			if m:
				date_str = m.group(1)
				for fmt in ('%Y-%m-%d','%m/%d/%Y','%d-%m-%Y'):
					try:
						data["invoice_date"] = datetime.strptime(date_str, fmt)
						break
					except:
						continue
				break
		
		# Airline (include Thai Airways)
		airline_patterns = [
			r'Airline[:]?!?\s*(Thai Airways|Air India|IndiGo|SpiceJet|Vistara|AirAsia)',
			r'\b(Thai Airways|Air India|IndiGo|SpiceJet|Vistara|AirAsia)\b'
		]
		for pattern in airline_patterns:
			m = re.search(pattern, text, re.IGNORECASE)
			if m:
				data["airline"] = m.group(1).strip()
				break
		
		# Amount (robust to currency glyphs)
		amount_patterns = [
			r'Amount[:]?\s*[^0-9\-]*([\d,]+\.?\d*)',
			r'Total[:]?\s*[^0-9\-]*([\d,]+\.?\d*)',
			r'[₹\$\€\£\u20B9\u00A3\u20AC\u00A5\s]*([\d,]+\.?\d*)'
		]
		for pattern in amount_patterns:
			m = re.search(pattern, text)
			if m:
				amount_str = m.group(1).replace(',', '')
				try:
					data["amount"] = float(amount_str)
				except:
					pass
				break
		
		# GSTIN
		gstin_pattern = r'([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})'
		m = re.search(gstin_pattern, text)
		if m:
			data["gstin"] = m.group(1)
		
		return data 