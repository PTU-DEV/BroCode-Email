import React, { useEffect } from 'react';
import { Shield, Mail, Cloud } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import EmailScanner from './components/EmailScanner';
import WorkloadScanner from './components/WorkloadScanner';
import { useAuthStore } from './store/auth';

function App() {
  const [activeTab, setActiveTab] = React.useState<'email' | 'workload'>('email');
  const { setAccessToken, checkAuth } = useAuthStore();

  useEffect(() => {
    // Handle OAuth callback
    const hashParams = new URLSearchParams(window.location.hash.substring(1)); // Remove the leading '#'
    console.log(hashParams);
    const accessToken = hashParams.get('access_token');
    console.log(accessToken);
    if (accessToken && !checkAuth()) {
      setAccessToken(accessToken);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [setAccessToken, checkAuth]);  

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <Toaster position="top-right" />
        
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">PhishingShield AI</h1>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Advanced threat detection powered by Google's Gemini AI. Protect your organization 
              from sophisticated phishing attacks and malicious workloads in real-time.
            </p>
          </header>

          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
              <button
                onClick={() => setActiveTab('email')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                  activeTab === 'email'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Mail className="w-5 h-5" />
                Email Scanner
              </button>
              <button
                onClick={() => setActiveTab('workload')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                  activeTab === 'workload'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Cloud className="w-5 h-5" />
                Workload Scanner
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            {activeTab === 'email' ? <EmailScanner /> : <WorkloadScanner />}
          </div>

          <footer className="mt-16 text-center text-gray-500 text-sm">
            <p>Protected by PhishingShield AI © {new Date().getFullYear()}</p>
            <p className="mt-1">Powered by Google Gemini</p>
          </footer>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;