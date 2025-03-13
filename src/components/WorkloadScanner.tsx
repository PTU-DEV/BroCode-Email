import React, { useState } from 'react';
import { Cloud, Shield, AlertTriangle } from 'lucide-react';
import { analyzeWorkload } from '../services/gemini';
import type { WorkloadData, ScanResult } from '../types';
import toast from 'react-hot-toast';

export default function WorkloadScanner() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [workloadData, setWorkloadData] = useState<WorkloadData>({
    ipAddress: '',
    domain: '',
    trafficPattern: '',
    payload: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const scanResult = await analyzeWorkload(workloadData);
      setResult(scanResult);
      toast.success('Workload analysis complete');
    } catch (error) {
      toast.error('Failed to analyze workload');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl p-6 bg-white rounded-xl shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <Cloud className="w-6 h-6 text-purple-600" />
        <h2 className="text-2xl font-bold text-gray-800">Cloud Workload Scanner</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">IP Address</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            value={workloadData.ipAddress}
            onChange={(e) => setWorkloadData({ ...workloadData, ipAddress: e.target.value })}
            required
            pattern="^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"
            placeholder="192.168.1.1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Domain</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            value={workloadData.domain}
            onChange={(e) => setWorkloadData({ ...workloadData, domain: e.target.value })}
            required
            placeholder="example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Traffic Pattern</label>
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            rows={3}
            value={workloadData.trafficPattern}
            onChange={(e) => setWorkloadData({ ...workloadData, trafficPattern: e.target.value })}
            required
            placeholder="Describe the traffic pattern (e.g., sudden spike in outbound connections)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Network Payload</label>
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            rows={3}
            value={workloadData.payload}
            onChange={(e) => setWorkloadData({ ...workloadData, payload: e.target.value })}
            required
            placeholder="Enter captured network payload or suspicious traffic data"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Analyzing Workload...
            </>
          ) : (
            <>
              <Shield className="w-5 h-5" />
              Scan Workload
            </>
          )}
        </button>
      </form>

      {result && (
        <div className={`mt-6 p-4 rounded-lg ${result.isPhishing ? 'bg-red-50' : 'bg-green-50'}`}>
          <div className="flex items-center gap-2 mb-4">
            {result.isPhishing ? (
              <AlertTriangle className="w-6 h-6 text-red-600" />
            ) : (
              <Shield className="w-6 h-6 text-green-600" />
            )}
            <h3 className={`text-lg font-semibold ${result.isPhishing ? 'text-red-800' : 'text-green-800'}`}>
              {result.isPhishing ? 'Threat Detected!' : 'Workload Appears Safe'}
            </h3>
          </div>
          
          <div className="space-y-2">
            <p className="text-gray-700"><strong>Confidence:</strong> {result.confidence}%</p>
            <p className="text-gray-700"><strong>Analysis:</strong> {result.explanation}</p>
            <div>
              <strong className="text-gray-700">Recommendations:</strong>
              <ul className="list-disc list-inside mt-2">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="text-gray-600">{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}