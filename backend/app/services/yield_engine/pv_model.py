import joblib
import pandas as pd
import os

from app.core.engineering_defaults import (
    DEFAULT_PANEL_WATTAGE_W,
    DEFAULT_PANEL_AREA_SQFT,
    DEFAULT_DERATE_FACTOR
)


MODEL_PATH = os.path.join(os.path.dirname(__file__), "peak_solar_model.pkl")
model = joblib.load(MODEL_PATH)


def derive_peak_sun_hours(irradiance_list: list[float]) -> float:
    
    total_irradiance = sum(irradiance_list)
    psh = total_irradiance / 1000.0
    return round(psh, 2)


def predict_hourly_yield(
    irradiance_list: list[float],
    temperature_list: list[float],
    panel_wattage_w: float = DEFAULT_PANEL_WATTAGE_W,
    panel_area_sqft: float = DEFAULT_PANEL_AREA_SQFT,
    derate_factor: float = DEFAULT_DERATE_FACTOR
) -> dict:
    

    hourly_per_panel = []
    hourly_per_sqft = []

    for hour in range(24):
        hour_irradiance = float(irradiance_list[hour])
        hour_temp = float(temperature_list[hour])

       
        if hour_irradiance <= 0:
            hourly_per_panel.append(0.0)
            hourly_per_sqft.append(0.0)
            continue

        
        module_temp = hour_temp + (hour_irradiance * 0.03)

       
        features = pd.DataFrame([{
            "hour": hour,
            "IRRADIATION": hour_irradiance,
            "AMBIENT_TEMPERATURE": hour_temp,
            "MODULE_TEMPERATURE": module_temp
        }])[["hour", "IRRADIATION", "AMBIENT_TEMPERATURE", "MODULE_TEMPERATURE"]]

       
        ml_efficiency = float(model.predict(features)[0])

        panel_kw = panel_wattage_w / 1000.0
        yield_per_panel_wh = max(0.0, round(
            ml_efficiency * panel_kw * derate_factor * 1000,
            2
        ))

       
        yield_per_sqft_wh = round(yield_per_panel_wh / panel_area_sqft, 2)

        hourly_per_panel.append(yield_per_panel_wh)
        hourly_per_sqft.append(yield_per_sqft_wh)

    
    daily_total_wh = sum(hourly_per_panel)
    daily_yield_kwh = round(daily_total_wh / 1000, 2)
    monthly_yield_kwh = round(daily_yield_kwh * 30, 2)

    
    psh = derive_peak_sun_hours(irradiance_list)

    return {
        "peak_sun_hours": psh,
        "hourly_yield_per_panel_wh": hourly_per_panel,
        "hourly_yield_per_sqft_wh": hourly_per_sqft,
        "daily_yield_per_panel_kwh": daily_yield_kwh,
        "monthly_yield_per_panel_kwh": monthly_yield_kwh
    }