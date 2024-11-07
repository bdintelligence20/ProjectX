from db_utils import create_sources_table, engine, Base  # Import functions and database setup

# Flask application
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Set up Flask app
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.secret_key = os.getenv('SECRET_KEY')

# Set up extensions
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
CORS(app, resources={r"/auth/*": {"origins": "https://orange-chainsaw-jj4w954456jj2jqqv-3000.app.github.dev"}})

# Create tables for users.db
with app.app_context():
    print("Creating all database tables...")
    Base.metadata.create_all(engine)
    create_sources_table()
    print("Database tables created successfully.")

# Register blueprints for routes
from app.routes import bp
app.register_blueprint(bp)

if __name__ == "__main__":
    app.run(debug=True)


app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024 * 1024  # 5 GB
