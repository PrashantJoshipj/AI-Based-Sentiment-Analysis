import React, { useState } from 'react';
import { AnalysisResult, AnalysisError } from '../types';
import { AlertCircle, Loader2 } from 'lucide-react';
import { UrlForm } from './UrlForm';
import { ResultsTable } from './ResultsTable';
import { Summary } from './Summary';

export function CommentAnalyzer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AnalysisError | null>(null);
  const [results, setResults] = useState<AnalysisResult | null>(null);

  const analyzeComments = async (url: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to analyze comments');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Social Media Comment Analyzer
          </h1>
          
          <UrlForm onSubmit={analyzeComments} disabled={loading} />

          {loading && (
            <div className="flex items-center justify-center mt-8">
              <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
              <span className="ml-2 text-gray-600">Analyzing comments...</span>
            </div>
          )}

          {error && (
            <div className="mt-8 p-4 bg-red-50 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="ml-2 text-red-700">{error.message}</span>
            </div>
          )}

          {results && (
            <div className="mt-12">
              <Summary summary={results.summary} />
              <ResultsTable comments={results.comments} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}