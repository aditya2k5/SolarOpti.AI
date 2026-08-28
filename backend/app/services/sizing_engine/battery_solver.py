
import math

from app.core.engineering_defaults import (
    DEFAULT_AUTONOMY_DAYS,
    DEFAULT_BATTERY_DOD,
    DEFAULT_BATTERY_EFFICIENCY,
    DEFAULT_BATTERY_CAPACITY_KWH,
    DEFAULT_SYSTEM_VOLTAGE
)


def step_battery_kwh(
    daily_consumption_kwh: float,
    autonomy_days: int = DEFAULT_AUTONOMY_DAYS,
    dod: float = DEFAULT_BATTERY_DOD,
    efficiency: float = DEFAULT_BATTERY_EFFICIENCY
) -> dict:
    """
    STEP 5 of RE Numerical
    Formula: Battery kWh = (Daily Energy × Autonomy Days) ÷ (DoD × Efficiency)

    WHY: If you consume 15 kWh/day and want 1 day backup:
    - You can't use 100% of battery (DoD = 0.80)
    - Charging/discharging wastes energy (Efficiency = 0.90)
    - So you need MORE storage than just 15 kWh
    """
    denominator = dod * efficiency
    if denominator > 0:
        result = round((daily_consumption_kwh * autonomy_days) / denominator, 2)
    else:
        result = 0.0

    return {
        "step": 5,
        "title": "Battery Storage Required",
        "formula": "Battery kWh = (Daily Energy × Autonomy Days) ÷ (DoD × Efficiency)",
        "calculation": f"({daily_consumption_kwh} × {autonomy_days}) ÷ ({dod} × {efficiency}) = {result} kWh",
        "result": result,
        "unit": "kWh"
    }


def step_battery_ah(
    battery_kwh: float,
    system_voltage: int = DEFAULT_SYSTEM_VOLTAGE
) -> dict:
    """
    STEP 6 of RE Numerical
    Formula: Battery Ah = (Battery kWh × 1000) ÷ System Voltage

    WHY: Batteries are rated in Ah (Ampere-hours), not kWh.
    This conversion uses the basic electrical formula:
      Energy (Wh) = Voltage (V) × Capacity (Ah)
    Rearranging: Ah = Wh ÷ V

    As an EEE student, you know this from your circuits class!
    """
    wh = battery_kwh * 1000
    if system_voltage > 0:
        result = round(wh / system_voltage, 2)
    else:
        result = 0.0

    return {
        "step": 6,
        "title": "Battery Capacity in Ampere-Hours",
        "formula": "Ah = (Battery kWh × 1000) ÷ System Voltage",
        "calculation": f"({battery_kwh} × 1000) ÷ {system_voltage} = {result} Ah",
        "result": result,
        "unit": "Ah"
    }


def step_battery_count(
    battery_kwh: float,
    single_battery_kwh: float = DEFAULT_BATTERY_CAPACITY_KWH,
    engineer_battery_override: int = None
) -> dict:
    """
    Calculates how many physical battery units are needed.
    Each unit is assumed to be 5 kWh (standard residential).
    """
    if single_battery_kwh > 0:
        recommended = math.ceil(battery_kwh / single_battery_kwh)
    else:
        recommended = 0

    final = engineer_battery_override if engineer_battery_override is not None else recommended

    return {
        "recommended_batteries": recommended,
        "final_batteries": final,
        "was_overridden": engineer_battery_override is not None
    }


def run_battery_numerical(
    daily_consumption_kwh: float,
    autonomy_days: int = DEFAULT_AUTONOMY_DAYS,
    dod: float = DEFAULT_BATTERY_DOD,
    efficiency: float = DEFAULT_BATTERY_EFFICIENCY,
    system_voltage: int = DEFAULT_SYSTEM_VOLTAGE,
    single_battery_kwh: float = DEFAULT_BATTERY_CAPACITY_KWH,
    engineer_battery_override: int = None
) -> dict:
    """
    Runs the complete battery numerical (Steps 5-6) in sequence.
    """

    # Step 5: Daily energy → Total battery kWh
    s5 = step_battery_kwh(daily_consumption_kwh, autonomy_days, dod, efficiency)

    # Step 6: Battery kWh → Ah (using V = IR basics!)
    s6 = step_battery_ah(s5["result"], system_voltage)

    # Battery count
    count = step_battery_count(s5["result"], single_battery_kwh, engineer_battery_override)

    return {
        "steps": [s5, s6],
        "battery_kwh": s5["result"],
        "battery_ah": s6["result"],
        "final_batteries": count["final_batteries"],
        "recommended_batteries": count["recommended_batteries"]
    }