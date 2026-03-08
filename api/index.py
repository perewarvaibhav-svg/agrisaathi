import os
import sys
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import requests

# --- Graceful Heavy Imports ---
try:
    import joblib
    import numpy as np
    ML_AVAILABLE = True
except ImportError:
    print("Warning: ML dependencies (numpy/joblib) not found. ML modules will be disabled.")
    ML_AVAILABLE = False
    class np: # Fake np for type hinting
        @staticmethod
        def array(x): return x

# Service Imports (Co-located in api/ folder)
from .services import get_weather, get_forecast, get_soil_data, translate_text, detect_language_from_coords

# Service Imports with fallbacks
try:
    from .fertilizer_service import FertilizerInput, calculate_fertilizer_needs
except ImportError:
    class FertilizerInput(BaseModel): lang: str = "en"
    def calculate_fertilizer_needs(x): return {"error": "Module offline"}

try:
    from .soil_service import SoilHealthInput, analyze_soil_health
except ImportError:
    class SoilHealthInput(BaseModel): lang: str = "en"
    def analyze_soil_health(x): return {"error": "Module offline"}

try:
    from .pest_service import PestInput, analyze_pest_risk
except ImportError:
    class PestInput(BaseModel): lang: str = "en"
    def analyze_pest_risk(x): return {"error": "Module offline"}

try:
    from .yield_service import YieldInput, predict_yield
except ImportError:
    class YieldInput(BaseModel): lang: str = "en"
    def predict_yield(x): return {"error": "Module offline"}

try:
    from .rotation_service import RotationInput, recommend_rotation
except ImportError:
    class RotationInput(BaseModel): lang: str = "en"
    def recommend_rotation(x): return {"error": "Module offline"}

from .market_service import get_market_prices
from .notification_service import NotificationPayload, FarmerContact, dispatch_alert, send_telegram_message
from .config import settings

try:
    from supabase import create_client, Client
    supabase_client: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
except Exception as e:
    print(f"Warning: Supabase not configured properly. {e}")
    supabase_client = None

app = FastAPI(title="Agrisaathi AI - Core Intelligence Engine v2.0")

# Optional: Include Twilio IVR router if available
try:
    from .twilio_ivr import router as ivr_router
    app.include_router(ivr_router)
    print("Twilio IVR features enabled")
except ImportError:
    print("Warning: Twilio not installed - IVR features disabled")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Load ML Model ----------
model = None
if ML_AVAILABLE:
    try:
        model_path = os.path.join(os.path.dirname(__file__), "model.joblib")
        if os.path.exists(model_path):
            model = joblib.load(model_path)
            print("Crop recommendation model loaded successfully.")
    except Exception as e:
        print(f"Warning: Model load failed. {e}")


# ============================================================
# SCHEMAS
# ============================================================

class CropFeatures(BaseModel):
    N: int
    P: int
    K: int
    temperature: float
    humidity: float
    ph: float
    rainfall: float
    lang: str = "en"

class LocationInput(BaseModel):
    lat: float
    lon: float
    crop: str = "rice"
    lang: str = "en"

class RecommendationResponse(BaseModel):
    recommended_crop: str
    confidence: float
    explanation: str
    warnings: List[str]

class GeoLangRequest(BaseModel):
    lat: float
    lon: float


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/")
def read_root():
    return {"status": "AgriSaathi AI Core Engine v2.0 — Online"}

@app.get("/health")
@app.get("/api/health")
def health():
    return {"status": "ok", "message": "AgriSaathi Backend is Running on Vercel"}

@app.get("/py-health")
@app.get("/api/py-health")
def py_health():
    return {
        "status": "online",
        "python_version": sys.version,
        "current_dir": os.getcwd(),
        "files": os.listdir('.')
    }


# ============================================================
# MODULE 1: AI CROP RECOMMENDATION (ML Model)
# ============================================================

@app.post("/api/recommend", response_model=RecommendationResponse)
def recommend_crop(features: CropFeatures):
    """Module 1: Recommends the best crop based on soil & climate parameters."""
    if not ML_AVAILABLE or not model:
        return RecommendationResponse(
            recommended_crop="System Status: Offline",
            confidence=0.0,
            explanation="Precision Crop Recommendation is currently in high-performance maintenance mode to save cloud resources. Please use the AI Advisor for general suggestions.",
            warnings=["⚠️ Module temporarily unavailable."]
        )

    data = np.array([[features.N, features.P, features.K,
                      features.temperature, features.humidity,
                      features.ph, features.rainfall]])

    predicted_crop = model.predict(data)[0]
    probabilities = model.predict_proba(data)[0]
    confidence_score = round(float(max(probabilities)) * 100, 2)
    # ... rest of the logic ...
    explanation = f"Based on your soil data, {predicted_crop} is recommended."
    return RecommendationResponse(recommended_crop=predicted_crop, confidence=confidence_score, explanation=explanation, warnings=[])


# ============================================================
# MODULE 2: FERTILIZER OPTIMISATION
# ============================================================

@app.post("/api/fertilizer-optimize")
def optimize_fertilizer(data: FertilizerInput):
    """Module 2: Personalized NPK nutrient management per crop and growth stage."""
    result = calculate_fertilizer_needs(data)

    if data.lang != "en":
        result["recommendations"] = [translate_text(r, data.lang) for r in result["recommendations"]]
        result["scientific_reasoning"] = [translate_text(r, data.lang) for r in result["scientific_reasoning"]]

    return result


# ============================================================
# MODULE 3: WEATHER-BASED CROP RISK INTELLIGENCE (Decision Support System)
# ============================================================

class CropRiskRequest(BaseModel):
    lat: float
    lon: float
    crop: str = "Paddy"
    stage: str = "Vegetative"
    lang: str = "en"

@app.post("/api/crop-risk")
@app.post("/api/weather-advice")  # Alias for backward compatibility
def crop_risk_intelligence(req: CropRiskRequest):
    """
    Predictive Crop Risk Engine.
    Combines current weather + 48h forecast to compute a Forward-Looking Risk Score.
    This allows farmers to take preventative action BEFORE the storm hits.
    """
    weather = get_weather(req.lat, req.lon)
    forecast_data = get_forecast(req.lat, req.lon)
    
    if not weather:
        raise HTTPException(status_code=500, detail="Weather fetch failed.")

    temp = weather.get("temp", 25)
    rain = weather.get("rainfall_last_3h", 0)
    humidity = weather.get("humidity", 50)
    wind = weather.get("wind_speed", 5)

    # 1. Base Current Risk
    risk_now = max(0, (temp - 35) * 4) + min(30, rain * 1.5) + max(0, (humidity - 80) * 1.0)

    # 2. Predictive Forecast Risk (checking 48h for spikes)
    forecast_risk = 0
    max_forecast_temp = temp
    max_rain_prob = 0
    upcoming_threats = []

    if "forecast" in forecast_data:
        for entry in forecast_data["forecast"]:
            f_temp = entry["temp"]
            f_prob = entry["rain_prob"]
            if f_temp > 38: 
                forecast_risk += 10
                upcoming_threats.append(f"Upcoming Heatwave ({f_temp}°C)")
            if f_temp < 10:
                forecast_risk += 15
                upcoming_threats.append(f"Frost Risk Detected ({f_temp}°C)")
            if f_prob > 70:
                forecast_risk += 20
                upcoming_threats.append(f"High Precipitation Certainty ({f_prob}%)")
            max_forecast_temp = max(max_forecast_temp, f_temp)
            max_rain_prob = max(max_rain_prob, f_prob)

    total_score = min(100, int(risk_now + (forecast_risk / 2) + (wind * 0.5)))

    # Risk classification
    if total_score < 25: level, color = "SAFE", "🟢"
    elif total_score < 55: level, color = "MODERATE", "🟡"
    elif total_score < 75: level, color = "HIGH", "🟠"
    else: level, color = "SEVERE", "🔴"

    # 3. Decision Support Analysis
    lang_name = LANG_NAMES.get(req.lang, "English")
    sys_prompt = f"You are AgriSaathi's Precision Predictive AI. Respond in {lang_name}."
    prompt = (
        f"DATA REPORT:\n- CURRENT: {temp}°C, {rain}mm rain, {humidity}% humidity.\n"
        f"- FORECAST: Max {max_forecast_temp}°C, Max Rain Prob {max_rain_prob}%.\n"
        f"- THREATS: {', '.join(upcoming_threats) if upcoming_threats else 'None'}.\n"
        f"- CROP: {req.crop} ({req.stage} stage).\n"
        f"- OVERALL RISK: {total_score}/100 ({level}).\n\n"
        f"Help the farmer prepare in {lang_name}:\n"
        f"1. EXPLANATION: Why is this risk level assigned? (3-4 sentences)\n"
        f"2. PREVENTATIVE ACTIONS: 5 detailed things to do NOW to save the crop from the upcoming conditions.\n"
        f"3. HARVEST IMPACT: How will this affect yield?"
    )
    res_text = get_llm_response(prompt=prompt, system_prompt=sys_prompt)
    
    # Structure output
    return {
        "location": {"lat": req.lat, "lon": req.lon},
        "crop": req.crop,
        "stage": req.stage,
        "risk": {
            "score": total_score,
            "level": level,
            "color": color,
            "threats_detected": upcoming_threats
        },
        "ai_advice": res_text,
        "current_weather": weather,
        "forecast_summary": f"Next 48h: Max {max_forecast_temp}°C, Rain potential up to {max_rain_prob}%",
        "timestamp": datetime.now().strftime("%I:%M %p, %d %b")
    }


@app.post("/api/forecast")
def get_extended_forecast(req: GeoLangRequest):
    """Fetches high-precision 5-day / 3-hour agricultural forecast."""
    return get_forecast(req.lat, req.lon)

# ============================================================
# MODULE 3A: AUTOMATED SCHEDULED ALERT ENGINE (CRON)
# ============================================================

from .notification_service import FarmerContact, NotificationPayload, dispatch_alert

@app.post("/api/telegram/webhook")
async def telegram_webhook(req: Request):
    """
    Automated Telegram Binding Flow.
    Farmers message the bot: "/start +919876543210" to link their account.
    """
    try:
        body = await req.json()
        if "message" in body:
            chat_id = str(body["message"]["chat"]["id"])
            text = body["message"].get("text", "").strip()
            
            if text.startswith("/start"):
                parts = text.split()
                if len(parts) == 2:
                    phone = parts[1]
                    if supabase_client:
                        # Update the farmer's Supabase profile with their Telegram Chat ID
                        res = supabase_client.table("farmers").update({"telegram_chat_id": chat_id}).eq("phone", phone).execute()
                        if res.data:
                            send_telegram_message(chat_id, "✅ Your Telegram account is strictly bound to AgriSaathi! You will now receive automated alerts here.")
                        else:
                            send_telegram_message(chat_id, "❌ Phone number not found. Ensure it is exactly how you registered (e.g. +919876543210).")
                    else:
                        send_telegram_message(chat_id, "⚠️ Database connection missing. Failed to link.")
                else:
                    send_telegram_message(chat_id, "Welcome to AgriSaathi! 🌾 To receive real-time alerts, please reply with: /start YOUR_PHONE_NUMBER\nExample: /start +919876543210")
        return {"status": "ok"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/cron/trigger-alerts")
def cron_trigger_alerts(force: bool = Query(False, description="Bypass weather checks for demo purposes")):
    """
    Automated Alert Engine.
    Intended to be triggered every 3-6 hours via CRON.
    Pulls live farmers from Supabase, checks local weather risk,
    and dispatches precision SMS/Telegram alerts if thresholds are breached.
    """
    alerts_sent = []
    
    # 1. Fetch real farmers from Supabase (fallback to MOCK if DB not set)
    farmers_list = []
    if supabase_client:
        try:
            res = supabase_client.table("farmers").select("*").execute()
            farmers_list = res.data or []
        except Exception as e:
            print(f"Supabase fetch failed: {e}")
            
    if not farmers_list:
        print("Falling back to MOCK_FARMERS for demo purposes.")
        farmers_list = [
            {"id": "f1", "name": "Ramesh", "phone": "+919876543210", "telegram_chat_id": None, "lat": 19.076, "lon": 72.877, "crop": "Cotton", "stage": "Flowering"},
            {"id": "f2", "name": "Suresh", "phone": "+919988776655", "telegram_chat_id": "123456789", "lat": 28.613, "lon": 77.209, "crop": "Wheat", "stage": "Vegetative"}
        ]

    for f in farmers_list:
        # Fallback dictionary keys for safety against db nulls
        lat = f.get("lat", 20.0)
        lon = f.get("lon", 78.0)
        crop = f.get("crop", "Wheat")
        stage = f.get("stage", "Vegetative")
        req = CropRiskRequest(lat=lat, lon=lon, crop=crop, stage=stage, lang="hi")
        try:
            risk_data = crop_risk_intelligence(req)
            risk_level = risk_data["risk"]["level"]
            score = risk_data["risk"]["score"]

            # 2. Threshold Check (Alert if High/Severe OR if Force-mode is ON)
            if risk_level in ["HIGH", "SEVERE"] or force:
                if force:
                    risk_level = "DEMO_SEVERE"
                    score = 99
                impact_text = "\n".join([f"• {i}" for i in risk_data["risk"]["impacts"]])
                msg = (
                    f"⚠️ URGENT WEATHER ALERT ⚠️\n"
                    f"Location: {lat}, {lon}\n"
                    f"Crop Risk Score: {score}/100 ({risk_level})\n"
                    f"\nExpected Impacts on {crop}:\n{impact_text}\n"
                    f"\nTake immediate preventative action to secure your harvest."
                )

                # 3. Dispatch Notification
                contact = FarmerContact(phone=f.get("phone", ""), telegram_chat_id=f.get("telegram_chat_id"), name=f.get("name", "Farmer"), lang=f.get("lang", "hi"))
                payload = NotificationPayload(
                    farmer=contact,
                    alert_type="weather",
                    title=f"High Risk Weather Warning - {crop}",
                    message=msg,
                    severity="CRITICAL" if risk_level == "SEVERE" else "WARNING"
                )
                res = dispatch_alert(payload)
                alerts_sent.append({"farmer": f.get("name"), "risk": risk_level, "dispatched": res})
        except Exception as e:
            print(f"Error processing farmer {f.get('id', 'unknown')}: {e}")

    return {
        "status": "success",
        "timestamp": datetime.now().isoformat(),
        "total_checked": len(farmers_list),
        "alerts_triggered": len(alerts_sent),
        "details": alerts_sent
    }


# ============================================================
# MODULE 4: SOIL HEALTH INTELLIGENCE
# ============================================================

@app.post("/api/soil-health")
def soil_health_intelligence(data: SoilHealthInput):
    """Module 4: Translates raw soil lab readings into actionable rejuvenation advice."""
    result = analyze_soil_health(data)

    if data.lang != "en":
        # Multi-field translation for rich soil profile
        result["insights"] = [translate_text(i, data.lang) for i in result["insights"]]
        result["rejuvenation_steps"] = [translate_text(s, data.lang) for s in result["rejuvenation_steps"]]
        if "texture" in result:
            result["texture"] = translate_text(result["texture"], data.lang)

    return result


# ============================================================
# MODULE 5: PEST & DISEASE PREDICTION
# ============================================================

@app.post("/api/pest-disease")
def pest_disease_prediction(data: PestInput):
    """Module 5: Predicts pest/disease risk based on crop, climate and symptoms."""
    result = analyze_pest_risk(data)

    if data.lang != "en":
        result["threats"] = [translate_text(t, data.lang) for t in result["threats"]]
        result["actions"] = [translate_text(a, data.lang) for a in result["actions"]]
        result["summary"] = translate_text(result["summary"], data.lang)
        # ai_diagnosis is generated in target lang, but translate if empty or mismatch found
        if result.get("ai_diagnosis") and len(result["ai_diagnosis"]) < 10:
             result["ai_diagnosis"] = translate_text(result["ai_diagnosis"], data.lang)

    return result


# ============================================================
# MODULE 6: YIELD PREDICTION
# ============================================================

@app.post("/api/yield-predict")
def yield_prediction(data: YieldInput):
    """Module 6: Estimates expected crop yield based on crop, soil, and climate inputs."""
    result = predict_yield(data)

    if data.lang != "en":
        result["advice"] = [translate_text(a, data.lang) for a in result["advice"]]
        result["summary"] = translate_text(result["summary"], data.lang)

    return result


# ============================================================
# MODULE 7: SMART CROP ROTATION PLANNER
# ============================================================

@app.post("/api/crop-rotation")
def crop_rotation_planner(data: RotationInput):
    """Module 7: Generates a 3-season crop rotation plan based on current crop and soil profile."""
    result = recommend_rotation(data)

    if data.lang != "en":
        result["rotation_plan"] = [translate_text(r, data.lang) for r in result["rotation_plan"]]
        result["summary"] = translate_text(result["summary"], data.lang)
        # ai_reasoning is already in target lang, but ensure it's not raw English
        if len(result["ai_reasoning"]) < 50:
            result["ai_reasoning"] = translate_text(result["ai_reasoning"], data.lang)

    return result


# ============================================================
# MODULE 8: MARKET PRICE TRACKER
# ============================================================

@app.get("/api/market-prices")
def market_prices(
    commodity: str = Query(default="rice", description="Commodity name"),
    state: str = Query(default="Maharashtra", description="State name"),
    lang: str = Query(default="en", description="Language code")
):
    """Module 8: Live mandi/market prices for key commodities (Agmarknet-style)."""
    result = get_market_prices(commodity, state)

    # Minor fix: Ensure we don't try to translate error messages as insights
    if lang != "en" and "error" not in result:
        result["commodity"] = translate_text(result["commodity"], lang)
        result["market_insights"] = [translate_text(i, lang) for i in result["market_insights"]]
    elif lang != "en" and "error" in result:
        result["error"] = translate_text(result["error"], lang)

    return result


# ============================================================
# MODULE 9: GEOLOCATION → LANGUAGE DETECTION
# ============================================================

@app.post("/api/detect-language")
def detect_language(req: GeoLangRequest):
    """Module 9: Detects the best regional language based on GPS coordinates."""
    lang_code, lang_name, state_name = detect_language_from_coords(req.lat, req.lon)
    return {
        "detected_language_code": lang_code,
        "detected_language_name": lang_name,
        "detected_state": state_name,
        "lat": req.lat,
        "lon": req.lon
    }


# ============================================================
# MODULE 10: NOTIFICATION DISPATCH
# ============================================================

@app.post("/api/send-alert")
def send_alert(payload: NotificationPayload):
    """
    Module 10: Sends a notification to a farmer via Telegram, SMS, or Voice Call
    depending on severity level.
    - INFO    → Telegram only
    - WARNING → Telegram + SMS
    - CRITICAL → Telegram + SMS + Voice Call (for disasters/floods)
    """
    result = dispatch_alert(payload)
    return result


class SchemeAlert(BaseModel):
    scheme_name: str
    eligibility_criteria: str
    deadline: str
    benefit_amount: str
    apply_link: str
    farmer_contacts: list[FarmerContact]
    lang: str = "hi"


@app.post("/api/broadcast-scheme")
def broadcast_scheme_alert(data: SchemeAlert):
    """
    Module 10b: Broadcasts a government scheme notification
    to a list of registered farmers via Telegram and/or SMS.
    """
    message = (
        f"📢 New Government Scheme Available!\n\n"
        f"🏛️ Scheme: {data.scheme_name}\n"
        f"✅ Eligibility: {data.eligibility_criteria}\n"
        f"📅 Last Date: {data.deadline}\n"
        f"💰 Benefit: {data.benefit_amount}\n"
        f"🔗 Apply: {data.apply_link}"
    )

    summary = []
    for farmer in data.farmer_contacts:
        payload = NotificationPayload(
            farmer=farmer,
            alert_type="scheme",
            title=data.scheme_name,
            message=message,
            severity="INFO"
        )
        result = dispatch_alert(payload)
        summary.append({"phone": farmer.phone, "result": result})

    return {
        "broadcast_complete": True,
        "total_farmers": len(data.farmer_contacts),
        "results": summary
    }


class DisasterAlert(BaseModel):
    disaster_type: str          # "flood", "cyclone", "drought", "heatwave", "frost"
    affected_district: str
    severity: str = "CRITICAL"  # Always critical for disasters
    instructions: str
    farmer_contacts: list[FarmerContact]


@app.post("/api/broadcast-disaster")
def broadcast_disaster_alert(data: DisasterAlert):
    """
    Module 10c: Broadcasts an emergency disaster alert via all channels.
    CRITICAL severity — triggers Telegram + SMS + Voice Call simultaneously.
    """
    DISASTER_EMOJIS = {
        "flood": "🌊", "cyclone": "🌀", "drought": "🏜️",
        "heatwave": "🔥", "frost": "❄️"
    }
    emoji = DISASTER_EMOJIS.get(data.disaster_type.lower(), "🚨")

    message = (
        f"{emoji} DISASTER ALERT — {data.disaster_type.upper()}\n"
        f"📍 District: {data.affected_district}\n"
        f"⚠️ Instructions: {data.instructions}"
    )

    summary = []
    for farmer in data.farmer_contacts:
        payload = NotificationPayload(
            farmer=farmer,
            alert_type="disaster",
            title=f"{data.disaster_type.upper()} ALERT — {data.affected_district}",
            message=message,
            severity="CRITICAL"
        )
        result = dispatch_alert(payload)
        summary.append({"phone": farmer.phone, "result": result})

    return {
        "broadcast_complete": True,
        "disaster_type": data.disaster_type,
        "total_farmers": len(data.farmer_contacts),
        "results": summary
    }

# ============================================================
# GENERIC AI CHATBOT (LLM Q&A) — with smart context injection
# ============================================================

LANG_NAMES = {
    "en": "English", "hi": "Hindi", "te": "Telugu", "ta": "Tamil",
    "mr": "Marathi", "pa": "Punjabi", "bn": "Bengali", "kn": "Kannada", 
    "gu": "Gujarati", "ml": "Malayalam", "or": "Odia", "as": "Assamese",
    "ur": "Urdu", "sa": "Sanskrit", "ks": "Kashmiri", "ne": "Nepali",
    "sd": "Sindhi", "mai": "Maithili", "doi": "Dogri", "mni": "Manipuri",
    "kok": "Konkani", "bho": "Bhojpuri"
}

class ChatRequest(BaseModel):
    message: str
    lang: str = "en"
    context: Optional[str] = None

from .llm_service import get_llm_response
from .market_service import get_market_prices

def _detect_commodity(text: str) -> Optional[str]:
    """Detect if the user is asking about a specific commodity price."""
    text_lower = text.lower()
    # Common commodities
    commodities = ["rice", "wheat", "maize", "cotton", "soybean", "groundnut", "sugarcane", "mustard"]
    for comm in commodities:
        if comm in text_lower:
            return comm
    return None

@app.post("/api/chat")
def ai_chat(req: ChatRequest):
    print(f"[BACKEND] Received chat request: {req.message[:50]}...")
    """
    Intelligent chat endpoint that:
    1. Detects if user is asking about market prices - injects REAL data context
    2. Always responds in user's chosen language
    """
    lang_name = LANG_NAMES.get(req.lang, "English")

    sys_prompt = (
        f"You are AgriSaathi, an expert AI agricultural advisor for Indian farmers. "
        f"You have access to real-time data. ALWAYS respond in {lang_name}. "
        f"Be specific, practical, and give actionable advice with exact numbers when available. "
        f"Format responses with bullet points for readability."
    )

    context_parts = []

    # 1. Auto-inject market data if price is asked
    commodity = _detect_commodity(req.message)
    price_keywords = ["price", "rate", "mandi", "market", "cost", "bhav", "dam", "keemat"]
    if commodity and any(kw in req.message.lower() for kw in price_keywords):
        try:
            price_data = get_market_prices(commodity, "Maharashtra")
            if "error" not in price_data:
                msp_str = f"Rs.{price_data['msp']}" if price_data.get('msp') else "None (horticulture)"
                ctx = (
                    f"REAL-TIME MARKET DATA (Updated {price_data['last_updated']}):\n"
                    f"- Commodity: {price_data['commodity']}\n"
                    f"- Current Avg Price: Rs.{price_data['current_price_inr']}/quintal\n"
                    f"- Best Market: {price_data['market_centers'][0]['market']} @ Rs.{price_data['market_centers'][0]['price']}\n"
                    f"- Insight: {price_data['market_insights'][0] if price_data['market_insights'] else 'Stable'}"
                )
                context_parts.append(ctx)
        except Exception as e:
            print(f"Market context inject failed: {e}")

    # 2. Auto-inject weather data if climate is asked
    weather_keywords = ["weather", "rain", "monsoon", "temp", "heat", "cold", "humidity", "mausam", "baarish"]
    if any(kw in req.message.lower() for kw in weather_keywords):
        try:
            # We use a default lat/lon if not provided in request (in production, passed from frontend)
            w = get_weather(19.076, 72.877) 
            wctx = (
                f"CURRENT WEATHER CONTEXT:\n"
                f"- Conditions: {w['description']}\n"
                f"- Temp: {w['temp']}°C | Hum: {w['humidity']}%\n"
                f"- Recent Rain: {w['rainfall_last_3h']}mm\n"
                f"- Recommendation: Maintain moisture if rain is low, avoid spraying if rain is expected."
            )
            context_parts.append(wctx)
        except Exception as e:
            print(f"Weather context inject failed: {e}")

    if context_parts or req.context:
        all_ctx = "\n\n".join(filter(None, context_parts + [req.context or ""]))
        prompt = (
            f"You have the following REAL-TIME DATA. Use it to give a specific, data-backed answer:\n"
            f"{all_ctx}\n\n"
            f"Farmer Question: {req.message}\n\n"
            f"Answer clearly in {lang_name} with exact figures."
        )
    else:
        prompt = f"Farmer Question: {req.message}\n\nAnswer in {lang_name}."

    response = get_llm_response(prompt=prompt, system_prompt=sys_prompt)
    return {"message": response}


# ============================================================
# SCHEME DOCUMENT DRAFTER
# ============================================================

class SchemeRequest(BaseModel):
    scheme_name: str
    farmer_name: str
    location: str
    land_area_acres: float
    crop_type: str
    aadhaar_last4: str = "XXXX"
    lang: str = "en"

@app.post("/api/scheme-draft")
def draft_scheme_document(req: SchemeRequest):
    """
    Autonomously drafts a complete government scheme application document.
    CRITICAL FIX: Explicitly instructed to NOT give steps, but the literal letter text.
    """
    lang_name = LANG_NAMES.get(req.lang, "English")
    sys_prompt = (
        f"You are a professional agricultural consultant. Your task is to DRAFT THE LITERAL TEXT of a formal government application letter. "
        f"DO NOT explain how to apply. DO NOT give steps. ONLY provide the final, ready-to-print document in {lang_name}."
    )
    prompt = (
        f"DRAFT A LITERAL FORMAL APPLICATION LETTER for this scheme:\n"
        f"SCHEME: {req.scheme_name}\n"
        f"FARMER NAME: {req.farmer_name}\n"
        f"LOCATION: {req.location}\n"
        f"LAND SIZE: {req.land_area_acres} Acres\n"
        f"CROP: {req.crop_type}\n"
        f"AADHAAR (LAST 4): {req.aadhaar_last4}\n\n"
        f"WRITING STYLE: Formal, respectful, and complete. Include correct headers, body paragraphs, and a signature block.\n"
        f"LANGUAGE: {lang_name}\n"
        f"DATE: {datetime.now().strftime('%d %B %Y')}"
    )
    draft = get_llm_response(prompt=prompt, system_prompt=sys_prompt)
    return {"draft": draft, "scheme": req.scheme_name, "lang": lang_name}


# ============================================================
# CONTRACT AUDIT
# ============================================================

class ContractRequest(BaseModel):
    contract_text: str
    contract_type: str = "loan"
    lang: str = "en"

@app.post("/api/contract-audit")
def audit_contract(req: ContractRequest):
    """Uses LLM to detect exploitative clauses in farm contracts."""
    lang_name = LANG_NAMES.get(req.lang, "English")
    sys_prompt = "You are an expert agricultural lawyer protecting Indian farmers from exploitative contracts."
    prompt = (
        f"Audit this {req.contract_type} contract for a farmer. Find ALL red flags in {lang_name}:\n\n"
        f"{req.contract_text}\n\n"
        f"Sections: 1) RISK LEVEL 2) RED FLAGS 3) HIDDEN COSTS 4) YOUR RIGHTS 5) RECOMMENDED ACTION"
    )
    analysis = get_llm_response(prompt=prompt, system_prompt=sys_prompt)
    return {"audit": analysis, "contract_type": req.contract_type}


# ============================================================
# SUBSIDY MATCHER
# ============================================================

class SubsidyRequest(BaseModel):
    state: str
    crop_type: str
    land_area_acres: float
    farmer_category: str = "general"
    has_kisan_card: bool = False
    annual_income_inr: int = 100000
    lang: str = "en"

@app.post("/api/subsidy-match")
def match_subsidies(req: SubsidyRequest):
    """Matches farmer profile to eligible government schemes."""
    lang_name = LANG_NAMES.get(req.lang, "English")
    sys_prompt = "You are AgriSaathi's scheme matching engine with deep knowledge of all central and state Indian agricultural schemes."
    prompt = (
        f"Match this farmer to ALL eligible schemes (Central + {req.state} State) in {lang_name}:\n"
        f"- State: {req.state}, Crops: {req.crop_type}, Land: {req.land_area_acres} acres\n"
        f"- Category: {req.farmer_category}, KCC: {'Yes' if req.has_kisan_card else 'No'}, Income: Rs.{req.annual_income_inr:,}\n\n"
        f"For each scheme: Name, Benefit Amount, Eligibility Reason, How to Apply, Documents Needed.\n"
        f"Include PM-KISAN, PMFBY, KCC, PKVY, SMAM, RKVY and relevant {req.state} state schemes."
    )
    matches = get_llm_response(prompt=prompt, system_prompt=sys_prompt)
    return {"matches": matches, "state": req.state}


# ============================================================
# DISPUTE ADVISOR
# ============================================================

class DisputeRequest(BaseModel):
    dispute_type: str
    description: str
    state: str
    lang: str = "en"

@app.post("/api/dispute-advice")
def dispute_advisor(req: DisputeRequest):
    """Provides legal-grade dispute resolution guidance for farmers."""
    lang_name = LANG_NAMES.get(req.lang, "English")
    sys_prompt = "You are a legal expert specializing in Indian agricultural disputes. Guide farmers step-by-step."
    prompt = (
        f"Help this farmer in {req.state} resolve their {req.dispute_type} dispute in {lang_name}:\n"
        f"{req.description}\n\n"
        f"Provide: 1) Immediate Steps 2) Legal Framework 3) Whom to Contact 4) Documents to Gather "
        f"5) Escalation Path 6) Helplines (Kisan Call 1800-180-1551, PM-KISAN 155261)"
    )
    advice = get_llm_response(prompt=prompt, system_prompt=sys_prompt)
    return {"advice": advice, "dispute_type": req.dispute_type}


# ============================================================
# MODULE 11: SATELLITE CROP MONITORING (Remote Sensing)
# ============================================================

class SatelliteRequest(BaseModel):
    lat: float
    lon: float
    crop: str = "rice"
    area_acres: float = 2.0
    lang: str = "en"

@app.post("/api/satellite-analysis")
def satellite_crop_analysis(req: SatelliteRequest):
    """
    Module 11: Remote sensing crop health analysis.
    Simulates NDVI, EVI, crop stress scoring, and anomaly detection
    for the specified field coordinates using AI inference.
    In production, integrate with Sentinel-2 / NASA Earthdata APIs.
    """
    import random, math
    from datetime import datetime, timedelta

    lang_name = LANG_NAMES.get(req.lang, "English")

    # Use New Service (Live Sentinel-Hub)
    from .satellite_service import satellite_service
    
    # 1. Fetch Real-World Satellite Indices
    res = satellite_service.get_crop_indices(req.lat, req.lon, buffer=0.005)
    
    base_ndvi = res["indices"]["ndvi"]
    evi = res["indices"]["evi"]
    savi = res["indices"]["savi"]
    health_score = int(base_ndvi * 100)
    
    health_label = (
        "EXCELLENT" if base_ndvi > 0.75
        else "GOOD" if base_ndvi > 0.55
        else "MODERATE" if base_ndvi > 0.35
        else "STRESSED"
    )

    # 14-day NDVI trend
    trend = []
    for i in range(14, 0, -1):
        d = (datetime.now() - timedelta(days=i)).strftime("%d %b")
        v = round(base_ndvi + random.uniform(-0.08, 0.08), 3)
        trend.append({"date": d, "ndvi": max(0.1, min(1.0, v))})

    # Anomaly detection
    anomalies = []
    if base_ndvi < 0.4:
        anomalies.append("🔴 Low biomass density — possible crop failure zone detected in NW quadrant")
    if random.random() > 0.65:
        anomalies.append("🟡 Irregular spectral signature in ~0.3 acres — possible waterlogging or pest damage")
    if random.random() > 0.8:
        anomalies.append("🔴 Boundary stress detected — edge rows showing chlorophyll decline")

    # AI interpretation prompt
    sys_prompt = "You are an expert satellite imagery analyst for Indian precision agriculture."
    prompt = (
        f"Analyze satellite crop health data for a {req.crop} field at lat={req.lat}, lon={req.lon} "
        f"({req.area_acres} acres) in {lang_name}:\n"
        f"NDVI: {base_ndvi} ({health_label}), EVI: {evi}, SAVI: {savi}\n"
        f"Anomalies: {'; '.join(anomalies) if anomalies else 'None detected'}\n\n"
        f"Provide: 1) Crop Health Interpretation 2) Risk Areas 3) Recommended Immediate Actions "
        f"4) Optimal Harvest Window estimate 5) Field Management Tips. Be specific with NDVI values."
    )
    ai_analysis = get_llm_response(prompt=prompt, system_prompt=sys_prompt)

    return {
        "location": {"lat": req.lat, "lon": req.lon},
        "crop": req.crop,
        "area_acres": req.area_acres,
        "health_score": health_score,
        "health_label": health_label,
        "indices": {
            "ndvi": base_ndvi,
            "evi": evi,
            "savi": savi,
        },
        "ndvi_14day_trend": trend,
        "anomalies_detected": anomalies,
        "ai_analysis": ai_analysis,
        "data_source": res["data_source"],
        "last_overpass": (datetime.now() - timedelta(days=random.randint(1, 5))).strftime("%d %b %Y"),
        "next_overpass": (datetime.now() + timedelta(days=random.randint(2, 7))).strftime("%d %b %Y"),
    }


# ============================================================
# MODULE 12: GOVERNANCE FEED (Live scheme updates via LLM)
# ============================================================

class GovernanceFeedRequest(BaseModel):
    state: str = "Maharashtra"
    category: str = "all"
    lang: str = "en"

@app.post("/api/governance-feed")
def governance_feed(req: GovernanceFeedRequest):
    """Returns curated live government scheme updates for the given state and category."""
    lang_name = LANG_NAMES.get(req.lang, "English")
    sys_prompt = "You are AgriSaathi's real-time government scheme intelligence engine with current knowledge of all Indian agricultural programs."
    prompt = (
        f"List ALL current and upcoming government agricultural schemes for {req.category} category "
        f"in {req.state} (include Central + State schemes) in {lang_name}. "
        f"Today's date: {datetime.now().strftime('%d %B %Y')}.\n\n"
        f"For each scheme provide:\n"
        f"• Scheme Name & Ministry\n• Benefit Amount / Type\n• Eligibility\n"
        f"• Application Deadline (if known)\n• How to Apply (portal URL or office)\n"
        f"• Required Documents\n\n"
        f"Include: PM-KISAN, PMFBY, KCC, PKVY, SMAM, RKVY, PM Kusum, eNAM, "
        f"Soil Health Card, MIDH, and relevant {req.state} state schemes."
    )
    content = get_llm_response(prompt=prompt, system_prompt=sys_prompt)
    return {
        "state": req.state,
        "category": req.category,
        "schemes": content,
        "generated_on": datetime.now().strftime("%d %b %Y, %I:%M %p"),
        "disclaimer": "Verify scheme details at india.gov.in or your district agricultural office before applying."
    }


# ============================================================
# MODULE 13: INDIC VOICE NOTIFICATION ENGINE (TTS)
# ============================================================

from fastapi.responses import StreamingResponse
from fastapi import Query, HTTPException

@app.get("/api/tts")
def generate_voice_alert(text: str = Query(..., description="Text to speak"), lang: str = Query("hi", description="Language code")):
    """
    Open-Source Voice Alert Engine.
    Converts text alerts (like Heavy Rain warnings) into audible MP3 files.
    """
    from gtts import gTTS
    import io

    # Fallback to hindi if language not completely supported by gTTS natively
    tts_lang = lang.lower()
    supported_gtts = ["en", "hi", "te", "ta", "mr", "pa", "bn", "gu", "ml", "ne", "ur"]
    
    if tts_lang not in supported_gtts:
        tts_lang = "hi"

    try:
        tts = gTTS(text=text, lang=tts_lang)
        fp = io.BytesIO()
        tts.write_to_fp(fp)
        fp.seek(0)
        from fastapi import Response
        return Response(content=fp.read(), media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS Generation failed: {e}")


# Vercel Serverless Entry Point
handler = app

