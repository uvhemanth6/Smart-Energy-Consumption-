import numpy as np
import pandas as pd
from flask import Flask, request, jsonify, render_template
import pickle
import os
from datetime import datetime

app = Flask(__name__)

# Load Model and Scaler
MODEL_PATH = 'models/smart_energy_model.pkl'
SCALER_PATH = 'models/scaler.pkl'

model = None
scaler = None

def load_artifacts():
    global model, scaler
    if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
        with open(MODEL_PATH, 'rb') as f:
            model = pickle.load(f)
        with open(SCALER_PATH, 'rb') as f:
            scaler = pickle.load(f)
        print("Model and Scaler loaded successfully.")
    else:
        print("Error: Model or Scaler not found. Please run the notebook to save them.")

load_artifacts()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if not model or not scaler:
        return jsonify({'error': 'Model not loaded'}), 500

    try:
        data = request.json
        
        # Extract inputs
        air_temp = float(data['air_temperature'])
        dew_point = float(data['dew_point_temperature'])
        humidity = float(data['relative_humidity'])
        wind_speed = float(data['wind_speed'])
        wind_dir = float(data['wind_direction'])
        
        # Time features
        timestamp = pd.to_datetime(data['timestamp'])
        hour = timestamp.hour
        day = timestamp.day
        month = timestamp.month
        day_of_week = timestamp.dayofweek
        is_weekend = 1 if day_of_week >= 5 else 0
        
        # Lag features
        lag_1h = float(data['lag_1h'])
        lag_24h = float(data['lag_24h'])
        
        # Prepare feature vector (Order must match training!)
        # Features: ['air_temperature', 'dew_point_temperature', 'relative_humidity', 
        #            'wind_speed', 'wind_direction', 'hour', 'day', 'month', 
        #            'day_of_week', 'is_weekend', 'lag_1h', 'lag_24h']
        
        features = np.array([[
            air_temp, dew_point, humidity, wind_speed, wind_dir,
            hour, day, month, day_of_week, is_weekend, lag_1h, lag_24h
        ]])
        
        # Scale features
        features_scaled = scaler.transform(features)
        
        # Predict
        prediction = model.predict(features_scaled)[0]
        
        # Usage Status Logic (Heuristic based on 24h lag)
        status = "Normal"
        if prediction > lag_24h * 1.15:
            status = "High"
        elif prediction < lag_24h * 0.85:
            status = "Low"
            
        return jsonify({
            'prediction': round(prediction, 2),
            'status': status,
            'message': get_status_message(status)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 400

def get_status_message(status):
    if status == "High":
        return "Usage is significantly higher than yesterday. Consider reducing AC or heavy appliances."
    elif status == "Low":
        return "Usage is lower than yesterday. Good job saving energy!"
    else:
        return "Usage is within the normal range."

if __name__ == "__main__":
    app.run(debug=True, port=5000)
