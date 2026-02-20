from flask import Blueprint, jsonify, request
from extensions import mongo
from bson import ObjectId

product_bp = Blueprint('product_bp', __name__)

DEFAULTS = [
    {
        "name": "Vermicelli",
        "description": "Handmade traditional vermicelli",
        "weight": "500g",
        "price": 80,
        "image": "images/vermicelli.jpg"
    },
    {
        "name": "Vermicelli",
        "description": "Handmade traditional vermicelli (Bulk)",
        "weight": "1kg",
        "price": 150,
        "image": "images/vermicelli.jpg"
    },
    {
        "name": "Kurdai",
        "description": "Sun-dried Maharashtrian snack",
        "weight": "250g",
        "price": 70,
        "image": "images/kurdai.jpg"
    },
    {
        "name": "Kurdai",
        "description": "Sun-dried Maharashtrian snack (Bulk)",
        "weight": "500g",
        "price": 130,
        "image": "images/kurdai.jpg"
    },
    {
        "name": "Papad",
        "description": "Homemade crispy papad",
        "weight": "250g",
        "price": 90,
        "image": "images/papad.jpg"
    },
    {
        "name": "Papad",
        "description": "Homemade crispy papad (Bulk)",
        "weight": "500g",
        "price": 170,
        "image": "images/papad.jpg"
    }
]

@product_bp.route('/', methods=['GET'])
def get_products():
    products_coll = mongo.db.products
    if products_coll.count_documents({}) == 0:
        products_coll.insert_many(DEFAULTS)
    
    products = []
    for p in products_coll.find():
        p['_id'] = str(p['_id'])
        products.append(p)
    return jsonify(products), 200

@product_bp.route('/<id>', methods=['GET'])
def get_product(id):
    product = mongo.db.products.find_one({'_id': ObjectId(id)})
    if product:
        product['_id'] = str(product['_id'])
        return jsonify(product), 200
    return jsonify({'message': 'Product not found'}), 404

# Admin Routes
@product_bp.route('/', methods=['POST'])
def add_product():
    # In a real app, check for admin token
    data = request.json
    mongo.db.products.insert_one(data)
    return jsonify({'message': 'Product added'}), 201

@product_bp.route('/<id>', methods=['DELETE'])
def delete_product(id):
    mongo.db.products.delete_one({'_id': ObjectId(id)})
    return jsonify({'message': 'Product deleted'}), 200
