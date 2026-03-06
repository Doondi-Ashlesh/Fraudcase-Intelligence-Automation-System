import sys
import os
import uuid
import random
from datetime import datetime, timedelta, timezone
from faker import Faker

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.db.database import SessionLocal, Customer, Transaction, FraudEvent, init_db

fake = Faker()

def seed_data():
    print("--- STARTING VAULT SEEDING (POSTGRESQL) ---")
    db = SessionLocal()
    
    # 1. Initialize DB
    init_db()
    
    # 2. Create Customers
    print("Generating 50 customers...")
    customers = []
    for _ in range(50):
        c = Customer(
            id=f"acc_{uuid.uuid4().hex[:8]}",
            full_name=fake.name(),
            email=fake.email(),
            dob=fake.date_of_birth(minimum_age=18, maximum_age=90).isoformat(),
            address=fake.address().replace('\n', ', '),
            risk_score=round(random.uniform(0, 1), 2)
        )
        customers.append(c)
        db.add(c)
    
    db.commit()
    
    # 3. Create Transactions
    print("Generating 500 transactions...")
    categories = ["Electronics", "Food & Drink", "Banking", "Travel", "Retail", "Services"]
    locations = ["New York, USA", "London, UK", "Lagos, Nigeria", "Moscow, Russia", "Tokyo, Japan", "Berlin, Germany"]
    
    for c in customers:
        # Each customer gets 5-15 transactions
        for _ in range(random.randint(5, 15)):
            t = Transaction(
                id=f"tx_{uuid.uuid4().hex[:10]}",
                account_id=c.id,
                amount=round(random.uniform(10, 10000), 2),
                merchant=fake.company(),
                category=random.choice(categories),
                ip_address=fake.ipv4(),
                device_id=f"dev_{uuid.uuid4().hex[:6]}",
                geo_location=random.choice(locations),
                is_flagged=False,
                timestamp=datetime.now(timezone.utc) - timedelta(days=random.randint(0, 30))
            )
            db.add(t)
            
    db.commit()
    print("--- SEEDING COMPLETE: VAULT IS FULL ---")

if __name__ == "__main__":
    seed_data()
