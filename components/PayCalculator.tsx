
import React, { useState, useEffect, useMemo } from 'react';
import { Calculator, DollarSign, RefreshCw, Download, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { STANDARD_PENALTIES } from '../constants';
import { Shift, PayBreakdown, Award, PenaltyRates } from '../types';

interface PayCalculatorProps {
  preselectedAwardCode?: string;
  availableAwards: Award[];
}

const PayCalculator: React.FC<PayCalculatorProps> = ({ preselectedAwardCode, availableAwards }) => {
  const [selectedAwardCode, setSelectedAwardCode] = useState(preselectedAwardCode || availableAwards[0]?.code);
  const [selectedClassId, setSelectedClassId] = useState(availableAwards[0]?.classifications[0]?.id);
  
  const [shifts, setShifts] = useState<Shift[]>(
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, idx) => ({
      id: `shift-${idx}`,
      day,
      hours: 0,
      isCasual: false,
      penaltyType: 'None',
      allowances: 0
    }))
  );

  const currentAward = useMemo(() => availableAwards.find(a => a.code === selectedAwardCode) || availableAwards[0], [selectedAwardCode, availableAwards]);
  
  const currentClass = useMemo(() => {
    if (!currentAward) return null;
    return currentAward.classifications.find(c => c.id === selectedClassId) || currentAward.classifications[0];
  }, [currentAward, selectedClassId]);

  // Use award specific penalties or fallback to standard
  const currentPenalties: PenaltyRates = useMemo(() => {
      return currentAward?.penaltyRates || STANDARD_PENALTIES;
  }, [currentAward]);

  const currentAllowances = useMemo(() => {
      return currentAward?.allowances || [];
  }, [currentAward]);

  useEffect(() => {
    if (preselectedAwardCode) {
        setSelectedAwardCode(preselectedAwardCode);
        const newAward = availableAwards.find(a => a.code === preselectedAwardCode);
        if (newAward) setSelectedClassId(newAward.classifications[0].id);
    }
  }, [preselectedAwardCode, availableAwards]);

  useEffect(() => {
    if(currentAward) {
        const cls = currentAward.classifications[0];
        if (cls) setSelectedClassId(cls.id);
    }
  }, [currentAward]);

  const updateShift = (index: number, field: keyof Shift, value: any) => {
    const newShifts = [...shifts];
    newShifts[index] = { ...newShifts[index], [field]: value };
    setShifts(newShifts);
  };

  const getPenaltyMultiplier = (type: Shift['penaltyType']) => {
      switch(type) {
          case 'Saturday': return currentPenalties.saturday;
          case 'Sunday': return currentPenalties.sunday;
          case 'PublicHoliday': return currentPenalties.publicHoliday;
          case 'Overtime': return currentPenalties.overtime;
          case 'NightShift': return currentPenalties.nightShift;
          default: return 1.0;
      }
  };

  const calculateBreakdown = (): PayBreakdown => {
    let basePay = 0;
    let penaltyPay = 0;
    let casualLoadingPay = 0;
    let allowances = 0;

    if (!currentClass) return { basePay:0, penaltyPay:0, casualLoadingPay:0, allowances:0, totalGross:0, superannuation:0 };

    shifts.forEach(shift => {
      const baseRate = currentClass.baseRate;
      const hours = shift.hours;
      const penaltyMultiplier = getPenaltyMultiplier(shift.penaltyType);
      
      // Basic Pay Portion
      basePay += hours * baseRate;

      // Penalty Portion (The amount *above* base rate)
      if (penaltyMultiplier > 1) {
        penaltyPay += (hours * baseRate * (penaltyMultiplier - 1));
      }

      // Casual Loading
      if (shift.isCasual) {
        casualLoadingPay += (hours * baseRate * currentClass.casualLoading);
      }

      allowances += shift.allowances;
    });

    const totalGross = basePay + penaltyPay + casualLoadingPay + allowances;
    const superannuation = totalGross * 0.115; // 11.5% super

    return { basePay, penaltyPay, casualLoadingPay, allowances, totalGross, superannuation };
  };

  const results = calculateBreakdown();

  const chartData = [
    { name: 'Base', value: results.basePay, color: '#3b82f6' },
    { name: 'Penalties', value: results.penaltyPay, color: '#ef4444' },
    { name: 'Casual', value: results.casualLoadingPay, color: '#f59e0b' },
    { name: 'Allowances', value: results.allowances, color: '#10b981' },
  ].filter(d => d.value > 0);

  if (!currentAward || !currentClass) return <div>No Awards Loaded. Please Ingest an Award first.</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Input Section */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Calculator className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Pay Calculator</h2>
              <p className="text-sm text-slate-500">Calculate weekly gross pay</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Award</label>
              <select 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                value={selectedAwardCode}
                onChange={(e) => setSelectedAwardCode(e.target.value)}
              >
                {availableAwards.map(award => (
                  <option key={award.code} value={award.code}>{award.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Classification</label>
              <select 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
              >
                {currentAward.classifications.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.title} (${cls.baseRate.toFixed(2)}/hr)</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Day</th>
                  <th className="px-4 py-3 w-24">Hours</th>
                  <th className="px-4 py-3 w-40">Penalty</th>
                  <th className="px-4 py-3 text-center">Casual?</th>
                  <th className="px-4 py-3 w-28">Allowances ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shifts.map((shift, idx) => {
                    const multi = getPenaltyMultiplier(shift.penaltyType);
                    return (
                  <tr key={shift.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-medium text-slate-700">{shift.day}</td>
                    <td className="px-4 py-3">
                      <input 
                        type="number" 
                        min="0" 
                        max="24"
                        className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={shift.hours}
                        onChange={(e) => updateShift(idx, 'hours', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={shift.penaltyType}
                        onChange={(e) => updateShift(idx, 'penaltyType', e.target.value)}
                      >
                         <option value="None">None (x1.0)</option>
                         <option value="Saturday">Saturday (x{currentPenalties.saturday})</option>
                         <option value="Sunday">Sunday (x{currentPenalties.sunday})</option>
                         <option value="PublicHoliday">Public Hol (x{currentPenalties.publicHoliday})</option>
                         <option value="Overtime">Overtime (x{currentPenalties.overtime})</option>
                         <option value="NightShift">Night Shift (x{currentPenalties.nightShift})</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input 
                        type="checkbox"
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
                        checked={shift.isCasual}
                        onChange={(e) => updateShift(idx, 'isCasual', e.target.checked)}
                      />
                    </td>
                    <td className="px-4 py-3">
                       <input 
                        type="number" 
                        min="0"
                        className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={shift.allowances}
                        onChange={(e) => updateShift(idx, 'allowances', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reference Allowances Panel */}
        {currentAllowances.length > 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm">
                <div className="flex items-center space-x-2 text-blue-800 font-semibold mb-2">
                    <Info className="w-4 h-4" />
                    <span>Reference Allowances for {currentAward.code}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentAllowances.map((allowance, idx) => (
                        <div key={idx} className="flex justify-between bg-white px-3 py-2 rounded border border-blue-100">
                            <span className="text-slate-700">{allowance.name}</span>
                            <span className="font-mono text-slate-900 font-medium">${allowance.amount.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-blue-600 mt-2">Enter these amounts in the "Allowances" column above where applicable.</p>
            </div>
        )}
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        <div className="bg-slate-900 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Total Estimated Gross</h3>
            <div className="flex items-baseline space-x-1">
              <span className="text-4xl font-bold tracking-tight">${results.totalGross.toFixed(2)}</span>
              <span className="text-slate-400">/week</span>
            </div>
            
            <div className="mt-6 space-y-3 pt-6 border-t border-slate-700">
               <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Superannuation (11.5%)</span>
                  <span className="font-medium">${results.superannuation.toFixed(2)}</span>
               </div>
               <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total Package</span>
                  <span className="font-medium text-emerald-400">${(results.totalGross + results.superannuation).toFixed(2)}</span>
               </div>
            </div>
          </div>
          <DollarSign className="absolute -bottom-4 -right-4 w-32 h-32 text-slate-800 opacity-50" />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4">Pay Breakdown</h3>
            <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" tick={{fontSize: 12}} width={70} />
                        <Tooltip 
                            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                            cursor={{fill: 'transparent'}}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
                {chartData.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start text-sm border-b border-slate-50 last:border-0 pb-1">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                            <span className="text-slate-600">{item.name}</span>
                        </div>
                        <span className="font-medium text-slate-900">${item.value.toFixed(2)}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default PayCalculator;
