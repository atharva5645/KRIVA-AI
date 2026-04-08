import os
import joblib
import pandas as pd
import mysql.connector
from datetime import datetime
import json

import sys
import io

# Force UTF-8 for printing to console
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Database configuration
db_config = {
    'host': 'localhost',
    'port': 3306,
    'user': 'root',
    'password': 'Jeeva@123',
    'database': 'ai_sante'
}

MODEL_DIR = r"D:\AI_Sante\ai_module\models"
MASTER_MODEL_PATH = os.path.join(MODEL_DIR, "price_prediction_model.pkl")

def generate_report_fast():
    print("⚡ Starting Optimized Deep AI Forecast with Master Model...")
    
    if not os.path.exists(MASTER_MODEL_PATH):
        print("❌ Master model not found.")
        return

    # Load master model
    try:
        master_model = joblib.load(MASTER_MODEL_PATH)
        print("✅ Master model loaded.")
    except Exception as e:
        print(f"❌ Error loading master model: {e}")
        return

    report = []
    
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        
        # Get all commodities with data
        print("📊 Fetching active commodities...")
        cursor.execute("SELECT DISTINCT commodity FROM market_prices WHERE commodity IS NOT NULL")
        all_commodities = [row['commodity'] for row in cursor.fetchall()]
        print(f"Found {len(all_commodities)} commodities.")

        # Get latest prices
        print("💰 Fetching latest prices snapshot...")
        latest_price_query = """
            SELECT m1.commodity, m1.modal_price, m1.price_date
            FROM market_prices m1
            JOIN (
                SELECT commodity, MAX(price_date) as max_date
                FROM market_prices
                GROUP BY commodity
            ) m2 ON m1.commodity = m2.commodity AND m1.price_date = m2.max_date
        """
        cursor.execute(latest_price_query)
        latest_prices = {row['commodity']: row['modal_price'] for row in cursor.fetchall()}

        print("🔮 Running batch predictions...")
        # Prepare temporal features for 30 days from now
        target_date = datetime.now() + pd.Timedelta(days=30)
        target_month = target_date.month
        target_week = target_date.isocalendar()[1]

        for commodity in all_commodities:
            if commodity not in latest_prices:
                continue
                
            last_price = latest_prices[commodity]
            
            try:
                # Use master model
                input_df = pd.DataFrame([[commodity, target_week, target_month]], 
                                       columns=['Commodity', 'week_number', 'month'])
                input_df['Commodity'] = input_df['Commodity'].astype('category')
                
                prediction = master_model.predict(input_df)[0]
                
                change = ((prediction - float(last_price)) / float(last_price)) * 100 if last_price != 0 else 0
                trend = "📈 Rising" if change > 3 else "📉 Falling" if change < -3 else "➡️ Stable"
                
                report.append({
                    "commodity": commodity,
                    "current": round(float(last_price), 2),
                    "forecast_30d": round(float(prediction), 2),
                    "change": f"{round(change, 1)}%",
                    "trend": trend
                })
            except:
                continue

        # Final Report Printing
        if not report:
            print("⚠️ No predictions generated.")
            return

        report = sorted(report, key=lambda x: float(x['change'].replace('%','')), reverse=True)
        
        import csv
        with open('ai_deep_forecast.csv', 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=report[0].keys())
            writer.writeheader()
            writer.writerows(report)

        print(f"\n{'COMMODITY':<25} | {'CURRENT':<10} | {'PREDICTED':<10} | {'CHANGE':<8} | {'TREND'}")
        print("-" * 75)
        for item in report[:30]: # Show top 30
             print(f"{item['commodity']:<25} | {item['current']:<10} | {item['forecast_30d']:<10} | {item['change']:>7} | {item['trend']}")

        print(f"\n✅ SUCCESS: Deep Forecast complete for {len(report)} items.")
        print(f"📄 Full CSV saved: ai_deep_forecast.csv")

        cursor.close()
        conn.close()
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    generate_report_fast()
