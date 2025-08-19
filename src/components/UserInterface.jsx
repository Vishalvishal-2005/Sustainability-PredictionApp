import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState } from 'react';
import { FaChartLine, FaFileUpload, FaPlayCircle, FaDownload } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const TrainAndPredict = () => {
    const [csvFile, setCsvFile] = useState(null);
    const [years, setYears] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setCsvFile(e.target.files[0]);
        setMessage('');
        setError(null);
    };

    const handleYearsChange = (e) => {
        setYears(e.target.value);
    };

    const handleTrain = async () => {
        if (!csvFile || !years) {
            setError('Please upload a CSV file and specify the number of years.');
            return;
        }

        const formData = new FormData();
        formData.append('file', csvFile);
        formData.append('k', years);

        try {
            setLoading(true);
            setError(null);
            const response = await axios.post('https://sustainability-fastapi.onrender.com/train/', formData);
            setMessage(response.data.message);
        } catch (err) {
            setError(err.response?.data?.detail || 'An error occurred while training the model.');
        } finally {
            setLoading(false);
        }
    };

    const handlePredict = async () => {
        if (!csvFile || !years) {
            setError('Please upload a CSV file and specify the number of years.');
            return;
        }

        const formData = new FormData();
        formData.append('file', csvFile);
        formData.append('k', years);

        try {
            setLoading(true);
            setError(null);
            const response = await axios.post('https://sustainability-fastapi.onrender.com/predict/', formData);
            navigate('/results', { state: { predictions: response.data, years } });
        } catch (err) {
            setError(err.response?.data?.detail || 'An error occurred while predicting.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5 d-flex justify-content-center">
            <div className="card p-4 shadow-lg" style={{ maxWidth: '500px', width: '100%' }}>
                
                {/* 🔹 Download Sample Dataset Button */}
                <div className="text-center mb-4">
                    <a 
                        href="public/sustainability_dataset (1).csv"   // place your CSV in the public folder
                        download
                        className="btn btn-outline-info"
                    >
                        <FaDownload className="me-2" /> Download Sample Dataset
                    </a>
                </div>

                <h2 className="text-primary text-center mb-3">
                    <FaFileUpload className="me-2" /> Upload & Train Model
                </h2>
                <div className="mb-3">
                    <input type="file" className="form-control" accept=".csv" onChange={handleFileChange} />
                </div>
                <div className="mb-3">
                    <input type="number" className="form-control" placeholder="Enter years for prediction" value={years} onChange={handleYearsChange} />
                </div>
                <button className="btn btn-primary w-100 mb-3" onClick={handleTrain} disabled={loading}>
                    {loading ? 'Training...' : <><FaPlayCircle className="me-2" /> Train Model</>}
                </button>
                {message && <p className="alert alert-success text-center">{message}</p>}
                <h2 className="text-success text-center mb-3">
                    <FaChartLine className="me-2" /> Predict Energy
                </h2>
                <button className="btn btn-success w-100 mb-3" onClick={handlePredict} disabled={loading}>
                    {loading ? 'Predicting...' : <><FaPlayCircle className="me-2" /> Predict Energy</>}
                </button>
                {error && <p className="alert alert-danger text-center">{error}</p>}
            </div>
        </div>
    );
};

export default TrainAndPredict;
