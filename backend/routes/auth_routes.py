from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import mongo
from config import Config
import jwt
import datetime

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        if not data:
            return jsonify({'message': 'Invalid input'}), 400
        
        users = mongo.db.users
        existing_user = users.find_one({'email': data['email']})
        
        if existing_user:
            return jsonify({'message': 'User already exists'}), 409
            
        hashed_password = generate_password_hash(data['password'])
        
        user_id = users.insert_one({
            'name': data['name'],
            'email': data['email'],
            'phone': data['phone'],
            'password': hashed_password,
            'address': data.get('address', ''),
            'city': data.get('city', ''),
            'pincode': data.get('pincode', '')
        }).inserted_id
        
        return jsonify({'message': 'User registered successfully', 'id': str(user_id)}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing email or password'}), 400
        
    user = mongo.db.users.find_one({'email': data['email']})
    
    if user and check_password_hash(user['password'], data['password']):
        token = jwt.encode({
            'user_id': str(user['_id']),
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, Config.JWT_SECRET)
        
        return jsonify({'token': token, 'name': user['name']}), 200
        
    return jsonify({'message': 'Invalid credentials'}), 401
