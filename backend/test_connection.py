
import requests
import sys

try:
    print("Testing connection to http://127.0.0.1:5000/api/health...")
    response = requests.get("http://127.0.0.1:5000/api/health", timeout=2)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
