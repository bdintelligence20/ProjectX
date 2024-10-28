from flask import Flask, request, jsonify
import os
import jwt
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

db = SQLAlchemy()
bcrypt = Bcrypt()

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.secret_key = os.getenv('SECRET_KEY')

    db.init_app(app)
    bcrypt.init_app(app)
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

    return app

def verify_supabase_jwt(jwt_token):
    """Verify JWT token using the secret key from Supabase."""
    try:
        secret = os.getenv('SUPABASE_SERVICE_ROLE_SECRET')
        decoded_token = jwt.decode(jwt_token, secret, algorithms=["HS256"])
        return decoded_token
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

app = create_app()

@app.route('/protected', methods=['GET'])
def protected():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"message": "Missing token"}), 401

    token = auth_header.split(" ")[1]
    user = verify_supabase_jwt(token)
    if user:
        return jsonify({"message": f"Hello, {user['email']}"}), 200
    else:
        return jsonify({"message": "Invalid token"}), 401

if __name__ == "__main__":
    app.run(debug=True)
