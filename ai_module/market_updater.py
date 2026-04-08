import os
import requests
from bs4 import BeautifulSoup
from groq import Groq
import mysql.connector
from datetime import datetime
from dotenv import load_dotenv
import json
import sys
import io

# Force UTF-8 for printing to console (Windows fix)
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', 'backend', '.env'))

# Configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'Jeeva@123',
    'database': 'ai_sante'
}

client = Groq(api_key=GROQ_API_KEY)

def fetch_mandi_data():
    """
    Fetches raw HTML/Text data from Agmarknet for today's prices.
    Uses a direct search URL for major vegetables.
    """
    today = datetime.now().strftime("%d/%m/%Y")
    # Example URL for all commodities today
    url = f"https://agmarknet.gov.in/SearchCMM2.aspx?Date={today}"
    
    print(f"Fetching data for {today}...")
    try:
        # Note: Since the site is JS heavy, we might get limited text, 
        # but Groq can often reason even from partial chunks or snippets.
        response = requests.get(url, timeout=15)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extract the main table or text content
        content = soup.get_text()[:4000] # Limit to avoid context window issues
        return content
    except Exception as e:
        print(f"Fetch Error: {e}")
        return None

def parse_with_groq(raw_text):
    """
    Uses Groq LLM to extract structured market data from raw text.
    """
    if not raw_text or len(raw_text) < 100:
        return []

    prompt = f"""
    Below is raw text from the Indian Agmarknet Mandi portal for today.
    Extract the market prices into a JSON list of objects.
    Each object MUST have: commodity, state, district, market, variety, modal_price, price_date ({datetime.now().strftime('%Y-%m-%d')}).
    
    ONLY return a valid JSON list. No preamble.
    
    TEXT:
    {raw_text}
    """
    
    try:
        completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama3-70b-8192",
            temperature=0,
            response_format={"type": "json_object"}
        )
        
        data = json.loads(completion.choices[0].message.content)
        # Ensure it's a list (Groq's json_object might wrap it)
        return data.get("prices", data.get("data", [])) if isinstance(data, dict) else data
    except Exception as e:
        print(f"Groq Parsing Error: {e}")
        return []

def update_database(prices):
    """
    Inserts or updates the market_prices table.
    """
    if not prices:
        print("No data to update.")
        return

    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        sql = """
            INSERT INTO market_prices 
            (state, district, market, commodity, variety, modal_price, price_date) 
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        
        inserted_count = 0
        for p in prices:
            try:
                vals = (
                    p.get('state', 'Unknown'),
                    p.get('district', 'Unknown'),
                    p.get('market', 'Unknown'),
                    p.get('commodity', 'Unknown'),
                    p.get('variety', 'Normal'),
                    float(p.get('modal_price', 0)),
                    p.get('price_date', datetime.now().strftime('%Y-%m-%d'))
                )
                cursor.execute(sql, vals)
                inserted_count += 1
            except:
                continue
                
        conn.commit()
        print(f"Database updated with {inserted_count} new records.")
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"DB Error: {e}")

if __name__ == "__main__":
    if not GROQ_API_KEY:
        print("GROQ_API_KEY not found in .env")
    else:
        text = fetch_mandi_data()
        parsed_data = parse_with_groq(text)
        update_database(parsed_data)
