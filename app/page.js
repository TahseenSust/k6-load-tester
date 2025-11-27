"use client";

import { useState } from "react";
import TestBuilder from "./components/TestBuilder";
import ResultsViewer from "./components/ResultsViewer";

export default function Home() {
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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

  return (
    <main className="container">
      <header className="header">
        <h1>⚡ K6 Load Tester</h1>
        <p>Simple, powerful load testing for everyone.</p>
      </header>

      <div className="content-grid">
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
      </div>
    </main>
  );
}
