from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Load environment variables from the .env file
load_dotenv()

# Initialize extensions without an app context yet
db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)

    # Set up configurations
    db_path = os.path.join(os.getcwd(), 'users.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')  # Load JWT secret key from environment variables
    app.secret_key = os.getenv('SECRET_KEY')  # Load Flask secret key from environment variables for sessions

    # Initialize extensions with app
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    # Properly configure CORS to allow the frontend domain
    CORS(app, resources={r"/auth/*": {"origins": "https://orange-chainsaw-jj4w954456jj2jqqv-3000.app.github.dev"}})

    # Import routes here to avoid circular imports
    from .routes import bp
    app.register_blueprint(bp)

    return app
