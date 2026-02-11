from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models.user import User
import re

auth_bp = Blueprint('auth', __name__)

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        email = data.get('email', '').lower().strip()
        password = data.get('password', '')
        name = data.get('name', '').strip()
        
        if not email or not password or not name:
            return jsonify({'error': 'All fields are required'}), 400
        
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
        existing_user = User.find_by_email(email)
        if existing_user:
            return jsonify({'error': 'Email already registered'}), 400
        
        user_id = User.create_user(email, password, name)
        access_token = create_access_token(identity=user_id)
        
        return jsonify({
            'message': 'User registered successfully',
            'access_token': access_token,
            'user': {
                'id': user_id,
                'email': email,
                'name': name,
                'role': 'student'
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email', '').lower().strip()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        user = User.find_by_email(email)
        if not user or not User.verify_password(user['password'], password):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # In Supabase, ID is already a string (UUID)
        user_id = user['id']
        access_token = create_access_token(identity=user_id)
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': {
                'id': user_id,
                'email': user['email'],
                'name': user['name'],
                'role': user['role'],
                'points': user.get('points', 0),
                'badges': user.get('badges', [])
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        user = User.find_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user': {
                'id': user['id'],
                'email': user['email'],
                'name': user['name'],
                'role': user['role'],
                'points': user.get('points', 0),
                'badges': user.get('badges', [])
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    try:
        leaderboard = User.get_leaderboard()
        formatted_leaderboard = []
        
        for i, user in enumerate(leaderboard):
            formatted_leaderboard.append({
                'rank': i + 1,
                'name': user['name'],
                'points': user.get('points', 0),
                'badges': user.get('badges', [])
            })
        
        return jsonify({'leaderboard': formatted_leaderboard}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500