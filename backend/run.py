# run.py

from app import create_app, db
from db_utils import create_sources_table  # Import the function to create the source table

app = create_app()

with app.app_context():
    # Initialize the database tables (create if not exists)
    print("Creating all database tables...")
    db.create_all()
    create_sources_table()
    print("Database tables created successfully.")

if __name__ == "__main__":
    app.run(debug=True)
