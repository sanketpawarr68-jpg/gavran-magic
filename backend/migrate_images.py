"""
Run this once to force-update all product images in MongoDB to the correct Netlify URLs.
Usage: python migrate_images.py
"""
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
IMAGE_BASE = "https://gavran-magic.netlify.app/images"

# Complete desired product catalogue with correct images
PRODUCTS = [
    {"name": "Vermicelli", "weight": "500g",  "image": f"{IMAGE_BASE}/Vermicelli-500g.jpg",  "price": 80,  "description": "Handmade traditional vermicelli"},
    {"name": "Vermicelli", "weight": "1kg",   "image": f"{IMAGE_BASE}/Vermicelli-1000g.jpg", "price": 150, "description": "Handmade traditional vermicelli (Bulk)"},
    {"name": "Kurdai",     "weight": "250g",  "image": f"{IMAGE_BASE}/kurdai-250g.jpg",      "price": 70,  "description": "Sun-dried Maharashtrian snack"},
    {"name": "Kurdai",     "weight": "500g",  "image": f"{IMAGE_BASE}/kurdai-500g.jpg",      "price": 130, "description": "Sun-dried Maharashtrian snack (Bulk)"},
    {"name": "Papad",      "weight": "250g",  "image": f"{IMAGE_BASE}/papad-250g.jpg",       "price": 90,  "description": "Homemade crispy papad"},
    {"name": "Papad",      "weight": "500g",  "image": f"{IMAGE_BASE}/papad-500g.jpg",       "price": 170, "description": "Homemade crispy papad (Bulk)"},
]

client = MongoClient(MONGO_URI)
db = client.get_default_database()
products_coll = db.products

print(f"Total products in DB: {products_coll.count_documents({})}")

# Drop and re-insert for a clean slate
products_coll.drop()
products_coll.insert_many(PRODUCTS)
print(f"✅ Inserted {len(PRODUCTS)} products with correct images.")

for p in products_coll.find():
    print(f"  • {p['name']} {p['weight']} → {p['image']}")

client.close()
