from flask import Flask, request, jsonify
import joblib
import pandas as pd

# -----------------------------
# LOAD MODEL (Retrained with 4 features)
# -----------------------------
model = joblib.load("models/peak_solar_model.pkl")

app = Flask(__name__)

# -----------------------------
# HEALTH CHECK
# -----------------------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "Weather-Aware Hybrid ML API Running"})


# -----------------------------
# PREDICT DAY
# -----------------------------
@app.route("/predict-day", methods=["POST"])
def predict_day():
    try:
        data = request.get_json()

        # -----------------------------
        # VALIDATION
        # -----------------------------
        required_fields = [
            "hourly_irradiance_forecast",
            "hourly_temp_forecast",
            "system_size_kw"
        ]

        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing field: {field}"}), 400

        irradiance_forecast = data["hourly_irradiance_forecast"]
        temp_forecast = data["hourly_temp_forecast"]
        system_size = float(data["system_size_kw"])

        chart_data = []
        peak_power = 0.0
        peak_time = "00:00"
        derate_factor = 0.82  # Accounts for wiring, dirt, and inverter losses

        # -----------------------------
        # 24-HOUR INTERPOLATION LOOP
        # -----------------------------
        for hour in range(24):
            hour_irradiance = float(irradiance_forecast[hour])
            hour_temp = float(temp_forecast[hour])

            # Structural Gate: Hard zero during night intervals
            if hour_irradiance <= 0:
                prediction = 0.0
            else:
                # Cell thermal computation matching your training matrix exactly
                module_temp = hour_temp + (hour_irradiance * 0.03)

                # -----------------------------
                # MATCH RETRAINED FEATURES (4 COLUMNS)
                # -----------------------------
                raw_features = {
                    "hour": hour,
                    "IRRADIATION": hour_irradiance,
                    "AMBIENT_TEMPERATURE": hour_temp,
                    "MODULE_TEMPERATURE": module_temp
                }

                feature_order = [
                    "hour",
                    "IRRADIATION",
                    "AMBIENT_TEMPERATURE",
                    "MODULE_TEMPERATURE"
                ]

                features = pd.DataFrame([raw_features])[feature_order]

                # Get the 1kW weather efficiency scaling factor (0.0 to 1.0)
                ml_efficiency_factor = float(model.predict(features)[0])

                # -----------------------------
                # THE HYBRID PHYSICS STEP (FIXED)
                # -----------------------------
                # Scale the 1kW weather baseline up by the true hardware capacity
                prediction = ml_efficiency_factor * system_size * derate_factor
                prediction = max(0.0, round(prediction, 2))

            time_label = f"{hour:02d}:00"

            if prediction > peak_power:
                peak_power = prediction
                peak_time = time_label

            chart_data.append({
                "time": time_label,
                "power_kwh": prediction
            })

        return jsonify({
            "peak_power_kwh": round(peak_power, 2),
            "peak_time": peak_time,
            "chart_data": chart_data
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -----------------------------
# RUN ENGINE
# -----------------------------
if __name__ == "__main__":
    app.run(port=8010, debug=True)