from flask import Flask
from flask_cors import CORS  # Import CORS to handle cross-origin requests
from app.routes import bp as main_bp

def create_app():
    app = Flask(__name__)

    # Enable CORS for the entire app
    CORS(app)

    # Register blueprint for the routes
    app.register_blueprint(main_bp)

    return app
