from flask import Flask, jsonify
from flask_cors import CORS
from extensions import connect_db

# Import Blueprints
from routes.auth_routes import auth_bp
from routes.product_routes import product_bp
from routes.order_routes import order_bp
from routes.settings_routes import settings_bp
from routes.offer_routes import offer_bp

app = Flask(__name__)
CORS(app)

# Connect to MongoDB on first request (lazy load)
# Removed explicit connect_db() call to speed up Render startup

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(product_bp, url_prefix='/api/products')
app.register_blueprint(order_bp, url_prefix='/api/orders')
app.register_blueprint(settings_bp, url_prefix='/api/settings')
app.register_blueprint(offer_bp, url_prefix='/api/offers')

@app.route('/')
def home():
    return jsonify({"message": "Welcome to Gavran Magic API"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
