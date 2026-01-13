
import React, { useState } from 'react';
import { LayoutGrid, Search, Calculator, MessageSquare, Menu, X, Settings, Database } from 'lucide-react';
import Dashboard from './components/Dashboard';
import AwardMatcher from './components/AwardMatcher';
import PayCalculator from './components/PayCalculator';
import Assistant from './components/Assistant';
import DocumentLibrary from './components/DocumentLibrary';
import { ViewState, Award } from './types';
import { MOCK_AWARDS } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [preselectedAward, setPreselectedAward] = useState<string | undefined>(undefined);
  
  // State to hold all available awards (Mock + Ingested)
  const [availableAwards, setAvailableAwards] = useState<Award[]>(MOCK_AWARDS);

  const navigateTo = (view: ViewState) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  const handleAwardSelection = (awardCode: string, _classification: string) => {
    setPreselectedAward(awardCode);
    navigateTo('calculator');
  };

  const handleAwardIngested = (newAward: Award) => {
    // Check if award already exists to avoid dupes
    setAvailableAwards(prev => {
        const exists = prev.find(a => a.code === newAward.code);
        if (exists) return prev.map(a => a.code === newAward.code ? newAward : a); // Update existing
        return [...prev, newAward];
    });
    // Optional: Auto-navigate to calculator with new award
    // setPreselectedAward(newAward.code);
    alert(`${newAward.name} successfully ingested into Knowledge Base!`);
  };

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState, icon: any, label: string }) => (
    <button
      onClick={() => navigateTo(view)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors w-full md:w-auto
        ${currentView === view 
          ? 'bg-slate-800 text-white' 
          : 'text-slate-600 hover:bg-slate-100'}`}
    >
      <Icon className="w-4 h-4" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigateTo('dashboard')}>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">FairPay AI</span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-2">
              <NavItem view="dashboard" icon={LayoutGrid} label="Dashboard" />
              <NavItem view="matcher" icon={Search} label="Find Award" />
              <NavItem view="library" icon={Database} label="Library" />
              <NavItem view="calculator" icon={Calculator} label="Calculator" />
              <NavItem view="assistant" icon={MessageSquare} label="Assistant" />
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-2 space-y-1">
            <NavItem view="dashboard" icon={LayoutGrid} label="Dashboard" />
            <NavItem view="matcher" icon={Search} label="Find Award" />
            <NavItem view="library" icon={Database} label="Library" />
            <NavItem view="calculator" icon={Calculator} label="Calculator" />
            <NavItem view="assistant" icon={MessageSquare} label="Assistant" />
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentView === 'dashboard' && <Dashboard onChangeView={navigateTo} />}
          {currentView === 'matcher' && 
            <AwardMatcher 
                onSelectAward={handleAwardSelection} 
                onAwardIngested={handleAwardIngested}
            />}
          {currentView === 'library' && 
            <DocumentLibrary 
                onAwardIngested={handleAwardIngested} 
                existingAwards={availableAwards}
            />}
          {currentView === 'calculator' && 
            <PayCalculator 
                preselectedAwardCode={preselectedAward} 
                availableAwards={availableAwards} 
            />}
          {currentView === 'assistant' && <Assistant availableAwards={availableAwards} />}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p>© 2024 FairPay AI. Not legal advice.</p>
          <div className="flex items-center space-x-4 mt-2 md:mt-0">
             <span className="flex items-center space-x-1">
                <Settings className="w-4 h-4" />
                <span>v1.0.0</span>
             </span>
             <a href="#" className="hover:text-blue-600">Privacy</a>
             <a href="#" className="hover:text-blue-600">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
