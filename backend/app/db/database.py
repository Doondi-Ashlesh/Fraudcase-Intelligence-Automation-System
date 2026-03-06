from sqlalchemy import create_engine, Column, String, Float, Boolean, DateTime, ForeignKey, Integer, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from app.config import settings
import datetime

# PostgreSQL connection
engine = create_engine(settings.POSTGRES_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Customer(Base):
    __tablename__ = "customers"
    
    id = Column(String, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    dob = Column(String)
    address = Column(String)
    risk_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    transactions = relationship("Transaction", back_populates="owner")
    reports = relationship("FraudEvent", back_populates="customer")

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(String, primary_key=True, index=True)
    account_id = Column(String, ForeignKey("customers.id"))
    amount = Column(Float)
    currency = Column(String, default="USD")
    merchant = Column(String)
    category = Column(String)
    ip_address = Column(String)
    device_id = Column(String)
    geo_location = Column(String)
    is_flagged = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    owner = relationship("Customer", back_populates="transactions")

class FraudEvent(Base):
    __tablename__ = "fraud_events"
    
    id = Column(String, primary_key=True, index=True)
    customer_id = Column(String, ForeignKey("customers.id"))
    reason = Column(Text)
    status = Column(String) # Verified, Safe, Escalated
    priority = Column(String) # High, Medium, Low
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    customer = relationship("Customer", back_populates="reports")

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
