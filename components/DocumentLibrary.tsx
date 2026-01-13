
import React, { useState } from 'react';
import { FileText, Download, Database, CheckCircle, Loader2, ExternalLink, Search, UploadCloud, AlertCircle, Filter } from 'lucide-react';
import { POPULAR_AWARDS_METADATA } from '../constants';
import { ingestAward, isApiConfigured, findOfficialDocuments } from '../services/geminiService';
import { Award, AwardDocument } from '../types';

interface DocumentLibraryProps {
  onAwardIngested: (award: Award) => void;
  existingAwards: Award[];
}

const DocumentLibrary: React.FC<DocumentLibraryProps> = ({ onAwardIngested, existingAwards }) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'search'>('browse');
  
  // Browse Filter State
  const [browseFilter, setBrowseFilter] = useState('');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<AwardDocument[]>([]);
  const [searchError, setSearchError] = useState('');
  
  // Link Finding State for Popular Awards
  const [findingLinkFor, setFindingLinkFor] = useState<string | null>(null);
  const [foundLinks, setFoundLinks] = useState<Record<string, string>>({});

  // Ingestion State
  const [analyzingFile, setAnalyzingFile] = useState(false);
  const [ingestionStatus, setIngestionStatus] = useState<{success: boolean, message: string} | null>(null);

  const isAlreadyIngested = (code?: string) => {
    if (!code) return false;
    return existingAwards.some(a => a.code === code);
  };

  const filteredAwards = POPULAR_AWARDS_METADATA.filter(doc => 
    doc.title.toLowerCase().includes(browseFilter.toLowerCase()) || 
    doc.awardCode?.toLowerCase().includes(browseFilter.toLowerCase()) ||
    doc.industry?.toLowerCase().includes(browseFilter.toLowerCase())
  );

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    if (!isApiConfigured()) {
        setSearchError("API Key is missing. Cannot perform live search.");
        return;
    }

    setIsSearching(true);
    setSearchError('');
    setSearchResults([]);

    try {
        const results = await findOfficialDocuments(searchQuery);
        setSearchResults(results);
        if (results.length === 0) {
            setSearchError("No relevant documents found. Try a different search term.");
        }
    } catch (err) {
        setSearchError("Failed to perform search. Please try again.");
    } finally {
        setIsSearching(false);
    }
  };

  const findLinkForPopularAward = async (award: AwardDocument) => {
      if (!award.awardCode) return;
      if (!isApiConfigured()) {
          alert("API Key is missing.");
          return;
      }
      
      setFindingLinkFor(award.awardCode);
      try {
          const query = `${award.title} ${award.awardCode} Pay Guide PDF`;
          const results = await findOfficialDocuments(query);
          if (results.length > 0 && results[0].url) {
              setFoundLinks(prev => ({ ...prev, [award.awardCode!]: results[0].url! }));
          } else {
              alert("Could not automatically find a link. Please try the Live Search.");
          }
      } catch (err) {
          console.error(err);
      } finally {
          setFindingLinkFor(null);
      }
  };

  const handleFileIngest = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!isApiConfigured()) {
        alert("API Key is missing. Cannot process document.");
        return;
    }

    setAnalyzingFile(true);
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
        
        onAwardIngested(award);
        setIngestionStatus({ success: true, message: `Successfully analyzed and ingested ${award.name} from file.` });
      } catch (err) {
        console.error(err);
        setIngestionStatus({ success: false, message: "Error ingesting award rules. Ensure the file is a readable Pay Guide (PDF/Text)." });
      } finally {
        setAnalyzingFile(false);
        // Clear the input value to allow re-uploading the same file if needed
        e.target.value = '';
      }
    };

    if (file.type === 'application/pdf') {
        reader.readAsDataURL(file); // Read as Base64 for PDF
    } else {
        reader.readAsText(file); // Read as text for others
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
                <Database className="w-6 h-6 text-orange-600" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-900">Document Library</h2>
                <p className="text-sm text-slate-500">Official Fair Work Pay Guides & Sources</p>
            </div>
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                    onClick={() => setActiveTab('browse')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition ${activeTab === 'browse' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    All Awards
                </button>
                <button 
                    onClick={() => setActiveTab('search')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition ${activeTab === 'search' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Live Search
                </button>
            </div>
        </div>

        {ingestionStatus && (
            <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${ingestionStatus.success ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                {ingestionStatus.success ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <span>{ingestionStatus.message}</span>
            </div>
        )}

        {/* Upload Zone (Always Visible for convenience) */}
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 bg-slate-50 hover:bg-slate-100 transition text-center mb-8">
            {analyzingFile ? (
                <div className="flex flex-col items-center py-4">
                    <Loader2 className="animate-spin w-8 h-8 text-orange-600 mb-2" />
                    <span className="text-sm font-medium text-slate-600">Analyzing Document & Extracting Rules (AI)...</span>
                </div>
            ) : (
                <>
                    <input 
                        type="file" 
                        id="library-upload"
                        accept=".txt,.json,.md,.pdf"
                        onChange={handleFileIngest}
                        className="hidden"
                    />
                    <label htmlFor="library-upload" className="cursor-pointer flex flex-col items-center">
                        <UploadCloud className="w-12 h-12 text-slate-400 mb-3" />
                        <span className="text-lg font-bold text-slate-700">Drop your downloaded Pay Guide PDF here</span>
                        <span className="text-sm text-slate-500 mt-1">to extract rules directly into the calculator</span>
                    </label>
                </>
            )}
        </div>

        {/* Popular Awards View */}
        {activeTab === 'browse' && (
             <div className="space-y-4 animate-fade-in">
                 {/* Filter Bar */}
                 <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Filter className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition"
                        placeholder="Filter by Award Name, Code (e.g. MA000004) or Industry"
                        value={browseFilter}
                        onChange={(e) => setBrowseFilter(e.target.value)}
                    />
                 </div>

                 <div className="grid gap-4 max-h-[600px] overflow-y-auto pr-1">
                    {filteredAwards.length === 0 && (
                        <div className="text-center py-8 text-slate-500">
                            No awards match your filter.
                        </div>
                    )}
                    {filteredAwards.map((doc) => {
                        const ingested = isAlreadyIngested(doc.awardCode);
                        const isFinding = findingLinkFor === doc.awardCode;
                        const foundLink = doc.awardCode ? foundLinks[doc.awardCode] : null;

                        return (
                        <div key={doc.awardCode} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-orange-300 transition bg-slate-50">
                            <div className="flex items-start space-x-4 mb-4 md:mb-0">
                            <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                                <FileText className="w-8 h-8 text-slate-500" />
                            </div>
                            <div>
                                <div className="flex items-center space-x-2">
                                    <h3 className="font-bold text-slate-900">{doc.title}</h3>
                                    <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-mono">{doc.awardCode}</span>
                                </div>
                                <p className="text-sm text-slate-500 mt-1">{doc.description}</p>
                                <span className="inline-block mt-1 text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                                    {doc.industry}
                                </span>
                            </div>
                            </div>

                            <div className="flex items-center space-x-3 pl-0 md:pl-4 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 mt-4 md:mt-0">
                            {ingested ? (
                                <div className="flex items-center text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    <span className="font-medium text-sm">Ingested</span>
                                </div>
                            ) : (
                                <>
                                    {foundLink ? (
                                        <a 
                                            href={foundLink} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition"
                                        >
                                            <Download className="w-4 h-4" />
                                            <span>Download PDF</span>
                                        </a>
                                    ) : (
                                        <button
                                            onClick={() => findLinkForPopularAward(doc)}
                                            disabled={isFinding}
                                            className="flex items-center space-x-2 bg-white hover:bg-slate-50 text-blue-600 border border-blue-200 px-4 py-2 rounded-lg font-medium text-sm transition disabled:opacity-50 min-w-[120px] justify-center"
                                        >
                                            {isFinding ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    <span>Finding...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Search className="w-4 h-4" />
                                                    <span>Find Link</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </>
                            )}
                            </div>
                        </div>
                        );
                    })}
                </div>
            </div>
        )}

        {/* Live Search View */}
        {activeTab === 'search' && (
            <div className="space-y-6 animate-fade-in">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        placeholder="Search for an award (e.g. 'Hair and Beauty Pay Guide 2024')"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button 
                        type="submit" 
                        disabled={isSearching || !searchQuery}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-6 rounded-lg font-medium transition disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSearching ? <Loader2 className="animate-spin w-5 h-5" /> : <Search className="w-5 h-5" />}
                        Search
                    </button>
                </form>

                {searchError && (
                    <div className="text-red-600 text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {searchError}
                    </div>
                )}

                <div className="space-y-4">
                    {searchResults.map((doc, idx) => (
                        <div key={idx} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border border-slate-200 rounded-lg hover:border-orange-300 transition bg-slate-50">
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-900">{doc.title}</h3>
                                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center mt-1 break-all">
                                    {doc.url} <ExternalLink className="w-3 h-3 ml-1" />
                                </a>
                            </div>
                            <div className="mt-4 md:mt-0 md:ml-4 flex items-center gap-3">
                                {doc.url && (
                                    <a 
                                        href={doc.url} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="flex items-center space-x-2 bg-white text-slate-700 border border-slate-300 px-3 py-2 rounded-lg font-medium text-sm hover:bg-slate-50 transition"
                                    >
                                        <Download className="w-4 h-4" />
                                        <span>Download PDF</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default DocumentLibrary;
