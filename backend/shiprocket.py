
import requests
import json
from config import Config

class ShiprocketAPI:
    def __init__(self):
        self.base_url = Config.SHIPROCKET_BASE_URL
        self.email = Config.SHIPROCKET_EMAIL
        self.password = Config.SHIPROCKET_PASSWORD
        self.token = None

    def authenticate(self):
        url = f"{self.base_url}/auth/login"
        payload = {
            "email": self.email,
            "password": self.password
        }
        try:
            response = requests.post(url, json=payload)
            if response.status_code == 200:
                self.token = response.json().get('token')
                return True
            else:
                print(f"Shiprocket Authentication Failed: {response.text}")
                return False
        except Exception as e:
            print(f"Error authenticating to Shiprocket: {e}")
            return False
            
    def _get_headers(self):
        if not self.token:
            if not self.authenticate():
                return None
        return {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.token}'
        }

    def check_serviceability(self, pickup_pincode, delivery_pincode, weight=0.5, cod=1):
        url = f"{self.base_url}/courier/serviceability"
        params = {
            "pickup_postcode": pickup_pincode,
            "delivery_postcode": delivery_pincode,
            "cod": cod,
            "weight": weight
        }
        headers = self._get_headers()
        if not headers:
             return {"status": "error", "message": "Authentication failed"}

        try:
            response = requests.get(url, headers=headers, params=params)
             # Note: Typically, shiprocket returns 200 even for no serviceability, check specific fields
            if response.status_code == 200:
                 return response.json()
            return {"status": "error", "message": response.text}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def create_order(self, order_data):
        url = f"{self.base_url}/orders/create/adhoc"
        headers = self._get_headers()
        if not headers:
             return {"status": "error", "message": "Authentication failed"}

        try:
            response = requests.post(url, headers=headers, json=order_data)
            if response.status_code == 200:
                return response.json()
            return {"status": "error", "message": response.text}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def get_tracking(self, shipment_id): # Or AWB
         # Tracking typically by AWB or Order ID
         pass 

