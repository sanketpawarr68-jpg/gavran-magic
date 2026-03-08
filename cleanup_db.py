import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Try to find .env in both possible dirs
env_path = os.path.join(os.path.dirname(__file__), 'backend', '.env')
load_dotenv(env_path)

MONGO_URI = os.getenv('MONGO_URI')

if not MONGO_URI:
    print("MONGO_URI not found.")
    exit(1)

client = MongoClient(MONGO_URI)
db = client.get_database() # or specific name if known

def cleanup_duplicates():
    products = list(db.products.find())
    seen = {}
    duplicates = []
    
    for p in products:
        name = p.get('name')
        if name in seen:
            duplicates.append(p['_id'])
        else:
            seen[name] = True
            
    if duplicates:
        print(f"Found {len(duplicates)} duplicates. Deleting...")
        db.products.delete_many({'_id': {'$in': duplicates}})
        print("Deleted.")
    else:
        print("No duplicates found.")

if __name__ == "__main__":
    cleanup_duplicates()
