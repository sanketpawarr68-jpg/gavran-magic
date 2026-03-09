from flask import Blueprint, jsonify, request
from extensions import get_db
from bson import ObjectId

product_bp = Blueprint('product_bp', __name__)

# Base URL for images — served from Netlify frontend /public/images/
IMAGE_BASE = "https://gavran-magic.netlify.app/images"

DEFAULTS = [
    {
        "name": "Vermicelli",
        "category": "Traditional Snacks",
        "description": "Handmade traditional vermicelli crafted with premium wheat.",
        "weight": "500g",
        "price": 80,
        "image": f"{IMAGE_BASE}/Vermicelli-500g.jpg",
        "images": [f"{IMAGE_BASE}/Vermicelli-500g.jpg", f"{IMAGE_BASE}/Vermicelli-1000g.jpg"],
        "stock": 100,
        "discount": 0
    },
    {
        "name": "Kurdai",
        "category": "Handmade Classics",
        "description": "Sun-dried Maharashtrian snack made from fermented wheat. Crispy and delicious!",
        "weight": "250g",
        "price": 70,
        "image": f"{IMAGE_BASE}/kurdai-250g.jpg",
        "images": [f"{IMAGE_BASE}/kurdai-250g.jpg", f"{IMAGE_BASE}/kurdai-500g.jpg"],
        "stock": 100,
        "discount": 0
    },
    {
        "name": "Papad",
        "category": "Traditional Snacks",
        "description": "Homemade crispy papad with classic spices and traditional flavor.",
        "weight": "250g",
        "price": 90,
        "image": f"{IMAGE_BASE}/papad-250g.jpg",
        "images": [f"{IMAGE_BASE}/papad-250g.jpg", f"{IMAGE_BASE}/papad-500g.jpg"],
        "stock": 100,
        "discount": 0
    }
]

@product_bp.route('/', methods=['GET'])
def get_products():
    """Fetch all products."""
    db = get_db()
    products_coll = db.products

    # Note: Removed auto-seeding logic here because it was causing deleted items 
    # (like Vermicelli) to instantly respawn when visiting the admin or shop page.

    products = list(products_coll.find())
    for p in products:
        p['_id'] = str(p['_id'])
        # Fallbacks for existing products
        if 'images' not in p:
            p['images'] = [p.get('image')] if p.get('image') else []
        if 'stock' not in p:
            p['stock'] = 100
        if 'discount' not in p:
            p['discount'] = 0
            
    return jsonify(products), 200


@product_bp.route('/<id>', methods=['GET'])
def get_product(id):
    db = get_db()
    product = db.products.find_one({'_id': ObjectId(id)})
    if product:
        product['_id'] = str(product['_id'])
        if 'images' not in product:
            product['images'] = [product.get('image')] if product.get('image') else []
        if 'stock' not in product:
            product['stock'] = 100
        if 'discount' not in product:
            product['discount'] = 0
        return jsonify(product), 200
    return jsonify({'message': 'Product not found'}), 404

# --- Review Routes ---

@product_bp.route('/<id>/reviews', methods=['GET'])
def get_reviews(id):
    db = get_db()
    reviews = list(db.reviews.find({'product_id': id}).sort('timestamp', -1))
    for r in reviews:
        r['_id'] = str(r['_id'])
    return jsonify(reviews), 200

@product_bp.route('/<id>/reviews', methods=['POST'])
def add_review(id):
    db = get_db()
    data = request.json
    review = {
        "product_id": id,
        "user_name": data.get("user_name", "Anonymous"),
        "user_id": data.get("user_id", "guest"),
        "rating": int(data.get("rating", 5)),
        "title": data.get("title", ""),
        "comment": data.get("comment", ""),
        "photo": data.get("photo"), # base64 string
        "timestamp": data.get("timestamp") or ""
    }
    db.reviews.insert_one(review)
    return jsonify({"message": "Review added successfully"}), 201


# Admin Routes
@product_bp.route('/', methods=['POST'])
def add_product():
    db = get_db()
    data = request.json
    db.products.insert_one(data)
    return jsonify({'message': 'Product added'}), 201


@product_bp.route('/<id>', methods=['PUT'])
def update_product(id):
    db = get_db()
    data = request.json
    # MongoDB update requires $set if we only want to update specific fields
    db.products.update_one({'_id': ObjectId(id)}, {'$set': data})
    return jsonify({'message': 'Product updated'}), 200


@product_bp.route('/<id>', methods=['DELETE'])
def delete_product(id):
    db = get_db()
    db.products.delete_one({'_id': ObjectId(id)})
    return jsonify({'message': 'Product deleted'}), 200
