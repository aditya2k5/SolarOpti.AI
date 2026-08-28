# app/services/tariff_engine/financial_calc.py

from app.core.engineering_defaults import (
    DEFAULT_PANEL_WATTAGE_W,
    DEFAULT_COST_PER_KW_INR,
    DEFAULT_BATTERY_COST_INR
)


def calculate_financials(
    monthly_consumption_kwh: float,
    monthly_generation_kwh: float,
    final_panels: int,
    final_batteries: int,
    rate_per_kwh_inr: float,
    tariff_label: str,
    panel_wattage_w: float = DEFAULT_PANEL_WATTAGE_W
) -> dict:
    """
    Calculates the complete financial picture for the user.

    This answers the 4 questions every homeowner asks:
    1. What is my current bill?
    2. What will my bill be after solar?
    3. How much will I save?
    4. When does the system pay for itself?
    """

    # -----------------------------------------
    # 1. MONTHLY BILL BEFORE SOLAR
    # Simple: consumption × tariff rate
    # Example: 450 kWh × ₹8 = ₹3,600/month
    # -----------------------------------------
    bill_before = round(monthly_consumption_kwh * rate_per_kwh_inr, 2)

    # -----------------------------------------
    # 2. MONTHLY BILL AFTER SOLAR
    # Whatever the solar panels DON'T cover, you still buy from the grid
    # If solar generates MORE than you consume, bill goes to ₹0
    # (Net metering credit is not calculated in this MVP)
    # -----------------------------------------
    remaining_consumption = max(0, monthly_consumption_kwh - monthly_generation_kwh)
    bill_after = round(remaining_consumption * rate_per_kwh_inr, 2)

    # -----------------------------------------
    # 3. MONTHLY SAVINGS
    # The difference between old bill and new bill
    # -----------------------------------------
    monthly_savings = round(bill_before - bill_after, 2)
    annual_savings = round(monthly_savings * 12, 2)

    # -----------------------------------------
    # 4. SYSTEM COST
    # Panel cost + Battery cost
    # Panel cost = system size in kW × cost per kW
    # -----------------------------------------
    system_kw = (final_panels * panel_wattage_w) / 1000.0
    panel_cost = system_kw * DEFAULT_COST_PER_KW_INR
    battery_cost = final_batteries * DEFAULT_BATTERY_COST_INR
    total_cost = round(panel_cost + battery_cost, 2)

    # -----------------------------------------
    # 5. PAYBACK PERIOD
    # How many years until savings = cost
    # Example: ₹3,53,000 ÷ ₹42,000/year = 8.4 years
    # After this, electricity is essentially FREE
    # -----------------------------------------
    if annual_savings > 0:
        payback_years = round(total_cost / annual_savings, 1)
    else:
        payback_years = 0.0

    return {
        "monthly_bill_before_solar_inr": bill_before,
        "monthly_bill_after_solar_inr": bill_after,
        "monthly_savings_inr": monthly_savings,
        "annual_savings_inr": annual_savings,
        "estimated_system_cost_inr": total_cost,
        "payback_years": payback_years,
        "tariff_applied": tariff_label
    }