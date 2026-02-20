from flask_pymongo import PyMongo
from pymongo import MongoClient
import os

mongo = PyMongo()

# Cache the direct client so we only create it once
_direct_client = None
_direct_db = None

def get_db():
    """Returns a valid database object, with fallback to direct PyMongo connection."""
    global _direct_client, _direct_db

    # Try flask-pymongo first
    if mongo.db is not None:
        return mongo.db

    # Fallback: direct connection (cached)
    if _direct_db is not None:
        return _direct_db

    uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/gavran_magic')
    _direct_client = MongoClient(
        uri,
        serverSelectionTimeoutMS=30000,  # 30 second timeout
        connectTimeoutMS=30000,
        socketTimeoutMS=30000
    )
    # Extract db name from URI or use default
    db_name = uri.split('/')[-1].split('?')[0].strip()
    if not db_name:
        db_name = 'gavran_magic'
    _direct_db = _direct_client[db_name]
    return _direct_db

