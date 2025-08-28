from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# Create database directory if it doesn't exist
os.makedirs(os.path.dirname(__file__), exist_ok=True)

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./db/database.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Passenger(Base):
    __tablename__ = "passengers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    pnr = Column(String, unique=True, index=True)
    download_status = Column(String, default="Pending")  # Pending, Success, Not Found, Error
    parse_status = Column(String, default="Pending")     # Pending, Success, Error
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Invoice(Base):
    __tablename__ = "invoices"
    
    id = Column(Integer, primary_key=True, index=True)
    pnr = Column(String, index=True)
    invoice_number = Column(String, index=True)
    invoice_date = Column(DateTime)
    airline = Column(String, index=True)
    amount = Column(Float)
    gstin = Column(String, nullable=True)
    pdf_path = Column(String)
    flag_for_review = Column(Boolean, default=False)
    raw_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 