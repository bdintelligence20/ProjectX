import sqlite3
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, declarative_base

# Setup SQLAlchemy Base and Engine for use in the application
Base = declarative_base()
engine = create_engine('sqlite:///users.db')
SessionLocal = sessionmaker(bind=engine)

# Define the User model
class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    username = Column(String(150), nullable=False, unique=True)
    email = Column(String(150), nullable=False, unique=True)
    name = Column(String(150), nullable=False)
    hashed_password = Column(String(255), nullable=False)

    def set_password(self, password):
        import bcrypt
        self.hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password):
        import bcrypt
        return bcrypt.checkpw(password.encode('utf-8'), self.hashed_password.encode('utf-8'))

    def __repr__(self):
        return f"<User {self.username}>"

# Create all tables
Base.metadata.create_all(engine)

# Functions for managing user data via SQLAlchemy
def create_user(username, email, name, password):
    session = SessionLocal()
    try:
        user = User(username=username, email=email, name=name)
        user.set_password(password)
        session.add(user)
        session.commit()
    except Exception as e:
        session.rollback()
        raise e
    finally:
        session.close()

def get_user_by_username_or_email(identifier):
    session = SessionLocal()
    try:
        return session.query(User).filter((User.username == identifier) | (User.email == identifier)).first()
    finally:
        session.close()

# SQLite-specific functions for the Sources database
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

