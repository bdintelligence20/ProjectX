from app import create_app
from db_utils import create_sources_table  # Import the function to create the table

app = create_app()

# Initialize the database tables
create_sources_table()

if __name__ == "__main__":
    app.run(debug=True)
