# app/services/sizing_engine/inverter_solver.py

from app.core.engineering_defaults import DEFAULT_INVERTER_SAFETY_FACTOR


def step_inverter_size(
    array_kwp: float,
    safety_factor: float = DEFAULT_INVERTER_SAFETY_FACTOR
) -> dict:
    """
    STEP 7 of RE Numerical
    Formula: Inverter Size (kVA) = PV Array kWp × Safety Factor

    WHY: The inverter must handle the full output of the solar array
    PLUS a safety margin for surge loads (AC compressor startup,
    motor loads, etc.)

    We use the PV array size as the peak load for this MVP.
    In a real design, you would measure the actual household peak load.
    """
    result = round(array_kwp * safety_factor, 2)

    return {
        "step": 7,
        "title": "Recommended Inverter Size",
        "formula": "Inverter kVA = PV Array kWp × Safety Factor",
        "calculation": f"{array_kwp} × {safety_factor} = {result} kVA",
        "result": result,
        "unit": "kVA"
    }