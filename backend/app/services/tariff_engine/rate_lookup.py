
STATE_TARIFFS = {
    "Andaman and Nicobar": {"low": 2.5, "medium": 4.5, "high": 6.0},
    "Andhra Pradesh": {"low": 2.0, "medium": 4.5, "high": 9.0},
    "Arunachal Pradesh": {"low": 4.0, "medium": 4.0, "high": 4.0},
    "Assam": {"low": 4.5, "medium": 6.0, "high": 7.5},
    "Bihar": {"low": 6.0, "medium": 7.0, "high": 8.5},
    "Chandigarh": {"low": 2.7, "medium": 4.3, "high": 4.7},
    "Chhattisgarh": {"low": 3.5, "medium": 4.5, "high": 6.5},
    "Dadra and Nagar Haveli": {"low": 1.5, "medium": 2.5, "high": 3.2},
    "Daman and Diu": {"low": 1.5, "medium": 2.2, "high": 2.8},
    "Delhi": {"low": 3.0, "medium": 4.5, "high": 8.0},
    "Goa": {"low": 1.8, "medium": 3.0, "high": 4.5},
    "Gujarat": {"low": 3.0, "medium": 4.0, "high": 5.2},
    "Haryana": {"low": 2.0, "medium": 4.5, "high": 7.0},
    "Himachal Pradesh": {"low": 3.3, "medium": 4.0, "high": 5.0},
    "Jammu and Kashmir": {"low": 2.0, "medium": 3.0, "high": 4.0},
    "Jharkhand": {"low": 4.2, "medium": 5.5, "high": 6.2},
    "Karnataka": {"low": 4.5, "medium": 6.5, "high": 8.5},
    "Kerala": {"low": 4.0, "medium": 6.0, "high": 8.0},
    "Ladakh": {"low": 2.0, "medium": 3.0, "high": 4.0},
    "Lakshadweep": {"low": 1.5, "medium": 3.5, "high": 6.0},
    "Madhya Pradesh": {"low": 4.2, "medium": 5.5, "high": 7.0},
    "Maharashtra": {"low": 4.5, "medium": 8.5, "high": 11.5},
    "Manipur": {"low": 4.5, "medium": 5.5, "high": 6.5},
    "Meghalaya": {"low": 4.0, "medium": 4.5, "high": 6.0},
    "Mizoram": {"low": 3.5, "medium": 4.8, "high": 5.5},
    "Nagaland": {"low": 4.5, "medium": 5.5, "high": 6.5},
    "Odisha": {"low": 3.0, "medium": 4.8, "high": 6.2},
    "Puducherry": {"low": 1.5, "medium": 2.8, "high": 4.5},
    "Punjab": {"low": 3.5, "medium": 5.0, "high": 7.3},
    "Rajasthan": {"low": 4.7, "medium": 6.5, "high": 8.0},
    "Sikkim": {"low": 2.0, "medium": 3.0, "high": 4.0},
    "Tamil Nadu": {"low": 3.5, "medium": 5.5, "high": 7.5},
    "Telangana": {"low": 3.5, "medium": 5.0, "high": 8.5},
    "Tripura": {"low": 4.5, "medium": 5.5, "high": 7.0},
    "Uttar Pradesh": {"low": 5.5, "medium": 6.0, "high": 7.0},
    "Uttarakhand": {"low": 3.0, "medium": 4.2, "high": 5.5},
    "West Bengal": {"low": 5.0, "medium": 6.5, "high": 9.0},
}

# Safety fallback for unrecognized states
DEFAULT_TARIFF = {"low": 4.0, "medium": 6.5, "high": 8.0}


def get_tariff_rate(state: str, monthly_consumption_kwh: float) -> dict:
    """
    Looks up the correct electricity rate based on
    the user's state and their consumption slab.

    Slab logic (how Indian electricity boards charge):
      0-100 kWh/month   → low tier  (cheapest)
      100-300 kWh/month  → medium tier
      300+ kWh/month     → high tier (most expensive)
    """

    # -----------------------------------------
    # STEP 1: Find the state's tariff data
    # .get() returns DEFAULT_TARIFF if state not found
    # -----------------------------------------
    tariff = STATE_TARIFFS.get(state, DEFAULT_TARIFF)

    # -----------------------------------------
    # STEP 2: Determine consumption slab
    # -----------------------------------------
    if monthly_consumption_kwh <= 100:
        tier = "low"
    elif monthly_consumption_kwh <= 300:
        tier = "medium"
    else:
        tier = "high"

    rate = tariff[tier]

    return {
        "state": state,
        "tier": tier,
        "rate_per_kwh_inr": rate,
        "label": f"{state} Residential ({tier.title()} Tier - Rs {rate}/kWh)"
    }