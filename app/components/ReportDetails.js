"use client";

import { useState, useEffect } from 'react';

export default function ReportDetails({ reportId, onBack }) {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/reports/${reportId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch report details');
        }
        const data = await response.json();
        setReport(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (reportId) {
      fetchReport();
    }
  }, [reportId]);

  if (isLoading) return <div className="loading">Loading details...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!report) return null;

  const { metrics } = report.summary;

  const formatDuration = (ms) => {
    if (ms === undefined || ms === null) return '-';
    return `${ms.toFixed(2)}ms`;
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="report-details">
      <div className="details-header">
        <button onClick={onBack} className="back-btn">← Back to History</button>
        <h2>Test Report</h2>
        <span className="timestamp">{new Date(report.timestamp).toLocaleString()}</span>
      </div>

      <div className="config-section">
        <h3>Configuration</h3>
        <div className="grid">
          <div className="item">
            <label>URL</label>
            <span>{report.config.method} {report.config.url}</span>
          </div>
          <div className="item">
            <label>VUs</label>
            <span>{report.config.vus}</span>
          </div>
          <div className="item">
            <label>Duration</label>
            <span>{report.config.duration}</span>
          </div>
        </div>
      </div>

      <div className="metrics-section">
        <h3>Key Metrics</h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <label>Total Requests</label>
            <span className="value">{metrics.http_reqs?.count || 0}</span>
            <span className="rate">({metrics.http_reqs?.rate?.toFixed(1) || 0}/s)</span>
          </div>
          <div className="metric-card">
            <label>Avg Response Time</label>
            <span className="value">{formatDuration(metrics.http_req_duration?.avg)}</span>
          </div>
          <div className="metric-card">
            <label>P95 Response Time</label>
            <span className="value">{formatDuration(metrics.http_req_duration?.['p(95)'])}</span>
          </div>
          <div className="metric-card">
            <label>Failed Requests</label>
            <span className="value error-text">{metrics.http_req_failed?.passes || 0}</span>
            <span className="sub-text">
              ({metrics.http_reqs?.count ? ((metrics.http_req_failed?.passes || 0) / metrics.http_reqs.count * 100).toFixed(2) : '0.00'}%)
            </span>
          </div>
        </div>
      </div>

      <div className="metrics-section">
        <h3>Data Transfer</h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <label>Data Sent</label>
            <span className="value">{formatBytes(metrics.data_sent?.count || 0)}</span>
            <span className="rate">({formatBytes(metrics.data_sent?.rate || 0)}/s)</span>
          </div>
          <div className="metric-card">
            <label>Data Received</label>
            <span className="value">{formatBytes(metrics.data_received?.count || 0)}</span>
            <span className="rate">({formatBytes(metrics.data_received?.rate || 0)}/s)</span>
          </div>
        </div>
      </div>

      <div className="metrics-section">
        <h3>Iteration Stats</h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <label>Total Iterations</label>
            <span className="value">{metrics.iterations?.count || 0}</span>
            <span className="rate">({metrics.iterations?.rate?.toFixed(1) || 0}/s)</span>
          </div>
          <div className="metric-card">
            <label>Avg Iteration Duration</label>
            <span className="value">{formatDuration(metrics.iteration_duration?.avg)}</span>
          </div>
        </div>
      </div>

      <div className="detailed-metrics">
        <h3>Detailed Breakdown</h3>
        <table>
          <thead>
            <tr>
              <th>Metric</th>
              <th>Avg</th>
              <th>Min</th>
              <th>Max</th>
              <th>P90</th>
              <th>P95</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Duration</td>
              <td>{formatDuration(metrics.http_req_duration?.avg)}</td>
              <td>{formatDuration(metrics.http_req_duration?.min)}</td>
              <td>{formatDuration(metrics.http_req_duration?.max)}</td>
              <td>{formatDuration(metrics.http_req_duration?.['p(90)'])}</td>
              <td>{formatDuration(metrics.http_req_duration?.['p(95)'])}</td>
            </tr>
            <tr>
              <td>Blocked</td>
              <td>{formatDuration(metrics.http_req_blocked?.avg)}</td>
              <td>{formatDuration(metrics.http_req_blocked?.min)}</td>
              <td>{formatDuration(metrics.http_req_blocked?.max)}</td>
              <td>{formatDuration(metrics.http_req_blocked?.['p(90)'])}</td>
              <td>{formatDuration(metrics.http_req_blocked?.['p(95)'])}</td>
            </tr>
            <tr>
              <td>Connecting</td>
              <td>{formatDuration(metrics.http_req_connecting?.avg)}</td>
              <td>{formatDuration(metrics.http_req_connecting?.min)}</td>
              <td>{formatDuration(metrics.http_req_connecting?.max)}</td>
              <td>{formatDuration(metrics.http_req_connecting?.['p(90)'])}</td>
              <td>{formatDuration(metrics.http_req_connecting?.['p(95)'])}</td>
            </tr>
            <tr>
              <td>TLS Handshaking</td>
              <td>{formatDuration(metrics.http_req_tls_handshaking?.avg)}</td>
              <td>{formatDuration(metrics.http_req_tls_handshaking?.min)}</td>
              <td>{formatDuration(metrics.http_req_tls_handshaking?.max)}</td>
              <td>{formatDuration(metrics.http_req_tls_handshaking?.['p(90)'])}</td>
              <td>{formatDuration(metrics.http_req_tls_handshaking?.['p(95)'])}</td>
            </tr>
            <tr>
              <td>Sending</td>
              <td>{formatDuration(metrics.http_req_sending?.avg)}</td>
              <td>{formatDuration(metrics.http_req_sending?.min)}</td>
              <td>{formatDuration(metrics.http_req_sending?.max)}</td>
              <td>{formatDuration(metrics.http_req_sending?.['p(90)'])}</td>
              <td>{formatDuration(metrics.http_req_sending?.['p(95)'])}</td>
            </tr>
            <tr>
              <td>Waiting (TTFB)</td>
              <td>{formatDuration(metrics.http_req_waiting?.avg)}</td>
              <td>{formatDuration(metrics.http_req_waiting?.min)}</td>
              <td>{formatDuration(metrics.http_req_waiting?.max)}</td>
              <td>{formatDuration(metrics.http_req_waiting?.['p(90)'])}</td>
              <td>{formatDuration(metrics.http_req_waiting?.['p(95)'])}</td>
            </tr>
            <tr>
              <td>Receiving</td>
              <td>{formatDuration(metrics.http_req_receiving?.avg)}</td>
              <td>{formatDuration(metrics.http_req_receiving?.min)}</td>
              <td>{formatDuration(metrics.http_req_receiving?.max)}</td>
              <td>{formatDuration(metrics.http_req_receiving?.['p(90)'])}</td>
              <td>{formatDuration(metrics.http_req_receiving?.['p(95)'])}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .report-details {
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          padding: 25px;
        }
        .details-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
          border-bottom: 1px solid #eee;
          padding-bottom: 15px;
        }
        .back-btn {
          background: none;
          border: 1px solid #ddd;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9em;
        }
        .back-btn:hover {
          background: #f8f9fa;
        }
        .timestamp {
          margin-left: auto;
          color: #6c757d;
        }
        h3 {
          margin: 0 0 15px 0;
          color: #343a40;
          font-size: 1.1em;
        }
        .config-section, .metrics-section {
          margin-bottom: 30px;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          background: #f8f9fa;
          padding: 15px;
          border-radius: 6px;
        }
        .item label, .metric-card label {
          display: block;
          font-size: 0.85em;
          color: #6c757d;
          margin-bottom: 5px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .item span {
          font-weight: 500;
          color: #212529;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 20px;
        }
        .metric-card {
          background: #fff;
          border: 1px solid #e9ecef;
          padding: 15px;
          border-radius: 6px;
          text-align: center;
        }
        .metric-card .value {
          display: block;
          font-size: 1.5em;
          font-weight: bold;
          color: #007bff;
          margin: 5px 0;
        }
        .metric-card .rate, .metric-card .sub-text {
          font-size: 0.85em;
          color: #6c757d;
        }
        .error-text {
          color: #dc3545 !important;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9em;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        th {
          background: #f8f9fa;
          font-weight: 600;
          color: #495057;
        }
        td {
          color: #212529;
        }
        .loading, .error {
          padding: 40px;
          text-align: center;
          color: #6c757d;
        }
      `}</style>
    </div>
  );
}
