"use client";

import { useState, useEffect } from 'react';

export default function ReportsList({ onSelectReport }) {
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await fetch('/api/reports');
                if (!response.ok) {
                    throw new Error('Failed to fetch reports');
                }
                const data = await response.json();
                setReports(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReports();
    }, []);

    if (isLoading) return <div className="loading">Loading reports...</div>;
    if (error) return <div className="error">Error: {error}</div>;
    if (reports.length === 0) return <div className="empty">No reports found. Run a test to generate one!</div>;

    return (
        <div className="reports-list">
            <h2>Test History</h2>
            <div className="list-container">
                {reports.map((report) => (
                    <div
                        key={report.id}
                        className="report-item"
                        onClick={() => onSelectReport(report.id)}
                    >
                        <div className="report-header">
                            <span className="method">{report.config.method}</span>
                            <span className="url">{report.config.url}</span>
                        </div>
                        <div className="report-meta">
                            <span>{new Date(report.timestamp).toLocaleString()}</span>
                            <span>VUs: {report.config.vus}</span>
                            <span>Duration: {report.config.duration}</span>
                        </div>
                    </div>
                ))}
            </div>
            <style jsx>{`
        .reports-list {
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          padding: 20px;
        }
        .list-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 600px;
          overflow-y: auto;
        }
        .report-item {
          border: 1px solid #eee;
          border-radius: 6px;
          padding: 15px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .report-item:hover {
          background: #f8f9fa;
          border-color: #ddd;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .report-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }
        .method {
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 4px;
          background: #e9ecef;
          font-size: 0.85em;
        }
        .url {
          color: #495057;
          font-family: monospace;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .report-meta {
          display: flex;
          gap: 15px;
          font-size: 0.85em;
          color: #6c757d;
        }
        .loading, .error, .empty {
          padding: 20px;
          text-align: center;
          color: #6c757d;
        }
        .error {
          color: #dc3545;
        }
      `}</style>
        </div>
    );
}
