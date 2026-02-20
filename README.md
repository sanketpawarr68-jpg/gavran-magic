# Gavran Magic — Maharashtra Homemade Foods Delivery Platform

A fully functional end-to-end e-commerce website for homemade Maharashtrian food products, featuring Shiprocket API integration for delivery management.

## 🧰 Tech Stack
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Python Flask
- **Database**: MongoDB
- **Delivery**: Shiprocket API

## 📦 Prerequisites
1. **Python 3.8+** installed.
2. **MongoDB** installed and running locally on port 27017.
3. **Shiprocket Account** (for API credentials).

## 🚀 Setup & Installation

### 1. Clone/Navigate to Project
```bash
cd gavran-magic
```

### 2. Backend Setup
1. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # Mac/Linux:
   source venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Configure Environment Variables:
   - Rename `.env.example` to `.env` (if provided) or create `.env` in `backend/` directory.
   - Add your credentials:
     ```
     MONGO_URI=mongodb://localhost:27017/gavran_magic
     JWT_SECRET=your_secret_key
     SHIPROCKET_EMAIL=your_email@example.com
     SHIPROCKET_PASSWORD=your_password
     ```

### 3. Run the Application
1. Start MongoDB Service (if not running).
2. Start Flask Server:
   ```bash
   cd backend
   python app.py
   ```
   Server will start at `http://localhost:5000`.

### 4. Open Frontend
- Open `frontend/index.html` in your browser.
- Or use a simple HTTP server (recommended for proper routing):
  ```bash
  cd frontend
  python -m http.server 8000
  ```
  Then open `http://localhost:8000`.

## 🛒 Features
- **Product Listing**: View traditional Maharashtrian foods.
- **Cart & Checkout**: consistent shopping experience.
- **Pincode Validation**: Restricted to Maharashtra (400xxx-44xxxx).
- **Order Tracking**: Real-time status via Shiprocket (simulated if no credentials).
- **Admin**: Basic product management via API.

## 📂 Project Structure
```
gavran-magic/
├── frontend/       # UI (HTML/CSS/JS)
├── backend/        # Flask API
│   ├── routes/     # API Endpoints
│   ├── models/     # Data Models
│   └── shiprocket.py # Shipping Logic
└── database/       # Schema Docs
```
