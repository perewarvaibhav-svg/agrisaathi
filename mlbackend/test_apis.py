import os
import requests
from dotenv import load_dotenv
from twilio.rest import Client

load_dotenv()

print("--- TESTING OPENWEATHER API ---")
owm_key = os.getenv("OPENWEATHER_API_KEY")
if owm_key:
    r = requests.get(f"https://api.openweathermap.org/data/2.5/weather?lat=19.076&lon=72.877&appid={owm_key}")
    if r.status_code == 200:
        print(f"[OK] OpenWeatherMap: Temp in Mumbai is {r.json()['main']['temp']}K")
    else:
        print(f"[FAIL] OpenWeatherMap: {r.status_code} {r.text}")
else:
    print("[FAIL] OPENWEATHER_API_KEY not found in .env")

print("\n--- TESTING TELEGRAM BOT API ---")
tg_token = os.getenv("TELEGRAM_BOT_TOKEN")
if tg_token:
    r = requests.get(f"https://api.telegram.org/bot{tg_token}/getMe")
    if r.status_code == 200:
        print(f"[OK] Telegram: Bot Name is {r.json()['result']['first_name']}")
    else:
        print(f"[FAIL] Telegram: {r.status_code} {r.text}")
else:
    print("[FAIL] TELEGRAM_BOT_TOKEN not found in .env")

print("\n--- TESTING TWILIO API ---")
account_sid = os.getenv('TWILIO_ACCOUNT_SID')
auth_token = os.getenv('TWILIO_AUTH_TOKEN')
twilio_phone = os.getenv('TWILIO_PHONE_NUMBER')

if account_sid and auth_token:
    try:
        client = Client(account_sid, auth_token)
        account = client.api.accounts(account_sid).fetch()
        print(f"[OK] Twilio: Authenticated as Status={account.status}")
    except Exception as e:
        print(f"[FAIL] Twilio: {e}")
else:
    print("[FAIL] TWILIO env vars not found")

print("\n--- TESTING GROQ LLM API ---")
groq_key = os.getenv("GROQ_API_KEY")
if groq_key:
    try:
        from groq import Groq
        client = Groq(api_key=groq_key)
        chat = client.chat.completions.create(
            messages=[{"role": "user", "content": "Say 'hello world' if you can hear me."}],
            model="llama-3.3-70b-versatile",
            max_tokens=10
        )
        print(f"[OK] Groq: {chat.choices[0].message.content}")
    except Exception as e:
        print(f"[FAIL] Groq: {e}")
else:
    print("[FAIL] GROQ_API_KEY not found")
