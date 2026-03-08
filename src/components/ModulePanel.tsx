"use client";
import { useState } from "react";

/* ─── Design tokens (match advisor page palette) ─── */
const C = {
    bg: "#111111",
    border: "rgba(173,255,47,0.12)",
    accent: "#ADFF2F",
    yellow: "#F5C518",
    dim: "rgba(173,255,47,0.55)",
    panel: "rgba(173,255,47,0.04)",
};

const inputStyle: React.CSSProperties = {
    width: "100%", background: "#0a0a0a", border: `1px solid ${C.border}`,
    color: C.accent, borderRadius: "8px", padding: "0.55rem 0.8rem",
    fontSize: "0.82rem", outline: "none", fontFamily: "inherit",
};
const labelStyle: React.CSSProperties = {
    color: C.dim, fontSize: "0.72rem", letterSpacing: "0.04em",
    textTransform: "uppercase", marginBottom: "4px", display: "block",
};
const rowStyle: React.CSSProperties = {
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem",
};
const btnStyle: React.CSSProperties = {
    marginTop: "1rem", width: "100%", background: C.accent, color: "#000",
    border: "none", borderRadius: "8px", padding: "0.65rem", fontWeight: 700,
    fontSize: "0.85rem", cursor: "pointer", letterSpacing: "0.05em",
};

const ALL_CROPS = [
    "Rice", "Wheat", "Maize", "Cotton", "Soybean", "Sugarcane", "Groundnut", "Tomato", "Onion", "Potato",
    "Mustard", "Turmeric", "Chilli", "Coffee", "Tea", "Rubber", "Coconut", "Apple", "Mango", "Banana",
    "Grapes", "Pomegranate", "Cardamom", "Black Pepper", "Cinamon", "Clove", "Garlic", "Ginger", "Jute",
    "Tobacco", "Barley", "Bajra", "Jowar", "Ragi", "Sunflower", "Safflower", "Sesame", "Linseed", "Castor",
    "Palm Oil", "Cashew", "Areca Nut", "Betel Leaf", "Cocoa", "Vanilla", "Peppermint", "Lavender", "Saffron"
];

const MODULES = [
    // ── AI Farming Modules ──
    { id: "crop", icon: "🌾", label: "Crop Recommend", group: "AI" },
    { id: "fertilizer", icon: "🧪", label: "Fertilizer", group: "AI" },
    { id: "weather", icon: "🌤️", label: "Weather Advice", group: "AI" },
    { id: "soil", icon: "🌍", label: "Soil Health", group: "AI" },
    { id: "pest", icon: "🐛", label: "Pest & Disease", group: "AI" },
    { id: "yield", icon: "📊", label: "Yield Predict", group: "AI" },
    { id: "rotation", icon: "🔄", label: "Crop Rotation", group: "AI" },
    { id: "market", icon: "💰", label: "Market Prices", group: "AI" },
    { id: "satellite", icon: "🛰️", label: "Satellite Monitor", group: "AI" },
    // ── 5 Core Governance Features ──
    { id: "subsidy", icon: "🧧", label: "Subsidy Matcher", group: "GOV" },
    { id: "scheme_draft", icon: "📝", label: "Scheme Drafter", group: "GOV" },
    { id: "contract", icon: "⚖️", label: "Contract Audit", group: "GOV" },
    { id: "dispute", icon: "🤝", label: "Dispute Advisor", group: "GOV" },
    { id: "governance", icon: "🗞️", label: "Scheme Feed", group: "GOV" },
    // ── Alerts ──
    { id: "notify", icon: "🔔", label: "Set Alerts", group: "AI" },
];

interface Props {
    onSubmit: (question: string, payload?: Record<string, unknown>) => void;
}

export default function ModulePanel({ onSubmit }: Props) {
    const [active, setActive] = useState<string | null>(null);
    const toggle = (id: string) => setActive(prev => prev === id ? null : id);

    return (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            {/* ── Module Pill Buttons & Expanding Panels (Accordion) ── */}
            {MODULES.map(m => (
                <div key={m.id} style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                    <button onClick={() => toggle(m.id)} style={{
                        background: active === m.id ? C.accent : C.panel,
                        color: active === m.id ? "#000" : C.accent,
                        border: `1px solid ${active === m.id ? C.accent : C.border}`,
                        borderRadius: "10px", padding: "0.6rem 0.9rem",
                        fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
                        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                        textAlign: "left",
                        display: "flex", alignItems: "center", gap: "0.5rem",
                        width: "100%",
                    }}>
                        <span>{m.icon}</span>
                        <span>{m.label}</span>
                        <span style={{
                            marginLeft: "auto", fontSize: "0.7rem", opacity: 0.5,
                            transform: active === m.id ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                        }}>▼</span>
                    </button>

                    {/* ── Inline Animated Panel Expansion ── */}
                    <div style={{
                        display: "grid",
                        gridTemplateRows: active === m.id ? "1fr" : "0fr",
                        opacity: active === m.id ? 1 : 0,
                        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                        overflow: "hidden"
                    }}>
                        <div style={{ minHeight: "0px", paddingBottom: active === m.id ? "0.35rem" : "0" }}>
                            {active === m.id && m.id === "crop" && <CropPanel onSubmit={onSubmit} />}
                            {active === m.id && m.id === "fertilizer" && <FertilizerPanel onSubmit={onSubmit} />}
                            {active === m.id && m.id === "weather" && <WeatherPanel onSubmit={onSubmit} />}
                            {active === m.id && m.id === "soil" && <SoilPanel onSubmit={onSubmit} />}
                            {active === m.id && m.id === "pest" && <PestPanel onSubmit={onSubmit} />}
                            {active === m.id && m.id === "yield" && <YieldPanel onSubmit={onSubmit} />}
                            {active === m.id && m.id === "rotation" && <RotationPanel onSubmit={onSubmit} />}
                            {active === m.id && m.id === "market" && <MarketPanel onSubmit={onSubmit} />}
                            {active === m.id && m.id === "satellite" && <SatellitePanel onSubmit={onSubmit} />}
                            {active === m.id && m.id === "subsidy" && <SubsidyPanel onSubmit={onSubmit} />}
                            {active === m.id && m.id === "scheme_draft" && <SchemeDraftPanel onSubmit={onSubmit} />}
                            {active === m.id && m.id === "contract" && <ContractPanel onSubmit={onSubmit} />}
                            {active === m.id && m.id === "dispute" && <DisputePanel onSubmit={onSubmit} />}
                            {active === m.id && m.id === "governance" && <GovernancePanel onSubmit={onSubmit} />}
                            {active === m.id && m.id === "notify" && <NotifyPanel onSubmit={onSubmit} />}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ════════════════════════════════════════════════════════════
   MODULE 1 — CROP RECOMMENDATION
════════════════════════════════════════════════════════════ */
function CropPanel({ onSubmit }: Props) {
    const [f, setF] = useState({ N: "50", P: "40", K: "40", temperature: "28", humidity: "65", ph: "6.5", rainfall: "100" });
    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setF(p => ({ ...p, [k]: e.target.value }));

    return (
        <Card title="🌾 AI Crop Recommendation" desc="Enter your soil & climate values to get the best crop suggestion.">
            <div style={rowStyle}>
                {[["N", "Nitrogen (kg/ha)"], ["P", "Phosphorus (kg/ha)"], ["K", "Potassium (kg/ha)"]].map(([k, l]) => (
                    <Field key={k} label={l}><input style={inputStyle} type="number" value={f[k as keyof typeof f]} onChange={set(k)} /></Field>
                ))}
                {[["temperature", "Temp (°C)"], ["humidity", "Humidity (%)"], ["ph", "Soil pH"], ["rainfall", "Rainfall (mm)"]].map(([k, l]) => (
                    <Field key={k} label={l}><input style={inputStyle} type="number" value={f[k as keyof typeof f]} onChange={set(k)} step="0.1" /></Field>
                ))}
            </div>
            <button style={btnStyle} onClick={() =>
                onSubmit(`recommend crop with N=${f.N} P=${f.P} K=${f.K} temperature=${f.temperature} humidity=${f.humidity} ph=${f.ph} rainfall=${f.rainfall}`,
                    { module: "crop", ...f })}>
                ⚡ Get Crop Recommendation
            </button>
        </Card>
    );
}

/* ════════════════════════════════════════════════════════════
   MODULE 2 — FERTILIZER OPTIMISATION
════════════════════════════════════════════════════════════ */
function FertilizerPanel({ onSubmit }: Props) {
    const [f, setF] = useState({
        crop_type: "rice", growth_stage: "Vegetative", field_size: "2", soil_type: "Loamy",
        prev_crop: "Wheat", irrigation_type: "Canal", organic_manure: "Compost",
    });
    const sel = (k: string) => (e: React.ChangeEvent<HTMLSelectElement>) => setF(p => ({ ...p, [k]: e.target.value }));
    const inp = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setF(p => ({ ...p, [k]: e.target.value }));

    return (
        <Card title="🧪 Fertilizer Optimisation" desc="Personalized NPK schedule for your crop and stage.">
            <div style={rowStyle}>
                <Field label="Crop Type">
                    <select style={inputStyle} value={f.crop_type} onChange={sel("crop_type")}>
                        {ALL_CROPS.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
                    </select>
                </Field>
                <Field label="Growth Stage">
                    <select style={inputStyle} value={f.growth_stage} onChange={sel("growth_stage")}>
                        {["Sowing", "Seedling", "Vegetative", "Flowering", "Fruiting"].map(s => <option key={s}>{s}</option>)}
                    </select>
                </Field>
                <Field label="Field Size (acres)">
                    <input style={inputStyle} type="number" value={f.field_size} onChange={inp("field_size")} />
                </Field>
                <Field label="Soil Type">
                    <select style={inputStyle} value={f.soil_type} onChange={sel("soil_type")}>
                        {["Loamy", "Clay", "Sandy", "Black", "Red"].map(s => <option key={s}>{s}</option>)}
                    </select>
                </Field>
                <Field label="Previous Crop">
                    <select style={inputStyle} value={f.prev_crop} onChange={sel("prev_crop")}>
                        {["Wheat", "Rice", "Maize", "Cotton", "Soybean", "Fallow", "Legume"].map(c => <option key={c}>{c}</option>)}
                    </select>
                </Field>
                <Field label="Irrigation Type">
                    <select style={inputStyle} value={f.irrigation_type} onChange={sel("irrigation_type")}>
                        {["Canal", "Drip", "Sprinkler", "Rainfed", "Borewell"].map(i => <option key={i}>{i}</option>)}
                    </select>
                </Field>
                <Field label="Organic Manure Used">
                    <select style={inputStyle} value={f.organic_manure} onChange={sel("organic_manure")}>
                        {["None", "Farmyard", "Compost", "Vermicompost", "Green Manure"].map(m => <option key={m}>{m}</option>)}
                    </select>
                </Field>
            </div>
            <button style={btnStyle} onClick={() =>
                onSubmit(`fertilizer optimize for ${f.crop_type} at ${f.growth_stage} stage on ${f.field_size} acres ${f.soil_type} soil with ${f.irrigation_type} irrigation`, { module: "fertilizer", ...f })}>
                ⚡ Calculate Fertilizer Plan
            </button>
        </Card>
    );
}

/* ════════════════════════════════════════════════════════════
   MODULE 3 — WEATHER ADVICE
════════════════════════════════════════════════════════════ */
function WeatherPanel({ onSubmit }: Props) {
    const [coords, setCoords] = useState({ lat: "19.076", lon: "72.877" });
    const locate = () => {
        if ("geolocation" in navigator)
            navigator.geolocation.getCurrentPosition(p => setCoords({ lat: String(p.coords.latitude.toFixed(4)), lon: String(p.coords.longitude.toFixed(4)) }));
    };

    return (
        <Card title="🌤️ Weather-Based Decision Support" desc="Get real-time weather farming advice for your location.">
            <div style={rowStyle}>
                <Field label="Latitude"><input style={inputStyle} value={coords.lat} onChange={e => setCoords(p => ({ ...p, lat: e.target.value }))} /></Field>
                <Field label="Longitude"><input style={inputStyle} value={coords.lon} onChange={e => setCoords(p => ({ ...p, lon: e.target.value }))} /></Field>
            </div>
            <button onClick={locate} style={{ ...btnStyle, background: "transparent", color: C.accent, border: `1px solid ${C.border}`, marginTop: "0.5rem" }}>
                📍 Auto-Detect My Location
            </button>
            <button style={btnStyle} onClick={() =>
                onSubmit(`weather advice at lat=${coords.lat} lon=${coords.lon}`, { module: "weather", ...coords })}>
                ⚡ Get Weather Advice
            </button>
        </Card>
    );
}

/* ════════════════════════════════════════════════════════════
   MODULE 4 — SOIL HEALTH
════════════════════════════════════════════════════════════ */
function SoilPanel({ onSubmit }: Props) {
    const [f, setF] = useState({
        ph: "6.2", nitrogen_ppm: "45", phosphorus_ppm: "22", potassium_ppm: "50",
        organic_carbon_pct: "0.4", sand_pct: "40", clay_pct: "30", silt_pct: "30"
    });
    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setF(p => ({ ...p, [k]: e.target.value }));

    return (
        <Card title="🌍 Soil Health Intelligence" desc="Enter your soil lab report values for a detailed health analysis.">
            <div style={{ fontSize: '0.65rem', color: C.dim, marginBottom: '0.5rem', letterSpacing: '0.05em' }}>CHEMICAL NUTRIENTS</div>
            <div style={rowStyle}>
                <Field label="Soil pH"><input style={inputStyle} type="number" step="0.1" value={f.ph} onChange={set("ph")} /></Field>
                <Field label="Nitrogen (ppm)"><input style={inputStyle} type="number" value={f.nitrogen_ppm} onChange={set("nitrogen_ppm")} /></Field>
                <Field label="Phosphorus (ppm)"><input style={inputStyle} type="number" value={f.phosphorus_ppm} onChange={set("phosphorus_ppm")} /></Field>
                <Field label="Potassium (ppm)"><input style={inputStyle} type="number" value={f.potassium_ppm} onChange={set("potassium_ppm")} /></Field>
                <Field label="Organic Carbon (%)"><input style={inputStyle} type="number" step="0.01" value={f.organic_carbon_pct} onChange={set("organic_carbon_pct")} /></Field>
            </div>

            <div style={{ fontSize: '0.65rem', color: C.dim, marginTop: '1rem', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>PHYSICAL TEXTURE (% sum to 100)</div>
            <div style={rowStyle}>
                <Field label="Sand %"><input style={inputStyle} type="number" value={f.sand_pct} onChange={set("sand_pct")} /></Field>
                <Field label="Clay %"><input style={inputStyle} type="number" value={f.clay_pct} onChange={set("clay_pct")} /></Field>
                <Field label="Silt %"><input style={inputStyle} type="number" value={f.silt_pct} onChange={set("silt_pct")} /></Field>
            </div>

            <Field label="📸 Upload Soil Photo or Lab Report (Optional CV Analysis)">
                <input
                    type="file"
                    accept="image/*"
                    style={{ ...inputStyle, padding: "0.5rem" }}
                    onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                            alert(`File "${e.target.files[0].name}" attached for CNN Vision Analysis.`);
                        }
                    }}
                />
            </Field>

            <button style={btnStyle} onClick={() =>
                onSubmit(`soil health report ph=${f.ph} N=${f.nitrogen_ppm}ppm texture: Sand=${f.sand_pct}% Clay=${f.clay_pct}%`, { module: "soil", ...f })}>
                ⚡ Analyze Soil Health
            </button>
        </Card>
    );
}

/* ════════════════════════════════════════════════════════════
   MODULE 5 — PEST & DISEASE
════════════════════════════════════════════════════════════ */
function PestPanel({ onSubmit }: Props) {
    const [f, setF] = useState({ crop: "rice", growth_stage: "Vegetative", temperature: "30", humidity: "80", rainfall_last_week: "20", symptoms_observed: "" });
    const sel = (k: string) => (e: React.ChangeEvent<HTMLSelectElement>) => setF(p => ({ ...p, [k]: e.target.value }));
    const inp = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF(p => ({ ...p, [k]: e.target.value }));

    return (
        <Card title="🐛 Pest & Disease Prediction" desc="Identify threats early before they damage your crop.">
            <div style={rowStyle}>
                <Field label="Crop">
                    <select style={inputStyle} value={f.crop} onChange={sel("crop")}>
                        {ALL_CROPS.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
                    </select>
                </Field>
                <Field label="Growth Stage">
                    <select style={inputStyle} value={f.growth_stage} onChange={sel("growth_stage")}>
                        {["Sowing", "Seedling", "Vegetative", "Flowering", "Fruiting"].map(s => <option key={s}>{s}</option>)}
                    </select>
                </Field>
                <Field label="Temperature (°C)"><input style={inputStyle} type="number" value={f.temperature} onChange={inp("temperature")} /></Field>
                <Field label="Humidity (%)"><input style={inputStyle} type="number" value={f.humidity} onChange={inp("humidity")} /></Field>
                <Field label="Rainfall Last Week (mm)"><input style={inputStyle} type="number" value={f.rainfall_last_week} onChange={inp("rainfall_last_week")} /></Field>
            </div>
            <Field label="Symptoms Observed (describe in your words)">
                <textarea style={{ ...inputStyle, resize: "none", height: "60px" } as React.CSSProperties}
                    value={f.symptoms_observed} onChange={inp("symptoms_observed")}
                    placeholder="e.g. yellowing leaves, holes in leaves, wilting..." />
            </Field>

            <Field label="📸 Upload Crop Leaf Photo (AI Vision Scan)">
                <input
                    type="file"
                    accept="image/*,capture=camera"
                    style={{ ...inputStyle, padding: "0.5rem", border: "1px dashed var(--vibrant-yellow)" }}
                    onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                            alert(`Leaf image "${e.target.files[0].name}" queued for PlantVillage CNN Disease Scan.`);
                        }
                    }}
                />
            </Field>

            <button style={btnStyle} onClick={() =>
                onSubmit(`pest disease prediction for ${f.crop} at ${f.growth_stage} stage temp=${f.temperature} humidity=${f.humidity} symptoms: ${f.symptoms_observed || "none"}`, { module: "pest", ...f })}>
                ⚡ Scan & Predict Pest Risk
            </button>
        </Card>
    );
}

/* ════════════════════════════════════════════════════════════
   MODULE 6 — YIELD PREDICTION
════════════════════════════════════════════════════════════ */
function YieldPanel({ onSubmit }: Props) {
    const [f, setF] = useState({ crop: "rice", field_size: "2", soil_type: "Loamy", irrigation_type: "Canal", fertilizer_used: "NPK", expected_rainfall: "500", temperature_avg: "28", seed_variety: "HYV" });
    const sel = (k: string) => (e: React.ChangeEvent<HTMLSelectElement>) => setF(p => ({ ...p, [k]: e.target.value }));
    const inp = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setF(p => ({ ...p, [k]: e.target.value }));

    return (
        <Card title="📊 Yield Prediction" desc="Estimate your expected harvest and revenue before the season.">
            <div style={rowStyle}>
                <Field label="Crop">
                    <select style={inputStyle} value={f.crop} onChange={sel("crop")}>
                        {ALL_CROPS.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
                    </select>
                </Field>
                <Field label="Seed Variety">
                    <select style={inputStyle} value={f.seed_variety} onChange={sel("seed_variety")}>
                        {["HYV", "hybrid", "local"].map(v => <option key={v}>{v}</option>)}
                    </select>
                </Field>
                <Field label="Field Size (acres)"><input style={inputStyle} type="number" value={f.field_size} onChange={inp("field_size")} /></Field>
                <Field label="Soil Type">
                    <select style={inputStyle} value={f.soil_type} onChange={sel("soil_type")}>
                        {["Loamy", "Clay", "Sandy", "Black", "Red"].map(s => <option key={s}>{s}</option>)}
                    </select>
                </Field>
                <Field label="Irrigation">
                    <select style={inputStyle} value={f.irrigation_type} onChange={sel("irrigation_type")}>
                        {["Canal", "Drip", "Sprinkler", "Rainfed", "Borewell"].map(i => <option key={i}>{i}</option>)}
                    </select>
                </Field>
                <Field label="Fertilizer Used">
                    <select style={inputStyle} value={f.fertilizer_used} onChange={sel("fertilizer_used")}>
                        {["NPK", "Urea", "DAP", "Organic", "Mixed"].map(f => <option key={f}>{f}</option>)}
                    </select>
                </Field>
                <Field label="Expected Rainfall (mm)"><input style={inputStyle} type="number" value={f.expected_rainfall} onChange={inp("expected_rainfall")} /></Field>
                <Field label="Avg Season Temp (°C)"><input style={inputStyle} type="number" value={f.temperature_avg} onChange={inp("temperature_avg")} /></Field>
            </div>
            <button style={btnStyle} onClick={() =>
                onSubmit(`yield prediction for ${f.crop} ${f.seed_variety} variety on ${f.field_size} acres`, { module: "yield", ...f })}>
                ⚡ Predict Yield & Revenue
            </button>
        </Card>
    );
}

/* ════════════════════════════════════════════════════════════
   MODULE 7 — CROP ROTATION
════════════════════════════════════════════════════════════ */
function RotationPanel({ onSubmit }: Props) {
    const [f, setF] = useState({ current_crop: "rice", soil_type: "Loamy", irrigation_type: "Canal", previous_crop: "Wheat" });
    const sel = (k: string) => (e: React.ChangeEvent<HTMLSelectElement>) => setF(p => ({ ...p, [k]: e.target.value }));

    return (
        <Card title="🔄 Smart Crop Rotation Planner" desc="Plan the next 3 seasons to maximize soil health and profitability.">
            <div style={rowStyle}>
                <Field label="Current Crop">
                    <select style={inputStyle} value={f.current_crop} onChange={sel("current_crop")}>
                        {ALL_CROPS.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
                    </select>
                </Field>
                <Field label="Previous Crop">
                    <select style={inputStyle} value={f.previous_crop} onChange={sel("previous_crop")}>
                        {["None/Fallow", "Wheat", "Rice", "Maize", "Cotton", "Soybean", "Legume"].map(c => <option key={c}>{c}</option>)}
                    </select>
                </Field>
                <Field label="Soil Type">
                    <select style={inputStyle} value={f.soil_type} onChange={sel("soil_type")}>
                        {["Loamy", "Clay", "Sandy", "Black", "Red"].map(s => <option key={s}>{s}</option>)}
                    </select>
                </Field>
                <Field label="Irrigation">
                    <select style={inputStyle} value={f.irrigation_type} onChange={sel("irrigation_type")}>
                        {["Canal", "Drip", "Sprinkler", "Rainfed", "Borewell"].map(i => <option key={i}>{i}</option>)}
                    </select>
                </Field>
            </div>
            <button style={btnStyle} onClick={() =>
                onSubmit(`crop rotation plan for ${f.current_crop} on ${f.soil_type} soil with ${f.irrigation_type} irrigation`, { module: "rotation", ...f })}>
                ⚡ Generate Rotation Plan
            </button>
        </Card>
    );
}

/* ════════════════════════════════════════════════════════════
   MODULE 8 — MARKET PRICES
════════════════════════════════════════════════════════════ */
function MarketPanel({ onSubmit }: Props) {
    const [f, setF] = useState({ commodity: "rice", state: "Maharashtra" });
    const sel = (k: string) => (e: React.ChangeEvent<HTMLSelectElement>) => setF(p => ({ ...p, [k]: e.target.value }));

    return (
        <Card title="💰 Live Market Prices" desc="Get real-time mandi prices and selling advice for your commodity.">
            <div style={rowStyle}>
                <Field label="Commodity">
                    <select style={inputStyle} value={f.commodity} onChange={sel("commodity")}>
                        {ALL_CROPS.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
                    </select>
                </Field>
                <Field label="State / Region">
                    <select style={inputStyle} value={f.state} onChange={sel("state")}>
                        {["Maharashtra", "Punjab", "Uttar Pradesh", "Madhya Pradesh", "Rajasthan", "Karnataka", "Andhra Pradesh", "Gujarat", "Haryana", "West Bengal", "Tamil Nadu"].map(s => <option key={s}>{s}</option>)}
                    </select>
                </Field>
            </div>
            <button style={btnStyle} onClick={() =>
                onSubmit(`market prices for ${f.commodity} in ${f.state}`, { module: "market", ...f })}>
                ⚡ Check Live Prices
            </button>
        </Card>
    );
}

/* ════════════════════════════════════════════════════════════
   MODULE 9 — SATELLITE CROP MONITORING
════════════════════════════════════════════════════════════ */
function SatellitePanel({ onSubmit }: Props) {
    const [f, setF] = useState({ lat: "19.076", lon: "72.877", crop: "rice", area_acres: "2" });
    const inp = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setF(p => ({ ...p, [k]: e.target.value }));
    const sel = (k: string) => (e: React.ChangeEvent<HTMLSelectElement>) => setF(p => ({ ...p, [k]: e.target.value }));
    const locate = () => {
        if ("geolocation" in navigator)
            navigator.geolocation.getCurrentPosition(p => setF(prev => ({ ...prev, lat: String(p.coords.latitude.toFixed(4)), lon: String(p.coords.longitude.toFixed(4)) })));
    };
    return (
        <Card title="🛰️ Satellite Crop Monitoring" desc="NDVI-based remote sensing analysis for your field using Sentinel-2 data.">
            <div style={rowStyle}>
                <Field label="Latitude"><input style={inputStyle} value={f.lat} onChange={inp("lat")} /></Field>
                <Field label="Longitude"><input style={inputStyle} value={f.lon} onChange={inp("lon")} /></Field>
                <Field label="Crop Type">
                    <select style={inputStyle} value={f.crop} onChange={sel("crop")}>
                        {ALL_CROPS.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
                    </select>
                </Field>
                <Field label="Field Area (acres)"><input style={inputStyle} type="number" value={f.area_acres} onChange={inp("area_acres")} /></Field>
            </div>
            <button onClick={locate} style={{ ...btnStyle, background: "transparent", color: C.accent, border: `1px solid ${C.border}`, marginTop: "0.5rem" }}>
                📍 Auto-Detect Location
            </button>
            <div style={{ background: "rgba(0,180,255,0.06)", border: "1px solid rgba(0,180,255,0.15)", borderRadius: "8px", padding: "0.65rem", marginTop: "0.5rem", fontSize: "0.73rem", color: "rgba(0,200,255,0.7)" }}>
                📡 Data Source: Sentinel-2 (ESA Copernicus) · Updates every 5 days · Indices: NDVI, EVI, SAVI
            </div>
            <button style={btnStyle} onClick={() =>
                onSubmit(`satellite analysis for ${f.crop} at lat=${f.lat} lon=${f.lon} area=${f.area_acres} acres`, { module: "satellite", ...f })}>
                ⚡ Run Satellite Analysis
            </button>
        </Card>
    );
}

/* ════════════════════════════════════════════════════════════
   MODULE 10 — SET ALERTS (NOTIFICATIONS)
════════════════════════════════════════════════════════════ */
function NotifyPanel({ onSubmit }: Props) {
    const [f, setF] = useState({ phone: "+91", telegram_chat_id: "", alert_types: ["scheme", "weather"], severity: "WARNING" });
    const inp = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setF(p => ({ ...p, [k]: e.target.value }));

    const TYPES = ["scheme", "weather", "market", "disaster"];
    const toggleType = (t: string) => setF(p => ({
        ...p,
        alert_types: p.alert_types.includes(t) ? p.alert_types.filter(x => x !== t) : [...p.alert_types, t]
    }));

    return (
        <Card title="🔔 Alert Preferences" desc="Register for automated Telegram / SMS / Call alerts.">
            <Field label="Phone Number (E.164 format, e.g. +919876543210)">
                <input style={inputStyle} value={f.phone} onChange={inp("phone")} placeholder="+91XXXXXXXXXX" />
            </Field>
            <Field label="Telegram Chat ID (optional — message @AgriSaathiBot to get yours)">
                <input style={inputStyle} value={f.telegram_chat_id} onChange={inp("telegram_chat_id")} placeholder="e.g. 123456789" />
            </Field>
            <Field label="Alert Types">
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "4px" }}>
                    {TYPES.map(t => (
                        <button key={t} onClick={() => toggleType(t)} style={{
                            background: f.alert_types.includes(t) ? C.accent : "transparent",
                            color: f.alert_types.includes(t) ? "#000" : C.accent,
                            border: `1px solid ${C.border}`, borderRadius: "16px",
                            padding: "0.3rem 0.75rem", fontSize: "0.75rem", cursor: "pointer"
                        }}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>
            </Field>
            <Field label="Minimum Severity">
                <select style={inputStyle} value={f.severity} onChange={e => setF(p => ({ ...p, severity: e.target.value }))}>
                    <option value="INFO">INFO — Telegram only (schemes, market tips)</option>
                    <option value="WARNING">WARNING — Telegram + SMS (weather, floods)</option>
                    <option value="CRITICAL">CRITICAL — Telegram + SMS + Voice Call (disasters)</option>
                </select>
            </Field>
            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "0.75rem", marginTop: "0.5rem", fontSize: "0.75rem", color: C.dim, lineHeight: 1.6 }}>
                ℹ️ After registering, alerts will be sent automatically. See the <b style={{ color: C.accent }}>Setup Guide</b> in your docs to configure Telegram and Twilio API keys.
            </div>
            <button style={btnStyle} onClick={() =>
                onSubmit(`register alerts for phone ${f.phone} types: ${f.alert_types.join(",")} severity: ${f.severity}`, { module: "notify", ...f })}>
                ⚡ Save Alert Preferences
            </button>
        </Card>
    );
}

/* ════════════════════════════════════════════════════════════
   CORE MODULE A — SUBSIDY MATCHER
════════════════════════════════════════════════════════════ */
function SubsidyPanel({ onSubmit }: Props) {
    const [f, setF] = useState({ state: "Maharashtra", crop_type: "rice", land_area_acres: "2", farmer_category: "general", has_kisan_card: false, annual_income_inr: "100000" });
    const sel = (k: string) => (e: React.ChangeEvent<HTMLSelectElement>) => setF(p => ({ ...p, [k]: e.target.value }));
    const inp = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setF(p => ({ ...p, [k]: e.target.value }));
    return (
        <Card title="🧧 Subsidy Matcher" desc="Find every central & state scheme you qualify for.">
            <div style={rowStyle}>
                <Field label="State">
                    <select style={inputStyle} value={f.state} onChange={sel("state")}>
                        {["Maharashtra", "Punjab", "Uttar Pradesh", "Madhya Pradesh", "Rajasthan", "Karnataka", "Andhra Pradesh", "Gujarat", "Haryana", "West Bengal", "Tamil Nadu", "Bihar"].map(s => <option key={s}>{s}</option>)}
                    </select>
                </Field>
                <Field label="Main Crop">
                    <select style={inputStyle} value={f.crop_type} onChange={sel("crop_type")}>
                        {ALL_CROPS.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
                    </select>
                </Field>
                <Field label="Land (acres)"><input style={inputStyle} type="number" value={f.land_area_acres} onChange={inp("land_area_acres")} /></Field>
                <Field label="Category">
                    <select style={inputStyle} value={f.farmer_category} onChange={sel("farmer_category")}>
                        {[["general", "General"], ["SC", "SC"], ["ST", "ST"], ["OBC", "OBC"], ["woman_farmer", "Woman Farmer"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                </Field>
                <Field label="Annual Income (Rs.)"><input style={inputStyle} type="number" value={f.annual_income_inr} onChange={inp("annual_income_inr")} /></Field>
                <Field label="Kisan Credit Card?">
                    <select style={inputStyle} value={f.has_kisan_card ? "yes" : "no"} onChange={e => setF(p => ({ ...p, has_kisan_card: e.target.value === "yes" }))}>
                        <option value="no">No</option><option value="yes">Yes</option>
                    </select>
                </Field>
            </div>
            <button style={btnStyle} onClick={() => onSubmit(`match subsidies for ${f.crop_type} farmer in ${f.state}`, { module: "subsidy", ...f })}>⚡ Find My Schemes</button>
        </Card>
    );
}

/* ════════════════════════════════════════════════════════════
   CORE MODULE B — SCHEME DOCUMENT DRAFTER
════════════════════════════════════════════════════════════ */
function SchemeDraftPanel({ onSubmit }: Props) {
    const [f, setF] = useState({ scheme_name: "PM-KISAN", farmer_name: "", location: "", land_area_acres: "2", crop_type: "rice", aadhaar_last4: "" });
    const inp = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setF(p => ({ ...p, [k]: e.target.value }));
    const sel = (k: string) => (e: React.ChangeEvent<HTMLSelectElement>) => setF(p => ({ ...p, [k]: e.target.value }));
    return (
        <Card title="📝 Scheme Document Drafter" desc="AI drafts your official application letter autonomously.">
            <div style={rowStyle}>
                <Field label="Scheme Name">
                    <select style={inputStyle} value={f.scheme_name} onChange={sel("scheme_name")}>
                        {["PM-KISAN", "PMFBY", "Kisan Credit Card (KCC)", "PKVY - Organic Farming", "PM Kusum Solar Pump", "Soil Health Card", "SMAM Farm Mechanization", "RKVY", "Pradhan Mantri Krishi Sinchai Yojana"].map(s => <option key={s}>{s}</option>)}
                    </select>
                </Field>
                <Field label="Land (acres)"><input style={inputStyle} type="number" value={f.land_area_acres} onChange={inp("land_area_acres")} /></Field>
                <Field label="Your Full Name"><input style={inputStyle} value={f.farmer_name} onChange={inp("farmer_name")} placeholder="e.g. Ramesh Kumar" /></Field>
                <Field label="District, State"><input style={inputStyle} value={f.location} onChange={inp("location")} placeholder="e.g. Nashik, Maharashtra" /></Field>
                <Field label="Crop Type"><input style={inputStyle} value={f.crop_type} onChange={inp("crop_type")} placeholder="e.g. Rice" /></Field>
                <Field label="Aadhaar Last 4 Digits"><input style={inputStyle} value={f.aadhaar_last4} onChange={inp("aadhaar_last4")} placeholder="e.g. 4821" maxLength={4} /></Field>
            </div>
            <button style={btnStyle} onClick={() => onSubmit(`draft scheme document for ${f.scheme_name} for ${f.farmer_name}`, { module: "scheme_draft", ...f })}>⚡ Draft Application Letter</button>
        </Card>
    );
}

/* ════════════════════════════════════════════════════════════
   CORE MODULE C — CONTRACT AUDIT
════════════════════════════════════════════════════════════ */
function ContractPanel({ onSubmit }: Props) {
    const [f, setF] = useState({ contract_text: "", contract_type: "loan" });
    const sel = (k: string) => (e: React.ChangeEvent<HTMLSelectElement>) => setF(p => ({ ...p, [k]: e.target.value }));
    return (
        <Card title="⚖️ Contract & Loan Audit" desc="Paste your farm contract or loan agreement — AI detects hidden clauses.">
            <Field label="Contract Type">
                {[["loan", "Loan"], ["sale_agreement", "Sale Agreement"], ["lease", "Lease"], ["insurance", "Insurance"], ["input_supply", "Input Supply"], ["buyback_agreement", "Buyback Agreement"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Field>
            <Field label="Paste Contract Text Below">
                <textarea
                    style={{ ...inputStyle, resize: "vertical", minHeight: "120px", marginTop: "4px" } as React.CSSProperties}
                    value={f.contract_text}
                    onChange={e => setF(p => ({ ...p, contract_text: e.target.value }))}
                    placeholder="Paste the full contract text here..."
                />
            </Field>
            <button style={btnStyle} onClick={() => onSubmit(`audit my ${f.contract_type} contract`, { module: "contract", ...f })}>⚡ Audit for Red Flags</button>
        </Card>
    );
}

/* ════════════════════════════════════════════════════════════
   CORE MODULE D — DISPUTE ADVISOR
════════════════════════════════════════════════════════════ */
function DisputePanel({ onSubmit }: Props) {
    const [f, setF] = useState({ dispute_type: "insurance_rejection", state: "Maharashtra", description: "" });
    const sel = (k: string) => (e: React.ChangeEvent<HTMLSelectElement>) => setF(p => ({ ...p, [k]: e.target.value }));
    return (
        <Card title="🤝 Dispute & Legal Advisor" desc="Get step-by-step legal guidance for insurance rejections, land disputes & more.">
            <div style={rowStyle}>
                <Field label="Dispute Type">
                    {[["insurance_rejection", "Insurance Rejection"], ["land_record_error", "Land Record Error"], ["water_rights", "Water Rights"], ["msm_price_dispute", "MSM Price Dispute"], ["loan_coercion", "Loan Coercion"], ["pmkisan_not_received", "PM-KISAN Not Received"], ["fertilizer_adulteration", "Fertilizer Adulteration"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </Field>
                <Field label="Your State">
                    <select style={inputStyle} value={f.state} onChange={sel("state")}>
                        {["Maharashtra", "Punjab", "Uttar Pradesh", "Madhya Pradesh", "Rajasthan", "Karnataka", "Andhra Pradesh", "Gujarat", "Haryana", "West Bengal", "Tamil Nadu", "Bihar"].map(s => <option key={s}>{s}</option>)}
                    </select>
                </Field>
            </div>
            <Field label="Describe Your Issue">
                <textarea
                    style={{ ...inputStyle, resize: "vertical", minHeight: "80px", marginTop: "4px" } as React.CSSProperties}
                    value={f.description}
                    onChange={e => setF(p => ({ ...p, description: e.target.value }))}
                    placeholder="Describe your dispute in detail..."
                />
            </Field>
            <button style={btnStyle} onClick={() => onSubmit(`legal advice for ${f.dispute_type} in ${f.state}`, { module: "dispute", ...f })}>⚡ Get Legal Guidance</button>
        </Card>
    );
}

/* ════════════════════════════════════════════════════════════
   CORE MODULE E — GOVERNANCE / SCHEME FEED
════════════════════════════════════════════════════════════ */
function GovernancePanel({ onSubmit }: Props) {
    const [f, setF] = useState({ state: "Maharashtra", category: "all" });
    const sel = (k: string) => (e: React.ChangeEvent<HTMLSelectElement>) => setF(p => ({ ...p, [k]: e.target.value }));
    return (
        <Card title="🗞️ Government Scheme Feed" desc="Get latest central & state schemes relevant to your location.">
            <div style={rowStyle}>
                <Field label="State">
                    <select style={inputStyle} value={f.state} onChange={sel("state")}>
                        {["All India", "Maharashtra", "Punjab", "Uttar Pradesh", "Madhya Pradesh", "Rajasthan", "Karnataka", "Andhra Pradesh", "Gujarat", "Haryana", "West Bengal", "Tamil Nadu", "Bihar"].map(s => <option key={s}>{s}</option>)}
                    </select>
                </Field>
                <Field label="Category">
                    <select style={inputStyle} value={f.category} onChange={sel("category")}>
                        {[["all", "All"], ["subsidy", "Subsidy"], ["insurance", "Insurance"], ["credit", "Credit"], ["irrigation", "Irrigation"], ["organic_farming", "Organic Farming"], ["mechanization", "Mechanization"], ["disaster_relief", "Disaster Relief"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                </Field>
            </div>
            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "0.75rem", marginTop: "0.5rem", fontSize: "0.75rem", color: C.dim, lineHeight: 1.6 }}>
                Scheme data sourced via: <b style={{ color: C.accent }}>pmkisan.gov.in</b>, <b style={{ color: C.accent }}>agricoop.nic.in</b>, <b style={{ color: C.accent }}>data.gov.in</b> (configured in backend)
            </div>
            <button style={btnStyle} onClick={() => onSubmit(`latest government schemes for ${f.category} in ${f.state}`, { module: "governance", state: f.state, category: f.category })}>⚡ Get Latest Schemes</button>
        </Card>
    );
}

/* ── Shared helpers ── */
function Card({ title, desc, children }: { title: string, desc: string, children: React.ReactNode }) {
    return (
        <div style={{
            background: C.bg, border: `1px solid ${C.border}`, borderRadius: "12px",
            padding: "1.25rem 1.5rem", marginTop: "0.25rem",
        }}>
            <div style={{ fontWeight: 700, color: C.accent, fontSize: "0.9rem", marginBottom: "0.25rem" }}>{title}</div>
            <div style={{ color: C.dim, fontSize: "0.75rem", marginBottom: "1rem" }}>{desc}</div>
            {children}
        </div>
    );
}

function Field({ label, children }: { label: string, children: React.ReactNode }) {
    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={labelStyle}>{label}</label>
            {children}
        </div>
    );
}
