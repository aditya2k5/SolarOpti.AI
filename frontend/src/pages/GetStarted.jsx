import React, { useState, useEffect } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from "recharts";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default Leaflet marker icons in React
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function MapEventsAndMarker({ lat, lon, updateLocation }) {
    const map = useMap();

    useEffect(() => {
        if (lat && lon) {
            map.flyTo([Number(lat), Number(lon)], map.getZoom());
        }
    }, [lat, lon, map]);

    useMapEvents({
        click: (e) => {
            updateLocation(e.latlng.lat, e.latlng.lng);
        },
    });

    return lat && lon ? (
        <Marker position={[Number(lat), Number(lon)]} />
    ) : null;
}

const GetStarted = () => {
    // Default panel wattage for display
    const DEFAULT_PANEL_WATTAGE = 450;

    // CURRENT STEP
    const [step, setStep] = useState(1);

    // Location Loader
    const [isLocating, setIsLocating] = useState(false);

    // solar result
    const [result, setResult] = useState(null);

    //graph data
    const [graphData, setGraphData] = useState([]);
    const [peakInfo, setPeakInfo] = useState(null);

    // Loading State Trackers
    const [loading, setLoading] = useState(false);
    // Export loading state
    const [isExporting, setIsExporting] = useState(false);

    // -----------------------------------------
    // ENGINEER MODE STATE
    // -----------------------------------------
    const [engineerMode, setEngineerMode] = useState(false);
    const [overrides, setOverrides] = useState({
        panel_wattage_w: "",
        derate_factor: "",
        autonomy_days: "",
        battery_dod: "",
        system_voltage_v: "",
        inverter_safety_factor: "",
    });

    // Update override fields
    const updateOverride = (key) => (e) => {
        setOverrides((prev) => ({ ...prev, [key]: e.target.value }));
    };

    // form data
    const [form, setForm] = useState({
        // step 1 - location
        address: "",
        lat: "",
        lon: "",

        // step 2 - energy
        consumptionType: "bill",
        monthlyBill: "",
        monthlyKwh: "",

        // STEP 3 - PROPERTY
        roofType: "Flat Roof",
        roofArea: "",
        budget: "1L-3L",
    });

    // Input update
    const update = (key) => (e) => {
        setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

    // direct update
    const updateDirect = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    // MAP LOCATION UPDATE
    const updateLocation = (lat, lon) => {
        setForm((prev) => {
            return {
                ...prev,
                lat: String(parseFloat(lat).toFixed(6)),
                lon: String(parseFloat(lon).toFixed(6))
            };
        });
    };

    const handleAutoDetect = () => {
        setIsLocating(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    updateLocation(position.coords.latitude, position.coords.longitude);
                    setIsLocating(false);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    alert("Could not detect location. Please ensure location permissions are granted.");
                    setIsLocating(false);
                }
            );
        } else {
            alert("Geolocation is not supported by your browser.");
            setIsLocating(false);
        }
    };

    const next = () => setStep((s) => Math.min(3, s + 1));
    const back = () => setStep((s) => Math.max(1, s - 1));

    // -----------------------------------------
    // UPDATED: Now calls our new FastAPI backend
    // -----------------------------------------
    const runSimulation = async () => {
        // FRONTEND VALIDATION
        if (!form.lat || !form.lon) {
            alert("Please select your location");
            return;
        }

        if (form.consumptionType === "bill" && !form.monthlyBill) {
            alert("Please enter monthly bill");
            return;
        }

        if (form.consumptionType === "kwh" && !form.monthlyKwh) {
            alert("Please enter monthly units");
            return;
        }

        // START LOADING
        setLoading(true);

        try {
            // -----------------------------------------
            // CONVERT BILL TO kWh IF NEEDED
            // If user entered bill in ₹, estimate kWh
            // Using average ₹7/kWh as rough conversion
            // -----------------------------------------
            let monthlyKwh;
            if (form.consumptionType === "bill") {
                monthlyKwh = Math.round(Number(form.monthlyBill) / 7);
            } else {
                monthlyKwh = Number(form.monthlyKwh);
            }

            // -----------------------------------------
            // EXTRACT STATE NAME FROM ADDRESS
            // -----------------------------------------
            const rawState = form.address?.split(",")?.pop()?.trim() || "Kerala";

            // -----------------------------------------
            // BUILD PAYLOAD FOR OUR NEW FASTAPI BACKEND
            // -----------------------------------------
            // -----------------------------------------
            // BUILD ENGINEER OVERRIDES (only non-empty fields)
            // -----------------------------------------
            let engineerOverrides = null;
            if (engineerMode) {
                engineerOverrides = {};
                Object.entries(overrides).forEach(([key, value]) => {
                    if (value !== "" && value !== null) {
                        engineerOverrides[key] = Number(value);
                    }
                });
                // Only send if at least one field was filled
                if (Object.keys(engineerOverrides).length === 0) {
                    engineerOverrides = null;
                }
            }

            const payload = {
                location: {
                    latitude: Number(form.lat),
                    longitude: Number(form.lon),
                    state: rawState
                },
                consumption: {
                    monthly_kwh: monthlyKwh
                },
                mode: engineerMode ? "engineer" : "normal",
                engineer_overrides: engineerOverrides
            };

            console.log("Sending Payload to FastAPI:", payload);

            // -----------------------------------------
            // CALL OUR NEW BACKEND
            // -----------------------------------------
            const response = await fetch(
                "http://localhost:8000/api/simulate",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Server Error");
            }

            const data = await response.json();
            console.log("Backend Response:", data);

            // -----------------------------------------
            // MAP BACKEND RESPONSE → FRONTEND UI FIELDS
            // -----------------------------------------
            const rec = data.final_recommendation;
            const fin = data.financials;

            setResult({
                systemSize: `${rec.pv_array_kwp} kWp`,
                recommendedPanels: `${rec.panel_count} Panels (${DEFAULT_PANEL_WATTAGE}W each)`,
                recommendedInverter: `${rec.inverter_kva} kVA Inverter`,
                estimatedProduction: `${rec.monthly_generation_kwh} kWh/month`,
                estimatedCost: `₹ ${fin.estimated_system_cost_inr.toLocaleString("en-IN")}`,
                governmentSubsidy: "Check MNRE Portal",
                finalCost: `₹ ${fin.estimated_system_cost_inr.toLocaleString("en-IN")}`,
                monthlySavings: `₹ ${fin.monthly_savings_inr.toLocaleString("en-IN")}`,
                paybackYears: `${fin.payback_years} Years`,
                billBefore: `₹ ${fin.monthly_bill_before_solar_inr.toLocaleString("en-IN")}`,
                billAfter: `₹ ${fin.monthly_bill_after_solar_inr.toLocaleString("en-IN")}`,
                tariff: fin.tariff_applied,
                sizingSteps: data.sizing_steps,
                assumptions: data.assumptions_used,
                disclaimers: data.disclaimers
            });

            // -----------------------------------------
            // MAP HOURLY YIELD → GRAPH FORMAT
            // -----------------------------------------
            const hourlyYield = data.yield_output.hourly_yield_per_panel_wh;
            const chartData = hourlyYield.map((wh, index) => ({
                time: `${String(index).padStart(2, "0")}:00`,
                power_kwh: Math.round((wh * rec.panel_count) / 1000 * 100) / 100
            }));

            setGraphData(chartData);

            // Find peak power and time
            const maxPower = Math.max(...chartData.map(d => d.power_kwh));
            const peakEntry = chartData.find(d => d.power_kwh === maxPower);
            setPeakInfo({
                peakPower: maxPower,
                peakTime: peakEntry?.time || "12:00"
            });

            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth"
            });

        } catch (error) {
            console.error(error);
            alert(`Simulation Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // PDF Generation Handler
    const downloadPDFReport = async () => {
        setIsExporting(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Please sign in to export reports.");
                setIsExporting(false);
                return;
            }

            const payload = {
                recommendation: result,
                peakInfo: peakInfo,
                graphData: graphData,
                formDetails: {
                    address: form.address,
                    lat: form.lat,
                    lon: form.lon,
                    roofType: form.roofType,
                    monthlyBill: form.monthlyBill,
                    monthlyKwh: form.monthlyKwh,
                    state: form.address?.split(",")?.pop()?.trim()?.replace(/\s+/g, "")
                }
            };

            const response = await fetch("http://localhost:5000/api/report/export-pdf", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error("Failed to compile document bytes.");
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.setAttribute("download", `SolarOpti_Proposal_${form.address?.split(',')[0]?.replace(/\s+/g, '_') || 'Report'}.pdf`);

            document.body.appendChild(link);
            link.click();

            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);

        } catch (error) {
            console.error("PDF Export Failure:", error);
            alert("Could not generate proposal document. Please check your network connection.");
        } finally {
            setIsExporting(false);
        }
    };

    const defaultCenter = [20.5937, 78.9629];
    const roofTypes = ["Flat Roof", "Sloped Roof", "Industrial Roof", "Ground Installation"];
    const budgetRanges = [
        "< ₹1 Lakh",
        "₹1 Lakh - ₹3 Lakh",
        "₹3 Lakh - ₹5 Lakh",
        "> ₹5 Lakh"
    ];

    return (
        <div className="min-h-screen bg-[#0a0f12] text-white">
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="max-w-3xl mx-auto px-6">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <h1 className="text-3xl md:text-4xl font-bold text-white">
                            Design Your <span className="text-emerald-400">Solar System</span>
                        </h1>
                        <p className="mt-3 text-emerald-100/80">
                            Tell us a bit about your home. Our AI handles the complex engineering calculations.
                        </p>
                    </div>

                    {/* Step indicator */}
                    <div className="flex items-center justify-center gap-4 mb-8">
                        {[
                            { n: 1, label: "Location" },
                            { n: 2, label: "Energy Usage" },
                            { n: 3, label: "Roof Details" },
                        ].map((x) => (
                            <div key={x.n} className="flex items-center gap-2">
                                <div
                                    className={[
                                        "h-8 w-8 rounded-full grid place-items-center text-sm font-bold transition-colors",
                                        step === x.n
                                            ? "bg-emerald-500 text-white"
                                            : step > x.n
                                                ? "bg-emerald-500/40 text-emerald-100"
                                                : "bg-white/10 text-emerald-100/50 border border-emerald-500/20",
                                    ].join(" ")}
                                >
                                    {x.n}
                                </div>
                                <span className={`text-sm hidden sm:block ${step === x.n ? "text-emerald-300 font-medium" : "text-emerald-100/50"}`}>
                                    {x.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Card */}
                    <div className="rounded-2xl border border-emerald-500/20 bg-white/5 backdrop-blur-md p-6 md:p-8 shadow-xl shadow-emerald-900/10">

                        {/* Step 1: Location */}
                        {step === 1 && (
                            <div className="animate-in fade-in duration-300">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                    <div>
                                        <h2 className="text-xl font-semibold text-white">Where are you located?</h2>
                                        <p className="text-sm text-emerald-100/60 mt-1">Needed for sunlight analysis and weather patterns.</p>
                                    </div>
                                    <button
                                        onClick={handleAutoDetect}
                                        disabled={isLocating}
                                        className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 whitespace-nowrap"
                                    >
                                        📍 {isLocating ? "Detecting..." : "Use Current Location"}
                                    </button>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div>
                                        <input
                                            value={form.address}
                                            onChange={update("address")}
                                            type="text"
                                            placeholder="Search address or tap on the map..."
                                            className="w-full rounded-xl bg-black/40 border border-emerald-500/20 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                                        />
                                    </div>

                                    {/* Map Container */}
                                    <div className="h-[300px] w-full rounded-xl overflow-hidden border border-emerald-500/20 bg-black/40 relative">
                                        {!form.lat && !form.lon && (
                                            <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center bg-black/40">
                                                <span className="bg-black/80 text-emerald-300 px-4 py-2 rounded-lg text-sm backdrop-blur-sm">
                                                    Tap anywhere on the map to drop a pin
                                                </span>
                                            </div>
                                        )}
                                        <MapContainer
                                            center={form.lat && form.lon ? [Number(form.lat), Number(form.lon)] : defaultCenter}
                                            zoom={form.lat && form.lon ? 16 : 4}
                                            style={{ height: "100%", width: "100%", zIndex: 10 }}
                                        >
                                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                            <MapEventsAndMarker lat={form.lat} lon={form.lon} updateLocation={updateLocation} />
                                        </MapContainer>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Consumption */}
                        {step === 2 && (
                            <div className="animate-in fade-in duration-300">
                                <h2 className="text-xl font-semibold text-white mb-2">How much energy do you use?</h2>
                                <p className="text-sm text-emerald-100/60 mb-6">This helps us size the right inverter and panel count for you.</p>

                                <div className="flex p-1 bg-black/40 rounded-xl mb-6 w-full max-w-md">
                                    <button
                                        onClick={() => updateDirect("consumptionType", "bill")}
                                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${form.consumptionType === "bill" ? "bg-emerald-500 text-white shadow-md" : "text-emerald-100/60 hover:text-white"
                                            }`}
                                    >
                                        Average Monthly Bill
                                    </button>
                                    <button
                                        onClick={() => updateDirect("consumptionType", "kwh")}
                                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${form.consumptionType === "kwh" ? "bg-emerald-500 text-white shadow-md" : "text-emerald-100/60 hover:text-white"
                                            }`}
                                    >
                                        Monthly Units (kWh)
                                    </button>
                                </div>

                                {form.consumptionType === "bill" ? (
                                    <div>
                                        <label className="block text-sm text-emerald-100/80 mb-2">What is your average monthly electricity bill?</label>
                                        <div className="relative max-w-md">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-100/50">₹</span>
                                            <input
                                                value={form.monthlyBill}
                                                onChange={update("monthlyBill")}
                                                type="number"
                                                placeholder="e.g. 2500"
                                                className="w-full rounded-xl bg-black/40 border border-emerald-500/20 pl-8 pr-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-lg"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm text-emerald-100/80 mb-2">How many units do you consume monthly?</label>
                                        <div className="relative max-w-md">
                                            <input
                                                value={form.monthlyKwh}
                                                onChange={update("monthlyKwh")}
                                                type="number"
                                                placeholder="e.g. 350"
                                                className="w-full rounded-xl bg-black/40 border border-emerald-500/20 pl-4 pr-16 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-lg"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-100/50 text-sm">kWh</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 3: Roof Details */}
                        {step === 3 && (
                            <div className="animate-in fade-in duration-300">
                                <h2 className="text-xl font-semibold text-white mb-2">Tell us about your property</h2>
                                <p className="text-sm text-emerald-100/60 mb-6">To check maximum installation capacity and recommend setup quality.</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Roof Type */}
                                    <div>
                                        <label className="block text-sm text-emerald-100/80 mb-2">Roof Type</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {roofTypes.map((type) => (
                                                <button
                                                    key={type}
                                                    onClick={() => updateDirect("roofType", type)}
                                                    className={`p-3 rounded-xl border text-sm text-left transition ${form.roofType === type
                                                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                                                        : "bg-black/40 border-emerald-500/20 text-emerald-100/70 hover:border-emerald-500/50"
                                                        }`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Area & Budget */}
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm text-emerald-100/80 mb-2">Approximate Roof Area (Optional)</label>
                                            <div className="relative">
                                                <input
                                                    value={form.roofArea}
                                                    onChange={update("roofArea")}
                                                    type="number"
                                                    placeholder="e.g. 1000"
                                                    className="w-full rounded-xl bg-black/40 border border-emerald-500/20 pl-4 pr-16 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-100/50 text-sm">sq ft</span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm text-emerald-100/80 mb-2">Estimated Budget Range</label>
                                            <select
                                                value={form.budget}
                                                onChange={update("budget")}
                                                className="w-full rounded-xl bg-black/40 border border-emerald-500/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 appearance-none"
                                            >
                                                {budgetRanges.map((range) => (
                                                    <option key={range} value={range} className="bg-gray-900">
                                                        {range}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* -----------------------------------------
                                    ENGINEER MODE TOGGLE + PANEL
                                ----------------------------------------- */}
                                <div className="mt-8 pt-6 border-t border-emerald-500/10">
                                    {/* Toggle Switch */}
                                    <button
                                        onClick={() => setEngineerMode(!engineerMode)}
                                        className="flex items-center gap-3 group"
                                    >
                                        <div className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                                            engineerMode ? "bg-emerald-500" : "bg-white/10"
                                        }`}>
                                            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                                                engineerMode ? "translate-x-6" : "translate-x-0"
                                            }`} />
                                        </div>
                                        <span className={`text-sm font-medium transition ${
                                            engineerMode ? "text-emerald-400" : "text-emerald-100/50 group-hover:text-emerald-100/80"
                                        }`}>
                                            ⚡ Engineer Mode
                                        </span>
                                        {engineerMode && (
                                            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                                                Custom Overrides Active
                                            </span>
                                        )}
                                    </button>

                                    {/* Collapsible Override Fields */}
                                    {engineerMode && (
                                        <div className="mt-5 p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                            <p className="text-xs text-emerald-100/50 mb-4">
                                                Override default assumptions. Leave blank to use engineering defaults.
                                            </p>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {/* Panel Wattage */}
                                                <div>
                                                    <label className="block text-xs text-emerald-100/60 mb-1">Panel Wattage</label>
                                                    <div className="relative">
                                                        <input
                                                            value={overrides.panel_wattage_w}
                                                            onChange={updateOverride("panel_wattage_w")}
                                                            type="number"
                                                            placeholder="450"
                                                            className="w-full rounded-lg bg-black/40 border border-emerald-500/20 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                                                        />
                                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-100/30 text-xs">W</span>
                                                    </div>
                                                </div>

                                                {/* Derate Factor */}
                                                <div>
                                                    <label className="block text-xs text-emerald-100/60 mb-1">Derate Factor</label>
                                                    <input
                                                        value={overrides.derate_factor}
                                                        onChange={updateOverride("derate_factor")}
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="0.82"
                                                        className="w-full rounded-lg bg-black/40 border border-emerald-500/20 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                                                    />
                                                </div>

                                                {/* Autonomy Days */}
                                                <div>
                                                    <label className="block text-xs text-emerald-100/60 mb-1">Autonomy Days</label>
                                                    <div className="relative">
                                                        <input
                                                            value={overrides.autonomy_days}
                                                            onChange={updateOverride("autonomy_days")}
                                                            type="number"
                                                            placeholder="1"
                                                            className="w-full rounded-lg bg-black/40 border border-emerald-500/20 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                                                        />
                                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-100/30 text-xs">days</span>
                                                    </div>
                                                </div>

                                                {/* Battery DoD */}
                                                <div>
                                                    <label className="block text-xs text-emerald-100/60 mb-1">Battery DoD</label>
                                                    <input
                                                        value={overrides.battery_dod}
                                                        onChange={updateOverride("battery_dod")}
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="0.80"
                                                        className="w-full rounded-lg bg-black/40 border border-emerald-500/20 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                                                    />
                                                </div>

                                                {/* System Voltage */}
                                                <div>
                                                    <label className="block text-xs text-emerald-100/60 mb-1">System Voltage</label>
                                                    <div className="relative">
                                                        <input
                                                            value={overrides.system_voltage_v}
                                                            onChange={updateOverride("system_voltage_v")}
                                                            type="number"
                                                            placeholder="48"
                                                            className="w-full rounded-lg bg-black/40 border border-emerald-500/20 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                                                        />
                                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-100/30 text-xs">V</span>
                                                    </div>
                                                </div>

                                                {/* Inverter Safety */}
                                                <div>
                                                    <label className="block text-xs text-emerald-100/60 mb-1">Inverter Safety</label>
                                                    <div className="relative">
                                                        <input
                                                            value={overrides.inverter_safety_factor}
                                                            onChange={updateOverride("inverter_safety_factor")}
                                                            type="number"
                                                            step="0.01"
                                                            placeholder="1.25"
                                                            className="w-full rounded-lg bg-black/40 border border-emerald-500/20 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                                                        />
                                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-100/30 text-xs">×</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="mt-8 pt-6 border-t border-emerald-500/20 flex items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={back}
                                disabled={step === 1}
                                className="rounded-xl px-6 py-3 border border-emerald-500/20 text-white hover:bg-emerald-500/10 transition disabled:opacity-50 disabled:hover:bg-transparent"
                            >
                                Back
                            </button>

                            {step < 3 ? (
                                <button
                                    type="button"
                                    onClick={next}
                                    className="rounded-xl px-8 py-3 bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/25"
                                >
                                    Continue
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={runSimulation}
                                    disabled={loading}
                                    className="rounded-xl px-8 py-3 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold hover:shadow-lg hover:shadow-emerald-500/40 transition transform hover:-translate-y-0.5 disabled:opacity-50"
                                >
                                    {loading ? "Generating..." : "Generate AI Result"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* RESULT BLOCK */}
                {result && (
                    <div className="max-w-4xl mx-auto px-6 mt-16 pb-20 animate-in slide-in-from-bottom-8 duration-500">
                        <div className="rounded-3xl border border-emerald-500/20 bg-white/5 backdrop-blur-md p-8 shadow-2xl shadow-emerald-900/10">
                            <div className="mb-8">
                                <h2 className="text-4xl font-bold text-emerald-400">
                                    Solar Recommendation
                                </h2>
                                <p className="text-emerald-100/60 mt-2">
                                    AI-generated solar analysis based on your property and energy usage.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* SYSTEM SIZE */}
                                <div className="bg-black/30 rounded-2xl p-5 border border-emerald-500/10">
                                    <p className="text-sm text-emerald-100/60">Recommended System Size</p>
                                    <h3 className="text-3xl font-bold text-white mt-2">{result.systemSize}</h3>
                                </div>

                                {/* PANELS */}
                                <div className="bg-black/30 rounded-2xl p-5 border border-emerald-500/10">
                                    <p className="text-sm text-emerald-100/60">Solar Panels Required</p>
                                    <h3 className="text-3xl font-bold text-white mt-2">{result.recommendedPanels}</h3>
                                </div>

                                {/* INVERTER */}
                                <div className="bg-black/30 rounded-2xl p-5 border border-emerald-500/10">
                                    <p className="text-sm text-emerald-100/60">Recommended Inverter</p>
                                    <h3 className="text-xl font-bold text-white mt-2">{result.recommendedInverter}</h3>
                                </div>

                                {/* PRODUCTION */}
                                <div className="bg-black/30 rounded-2xl p-5 border border-emerald-500/10">
                                    <p className="text-sm text-emerald-100/60">Estimated Monthly Production</p>
                                    <h3 className="text-2xl font-bold text-white mt-2">{result.estimatedProduction}</h3>
                                </div>

                                {/* COST */}
                                <div className="bg-black/30 rounded-2xl p-5 border border-emerald-500/10">
                                    <p className="text-sm text-emerald-100/60">Estimated Installation Cost</p>
                                    <h3 className="text-2xl font-bold text-white mt-2">{result.estimatedCost}</h3>
                                </div>

                                {/* SUBSIDY */}
                                <div className="bg-black/30 rounded-2xl p-5 border border-emerald-500/10">
                                    <p className="text-sm text-emerald-100/60">Government Subsidy</p>
                                    <h3 className="text-2xl font-bold text-green-400 mt-2">{result.governmentSubsidy}</h3>
                                </div>

                                {/* FINAL COST */}
                                <div className="md:col-span-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
                                    <p className="text-sm text-emerald-100/60">Final Estimated Cost After Subsidy</p>
                                    <h3 className="text-4xl font-bold text-emerald-300 mt-3">{result.finalCost}</h3>
                                </div>

                                {/* ML POWER GRAPH */}
                                <div className="mt-10 md:col-span-2">
                                    <div className="mb-5">
                                        <h3 className="text-2xl font-bold text-emerald-400">AI Solar Power Curve</h3>
                                        <p className="text-emerald-100/60 mt-1">Machine-learning predicted daily power generation.</p>
                                    </div>

                                    <div className="bg-black/30 rounded-2xl p-5 border border-emerald-500/10">
                                        {peakInfo && (
                                            <div className="mb-4 flex flex-wrap gap-4">
                                                <div className="bg-emerald-500/10 rounded-xl px-4 py-3">
                                                    <p className="text-xs text-emerald-100/50">Peak Power</p>
                                                    <h4 className="text-xl font-bold text-emerald-300">{peakInfo.peakPower} kWh</h4>
                                                </div>
                                                <div className="bg-emerald-500/10 rounded-xl px-4 py-3">
                                                    <p className="text-xs text-emerald-100/50">Peak Time</p>
                                                    <h4 className="text-xl font-bold text-emerald-300">{peakInfo.peakTime}</h4>
                                                </div>
                                            </div>
                                        )}

                                        <div style={{ width: "100%", height: 320 }}>
                                            <ResponsiveContainer>
                                                <LineChart data={graphData}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="time" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="power_kwh"
                                                        stroke="#34d399"
                                                        strokeWidth={3}
                                                        dot={false}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>

                                {/* Generate PDF Report Button */}
                                <div className="md:col-span-2 flex justify-center mt-6">
                                    <button
                                        onClick={downloadPDFReport}
                                        disabled={isExporting}
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-3"
                                    >
                                        {isExporting ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Generating Proposal...
                                            </>
                                        ) : (
                                            "📄 Generate PDF Report"
                                        )}
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default GetStarted;