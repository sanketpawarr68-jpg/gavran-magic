from flask import Flask, jsonify
from flask_cors import CORS
from extensions import connect_db

# Import Blueprints
from routes.auth_routes import auth_bp
from routes.product_routes import product_bp
from routes.order_routes import order_bp

app = Flask(__name__)
CORS(app)

# Connect to MongoDB at startup
connect_db()

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(product_bp, url_prefix='/api/products')
app.register_blueprint(order_bp, url_prefix='/api/orders')

@app.route('/')
def home():
    return jsonify({"message": "Welcome to Gavran Magic API"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
