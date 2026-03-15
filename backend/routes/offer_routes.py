from flask import Blueprint, jsonify, request
from extensions import get_db
from bson import ObjectId
from datetime import datetime

offer_bp = Blueprint('offer_bp', __name__)

@offer_bp.route('/', methods=['GET'])
def get_offers():
    """Fetch all offers."""
    db = get_db()
    offers_coll = db.offers
    offers = list(offers_coll.find())
    
    current_time = datetime.now()
    
    for o in offers:
        o['_id'] = str(o['_id'])
        # Add a derived 'is_active_now' field based on dates
        try:
            start_date = datetime.fromisoformat(o.get('start_date').replace('Z', '+00:00')) if o.get('start_date') else None
            end_date = datetime.fromisoformat(o.get('end_date').replace('Z', '+00:00')) if o.get('end_date') else None
            
            is_active = o.get('status') == 'active'
            if start_date and current_time < start_date:
                is_active = False
            if end_date and current_time > end_date:
                is_active = False
                
            o['is_currently_valid'] = is_active
        except Exception:
            o['is_currently_valid'] = o.get('status') == 'active'
            
    return jsonify(offers), 200

@offer_bp.route('/', methods=['POST'])
def add_offer():
    db = get_db()
    data = request.json
    data['created_at'] = datetime.now().isoformat()
    db.offers.insert_one(data)
    return jsonify({'message': 'Offer created successfully'}), 201

@offer_bp.route('/<id>', methods=['PUT'])
def update_offer(id):
    db = get_db()
    data = request.json
    if '_id' in data:
        del data['_id']
    db.offers.update_one({'_id': ObjectId(id)}, {'$set': data})
    return jsonify({'message': 'Offer updated successfully'}), 200

@offer_bp.route('/<id>', methods=['DELETE'])
def delete_offer(id):
    db = get_db()
    db.offers.delete_one({'_id': ObjectId(id)})
    return jsonify({'message': 'Offer deleted successfully'}), 200
