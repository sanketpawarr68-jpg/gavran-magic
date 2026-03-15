from flask import Blueprint, request, jsonify
from extensions import get_db
from bson import ObjectId
import os

settings_bp = Blueprint('settings', __name__)

@settings_bp.route('/', methods=['GET'])
def get_settings():
    db = get_db()
    # We only have one settings document
    settings = db.settings.find_one({"type": "global"})
    if settings:
        settings['_id'] = str(settings['_id'])
        return jsonify(settings), 200
    
    # Default settings if none exist
    default_settings = {
        "type": "global",
        "refund_hour_grace_period": 24,
        "refund_policy_text": "You can request a refund within the grace period after placing your order.",
        "return_policy_text": "Products can be returned if they are damaged or incorrect upon delivery.",
        "store_name": "Gavran Magic",
        "store_email": "contact@gavranmagic.com",
        "store_phone": "+91 9876543210",
        "store_address": "Pune, Maharashtra, India"
    }
    return jsonify(default_settings), 200

@settings_bp.route('/keys/razorpay', methods=['GET'])
def get_razorpay_key():
    return jsonify({'key': os.getenv('RAZORPAY_KEY_ID')}), 200

@settings_bp.route('/', methods=['POST'])
def update_settings():
    db = get_db()
    data = request.json
    
    update_data = {
        "refund_hour_grace_period": data.get('refund_hour_grace_period', 24),
        "refund_policy_text": data.get('refund_policy_text', ""),
        "return_policy_text": data.get('return_policy_text', ""),
        "store_name": data.get('store_name', "Gavran Magic"),
        "store_email": data.get('store_email', "contact@gavranmagic.com"),
        "store_phone": data.get('store_phone', "+91 9876543210"),
        "store_address": data.get('store_address', "Pune, Maharashtra, India")
    }
    
    db.settings.update_one(
        {"type": "global"},
        {"$set": update_data},
        upsert=True
    )
    
    return jsonify({"message": "Settings updated successfully"}), 200
