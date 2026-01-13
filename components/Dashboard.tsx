import React from 'react';
import { Search, Calculator, MessageSquare, ArrowRight } from 'lucide-react';
import { ViewState } from '../types';

interface DashboardProps {
  onChangeView: (view: ViewState) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onChangeView }) => {
  return (
    <div className="space-y-10">
      <div className="text-center space-y-4 py-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
          Australian Award Rates, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600">
            Simplified with AI
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-slate-600">
          Instantly identify the correct Modern Award, calculate complex pay rates including penalties and allowances, and stay compliant with Fair Work regulations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => onChangeView('matcher')}
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition cursor-pointer group"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
            <Search className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Find My Award</h3>
          <p className="text-slate-500 mb-4">Upload a job description or PDF to automatically match the correct Fair Work award and classification.</p>
          <div className="flex items-center text-blue-600 font-medium text-sm group-hover:translate-x-1 transition">
            <span>Start Matching</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </div>

        <div 
          onClick={() => onChangeView('calculator')}
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-emerald-300 transition cursor-pointer group"
        >
          <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
            <Calculator className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Pay Calculator</h3>
          <p className="text-slate-500 mb-4">Calculate weekly pay including overtime, casual loading, and weekend penalties accurately.</p>
          <div className="flex items-center text-emerald-600 font-medium text-sm group-hover:translate-x-1 transition">
            <span>Calculate Pay</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </div>

        <div 
          onClick={() => onChangeView('assistant')}
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-violet-300 transition cursor-pointer group"
        >
          <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
            <MessageSquare className="w-6 h-6 text-violet-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">AI Assistant</h3>
          <p className="text-slate-500 mb-4">Ask questions about specific clauses, leave entitlements, or break rules directly.</p>
          <div className="flex items-center text-violet-600 font-medium text-sm group-hover:translate-x-1 transition">
            <span>Ask a Question</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
