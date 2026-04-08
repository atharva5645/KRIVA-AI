from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import os
import sys

# Force UTF-8 for printing to console (Windows fix)
if sys.stdout.encoding != 'utf-8':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

app = Flask(__name__)
CORS(app)

# Load CSV dataset from the current module directory.
base_dir = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(base_dir, 'ai_deep_forecast.csv')
if os.path.exists(csv_path):
    df_forecast = pd.read_csv(csv_path)
    print('Forecast data loaded.')
else:
    df_forecast = pd.DataFrame()
    print('Forecast CSV not found.')


@app.route('/predict-market', methods=['GET'])
def predict_market():
    commodity_name = request.args.get('commodity', 'Paddy(Dhan)(Common)')

    if df_forecast.empty:
        return jsonify({'error': 'No data available'}), 500

    # Find commodity in dataset
    row = df_forecast[df_forecast['commodity'].str.contains(commodity_name, case=False, na=False)]

    if row.empty:
        # Fallback to first row or default
        row = df_forecast.iloc[0:1]
        commodity_name = row['commodity'].values[0]

    current_price_quintal = float(row['current'].values[0])
    forecast_price_quintal = float(row['forecast_30d'].values[0])
    growth_percent = float(row['change'].values[0].replace('%', ''))
    trend = row['trend'].values[0]

    # Convert prices from per quintal (100kg) to per kg
    current_price_kg = current_price_quintal / 100.0
    forecast_price_kg = forecast_price_quintal / 100.0

    # Calculate realistic mocked demand (in kg) rather than using price
    base_demand = (len(commodity_name) * 150) + 1200
    predicted_demand = round(base_demand * (1 + (growth_percent / 100)))

    # Recommend a competitive price at 95% of forecast
    recommended_price = round(forecast_price_kg * 0.95, 2)
    recommended_price_quintal = round(forecast_price_quintal * 0.95, 2)

    price_alert = f'Market Trend: {trend}'
    crop_suggestion = 'Maintain current supply.'

    if growth_percent < -10:
        price_alert = f'PRICE CRASH ALERT! {trend}'
        crop_suggestion = 'High supply detected. Consider delaying harvest or processing into value-added products.'
    elif growth_percent > 10:
        price_alert = f'RISING DEMAND! {trend}'
        crop_suggestion = 'Optimize logistics for immediate market delivery to capture high prices.'

    return jsonify({
        'commodity': commodity_name,
        'predicted_demand': predicted_demand,
        'growth_percent': growth_percent,
        'recommended_price': recommended_price,
        'recommended_price_quintal': recommended_price_quintal,
        'price_alert': price_alert,
        'crop_suggestion': crop_suggestion,
    })


if __name__ == '__main__':
    app.run(port=5001, debug=True)
