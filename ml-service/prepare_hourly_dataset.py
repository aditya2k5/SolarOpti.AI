import pandas as pd

# 1. LOAD RAW DATA
gen_df = pd.read_csv("dataset/archive/Plant_1_Generation_Data.csv")
weather_df = pd.read_csv("dataset/archive/Plant_1_Weather_Sensor_Data.csv")

gen_df["DATE_TIME"] = pd.to_datetime(gen_df["DATE_TIME"], format='mixed')
weather_df["DATE_TIME"] = pd.to_datetime(weather_df["DATE_TIME"], format='mixed')

# 2. AGGREGATE PER INVERTER
gen_df.set_index("DATE_TIME", inplace=True)
weather_df.set_index("DATE_TIME", inplace=True)

weather_hourly = weather_df.resample("h").agg({
    "IRRADIATION": "mean",
    "AMBIENT_TEMPERATURE": "mean",
    "MODULE_TEMPERATURE": "mean"
}).dropna()

gen_hourly = gen_df.groupby(["SOURCE_KEY"]).resample("h").agg({
    "AC_POWER": "mean"
}).dropna()

gen_hourly = gen_hourly.reset_index()
weather_hourly = weather_hourly.reset_index()

# 3. MERGE DATASETS
final_df = pd.merge(gen_hourly, weather_hourly, on="DATE_TIME", how="inner")
final_df["hour"] = final_df["DATE_TIME"].dt.hour

# 4. CREATE THE HYBRID ML TARGET
# Find the absolute maximum power this specific inverter ever generated
max_ac_power = final_df["AC_POWER"].max()

# Normalize the power to a 0.0 - 1.0 scale. 
# This represents how much of its maximum capacity the system is currently producing based purely on the weather.
final_df["normalized_1kw_yield"] = final_df["AC_POWER"] / max_ac_power

# 5. EXPORT
final_df.drop(columns=["SOURCE_KEY"], inplace=True)
final_df.to_csv("dataset/ml_weather_efficiency_data.csv", index=False)

print("Dataset Normalized! Target column is now 'normalized_1kw_yield'.")