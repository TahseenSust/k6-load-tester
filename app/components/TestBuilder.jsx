'use client';

import { useState } from 'react';

export default function TestBuilder({ onRunTest, isLoading }) {
    const [config, setConfig] = useState({
        url: 'https://test-api.k6.io/public/crocodiles/',
        method: 'GET',
        vus: 1,
        duration: '10s',
        headers: [],
        queryParams: [],
        body: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        // Convert arrays to objects for easier processing
        const headersObj = config.headers.reduce((acc, curr) => {
            if (curr.key && curr.value) acc[curr.key] = curr.value;
            return acc;
        }, {});

        const queryParamsObj = config.queryParams.reduce((acc, curr) => {
            if (curr.key && curr.value) acc[curr.key] = curr.value;
            return acc;
        }, {});

        onRunTest({
            ...config,
            headers: headersObj,
            queryParams: queryParamsObj,
        });
    };

    const addHeader = () => {
        setConfig({ ...config, headers: [...config.headers, { key: '', value: '' }] });
    };

    const removeHeader = (index) => {
        const newHeaders = [...config.headers];
        newHeaders.splice(index, 1);
        setConfig({ ...config, headers: newHeaders });
    };

    const updateHeader = (index, field, value) => {
        const newHeaders = [...config.headers];
        newHeaders[index][field] = value;
        setConfig({ ...config, headers: newHeaders });
    };

    const addQueryParam = () => {
        setConfig({ ...config, queryParams: [...config.queryParams, { key: '', value: '' }] });
    };

    const removeQueryParam = (index) => {
        const newParams = [...config.queryParams];
        newParams.splice(index, 1);
        setConfig({ ...config, queryParams: newParams });
    };

    const updateQueryParam = (index, field, value) => {
        const newParams = [...config.queryParams];
        newParams[index][field] = value;
        setConfig({ ...config, queryParams: newParams });
    };

    const showBodyInput = ['POST', 'PUT', 'PATCH'].includes(config.method);

    return (
        <div className="card">
            <h2>Configure Load Test</h2>
            <form onSubmit={handleSubmit} className="form-grid">
                <div className="form-group">
                    <label htmlFor="url">Target URL</label>
                    <input
                        type="url"
                        id="url"
                        value={config.url}
                        onChange={(e) => setConfig({ ...config, url: e.target.value })}
                        required
                        placeholder="https://api.example.com"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="method">HTTP Method</label>
                    <select
                        id="method"
                        value={config.method}
                        onChange={(e) => setConfig({ ...config, method: e.target.value })}
                    >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                        <option value="PATCH">PATCH</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="vus">Virtual Users (VUs)</label>
                    <input
                        type="number"
                        id="vus"
                        min="1"
                        max="100"
                        value={config.vus}
                        onChange={(e) => setConfig({ ...config, vus: parseInt(e.target.value) })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="duration">Duration (e.g., 10s, 1m)</label>
                    <input
                        type="text"
                        id="duration"
                        pattern="^\d+[smh]$"
                        value={config.duration}
                        onChange={(e) => setConfig({ ...config, duration: e.target.value })}
                        required
                        placeholder="30s"
                    />
                </div>

                {/* Query Parameters */}
                <div className="form-group">
                    <label>Query Parameters</label>
                    {config.queryParams.map((param, index) => (
                        <div key={index} className="key-value-row">
                            <input
                                placeholder="Key"
                                value={param.key}
                                onChange={(e) => updateQueryParam(index, 'key', e.target.value)}
                            />
                            <input
                                placeholder="Value"
                                value={param.value}
                                onChange={(e) => updateQueryParam(index, 'value', e.target.value)}
                            />
                            <button type="button" onClick={() => removeQueryParam(index)} className="btn-remove">×</button>
                        </div>
                    ))}
                    <button type="button" onClick={addQueryParam} className="btn-secondary">+ Add Param</button>
                </div>

                {/* Headers */}
                <div className="form-group">
                    <label>Headers</label>
                    {config.headers.map((header, index) => (
                        <div key={index} className="key-value-row">
                            <input
                                placeholder="Key"
                                value={header.key}
                                onChange={(e) => updateHeader(index, 'key', e.target.value)}
                            />
                            <input
                                placeholder="Value"
                                value={header.value}
                                onChange={(e) => updateHeader(index, 'value', e.target.value)}
                            />
                            <button type="button" onClick={() => removeHeader(index)} className="btn-remove">×</button>
                        </div>
                    ))}
                    <button type="button" onClick={addHeader} className="btn-secondary">+ Add Header</button>
                </div>

                {/* Request Body */}
                {showBodyInput && (
                    <div className="form-group">
                        <label htmlFor="body">Request Body (JSON)</label>
                        <textarea
                            id="body"
                            rows="5"
                            value={config.body}
                            onChange={(e) => setConfig({ ...config, body: e.target.value })}
                            placeholder='{"key": "value"}'
                            className="code-input"
                        />
                    </div>
                )}

                <button type="submit" disabled={isLoading} className="btn-primary">
                    {isLoading ? 'Running Test...' : 'Start Load Test'}
                </button>
            </form>
        </div>
    );
}
