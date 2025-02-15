import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Analysis = () => {
    const navigate = useNavigate();

    // ✅ State Management
    const [field, setField] = useState("energy_consumption");
    const [chartType, setChartType] = useState("line");
    const [years, setYears] = useState(5);

    // User Input Data
    const [productionVolume, setProductionVolume] = useState(100);
    const [wasteGenerated, setWasteGenerated] = useState(20);
    const [employeeCount, setEmployeeCount] = useState(50);

    // API Results
    const [analysisResult, setAnalysisResult] = useState(null);
    const [imageUrl, setImageUrl] = useState("");

    // Loading & Error Handling
    const [loadingAnalysis, setLoadingAnalysis] = useState(false);
    const [loadingChart, setLoadingChart] = useState(false);
    const [error, setError] = useState(null);

    // Dropdown Options
    const fields = ["energy_consumption", "production_volume", "waste_generated", "carbon_emission"];
    const chartTypes = ["line", "bar", "scatter", "pie"];

    // ✅ Fetch Updated Values When `years` Changes
    useEffect(() => {
        const fetchUpdatedValues = async () => {
            try {
                const response = await axios.get("https://sustainability-fastapi.onrender.com/get_updated_values/", {
                    params: { years }
                });
                setProductionVolume(response.data.production_volume);
                setWasteGenerated(response.data.waste_generated);
                setEmployeeCount(response.data.employee_count);
            } catch (err) {
                setError("Failed to fetch updated values.");
            }
        };

        fetchUpdatedValues();
    }, [years]);

    // ✅ Fetch Analysis Data
    const fetchAnalysis = async () => {
        setLoadingAnalysis(true);
        setError(null);
        try {
            const response = await axios.get("https://sustainability-fastapi.onrender.com/analyze/", {
                params: { production_volume: productionVolume, waste_generated: wasteGenerated, employee_count: employeeCount, years }
            });
            setAnalysisResult(response.data);
        } catch (err) {
            setError("Error fetching analysis: " + (err.response?.data?.detail || err.message));
        } finally {
            setLoadingAnalysis(false);
        }
    };

    // ✅ Fetch Visualization Chart
    const fetchVisualization = async () => {
        setLoadingChart(true);
        setError(null);
        try {
            const response = await axios.get("https://sustainability-fastapi.onrender.com/visualize/", {
                params: { k: years, field, chart_type: chartType },
                responseType: "blob",
            });

            // Prevent Memory Leak: Revoke Old URL
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl);
            }

            const newImageUrl = URL.createObjectURL(response.data);
            setImageUrl(newImageUrl);
        } catch (err) {
            setError("Failed to fetch visualization. Please try again.");
        } finally {
            setLoadingChart(false);
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="text-primary text-center">Data Analysis & Visualization</h2>

            {/* Controls Panel */}
            <div className="row">
                <div className="col-md-4 border-end">
                    <h4>Controls</h4>

                    <label className="form-label">Select Field:</label>
                    <select className="form-select mb-2" onChange={(e) => setField(e.target.value)} value={field}>
                        {fields.map((f) => (
                            <option key={f} value={f}>{f.replace("_", " ").toUpperCase()}</option>
                        ))}
                    </select>

                    <label className="form-label">Select Chart Type:</label>
                    <select className="form-select mb-2" onChange={(e) => setChartType(e.target.value)} value={chartType}>
                        {chartTypes.map((type) => (
                            <option key={type} value={type}>{type.toUpperCase()}</option>
                        ))}
                    </select>

                    <label className="form-label">Years:</label>
                    <input
                        type="number"
                        className="form-control mb-2"
                        value={years}
                        onChange={(e) => setYears(parseInt(e.target.value) || 1)}
                    />

                    <button className="btn btn-info w-100 mb-2" onClick={fetchAnalysis} disabled={loadingAnalysis}>
                        {loadingAnalysis ? "Fetching..." : "Get Analysis"}
                    </button>
                    <button className="btn btn-success w-100 mb-2" onClick={fetchVisualization} disabled={loadingChart}>
                        {loadingChart ? "Generating Chart..." : "Generate Chart"}
                    </button>
                    <button className="btn btn-secondary w-100 mt-3" onClick={() => navigate("/results")}>
                        Back to Dashboard
                    </button>
                </div>

                {/* Analysis & Chart Display */}
                <div className="col-md-8">
                    {error && <p className="alert alert-danger">{error}</p>}

                    <h4>Analysis Results</h4>
                    {loadingAnalysis ? (
                        <p>Loading analysis...</p>
                    ) : (
                        analysisResult ? (
                            <div className="bg-light p-3 border rounded">
                                <p><strong>Production Volume:</strong> {analysisResult.production_volume}</p>
                                <p><strong>Waste Generated:</strong> {analysisResult.waste_generated}</p>
                                <p><strong>Employee Count:</strong> {analysisResult.employee_count}</p>
                                <p><strong>Predicted Energy:</strong> {analysisResult.predicted_energy} kWh</p>
                                <p><strong>Predicted Emission:</strong> {analysisResult.predicted_emission} kg CO₂</p>
                            </div>
                        ) : (
                            <p>No analysis data yet.</p>
                        )
                    )}

                    <h4>Visualization</h4>
                    {loadingChart ? (
                        <p>Loading chart...</p>
                    ) : (
                        imageUrl && (
                            <div className="border p-3 rounded">
                                <h5>Generated Chart:</h5>
                                <img src={imageUrl} alt="Visualization" className="img-fluid" />
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default Analysis;
