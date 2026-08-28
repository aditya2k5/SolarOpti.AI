from pydantic import BaseModel
from typing import Optional

class LocationInput(BaseModel):
    latitude: float
    longitude: float
    state: str = "Kerala"            
class ConsumptionInput(BaseModel):
    monthly_kwh: float

class EngineerOverrides(BaseModel):
    panel_wattage_w: Optional[float] = None
    panel_area_sqft: Optional[float] = None
    derate_factor: Optional[float] = None
    autonomy_days: Optional[int] = None
    battery_dod: Optional[float] = None
    battery_efficiency: Optional[float] = None
    system_voltage_v: Optional[int] = None
    inverter_safety_factor: Optional[float] = None
    tilt_degrees: Optional[float] = None
    panel_count: Optional[int] = None
    battery_count: Optional[int] = None


class SimulationRequest(BaseModel):
    location: LocationInput
    consumption: ConsumptionInput
    mode: str = "normal"              
    engineer_overrides: Optional[EngineerOverrides] = None