# db_utils.py

import sqlite3
from app import db, create_app
from app.models import User

# Existing SQLite functions
def get_db_connection():
    conn = sqlite3.connect('sources.db')
    conn.row_factory = sqlite3.Row
    return conn

def create_sources_table():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS Sources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source_id TEXT NOT NULL,
            source_type TEXT NOT NULL,
            title TEXT NOT NULL,
            content TEXT,
            date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'unprocessed'
        )
    ''')
    conn.commit()
    conn.close()

def insert_source(source_id, source_type, title, content):
    conn = get_db_connection()
    conn.execute('''
        INSERT INTO Sources (source_id, source_type, title, content)
        VALUES (?, ?, ?, ?)
    ''', (source_id, source_type, title, content))
    conn.commit()
    conn.close()

def get_all_sources():
    conn = get_db_connection()
    sources = conn.execute('SELECT * FROM Sources').fetchall()
    conn.close()
    return sources

# New SQLAlchemy-based functions for users table
def initialize_db():
    app = create_app()
    with app.app_context():
        # Create all tables defined in the SQLAlchemy models (User table)
        db.create_all()

# Usage of initialize_db should happen during app initialization or explicitly
