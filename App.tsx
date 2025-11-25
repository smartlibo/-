import React, { useState, useRef, useEffect } from 'react';
import { ArtStyle, GeneratedData, GenerationState } from './types';
import { generateWeChatCover } from './services/geminiService';
import { Spinner } from './components/Spinner';
import { PreviewCard } from './components/PreviewCard';

const SAMPLE_TEXT = `春天到了，万物复苏。这是一个关于在繁忙都市中寻找内心宁静的故事。我们探索了城市公园的隐秘角落，发现了盛开的樱花和在湖边晨练的老人。这是一份给所有都市奋斗者的心灵指南，教你如何在快节奏生活中慢下来，享受片刻的安宁。`;

function App() {
  const [articleText, setArticleText] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<ArtStyle>(ArtStyle.PHOTOREALISTIC);
  const [generationState, setGenerationState] = useState<GenerationState>({
    isLoading: false,
    step: 'idle',
    error: null,
  });
  const [result, setResult] = useState<GeneratedData | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [articleText]);

  const handleGenerate = async () => {
    if (!articleText.trim()) return;

    setGenerationState({ isLoading: true, step: 'analyzing', error: null });
    setResult(null);

    try {
      const data = await generateWeChatCover(articleText, selectedStyle);
      setResult(data);
      setGenerationState({ isLoading: false, step: 'complete', error: null });
    } catch (err: any) {
      setGenerationState({ 
        isLoading: false, 
        step: 'error', 
        error: err.message || "An unexpected error occurred." 
      });
    }
  };

  const handleDownload = () => {
    if (result?.imageUrl) {
      const link = document.createElement('a');
      link.href = result.imageUrl;
      link.download = `wechat-cover-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              WeChat<span className="text-green-600">Cover</span>Gen
            </h1>
          </div>
          <div className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            Powered by Gemini 2.5 Flash
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        
        {/* Left Column: Input */}
        <div className="space-y-6">
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Article Content
            </label>
            <p className="text-xs text-slate-500 mb-3">
              Paste your article text here. We'll analyze it to extract the mood and subject for the perfect cover.
            </p>
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={articleText}
                onChange={(e) => setArticleText(e.target.value)}
                placeholder="Paste your article content here..."
                className="w-full min-h-[160px] p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none text-slate-700 leading-relaxed"
              ></textarea>
              <div className="absolute bottom-3 right-3 flex space-x-2">
                 <button 
                  onClick={() => setArticleText(SAMPLE_TEXT)}
                  className="text-xs text-green-600 hover:text-green-700 font-medium px-2 py-1 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
                >
                  Load Sample
                </button>
                <button 
                  onClick={() => setArticleText('')}
                  className="text-xs text-slate-400 hover:text-slate-600 font-medium px-2 py-1 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <label className="block text-sm font-bold text-slate-700 mb-3">
              Visual Style
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.values(ArtStyle).map((style) => (
                <button
                  key={style}
                  onClick={() => setSelectedStyle(style)}
                  className={`px-3 py-2 text-sm rounded-lg border text-left transition-all ${
                    selectedStyle === style
                      ? 'border-green-500 bg-green-50 text-green-700 ring-1 ring-green-500'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generationState.isLoading || !articleText.trim()}
            className={`w-full py-4 px-6 rounded-xl flex items-center justify-center space-x-3 text-white font-bold text-lg transition-all shadow-lg hover:shadow-xl active:scale-[0.98] ${
              generationState.isLoading || !articleText.trim()
                ? 'bg-slate-300 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
            }`}
          >
            {generationState.isLoading ? (
              <>
                <Spinner className="w-6 h-6 text-white" />
                <span>
                  {generationState.step === 'analyzing' ? 'Analyzing Text...' : 'Generating Art...'}
                </span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <span>Generate Cover</span>
              </>
            )}
          </button>

          {generationState.error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{generationState.error}</span>
            </div>
          )}

        </div>

        {/* Right Column: Result */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px] flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800">Preview</h2>
              {result && (
                <button 
                  onClick={handleDownload}
                  className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center space-x-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download HD</span>
                </button>
              )}
            </div>
            
            <div className="flex-1 bg-slate-50 p-6 flex flex-col items-center justify-center">
              {result ? (
                <div className="w-full space-y-6 animate-fade-in">
                  <PreviewCard 
                    imageUrl={result.imageUrl} 
                    title={result.suggestedTitle}
                    summary={result.summary}
                  />
                  
                  <div className="bg-white p-4 rounded-xl border border-slate-200 max-w-sm mx-auto w-full">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Prompt Used</h3>
                    <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-100">
                      "{result.imagePrompt}"
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 opacity-50">
                  <div className="w-24 h-24 bg-slate-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-slate-500 font-medium">Your generated cover will appear here</p>
                  <p className="text-sm text-slate-400 mt-1">Ready to create something amazing?</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
