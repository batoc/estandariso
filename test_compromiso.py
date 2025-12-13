import os
import requests
import json
from datetime import datetime

url = "https://dlprwnauavbizoclboqt.supabase.co/rest/v1/compromisos"
headers = {
    "apikey": "sb_publishable_ElgAI9bT_MbuuIGlYkMbIQ_2Wz5V2lh",
    "Authorization": "Bearer sb_publishable_ElgAI9bT_MbuuIGlYkMbIQ_2Wz5V2lh",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

data = {
    "descripcion": "Test compromiso from script",
    "responsable": "Tester",
    "fecha_compromiso": datetime.now().strftime("%Y-%m-%d"),
    "estado": "pendiente"
}

response = requests.post(url, headers=headers, json=data)

print(f"Status Code: {response.status_code}")
print(f"Response: {response.text}")
