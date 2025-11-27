"use client";

import { useState } from "react";
import TestBuilder from "./components/TestBuilder";
import ResultsViewer from "./components/ResultsViewer";
import ReportsList from "./components/ReportsList";
import ReportDetails from "./components/ReportDetails";

export default function Home() {
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [view, setView] = useState('test'); // 'test', 'history', 'details'
  const [selectedReportId, setSelectedReportId] = useState(null);

  const handleRunTest = async (config) => {
    setIsLoading(true);
    setResults(''); // Initialize as empty string for streaming
    setError(null);

    try {
      const response = await fetch('/api/run-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.details || 'Failed to run test');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        setResults((prev) => (prev || '') + text);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectReport = (id) => {
    setSelectedReportId(id);
    setView('details');
  };

  return (
    <main className="container">
      <header className="header">
        <h1>⚡ K6 Load Tester</h1>
        <p>Simple, powerful load testing for everyone.</p>

        <div className="nav-tabs">
          <button
            className={`nav-btn ${view === 'test' ? 'active' : ''}`}
            onClick={() => setView('test')}
          >
            Run Test
          </button>
          <button
            className={`nav-btn ${view === 'history' || view === 'details' ? 'active' : ''}`}
            onClick={() => setView('history')}
          >
            History
          </button>
        </div>
      </header>

      <div className="content-grid">
        {view === 'test' && (
          <>
            <section>
              <TestBuilder onRunTest={handleRunTest} isLoading={isLoading} />
            </section>

            <section>
              {error && (
                <div className="error-card">
                  <h3>Error</h3>
                  <p>{error}</p>
                </div>
              )}
              <ResultsViewer results={results} />
            </section>
          </>
        )}

        {view === 'history' && (
          <section className="full-width">
            <ReportsList onSelectReport={handleSelectReport} />
          </section>
        )}

        {view === 'details' && (
          <section className="full-width">
            <ReportDetails
              reportId={selectedReportId}
              onBack={() => setView('history')}
            />
          </section>
        )}
      </div>

      <style jsx>{`
        .nav-tabs {
          margin-top: 20px;
          display: flex;
          gap: 10px;
          justify-content: center;
        }
        .nav-btn {
          padding: 8px 20px;
          border: none;
          background: rgba(255,255,255,0.1);
          color: #fff;
          border-radius: 20px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }
        .nav-btn:hover {
          background: rgba(255,255,255,0.2);
        }
        .nav-btn.active {
          background: #fff;
          color: #007bff;
        }
        .full-width {
          grid-column: 1 / -1;
        }
      `}</style>
    </main>
  );
}
