import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/gavran_magic')
    JWT_SECRET = os.getenv('JWT_SECRET', 'your_jwt_secret_key')
    SHIPROCKET_EMAIL = os.getenv('SHIPROCKET_EMAIL')
    SHIPROCKET_PASSWORD = os.getenv('SHIPROCKET_PASSWORD')
    SHIPROCKET_BASE_URL = "https://apiv2.shiprocket.in/v1/external"
    DEBUG = True
