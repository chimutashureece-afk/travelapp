import React, { useState, useEffect } from 'react';
import './App.css';

// Type definitions for Electron API
declare global {
  interface Window {
    electronAPI?: {
      generateAI: (params: any) => Promise<any>;
      getAppVersion: () => Promise<string>;
      openFile: () => Promise<any>;
      saveFile: (data: any) => Promise<any>;
    };
  }
}

function App() {
  const [appVersion, setAppVersion] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Get app version from Electron
    if (window.electronAPI) {
      window.electronAPI.getAppVersion().then(setAppVersion);
    }
  }, []);

  const handleGenerateAnimation = async () => {
    if (!window.electronAPI) return;
    
    setIsGenerating(true);
    try {
      const result = await window.electronAPI.generateAI({
        prompt: 'Sample animation prompt',
        type: 'text-to-video'
      });
      console.log('AI Generation result:', result);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Olori Animate</h1>
              {appVersion && (
                <span className="ml-2 text-sm text-gray-500">v{appVersion}</span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <button className="btn-secondary">Settings</button>
              <button className="btn-primary">Export</button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Input Panel */}
            <div className="lg:col-span-1">
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Animation</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prompt
                    </label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      rows={4}
                      placeholder="Describe your animation..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Style
                    </label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                      <option>Realistic</option>
                      <option>Cartoon</option>
                      <option>Anime</option>
                      <option>3D Render</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration
                      </label>
                      <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                        <option>2 seconds</option>
                        <option>4 seconds</option>
                        <option>8 seconds</option>
                        <option>16 seconds</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quality
                      </label>
                      <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                        <option>Draft</option>
                        <option>Standard</option>
                        <option>High</option>
                        <option>Ultra</option>
                      </select>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleGenerateAnimation}
                    disabled={isGenerating}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                      isGenerating
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-primary-600 hover:bg-primary-700'
                    } text-white`}
                  >
                    {isGenerating ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </div>
                    ) : (
                      'Generate Animation'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="lg:col-span-2">
              <div className="card h-full">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview</h2>
                
                <div className="bg-gray-100 rounded-lg h-64 lg:h-96 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500">Your animation will appear here</p>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex space-x-2">
                    <button className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h6m-6 0v6m0-6H7m6 0h6" />
                      </svg>
                    </button>
                    <button className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    No animation loaded
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent Projects */}
          <div className="mt-8">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="bg-gray-100 rounded-lg p-4 hover:bg-gray-200 transition-colors cursor-pointer">
                    <div className="bg-gray-300 h-24 rounded mb-2"></div>
                    <p className="text-sm font-medium text-gray-900">Project {item}</p>
                    <p className="text-xs text-gray-500">2 days ago</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
