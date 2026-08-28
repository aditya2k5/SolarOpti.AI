from pydantic import BaseModel
from typing import List


class AssumptionEntry(BaseModel):
    parameter: str                     # e.g. "Panel Wattage"
    value: float                       # e.g. 450
    unit: str                          # e.g. "W"
    source: str                        # "default_assumption" or "user_provided"


class CalculationStep(BaseModel):
    step: int                          # Step number (1, 2, 3...)
    title: str                         # e.g. "Daily Consumption"
    formula: str                       # e.g. "Daily = Monthly ÷ 30"
    calculation: str                   # e.g. "450 ÷ 30 = 15.0 kWh/day"
    result: float                      # e.g. 15.0
    unit: str                          # e.g. "kWh/day"


class YieldOutput(BaseModel):
    peak_sun_hours: float
    hourly_yield_per_panel_wh: List[float]
    hourly_yield_per_sqft_wh: List[float]
    daily_yield_per_panel_kwh: float
    monthly_yield_per_panel_kwh: float


class FinalRecommendation(BaseModel):
    pv_array_kwp: float
    panel_count: int
    total_roof_area_sqft: float
    battery_kwh: float
    battery_ah: float
    battery_count: int
    inverter_kva: float
    monthly_generation_kwh: float


class FinancialOutput(BaseModel):
    monthly_bill_before_solar_inr: float
    monthly_bill_after_solar_inr: float
    monthly_savings_inr: float
    estimated_system_cost_inr: float
    payback_years: float
    tariff_applied: str


class SimulationResponse(BaseModel):
    inputs_received: dict
    assumptions_used: List[AssumptionEntry]
    yield_output: YieldOutput
    sizing_steps: List[CalculationStep]
    final_recommendation: FinalRecommendation
    financials: FinancialOutput
    disclaimers: List[str]