from flask_pymongo import PyMongo
from pymongo import MongoClient
import os

mongo = PyMongo()

def get_db():
    """Always returns a valid database object, even if mongo.db is None."""
    if mongo.db is not None:
        return mongo.db
    # Fallback: connect directly using env var
    uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/gavran_magic')
    client = MongoClient(uri)
    # Extract db name from URI or use default
    db_name = uri.split('/')[-1].split('?')[0] or 'gavran_magic'
    return client[db_name]

