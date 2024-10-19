# run.py
from app import create_app, db
from db_utils import create_sources_table, initialize_db  # Import the function to create the source table

app = create_app()

with app.app_context():
    # Initialize the database tables (create if not exists)
    db.create_all()
    create_sources_table()
    initialize_db()  # For the SQLAlchemy users table

if __name__ == "__main__":
    app.run(debug=True)
