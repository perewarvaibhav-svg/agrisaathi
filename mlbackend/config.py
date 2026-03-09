import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # ── Supabase ──────────────────────────────────────────────
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")

    # ── Weather (OpenWeather) ─────────────────────────────────
    OPENWEATHER_API_KEY: str = os.getenv("OPENWEATHER_API_KEY", "")

    # ── Telegram Bot ──────────────────────────────────────────
    # Get from @BotFather on Telegram
    TELEGRAM_BOT_TOKEN: str = os.getenv("TELEGRAM_BOT_TOKEN", "")

    # ── Twilio (SMS + Voice Calls) ────────────────────────────
    # Get from console.twilio.com
    TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_PHONE_NUMBER: str = os.getenv("TWILIO_PHONE_NUMBER", "")  # E.164: +1XXXXXXXXXX

    # ── LLMs (Groq, Gemini) ───────────────────────────────────
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    # ── Govt APIs ─────────────────────────────────────────────
    DATA_GOV_API_KEY: str = os.getenv("DATA_GOV_API_KEY", "")

    # ── Satellite (Sentinel Hub) ──────────────────────────────
    # Get from shub.sentinel-hub.com
    SENTINEL_CLIENT_ID: str = os.getenv("SENTINEL_CLIENT_ID", "")
    SENTINEL_CLIENT_SECRET: str = os.getenv("SENTINEL_CLIENT_SECRET", "")

    # ── Internal ──────────────────────────────────────────────
    MODEL_PATH: str = "model.joblib"
    PORT: int = 8000

    class Config:
        env_file = ".env"

settings = Settings()
