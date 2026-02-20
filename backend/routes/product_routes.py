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

# Migrate ALL old / wrong image URLs to new correct Netlify URLs
IMAGE_FIXES = {
    # Old relative paths
    "images/vermicelli.jpg":  f"{IMAGE_BASE}/Vermicelli-500g.jpg",
    "images/kurdai.jpg":      f"{IMAGE_BASE}/kurdai-250g.jpg",
    "images/papad.jpg":       f"{IMAGE_BASE}/papad-250g.jpg",
    # Old GitHub Pages full URLs (generic filenames)
    "https://sanketpawarr68-jpg.github.io/gavran-magic/images/Vermicelli.jpg":  f"{IMAGE_BASE}/Vermicelli-500g.jpg",
    "https://sanketpawarr68-jpg.github.io/gavran-magic/images/kurdai.avif":     f"{IMAGE_BASE}/kurdai-250g.jpg",
    "https://sanketpawarr68-jpg.github.io/gavran-magic/images/papad.jpg":       f"{IMAGE_BASE}/papad-250g.jpg",
    # Old GitHub Pages full URLs (weight-specific but wrong extension)
    "https://sanketpawarr68-jpg.github.io/gavran-magic/images/Vermicelli-500g.jpg":  f"{IMAGE_BASE}/Vermicelli-500g.jpg",
    "https://sanketpawarr68-jpg.github.io/gavran-magic/images/Vermicelli-1000g.jpg": f"{IMAGE_BASE}/Vermicelli-1000g.jpg",
    "https://sanketpawarr68-jpg.github.io/gavran-magic/images/kurdai-250g.avif":     f"{IMAGE_BASE}/kurdai-250g.jpg",
    "https://sanketpawarr68-jpg.github.io/gavran-magic/images/kurdai-500g.avif":     f"{IMAGE_BASE}/kurdai-500g.jpg",
    "https://sanketpawarr68-jpg.github.io/gavran-magic/images/papad-250g.jpg":       f"{IMAGE_BASE}/papad-250g.jpg",
    "https://sanketpawarr68-jpg.github.io/gavran-magic/images/papad-500g.jpg":       f"{IMAGE_BASE}/papad-500g.jpg",
}

@product_bp.route('/', methods=['GET'])
def get_products():
    db = get_db()
    products_coll = db.products

    if products_coll.count_documents({}) == 0:
        # Fresh DB — seed with defaults
        products_coll.insert_many(DEFAULTS)
    else:
        # Migrate existing products with any old/wrong image paths
        for old_url, new_url in IMAGE_FIXES.items():
            products_coll.update_many(
                {"image": old_url},
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
