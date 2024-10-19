# app/auth_routes.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from . import db, bcrypt  # Import bcrypt for password hashing
from .models import User

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')  # Adding url_prefix for better routing

@auth_bp.route('/register', methods=['POST', 'OPTIONS'])
def register():
    """
    Endpoint to handle user registration.
    """
    if request.method == 'OPTIONS':
        return jsonify({"message": "Preflight check passed"}), 200

    try:
        # Get request data
        data = request.json
        username = data.get('username')
        password = data.get('password')

        # Validate input
        if not username or not password:
            return jsonify({"error": "Username and password are required"}), 400

        # Check if the user already exists in the database
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            return jsonify({"error": "Username already exists"}), 409

        # Hash the password using bcrypt
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        # Create and save the new user
        new_user = User(username=username, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@auth_bp.route('/login', methods=['POST', 'OPTIONS'])
def login():
    """
    Endpoint to handle user login and token generation.
    """
    if request.method == 'OPTIONS':
        return jsonify({"message": "Preflight check passed"}), 200

    try:
        # Get request data
        data = request.json
        username = data.get('username')
        password = data.get('password')

        # Validate user existence
        user = User.query.filter_by(username=username).first()
        if user and bcrypt.check_password_hash(user.password, password):
            # Create a JWT access token for the user
            access_token = create_access_token(identity=user.id)
            return jsonify(access_token=access_token), 200

        return jsonify({"error": "Invalid username or password"}), 401
    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@auth_bp.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    """
    Example protected route to check JWT functionality.
    """
    try:
        # Access the current user's identity using JWT
        current_user_id = get_jwt_identity()
        return jsonify({"message": f"Hello, user {current_user_id}!"}), 200
    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500
