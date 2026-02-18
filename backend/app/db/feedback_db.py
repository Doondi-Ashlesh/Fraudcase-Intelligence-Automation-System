import sqlite3
from app.config import settings
import os
import re

def get_db_path():
    """Extracts the file path from the sqlite:/// URI."""
    # Matches sqlite:///path (3 slashes) or sqlite://path (2 slashes)
    match = re.match(r"sqlite:///+(.*)", settings.DATABASE_URL)
    if match:
        path = match.group(1)
        # On Windows, path might be 'C:\path' or '/C:/path'
        if os.name == 'nt' and path.startswith('/'):
            path = path[1:]
        return path
    return settings.DATABASE_URL # Fallback

def init_db():
    db_path = get_db_path()
    db_dir = os.path.dirname(db_path)
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            query TEXT,
            answer TEXT,
            rating TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

def save_feedback(query: str, answer: str, rating: str):
    db_path = get_db_path()
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO feedback (query, answer, rating) VALUES (?, ?, ?)",
        (query, answer, rating)
    )
    conn.commit()
    conn.close()
