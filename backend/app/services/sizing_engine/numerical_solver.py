import math

from app.core.engineering_defaults import (
    DEFAULT_PANEL_WATTAGE_W,
    DEFAULT_PANEL_AREA_SQFT,
    DEFAULT_DERATE_FACTOR,
    DEFAULT_SIZING_SAFETY_FACTOR
)


def step_daily_consumption(monthly_kwh: float) -> dict:
    
    result = round(monthly_kwh / 30, 2)

    return {
        "step": 1,
        "title": "Daily Energy Consumption",
        "formula": "Daily Consumption = Monthly Consumption ÷ 30",
        "calculation": f"{monthly_kwh} ÷ 30 = {result} kWh/day",
        "result": result,
        "unit": "kWh/day"
    }


def step_dc_energy(daily_ac_kwh: float, derate_factor: float = DEFAULT_DERATE_FACTOR) -> dict:
    
    result = round(daily_ac_kwh / derate_factor, 2)

    return {
        "step": 2,
        "title": "Required DC Energy (after system losses)",
        "formula": "DC Energy = Daily AC Energy ÷ Derate Factor",
        "calculation": f"{daily_ac_kwh} ÷ {derate_factor} = {result} kWh/day",
        "result": result,
        "unit": "kWh/day"
    }


def step_pv_array_size(dc_energy_kwh: float, peak_sun_hours: float) -> dict:
   
    if peak_sun_hours > 0:
        result = round(dc_energy_kwh / peak_sun_hours, 2)
    else:
        result = 0.0

    return {
        "step": 3,
        "title": "PV Array Size Required",
        "formula": "Array Size (kWp) = DC Energy ÷ Peak Sun Hours",
        "calculation": f"{dc_energy_kwh} ÷ {peak_sun_hours} = {result} kWp",
        "result": result,
        "unit": "kWp"
    }


def step_panel_count(
    array_kwp: float,
    panel_wattage_w: float = DEFAULT_PANEL_WATTAGE_W,
    panel_area_sqft: float = DEFAULT_PANEL_AREA_SQFT,
    safety_factor: float = DEFAULT_SIZING_SAFETY_FACTOR,
    engineer_panel_override: int = None
) -> dict:
    
    panel_kwp = panel_wattage_w / 1000.0
    sized_array = array_kwp * safety_factor

    if panel_kwp > 0:
        recommended = math.ceil(sized_array / panel_kwp)
    else:
        recommended = 0

   
    final_panels = engineer_panel_override if engineer_panel_override else recommended
    total_area = round(final_panels * panel_area_sqft, 1)

    return {
        "step": 4,
        "title": "Number of Solar Panels",
        "formula": "Panels = ⌈(Array kWp × Safety Factor) ÷ Panel kWp⌉",
        "calculation": f"⌈({array_kwp} × {safety_factor}) ÷ {panel_kwp}⌉ = ⌈{round(sized_array / panel_kwp, 2)}⌉ = {recommended} panels",
        "result": final_panels,
        "unit": "panels",
        
        "recommended_panels": recommended,
        "was_overridden": engineer_panel_override is not None,
        "total_roof_area_sqft": total_area
    }


def run_sizing_numerical(
    monthly_kwh: float,
    peak_sun_hours: float,
    derate_factor: float = DEFAULT_DERATE_FACTOR,
    panel_wattage_w: float = DEFAULT_PANEL_WATTAGE_W,
    panel_area_sqft: float = DEFAULT_PANEL_AREA_SQFT,
    safety_factor: float = DEFAULT_SIZING_SAFETY_FACTOR,
    engineer_panel_override: int = None
) -> dict:
    

    
    s1 = step_daily_consumption(monthly_kwh)

    
    s2 = step_dc_energy(s1["result"], derate_factor)

   
    s3 = step_pv_array_size(s2["result"], peak_sun_hours)

  
    s4 = step_panel_count(
        s3["result"],
        panel_wattage_w,
        panel_area_sqft,
        safety_factor,
        engineer_panel_override
    )

    return {
        "steps": [s1, s2, s3, s4],
        "daily_consumption_kwh": s1["result"],
        "dc_energy_kwh": s2["result"],
        "array_kwp": s3["result"],
        "final_panels": s4["result"],
        "recommended_panels": s4["recommended_panels"],
        "total_roof_area_sqft": s4["total_roof_area_sqft"]
    }