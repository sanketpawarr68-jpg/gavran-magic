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
    offers = list(offers_coll.find().sort('created_at', -1))
    
    current_time = datetime.utcnow()
    
    for o in offers:
        o['_id'] = str(o['_id'])
        is_active = o.get('status') == 'active'
        o['is_currently_valid'] = is_active
        o['validity_reason'] = ""

        if not is_active:
            o['is_currently_valid'] = False
            o['validity_reason'] = "Campaign is inactive"
            continue

        try:
            # Handle start_date
            s_val = o.get('start_date')
            start_date = None
            if s_val:
                if 'T' in s_val:
                    start_date = datetime.fromisoformat(s_val.replace('Z', '+00:00')).replace(tzinfo=None)
                else:
                    start_date = datetime.strptime(s_val, '%Y-%m-%d')
            
            # Handle end_date
            e_val = o.get('end_date')
            end_date = None
            if e_val:
                if 'T' in e_val:
                    end_date = datetime.fromisoformat(e_val.replace('Z', '+00:00')).replace(tzinfo=None)
                else:
                    end_date = datetime.strptime(e_val, '%Y-%m-%d')
                    # If it's just a date, set it to the end of that day (23:59:59)
                    end_date = end_date.replace(hour=23, minute=59, second=59)

            if start_date and current_time < start_date:
                o['is_currently_valid'] = False
                o['validity_reason'] = f"Starts on {start_date.strftime('%d %b %Y')}"
            
            if end_date and current_time > end_date:
                o['is_currently_valid'] = False
                o['validity_reason'] = "Expired"
                
        except Exception as e:
            # If parsing fails, we fallback to just status check but keep it valid
            print(f"Date parsing error: {e}")
            pass
            
    return jsonify(offers), 200

@offer_bp.route('/', methods=['POST'])
def add_offer():
    db = get_db()
    data = request.json
    if 'code' in data:
        data['code'] = data['code'].strip().upper()
    data['created_at'] = datetime.utcnow().isoformat()
    db.offers.insert_one(data)
    return jsonify({'message': 'Offer created successfully'}), 201

@offer_bp.route('/<id>', methods=['PUT'])
def update_offer(id):
    db = get_db()
    data = request.json
    if '_id' in data:
        del data['_id']
    if 'code' in data:
        data['code'] = data['code'].strip().toUpperCase()
    db.offers.update_one({'_id': ObjectId(id)}, {'$set': data})
    return jsonify({'message': 'Offer updated successfully'}), 200

@offer_bp.route('/<id>', methods=['DELETE'])
def delete_offer(id):
    db = get_db()
    db.offers.delete_one({'_id': ObjectId(id)})
    return jsonify({'message': 'Offer deleted successfully'}), 200
