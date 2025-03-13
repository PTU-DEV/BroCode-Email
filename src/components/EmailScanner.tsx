import React, { useState, useEffect } from 'react';
import { Mail, Shield, AlertTriangle, LogIn, Settings, RefreshCw, Search, Clock, Paperclip, Link2, ChevronRight } from 'lucide-react';
import { analyzeEmail } from '../services/gemini';
import { fetchEmails, getGmailAuthUrl } from '../services/gmail';
import { useAuthStore } from '../store/auth';
import type { EmailData, ScanResult } from '../types';
import toast from 'react-hot-toast';

export default function EmailScanner() {
  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState<EmailData[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailData | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const { accessToken, isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    const isAuthed = checkAuth();
    if (isAuthed && accessToken) {
      loadEmails();
    }
  }, [accessToken, checkAuth]);

  const loadEmails = async () => {
    if (!accessToken) return;
    
    setLoading(true);
    try {
      const fetchedEmails = await fetchEmails(accessToken);
      setEmails(fetchedEmails);
      toast.success('Emails loaded successfully');
    } catch (error) {
      console.error('Failed to load emails:', error);
      toast.error('Failed to load emails');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSelect = async (email: EmailData) => {
    setSelectedEmail(email);
    setResult(null); // Clear previous result
    setLoading(true);
    try {
      const scanResult = await analyzeEmail(email);
      setResult(scanResult);
      toast.success('Analysis complete');
    } catch (error) {
      console.error('Failed to analyze email:', error);
      toast.error('Failed to analyze email');
    } finally {
      setLoading(false);
    }
  };

  const handleGmailConnect = () => {
    window.location.href = getGmailAuthUrl();
  };

  const filteredEmails = emails.filter(email => 
    email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.sender.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated || !checkAuth()) {
    return (
      <div className="w-full max-w-4xl p-6 bg-white rounded-xl shadow-lg text-center">
        <div className="flex flex-col items-center gap-4 py-8">
          <Mail className="w-12 h-12 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Connect Your Gmail Account</h2>
          <p className="text-gray-600 mb-4">
            Connect your Gmail account to automatically scan emails for phishing threats.
          </p>
          <button
            onClick={handleGmailConnect}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <LogIn className="w-5 h-5" />
            Connect Gmail
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl p-6 bg-white rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Mail className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Email Scanner</h2>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={loadEmails}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            title="Refresh"
            disabled={loading}
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Scanner Settings</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded text-blue-600" />
              <span>Auto-scan new emails</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded text-blue-600" />
              <span>Show warning banners for suspicious emails</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="number" min="5" max="50" className="w-20 rounded-md border-gray-300" />
              <span>Number of emails to load</span>
            </label>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search emails..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold">Recent Emails</h3>
          </div>
          {loading && !emails.length ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {filteredEmails.map((email, index) => (
                <button
                  key={index}
                  onClick={() => handleEmailSelect(email)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                    selectedEmail === email ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate mb-1">
                        {email.subject || '(No subject)'}
                      </p>
                      <p className="text-sm text-gray-600 truncate mb-2">{email.sender}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {email.timestamp || 'Recent'}
                        </span>
                        {email.attachments.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Paperclip className="w-4 h-4" />
                            {email.attachments.length}
                          </span>
                        )}
                        {email.links.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Link2 className="w-4 h-4" />
                            {email.links.length}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border rounded-lg">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold">Analysis Results</h3>
          </div>
          <div className="p-4">
            {loading && selectedEmail ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : result ? (
              <div className={`rounded-lg border ${
                result.isPhishing 
                  ? 'border-red-200 bg-red-50' 
                  : 'border-green-200 bg-green-50'
              }`}>
                <div className="p-4 border-b border-inherit">
                  <div className="flex items-center gap-2">
                    {result.isPhishing ? (
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    ) : (
                      <Shield className="w-6 h-6 text-green-600" />
                    )}
                    <h3 className={`text-lg font-semibold ${
                      result.isPhishing ? 'text-red-800' : 'text-green-800'
                    }`}>
                      {result.isPhishing ? 'Phishing Detected!' : 'Email Appears Safe'}
                    </h3>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Confidence:</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full">
                        <div 
                          className={`h-2 rounded-full ${
                            result.isPhishing && result.confidence >= 80 ? 'bg-red-500' :
                            result.isPhishing && result.confidence >= 60 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${result.confidence}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{result.confidence}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Risk Factors:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {result.riskFactors.map((factor, index) => (
                        <li key={index} className="text-gray-700">{factor}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Analysis:</h4>
                    <p className="text-gray-700">{result.explanation}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Recommendations:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {result.recommendations.map((rec, index) => (
                        <li key={index} className="text-gray-700">{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Mail className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Select an email to analyze</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}