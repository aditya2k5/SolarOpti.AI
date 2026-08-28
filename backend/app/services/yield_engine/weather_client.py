
import httpx

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

async def fetch_hourly_weather(latitude: float, longitude: float) -> dict:
    

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "hourly": "shortwave_radiation,temperature_2m",
        "forecast_days": 1,
        "timezone": "auto"
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(OPEN_METEO_URL, params=params)
        response.raise_for_status()    
        data = response.json()

    
    hourly = data["hourly"]

    return {
        "irradiance": hourly["shortwave_radiation"], 
        "temperature": hourly["temperature_2m"]
    }
    
    