'use client';

export default function ResultsViewer({ results }) {
    if (!results) return null;

    return (
        <div className="card results-card">
            <h2>Test Results</h2>
            <pre className="results-output">
                {results}
            </pre>
        </div>
    );
}
