
import React, { useState } from 'react';
import { Search, Loader2, FileText, CheckCircle, AlertCircle, UploadCloud, Plus } from 'lucide-react';
import { matchAwardWithGemini, isApiConfigured, ingestAward } from '../services/geminiService';
import { AIAnalysisResult, Award } from '../types';

interface AwardMatcherProps {
  onSelectAward: (awardName: string, classification: string) => void;
  onAwardIngested: (award: Award) => void;
}

const AwardMatcher: React.FC<AwardMatcherProps> = ({ onSelectAward, onAwardIngested }) => {
  const [jobTitle, setJobTitle] = useState('');
  const [industry, setIndustry] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AIAnalysisResult | null>(null);
  const [error, setError] = useState('');
  
  const [analyzingFile, setAnalyzingFile] = useState(false);
  const [ingestedAward, setIngestedAward] = useState<Award | null>(null);

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isApiConfigured()) {
      setError("Gemini API Key is missing. Please check your environment variables.");
      return;
    }
    
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const data = await matchAwardWithGemini(jobTitle, description, industry);
      setResults(data);
    } catch (err) {
      setError("Failed to analyze job details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isApiConfigured()) {
        setError("API key missing. Cannot ingest award.");
        return;
    }

    setAnalyzingFile(true);
    setIngestedAward(null);
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const result = event.target?.result;
        let award: Award;

        if (file.type === 'application/pdf' && typeof result === 'string') {
            // Remove Data URL prefix for Base64
            const base64Data = result.split(',')[1];
            award = await ingestAward(base64Data, file.type);
        } else if (typeof result === 'string') {
            // Treat as text
            award = await ingestAward(result, 'text/plain');
        } else {
            throw new Error("Unsupported file type");
        }
        
        setIngestedAward(award);
      } catch (err) {
        console.error(err);
        setError("Error ingesting award rules. Ensure the file is readable.");
      } finally {
        setAnalyzingFile(false);
      }
    };

    if (file.type === 'application/pdf') {
        reader.readAsDataURL(file); // Read as Base64 for PDF
    } else {
        reader.readAsText(file); // Read as text for others
    }
  };

  const confirmIngestion = () => {
    if (ingestedAward) {
        onAwardIngested(ingestedAward);
        // Reset file input
        setIngestedAward(null);
        alert(`Successfully ingested rules for ${ingestedAward.name}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Search Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Search className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Find Your Award</h2>
            <p className="text-sm text-slate-500">AI-powered analysis of your role</p>
          </div>
        </div>

        <form onSubmit={handleMatch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="e.g. Retail Assistant"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Industry (Optional)</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="e.g. Retail"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Job Description / Duties</label>
            <textarea
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition h-24 resize-none"
              placeholder="Describe the daily tasks..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button
              type="submit"
              disabled={loading || !jobTitle}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Find Award</span>
                </>
              )}
            </button>
        </form>
      </div>

      {/* Ingest Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
           <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                    <UploadCloud className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Ingest New Award Rules</h2>
                    <p className="text-sm text-slate-500">Upload Pay Guide text to add new rules to the system</p>
                </div>
           </div>

           <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 bg-slate-50 hover:bg-slate-100 transition text-center">
                {analyzingFile ? (
                    <div className="flex flex-col items-center py-4">
                        <Loader2 className="animate-spin w-8 h-8 text-purple-600 mb-2" />
                        <span className="text-sm font-medium text-slate-600">Extracting Rules & Rates...</span>
                    </div>
                ) : (
                    <>
                        <input 
                            type="file" 
                            id="award-upload"
                            accept=".txt,.json,.md,.pdf"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <label htmlFor="award-upload" className="cursor-pointer flex flex-col items-center">
                            <FileText className="w-10 h-10 text-slate-400 mb-2" />
                            <span className="text-sm font-medium text-slate-700">Click to upload Pay Guide (PDF/Text)</span>
                            <span className="text-xs text-slate-500 mt-1">AI-powered parsing</span>
                        </label>
                    </>
                )}
           </div>

           {ingestedAward && (
               <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
                   <div className="flex justify-between items-start">
                       <div>
                           <h4 className="font-bold text-green-900 flex items-center gap-2">
                               <CheckCircle className="w-4 h-4" />
                               Extracted: {ingestedAward.name}
                           </h4>
                           <p className="text-xs text-green-700 mt-1">Code: {ingestedAward.code} | Classifications: {ingestedAward.classifications.length}</p>
                           <div className="mt-2 flex flex-wrap gap-2 text-xs text-green-800">
                                <span className="bg-green-100 px-2 py-1 rounded">Sat: x{ingestedAward.penaltyRates?.saturday}</span>
                                <span className="bg-green-100 px-2 py-1 rounded">Sun: x{ingestedAward.penaltyRates?.sunday}</span>
                                {ingestedAward.allowances && ingestedAward.allowances.length > 0 && (
                                   <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded border border-purple-200">
                                       {ingestedAward.allowances.length} Allowances
                                   </span>
                                )}
                           </div>
                       </div>
                       <button 
                         onClick={confirmIngestion}
                         className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 flex items-center gap-2 transition"
                       >
                           <Plus className="w-4 h-4" />
                           Add to Calculator
                       </button>
                   </div>
               </div>
           )}
      </div>

      {results && (
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-lg font-semibold text-slate-800 px-1">Top Matches</h3>
          {results.matches.map((match, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:border-blue-300 transition cursor-pointer relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                <FileText className="w-24 h-24 text-blue-600" />
              </div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded border border-blue-200">
                        {match.awardCode}
                    </span>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                        match.confidence > 80 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                        {match.confidence}% Match
                    </span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-1">{match.awardName}</h4>
                <p className="text-slate-600 text-sm mb-3">Suggested: <span className="font-semibold text-slate-800">{match.suggestedClassification}</span></p>
                <p className="text-slate-500 text-sm mb-4 leading-relaxed">{match.reasoning}</p>
                
                <button 
                    onClick={() => onSelectAward(match.awardCode, match.suggestedClassification)}
                    className="flex items-center space-x-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition"
                >
                    <CheckCircle className="w-4 h-4" />
                    <span>Use this Award</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center space-x-2 border border-red-100">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
            </div>
      )}
    </div>
  );
};

export default AwardMatcher;
