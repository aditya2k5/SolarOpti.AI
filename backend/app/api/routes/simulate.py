# app/api/routes/simulate.py
from fastapi import APIRouter

from app.schemas.requests import SimulationRequest
from app.schemas.responses import (
    SimulationResponse,
    AssumptionEntry,
    YieldOutput,
    CalculationStep,
    FinalRecommendation,
    FinancialOutput
)
from app.core.engineering_defaults import (
    DEFAULT_PANEL_WATTAGE_W,
    DEFAULT_PANEL_AREA_SQFT,
    DEFAULT_DERATE_FACTOR,
    DEFAULT_AUTONOMY_DAYS,
    DEFAULT_BATTERY_DOD,
    DEFAULT_BATTERY_EFFICIENCY,
    DEFAULT_SYSTEM_VOLTAGE,
    DEFAULT_INVERTER_SAFETY_FACTOR,
    DEFAULT_SIZING_SAFETY_FACTOR,
    DEFAULT_BATTERY_CAPACITY_KWH
)
from app.services.yield_engine.weather_client import fetch_hourly_weather
from app.services.yield_engine.pv_model import predict_hourly_yield
from app.services.sizing_engine.numerical_solver import run_sizing_numerical
from app.services.sizing_engine.battery_solver import run_battery_numerical
from app.services.sizing_engine.inverter_solver import step_inverter_size
from app.services.tariff_engine.rate_lookup import get_tariff_rate
from app.services.tariff_engine.financial_calc import calculate_financials

# -----------------------------------------
# CREATE A ROUTER (sub-app for this endpoint)
# -----------------------------------------
router = APIRouter()


def resolve_param(override_value, default_value):
    """
    If the engineer provided a custom value, use it.
    Otherwise, fall back to the engineering default.
    Returns: (final_value, source_label)
    """
    if override_value is not None:
        return override_value, "user_provided"
    return default_value, "default_assumption"


@router.post("/api/simulate", response_model=SimulationResponse)
async def simulate(request: SimulationRequest):
    """
    THE MAIN ENDPOINT
    This is the control room that runs the full simulation:
      1. Fetch weather data
      2. Predict yield using ML model
      3. Run RE numerical (F1-F7)
      4. Calculate financials
      5. Return step-by-step response
    """

    # =========================================
    # STEP A: RESOLVE ALL PARAMETERS
    # Engineer overrides > Default assumptions
    # =========================================
    overrides = request.engineer_overrides
    if overrides is None:
        from app.schemas.requests import EngineerOverrides
        overrides = EngineerOverrides()

    # Resolve each parameter and track its source
    panel_w, panel_w_src = resolve_param(overrides.panel_wattage_w, DEFAULT_PANEL_WATTAGE_W)
    panel_area, panel_area_src = resolve_param(overrides.panel_area_sqft, DEFAULT_PANEL_AREA_SQFT)
    derate, derate_src = resolve_param(overrides.derate_factor, DEFAULT_DERATE_FACTOR)
    autonomy, autonomy_src = resolve_param(overrides.autonomy_days, DEFAULT_AUTONOMY_DAYS)
    dod, dod_src = resolve_param(overrides.battery_dod, DEFAULT_BATTERY_DOD)
    batt_eff, batt_eff_src = resolve_param(overrides.battery_efficiency, DEFAULT_BATTERY_EFFICIENCY)
    sys_voltage, sys_v_src = resolve_param(overrides.system_voltage_v, DEFAULT_SYSTEM_VOLTAGE)
    inv_safety, inv_src = resolve_param(overrides.inverter_safety_factor, DEFAULT_INVERTER_SAFETY_FACTOR)
    tilt, tilt_src = resolve_param(overrides.tilt_degrees, request.location.latitude)

    # Build assumptions list for the response
    assumptions = [
        AssumptionEntry(parameter="Panel Wattage", value=panel_w, unit="W", source=panel_w_src),
        AssumptionEntry(parameter="Panel Area", value=panel_area, unit="sqft", source=panel_area_src),
        AssumptionEntry(parameter="Derate Factor", value=derate, unit="", source=derate_src),
        AssumptionEntry(parameter="Autonomy Days", value=autonomy, unit="days", source=autonomy_src),
        AssumptionEntry(parameter="Battery DoD", value=dod, unit="", source=dod_src),
        AssumptionEntry(parameter="Battery Efficiency", value=batt_eff, unit="", source=batt_eff_src),
        AssumptionEntry(parameter="System Voltage", value=sys_voltage, unit="V", source=sys_v_src),
        AssumptionEntry(parameter="Inverter Safety Factor", value=inv_safety, unit="", source=inv_src),
        AssumptionEntry(parameter="Tilt Angle", value=tilt, unit="°", source=tilt_src),
    ]

    # =========================================
    # STEP B: PART 1 — YIELD ENGINE
    # Fetch weather → ML prediction → PSH
    # =========================================
    weather = await fetch_hourly_weather(
        request.location.latitude,
        request.location.longitude
    )

    yield_result = predict_hourly_yield(
        irradiance_list=weather["irradiance"],
        temperature_list=weather["temperature"],
        panel_wattage_w=panel_w,
        panel_area_sqft=panel_area,
        derate_factor=derate
    )

    yield_output = YieldOutput(
        peak_sun_hours=yield_result["peak_sun_hours"],
        hourly_yield_per_panel_wh=yield_result["hourly_yield_per_panel_wh"],
        hourly_yield_per_sqft_wh=yield_result["hourly_yield_per_sqft_wh"],
        daily_yield_per_panel_kwh=yield_result["daily_yield_per_panel_kwh"],
        monthly_yield_per_panel_kwh=yield_result["monthly_yield_per_panel_kwh"]
    )

    # =========================================
    # STEP C: PART 2 — SIZING ENGINE (F1-F7)
    # The core RE numerical
    # =========================================

    # F1-F4: Panel sizing numerical
    sizing = run_sizing_numerical(
        monthly_kwh=request.consumption.monthly_kwh,
        peak_sun_hours=yield_result["peak_sun_hours"],
        derate_factor=derate,
        panel_wattage_w=panel_w,
        panel_area_sqft=panel_area,
        safety_factor=DEFAULT_SIZING_SAFETY_FACTOR,
        engineer_panel_override=overrides.panel_count
    )

    # F5-F6: Battery numerical
    battery = run_battery_numerical(
        daily_consumption_kwh=sizing["daily_consumption_kwh"],
        autonomy_days=autonomy,
        dod=dod,
        efficiency=batt_eff,
        system_voltage=sys_voltage,
        single_battery_kwh=DEFAULT_BATTERY_CAPACITY_KWH,
        engineer_battery_override=overrides.battery_count
    )

    # F7: Inverter sizing
    inverter = step_inverter_size(
        array_kwp=sizing["array_kwp"],
        safety_factor=inv_safety
    )

    # Combine all 7 steps into one list
    all_steps = sizing["steps"] + battery["steps"] + [inverter]

    # Convert step dicts to CalculationStep objects
    sizing_steps = [CalculationStep(**s) for s in all_steps]

    # Monthly generation = yield per panel × number of panels
    monthly_gen = round(
        yield_result["monthly_yield_per_panel_kwh"] * sizing["final_panels"],
        2
    )

    final_recommendation = FinalRecommendation(
        pv_array_kwp=sizing["array_kwp"],
        panel_count=sizing["final_panels"],
        total_roof_area_sqft=sizing["total_roof_area_sqft"],
        battery_kwh=battery["battery_kwh"],
        battery_ah=battery["battery_ah"],
        battery_count=battery["final_batteries"],
        inverter_kva=inverter["result"],
        monthly_generation_kwh=monthly_gen
    )

    # =========================================
    # STEP D: PART 3 — TARIFF & FINANCIAL ENGINE
    # =========================================
    tariff = get_tariff_rate(
        state=request.location.state,
        monthly_consumption_kwh=request.consumption.monthly_kwh
    )

    financials_result = calculate_financials(
        monthly_consumption_kwh=request.consumption.monthly_kwh,
        monthly_generation_kwh=monthly_gen,
        final_panels=sizing["final_panels"],
        final_batteries=battery["final_batteries"],
        rate_per_kwh_inr=tariff["rate_per_kwh_inr"],
        tariff_label=tariff["label"],
        panel_wattage_w=panel_w
    )

    financials = FinancialOutput(
        monthly_bill_before_solar_inr=financials_result["monthly_bill_before_solar_inr"],
        monthly_bill_after_solar_inr=financials_result["monthly_bill_after_solar_inr"],
        monthly_savings_inr=financials_result["monthly_savings_inr"],
        estimated_system_cost_inr=financials_result["estimated_system_cost_inr"],
        payback_years=financials_result["payback_years"],
        tariff_applied=financials_result["tariff_applied"]
    )

    # =========================================
    # STEP E: BUILD FINAL RESPONSE
    # =========================================
    disclaimers = [
        "This is a first-pass feasibility estimate, not a final installation design.",
        "Actual performance depends on roof orientation, shading, and local weather patterns.",
        "Battery sizing assumes grid-tied with minimal backup. Off-grid requires different calculations.",
        "Tariff rates are approximate and may vary by distribution company within the state.",
        "Consult a certified solar installer before procurement."
    ]

    return SimulationResponse(
        inputs_received={
            "latitude": request.location.latitude,
            "longitude": request.location.longitude,
            "state": request.location.state,
            "monthly_kwh": request.consumption.monthly_kwh,
            "mode": request.mode
        },
        assumptions_used=assumptions,
        yield_output=yield_output,
        sizing_steps=sizing_steps,
        final_recommendation=final_recommendation,
        financials=financials,
        disclaimers=disclaimers
    )