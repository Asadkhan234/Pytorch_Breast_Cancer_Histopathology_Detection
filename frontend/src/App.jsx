
import { useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Local FastAPI
  // Change this to your Render URL after deployment
  const API_URL = "https://pytorch-breast-cancer-histopathology.onrender.com";
  

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResult(null);
    setError("");
  };

  const handlePredict = async () => {
    if (!file) {
      setError("Please upload a histopathology image first.");
      return;
    }

    setLoading(true);
    setResult(null);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Prediction failed");
      }

      const data = await response.json();

      setResult(data);
    } catch (error) {
      console.error(error);

      setError(
        "Unable to connect to the prediction server. Make sure FastAPI is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError("");
  };

  return (
    <div className="app">

      {/* Header */}
      <header className="header">
        <div className="brand">
          <div className="brand-icon">+</div>

          <div>
            <h2>MedVision AI</h2>
            <span>Computer Vision Project</span>
          </div>
        </div>

        <div className="status">
          <span className="status-dot"></span>
          Model Online
        </div>
      </header>


      {/* Main */}
      <main className="main">

        <section className="hero">

          <div className="hero-badge">
            PyTorch • CNN • BreaKHis
          </div>

          <h1>
            Breast Cancer
            <br />
            <span>Histopathology Detection</span>
          </h1>

          <p>
            Upload a breast histopathology image and let the trained
            PyTorch CNN classify the image as Benign or Malignant.
          </p>

        </section>


        <section className="dashboard">

          {/* Upload Card */}
          <div className="card upload-card">

            <div className="card-header">
              <div>
                <h3>Upload Image</h3>
                <p>Upload a histopathology image for analysis</p>
              </div>

              <div className="card-number">01</div>
            </div>


            {!preview ? (

              <label className="drop-zone">

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  hidden
                />

                <div className="upload-icon">
                  ↑
                </div>

                <h4>Choose a histopathology image</h4>

                <p>
                  Click here to browse your computer
                </p>

                <span className="file-types">
                  JPG • JPEG • PNG
                </span>

              </label>

            ) : (

              <div className="preview-container">

                <img
                  src={preview}
                  alt="Histopathology preview"
                  className="preview-image"
                />

                <div className="image-info">

                  <div>
                    <strong>{file.name}</strong>

                    <span>
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>

                  <button
                    className="remove-button"
                    onClick={removeImage}
                  >
                    Remove
                  </button>

                </div>

              </div>

            )}


            <button
              className="predict-button"
              onClick={handlePredict}
              disabled={!file || loading}
            >

              {loading ? (
                <>
                  <span className="spinner"></span>
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze Image
                  <span>→</span>
                </>
              )}

            </button>

          </div>


          {/* Result Card */}
          <div className="card result-card">

            <div className="card-header">

              <div>
                <h3>Analysis Result</h3>
                <p>AI classification result</p>
              </div>

              <div className="card-number">02</div>

            </div>


            {!result ? (

              <div className="empty-result">

                <div className="result-icon">
                  ◉
                </div>

                <h4>No analysis yet</h4>

                <p>
                  Upload an image and click
                  <strong> Analyze Image </strong>
                  to see the prediction.
                </p>

              </div>

            ) : (

              <div className="result-content">

                <div
                  className={`prediction ${
                    result.prediction.toLowerCase() === "malignant"
                      ? "malignant"
                      : "benign"
                  }`}
                >

                  <div className="prediction-icon">
                    {result.prediction.toLowerCase() === "malignant"
                      ? "!"
                      : "✓"}
                  </div>

                  <div>
                    <span>Prediction</span>

                    <h2>
                      {result.prediction}
                    </h2>
                  </div>

                </div>


                <div className="confidence-section">

                  <div className="confidence-header">
                    <span>Confidence</span>

                    <strong>
                      {result.confidence}%
                    </strong>
                  </div>

                  <div className="progress-bar">
                    <div
                      className="progress"
                      style={{
                        width: `${result.confidence}%`,
                      }}
                    ></div>
                  </div>

                </div>


                <div className="result-details">

                  <div>
                    <span>Model</span>
                    <strong>PyTorch CNN</strong>
                  </div>

                  <div>
                    <span>Dataset</span>
                    <strong>BreaKHis</strong>
                  </div>

                  <div>
                    <span>Classes</span>
                    <strong>2</strong>
                  </div>

                </div>

              </div>

            )}

          </div>

        </section>


        {error && (
          <div className="error-message">
            <span>!</span>
            {error}
          </div>
        )}


        {/* Info */}
        <section className="info-section">

          <div className="info-card">
            <span>01</span>
            <div>
              <h4>Upload</h4>
              <p>Select a histopathology image.</p>
            </div>
          </div>

          <div className="info-card">
            <span>02</span>
            <div>
              <h4>Analyze</h4>
              <p>PyTorch CNN processes the image.</p>
            </div>
          </div>

          <div className="info-card">
            <span>03</span>
            <div>
              <h4>Result</h4>
              <p>View classification and confidence.</p>
            </div>
          </div>

        </section>


        <div className="disclaimer">
          <strong>Important:</strong> This application is an educational
          machine-learning project and is not a medical diagnostic tool.
          Results should not be used for clinical decisions.
        </div>

      </main>


      <footer>
        <span>MedVision AI</span>
        <span>Built with PyTorch + FastAPI + React</span>
      </footer>

    </div>
  );
}

export default App;
