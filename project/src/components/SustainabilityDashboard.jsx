import { Activity, AlertCircle, BarChart3, CheckCircle, Download, Factory, Leaf, LineChart, Settings, Trash2, TrendingUp, Upload, Users, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

const API_BASE = 'http://127.0.0.1:8000';

export default function SustainabilityDashboard() {
  const [activeTab, setActiveTab] = useState('train');
  const [trainFile, setTrainFile] = useState(null);
  const [predictFile, setPredictFile] = useState(null);
  const [years, setYears] = useState(5);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [modelTrained, setModelTrained] = useState(false);
  const [notification, setNotification] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [analysisParams, setAnalysisParams] = useState({
    production_volume: 120,
    waste_generated: 30,
    employee_count: 50,
    years: 1
  });
  const [analysisResults, setAnalysisResults] = useState(null);
  const [recentFiles, setRecentFiles] = useState([]);

  // Initialize from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedRecentFiles = JSON.parse(localStorage.getItem('recentFiles') || '[]');
    setDarkMode(savedDarkMode);
    setRecentFiles(savedRecentFiles);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const addToRecentFiles = (file) => {
    const updatedFiles = [file, ...recentFiles.filter(f => f.name !== file.name)].slice(0, 5);
    setRecentFiles(updatedFiles);
    localStorage.setItem('recentFiles', JSON.stringify(updatedFiles));
  };

  const handleTrainModel = async () => {
    if (!trainFile) {
      showNotification('Please select a CSV file to train the model', 'error');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', trainFile);

    try {
      const response = await fetch(`${API_BASE}/train/`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setModelTrained(true);
        addToRecentFiles(trainFile);
        showNotification(`Model trained successfully with ${data.training_samples} samples! 🎉`);
        setActiveTab('analyze');
      } else {
        throw new Error('Training failed');
      }
    } catch (error) {
      showNotification('Failed to train model. Please check your CSV format.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!modelTrained) {
      showNotification('Please train the model first!', 'error');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams(analysisParams).toString();
      const response = await fetch(`${API_BASE}/analyze/?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setAnalysisResults(data);
        showNotification('Analysis complete! 📊');
      } else {
        throw new Error('Analysis failed');
      }
    } catch (error) {
      showNotification('Analysis failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async () => {
    if (!predictFile || !modelTrained) {
      showNotification('Please train the model and select a file first!', 'error');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', predictFile);
    formData.append('k', years);

    try {
      const response = await fetch(`${API_BASE}/predict/`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data);
        addToRecentFiles(predictFile);
        showNotification(`Predictions generated for ${years} years ahead! 🚀`);
      } else {
        throw new Error('Prediction failed');
      }
    } catch (error) {
      showNotification('Prediction failed. Please check your data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const downloadSampleDataset = async () => {
    try {
      const response = await fetch(`${API_BASE}/sample-dataset`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'sample_sustainability_data.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        showNotification('Sample dataset downloaded! 📥');
      }
    } catch (error) {
      showNotification('Failed to download sample dataset', 'error');
    }
  };

  const themeClasses = darkMode 
    ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white'
    : 'bg-gradient-to-br from-emerald-50 via-blue-50 to-teal-50 text-gray-800';

  const cardClasses = darkMode 
    ? 'bg-gray-800 border-gray-700 text-white'
    : 'bg-white border-gray-200 text-gray-800';

  const inputClasses = darkMode
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
    : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses}`}>
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in ${
          notification.type === 'success' 
            ? (darkMode ? 'bg-emerald-600 text-white' : 'bg-emerald-500 text-white')
            : (darkMode ? 'bg-red-600 text-white' : 'bg-red-500 text-white')
        }`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className={`${darkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-emerald-600 to-teal-600'} text-white shadow-xl transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl backdrop-blur ${darkMode ? 'bg-white/10' : 'bg-white/20'}`}>
                <Leaf size={32} />
              </div>
              <div>
                <h1 className="text-4xl font-bold">EcoPredict Dashboard</h1>
                <p className={darkMode ? "text-gray-300 mt-1" : "text-emerald-100 mt-1"}>
                  AI-Powered Sustainability Intelligence
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                className={`p-3 rounded-xl transition-all ${
                  darkMode ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`p-3 rounded-xl transition-all ${
                  darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                <Settings size={24} />
              </button>
            </div>
          </div>
          
          <div className="flex gap-2 mt-6 flex-wrap">
            <button
              onClick={() => setActiveTab('train')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'train'
                  ? (darkMode ? 'bg-gray-700 text-white shadow-lg' : 'bg-white text-emerald-600 shadow-lg')
                  : (darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-white/20 hover:bg-white/30')
              }`}
            >
              🎓 Train Model
            </button>
            <button
              onClick={() => setActiveTab('analyze')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'analyze'
                  ? (darkMode ? 'bg-gray-700 text-white shadow-lg' : 'bg-white text-emerald-600 shadow-lg')
                  : (darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-white/20 hover:bg-white/30')
              }`}
            >
              📊 Quick Analysis
            </button>
            <button
              onClick={() => setActiveTab('predict')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'predict'
                  ? (darkMode ? 'bg-gray-700 text-white shadow-lg' : 'bg-white text-emerald-600 shadow-lg')
                  : (darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-white/20 hover:bg-white/30')
              }`}
            >
              🔮 Future Predictions
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      {sidebarOpen && (
        <div className={`fixed right-0 top-0 h-full w-80 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl z-40 transition-transform duration-300`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold">Settings & Tools</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Download size={18} />
                  Recent Files
                </h3>
                <div className="space-y-2">
                  {recentFiles.map((file, index) => (
                    <div key={index} className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} text-sm`}>
                      {file.name}
                    </div>
                  ))}
                  {recentFiles.length === 0 && (
                    <p className="text-sm opacity-70">No recent files</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Export Data</h3>
                <button className={`w-full p-3 rounded-lg text-left transition-colors ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                }`}>
                  📊 Export Current Results
                </button>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Help & Support</h3>
                <button className={`w-full p-3 rounded-lg text-left transition-colors ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                }`}>
                  📚 Documentation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Train Tab */}
        {activeTab === 'train' && (
          <div className={`rounded-2xl shadow-xl p-8 border-2 transition-colors duration-300 ${cardClasses}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 rounded-xl ${darkMode ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
                <Upload className={darkMode ? "text-blue-300" : "text-blue-600"} size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Train Your Model</h2>
                <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                  Upload historical data to train the AI prediction models
                </p>
              </div>
            </div>

            <div className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors hover:border-emerald-400 ${
              darkMode ? 'border-gray-600' : 'border-gray-300'
            }`}>
              <Upload className={`mx-auto mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} size={48} />
              <label className="cursor-pointer">
                <span className={`text-lg font-semibold hover:text-emerald-400 transition-colors ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {trainFile ? trainFile.name : 'Click to upload CSV file'}
                </span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setTrainFile(e.target.files[0])}
                  className="hidden"
                />
              </label>
              <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Required columns: production_volume, waste_generated, employee_count, energy_consumption, carbon_emission
              </p>
            </div>

            <button
              onClick={handleTrainModel}
              disabled={loading || !trainFile}
              className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 rounded-xl font-bold text-lg hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {loading ? '🔄 Training Model...' : '🚀 Train Model'}
            </button>

            {modelTrained && (
              <div className={`mt-6 p-4 rounded-xl border-2 ${
                darkMode ? 'bg-emerald-900/20 border-emerald-800' : 'bg-emerald-50 border-emerald-200'
              }`}>
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle size={20} />
                  <span className="font-semibold">Model is trained and ready to use!</span>
                </div>
              </div>
            )}

            {/* Sample Dataset Card */}
            <div className={`mt-6 rounded-xl p-6 shadow-lg transition-all ${cardClasses}`}>
              <div className="text-4xl mb-3 text-center">📂</div>
              <h3 className="text-lg font-bold text-center mb-2">Sample Dataset</h3>
              <p className={`text-center mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Download a sample CSV with all required columns to test the model.
              </p>
              <div className="text-center">
                <button
                  onClick={downloadSampleDataset}
                  className="bg-emerald-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-emerald-600 transition-all inline-flex items-center gap-2"
                >
                  <Download size={18} />
                  ⬇️ Download Sample
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Analyze Tab */}
        {activeTab === 'analyze' && (
          <div className="space-y-6">
            <div className={`rounded-2xl shadow-xl p-8 border-2 transition-colors duration-300 ${cardClasses}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-xl ${darkMode ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
                  <Activity className={darkMode ? "text-purple-300" : "text-purple-600"} size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Real-Time Analysis</h2>
                  <p className={darkMode ? "text-gray-300" : "text-gray-600"}>Get instant sustainability predictions</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { key: 'production_volume', icon: Factory, label: 'Production Volume (units)', color: 'blue' },
                  { key: 'waste_generated', icon: Trash2, label: 'Waste Generated (kg)', color: 'orange' },
                  { key: 'employee_count', icon: Users, label: 'Employee Count', color: 'red' },
                  { key: 'years', icon: TrendingUp, label: 'Projection Years', color: 'green' }
                ].map(({ key, icon: Icon, label, color }) => (
                  <div key={key}>
                    <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <Icon size={18} className={`text-${color}-500`} />
                      {label}
                    </label>
                    <input
                      type="number"
                      value={analysisParams[key]}
                      onChange={(e) => setAnalysisParams({
                        ...analysisParams, 
                        [key]: key === 'years' ? parseInt(e.target.value) : parseFloat(e.target.value)
                      })}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors ${inputClasses}`}
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={handleAnalyze}
                disabled={loading || !modelTrained}
                className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                {loading ? '🔄 Analyzing...' : '🔍 Analyze Now'}
              </button>
            </div>

            {analysisResults && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { key: 'predicted_energy', icon: Zap, label: 'Energy', unit: 'kWh Predicted', gradient: 'from-blue-500 to-blue-600' },
                  { key: 'predicted_emission', icon: Activity, label: 'Emissions', unit: 'kg CO₂', gradient: 'from-red-500 to-red-600' },
                  { key: 'trees_equivalent', icon: Leaf, label: 'Trees', unit: 'Needed to Offset', gradient: 'from-green-500 to-emerald-600' },
                  { key: 'sustainability_score', icon: BarChart3, label: 'Score', unit: 'Sustainability Index', gradient: 'from-purple-500 to-purple-600' }
                ].map(({ key, icon: Icon, label, unit, gradient }) => (
                  <div key={key} className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform duration-300`}>
                    <div className="flex items-center justify-between mb-3">
                      <Icon size={32} />
                      <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">{label}</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">
                      {analysisResults[key]?.toFixed?.(2) || analysisResults[key]}
                    </div>
                    <div className="opacity-90 text-sm">{unit}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Predict Tab */}
        {activeTab === 'predict' && (
          <div className="space-y-6">
            <div className={`rounded-2xl shadow-xl p-8 border-2 transition-colors duration-300 ${cardClasses}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-xl ${darkMode ? 'bg-indigo-900/50' : 'bg-indigo-100'}`}>
                  <TrendingUp className={darkMode ? "text-indigo-300" : "text-indigo-600"} size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Future Predictions</h2>
                  <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                    Upload current data to forecast future sustainability metrics
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors hover:border-indigo-400 ${
                  darkMode ? 'border-gray-600' : 'border-gray-300'
                }`}>
                  <Upload className={`mx-auto mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} size={40} />
                  <label className="cursor-pointer">
                    <span className={`text-base font-semibold hover:text-indigo-400 transition-colors ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {predictFile ? predictFile.name : 'Upload Current Data CSV'}
                    </span>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => setPredictFile(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex flex-col justify-center">
                  <label className={`text-sm font-semibold mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    🔮 Forecast Timeline (Years)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={years}
                    onChange={(e) => setYears(parseInt(e.target.value))}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className={`flex justify-between text-sm mt-2 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <span>1 year</span>
                    <span className="text-xl font-bold text-indigo-600">{years} years</span>
                    <span>20 years</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePredict}
                disabled={loading || !predictFile || !modelTrained}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-4 rounded-xl font-bold text-lg hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                {loading ? '🔄 Generating Predictions...' : '🚀 Generate Predictions'}
              </button>
            </div>

            {results && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
                  <h3 className="text-2xl font-bold mb-6">📊 Prediction Results for {results.years} Years</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { key: 'predicted_energy_consumption', icon: Zap, label: 'Energy Consumption' },
                      { key: 'predicted_carbon_emission', icon: Activity, label: 'Carbon Emissions' },
                      { key: 'trees_equivalent', icon: Leaf, label: 'Trees Required' },
                      { key: 'production_volume', icon: Factory, label: 'Production Volume', format: (val) => val?.toFixed(2) },
                      { key: 'waste_generated', icon: Trash2, label: 'Waste Generated', format: (val) => val?.toFixed(2) + ' kg' },
                      { key: 'employee_count', icon: Users, label: 'Employee Count' }
                    ].map(({ key, icon: Icon, label, format }) => (
                      <div key={key} className="bg-white/20 backdrop-blur rounded-xl p-5 transform hover:scale-105 transition-transform">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon size={20} />
                          <span className="text-sm font-semibold">{label}</span>
                        </div>
                        <div className="text-3xl font-bold">
                          {format ? format(results[key]) : results[key]}
                        </div>
                      </div>
                    ))}
                  </div>

                  {results.sustainability_score && (
                    <div className="mt-6 bg-white/20 backdrop-blur rounded-xl p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-semibold">Sustainability Score</span>
                        <span className="text-4xl font-bold">{results.sustainability_score}/100</span>
                      </div>
                      <div className="w-full bg-white/30 rounded-full h-4">
                        <div
                          className="bg-gradient-to-r from-yellow-300 to-green-300 h-4 rounded-full transition-all duration-1000"
                          style={{ width: `${results.sustainability_score}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {results.plot_url && (
                  <div className={`rounded-2xl shadow-xl p-8 border-2 transition-colors duration-300 ${cardClasses}`}>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <LineChart className="text-indigo-600" />
                      Visual Analysis
                    </h3>
                    <img
                      src={`${API_BASE}${results.plot_url}`}
                      alt="Prediction Chart"
                      className="w-full rounded-xl shadow-lg"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Info Cards at Bottom */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {[
            { emoji: "🎯", title: "How It Works", description: "Upload your historical data, train our AI models, and get accurate predictions for energy consumption and carbon emissions." },
            { emoji: "🌱", title: "Impact Insights", description: "Understand your environmental footprint with tree equivalence calculations and sustainability scores." },
            { emoji: "📈", title: "Future Planning", description: "Make data-driven decisions with forecasts up to 20 years ahead, helping you plan sustainable growth." }
          ].map((card, index) => (
            <div key={index} className={`rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${cardClasses}`}>
              <div className="text-4xl mb-3">{card.emoji}</div>
              <h3 className="text-lg font-bold mb-2">{card.title}</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}