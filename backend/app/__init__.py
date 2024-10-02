from flask import Flask
from flask_cors import CORS  # Import CORS
from app.routes import bp as main_bp

def create_app():
    app = Flask(__name__)

    # Enable CORS for all routes, allowing requests from your frontend
    CORS(app, resources={r"/*": {"origins": "https://orange-chainsaw-jj4w954456jj2jqqv-3000.app.github.dev"}})

    # Register your routes
    app.register_blueprint(main_bp)
    
    return app
