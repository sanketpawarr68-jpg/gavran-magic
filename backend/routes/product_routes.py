from flask import Blueprint, jsonify, request
from extensions import get_db
from bson import ObjectId

product_bp = Blueprint('product_bp', __name__)

# Base URL for images (served from GitHub Pages frontend)
IMAGE_BASE = "https://sanketpawarr68-jpg.github.io/gavran-magic/images"

DEFAULTS = [
    {
        "name": "Vermicelli",
        "description": "Handmade traditional vermicelli",
        "weight": "500g",
        "price": 80,
        "image": f"{IMAGE_BASE}/Vermicelli.jpg"
    },
    {
        "name": "Vermicelli",
        "description": "Handmade traditional vermicelli (Bulk)",
        "weight": "1kg",
        "price": 150,
        "image": f"{IMAGE_BASE}/Vermicelli.jpg"
    },
    {
        "name": "Kurdai",
        "description": "Sun-dried Maharashtrian snack",
        "weight": "250g",
        "price": 70,
        "image": f"{IMAGE_BASE}/kurdai.avif"
    },
    {
        "name": "Kurdai",
        "description": "Sun-dried Maharashtrian snack (Bulk)",
        "weight": "500g",
        "price": 130,
        "image": f"{IMAGE_BASE}/kurdai.avif"
    },
    {
        "name": "Papad",
        "description": "Homemade crispy papad",
        "weight": "250g",
        "price": 90,
        "image": f"{IMAGE_BASE}/papad.jpg"
    },
    {
        "name": "Papad",
        "description": "Homemade crispy papad (Bulk)",
        "weight": "500g",
        "price": 170,
        "image": f"{IMAGE_BASE}/papad.jpg"
    }
]

# Mapping of old wrong paths -> correct full URLs
IMAGE_FIXES = {
    "images/vermicelli.jpg": f"{IMAGE_BASE}/Vermicelli.jpg",
    "images/kurdai.jpg":     f"{IMAGE_BASE}/kurdai.avif",
    "images/papad.jpg":      f"{IMAGE_BASE}/papad.jpg",
}

@product_bp.route('/', methods=['GET'])
def get_products():
    db = get_db()
    products_coll = db.products
    if products_coll.count_documents({}) == 0:
        products_coll.insert_many(DEFAULTS)
    else:
        # Migrate any existing products with old relative image paths
        for old_path, new_url in IMAGE_FIXES.items():
            products_coll.update_many(
                {"image": old_path},
                {"$set": {"image": new_url}}
            )
    
    products = []
    for p in products_coll.find():
        p['_id'] = str(p['_id'])
        products.append(p)
    return jsonify(products), 200

@product_bp.route('/<id>', methods=['GET'])
def get_product(id):
    db = get_db()
    product = db.products.find_one({'_id': ObjectId(id)})
    if product:
        product['_id'] = str(product['_id'])
        return jsonify(product), 200
    return jsonify({'message': 'Product not found'}), 404

# Admin Routes
@product_bp.route('/', methods=['POST'])
def add_product():
    db = get_db()
    data = request.json
    db.products.insert_one(data)
    return jsonify({'message': 'Product added'}), 201

@product_bp.route('/<id>', methods=['DELETE'])
def delete_product(id):
    db = get_db()
    db.products.delete_one({'_id': ObjectId(id)})
    return jsonify({'message': 'Product deleted'}), 200
