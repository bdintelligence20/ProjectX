from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client
import os

# Load environment variables
load_dotenv()

# Set up Flask app
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.secret_key = os.getenv('SECRET_KEY')

# Set larger max content length (5GB)
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024 * 1024

# Increase request timeouts
app.config['PERMANENT_SESSION_LIFETIME'] = 300  # 5 minutes

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_SECRET")
app.supabase = create_client(supabase_url, supabase_key)

# Configure CORS
CORS(app, resources={
    r"/*": {
        "origins": ["https://projectx-frontend-3owg.onrender.com"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Set up extensions
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Register blueprints for routes
from app.routes import bp
app.register_blueprint(bp)

if __name__ == "__main__":
    with app.app_context():
        print("Creating all database tables...")
        db.create_all()
        print("Database tables created successfully.")
    app.run(debug=True)
