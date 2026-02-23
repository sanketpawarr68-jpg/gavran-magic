from flask import Blueprint, jsonify, request
from extensions import get_db
from bson import ObjectId

product_bp = Blueprint('product_bp', __name__)

# Base URL for images — served from Netlify frontend /public/images/
IMAGE_BASE = "https://gavran-magic.netlify.app/images"

DEFAULTS = [
    {
        "name": "Vermicelli",
        "description": "Handmade traditional vermicelli",
        "weight": "500g",
        "price": 80,
        "image": f"{IMAGE_BASE}/Vermicelli-500g.jpg"
    },
    {
        "name": "Vermicelli",
        "description": "Handmade traditional vermicelli (Bulk)",
        "weight": "1kg",
        "price": 150,
        "image": f"{IMAGE_BASE}/Vermicelli-1000g.jpg"
    },
    {
        "name": "Kurdai",
        "description": "Sun-dried Maharashtrian snack",
        "weight": "250g",
        "price": 70,
        "image": f"{IMAGE_BASE}/kurdai-250g.jpg"
    },
    {
        "name": "Kurdai",
        "description": "Sun-dried Maharashtrian snack (Bulk)",
        "weight": "500g",
        "price": 130,
        "image": f"{IMAGE_BASE}/kurdai-500g.jpg"
    },
    {
        "name": "Papad",
        "description": "Homemade crispy papad",
        "weight": "250g",
        "price": 90,
        "image": f"{IMAGE_BASE}/papad-250g.jpg"
    },
    {
        "name": "Papad",
        "description": "Homemade crispy papad (Bulk)",
        "weight": "500g",
        "price": 170,
        "image": f"{IMAGE_BASE}/papad-500g.jpg"
    }
]

@product_bp.route('/', methods=['GET'])
def get_products():
    """Fetch all products. Seeding occurs only if the collection is empty."""
    db = get_db()
    products_coll = db.products

    # Seed if empty
    if products_coll.count_documents({}) == 0:
        products_coll.insert_many(DEFAULTS)

    # Auto-fix: update any stale image URLs in DB (old typo or localhost URLs)
    wrong_url_patterns = ["garvran-magic.netlify.app", "localhost:5000"]
    for pattern in wrong_url_patterns:
        stale = list(products_coll.find({"image": {"$regex": pattern}}))
        for p in stale:
            correct_image = str(p['image']).replace(pattern, "gavran-magic.netlify.app")
            products_coll.update_one({"_id": p["_id"]}, {"$set": {"image": correct_image}})

    # Return all products with corrected URLs
    products = list(products_coll.find())
    for p in products:
        p['_id'] = str(p['_id'])
        # Fallback: ensure image URL is always correct even if DB fix missed something
        if p.get('image'):
            p['image'] = p['image'].replace("garvran-magic.netlify.app", "gavran-magic.netlify.app")

    response = jsonify(products)
    response.headers['Cache-Control'] = 'public, max-age=3600'
    return response, 200


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
