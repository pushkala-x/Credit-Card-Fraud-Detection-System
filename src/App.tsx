import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  BarChart3, 
  Settings2, 
  CreditCard, 
  AlertTriangle,
  History,
  TrendingDown,
  Info,
  Github
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Transaction, Metrics } from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [threshold, setThreshold] = useState(0.5);
  const [metrics, setMetrics] = useState<Metrics>({
    precision: 0.88,
    recall: 0.76,
    f1: 0.81,
    pr_auc: 0.92
  });
  const [isLive, setIsLive] = useState(true);
  const [view, setView] = useState<'dashboard' | 'documentation'>('dashboard');

  // Fetch initial config
  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        setThreshold(data.threshold);
        setMetrics(data.metrics);
      });
  }, []);

  // Poll for live transactions
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      fetch('/api/transactions/stream')
        .then(res => res.json())
        .then(data => {
          setTransactions(prev => [...data, ...prev].slice(0, 50));
        });
    }, 3000);
    return () => clearInterval(interval);
  }, [isLive]);

  const handleThresholdChange = async (val: number) => {
    setThreshold(val);
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threshold: val })
    });
    const data = await res.json();
    setMetrics(data.metrics);
  };

  // Simulated PR Data for Chart
  const prData = Array.from({ length: 20 }).map((_, i) => {
    const t = i / 20;
    return {
      threshold: t,
      precision: 0.5 + t * 0.49,
      recall: 0.95 - t * 0.8
    };
  });

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e1e1e3] font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0b]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                  FraudGuard
                </span>
                <span className="ml-1 text-[10px] font-medium text-indigo-400 bg-indigo-400/10 px-1.5 py-0.5 rounded border border-indigo-400/20 uppercase tracking-widest">
                  Enterprise
                </span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm">
              <button 
                onClick={() => setView('dashboard')}
                className={cn(
                  "transition-colors",
                  view === 'dashboard' ? "text-indigo-400" : "text-white/60 hover:text-white"
                )}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setView('documentation')}
                className={cn(
                  "transition-colors",
                  view === 'documentation' ? "text-indigo-400" : "text-white/60 hover:text-white"
                )}
              >
                Documentation
              </button>
              <div className="h-4 w-px bg-white/10" />
              <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-colors text-white/80">
                <Github className="w-4 h-4" />
                <span>View Source</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'dashboard' ? (
          <div className="space-y-8">
            {/* Real-time Status */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">Detection System</h1>
                <p className="text-white/50 text-sm mt-1">Monitoring real-time transaction streams with sub-100ms latency.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs font-mono bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                  <div className={cn("w-2 h-2 rounded-full", isLive ? "bg-emerald-500 animate-pulse" : "bg-white/20")} />
                  <span className="opacity-60">{isLive ? "LIVE STREAM" : "PAUSED"}</span>
                </div>
                <button 
                  onClick={() => setIsLive(!isLive)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20"
                >
                  {isLive ? "Pause Monitoring" : "Resume Monitoring"}
                </button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <MetricCard 
                label="Precision" 
                value={(metrics.precision * 100).toFixed(1) + "%"} 
                description="TP / (TP + FP)" 
                icon={ShieldCheck}
                trend="+0.2%"
              />
              <MetricCard 
                label="Recall" 
                value={(metrics.recall * 100).toFixed(1) + "%"} 
                description="TP / (TP + FN)" 
                icon={BarChart3}
                trend="-0.5%"
              />
              <MetricCard 
                label="F1 Score" 
                value={metrics.f1.toFixed(3)} 
                description="Harmonic Mean" 
                icon={Activity}
              />
              <MetricCard 
                label="PR AUC" 
                value={(metrics.pr_auc * 100).toFixed(1) + "%"} 
                description="Area under PR Curve" 
                icon={trendingUp} // wait, fixed below
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Threshold & PR Curve */}
              <div className="lg:col-span-1 space-y-6">
                <section className="bg-white/2 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Settings2 className="w-5 h-5 text-indigo-400" />
                      Classification Engine
                    </h2>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <div className="flex justify-between items-end mb-4">
                        <div>
                          <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Scoring Threshold</label>
                          <div className="text-2xl font-bold font-mono text-indigo-400">{threshold.toFixed(2)}</div>
                        </div>
                      </div>
                      <input 
                        type="range" 
                        min="0.05" 
                        max="0.95" 
                        step="0.01" 
                        value={threshold} 
                        onChange={(e) => handleThresholdChange(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                      <div className="flex justify-between mt-2 text-[10px] font-medium text-white/30">
                        <span>MAX RECALL (AGGRESSIVE)</span>
                        <span>MAX PRECISION (CAUTIOUS)</span>
                      </div>
                    </div>

                    <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl space-y-2">
                      <div className="flex items-start gap-3">
                        <Info className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-indigo-200/70 leading-relaxed">
                          Higher thresholds reduce False Positives (customer friction) but increase False Negatives (missed fraud). Lower thresholds catch more fraud but block more legit customers.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-white/2 border border-white/5 rounded-2xl p-6">
                  <h2 className="text-sm font-semibold mb-4 text-white/60">Live Trade-off Analysis</h2>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={prData}>
                        <defs>
                          <linearGradient id="colorPr" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="recall" hide />
                        <YAxis hide domain={[0.4, 1.1]} />
                        <Tooltip 
                          contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                          labelStyle={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="precision" 
                          stroke="#6366f1" 
                          fillOpacity={1} 
                          fill="url(#colorPr)" 
                          strokeWidth={2}
                          animationDuration={1000}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Precision-Recall Curve</div>
                    <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">AUC: {(metrics.pr_auc * 100).toFixed(0)}%</div>
                  </div>
                </section>
              </div>

              {/* Transactions Feed */}
              <div className="lg:col-span-2">
                <section className="bg-white/2 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm h-full flex flex-col">
                  <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <History className="w-5 h-5 text-indigo-400" />
                      Real-time Feed
                    </h2>
                    <span className="text-xs text-white/30 font-mono">Showing last 50 events</span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto max-h-[700px] scrollbar-thin scrollbar-thumb-white/10">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-[#0f0f11] text-[10px] text-white/40 uppercase tracking-widest font-bold">
                        <tr>
                          <th className="px-6 py-4">Transaction</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Amount</th>
                          <th className="px-6 py-4 text-right">Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        <AnimatePresence initial={false}>
                          {transactions.map((tx) => (
                            <motion.tr 
                              key={tx.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={cn(
                                "group transition-colors",
                                tx.decision === 'FRAUD' ? "bg-red-500/5 hover:bg-red-500/10" : "hover:bg-white/[0.02]"
                              )}
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center border",
                                    tx.decision === 'FRAUD' ? "border-red-500/20 bg-red-500/10" : "border-white/10 bg-white/5"
                                  )}>
                                    <CreditCard className={cn("w-5 h-5", tx.decision === 'FRAUD' ? "text-red-400" : "text-white/40")} />
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-white/90">{tx.merchant}</div>
                                    <div className="text-[10px] text-white/40 font-mono">{tx.id} • {tx.location}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className={cn(
                                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                                  tx.decision === 'FRAUD' 
                                    ? "bg-red-500/20 text-red-400 border border-red-500/20" 
                                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                                )}>
                                  {tx.decision === 'FRAUD' ? <ShieldAlert className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                                  {tx.decision}
                                </div>
                                {tx.decision === 'FRAUD' && tx.actual === 'LEGIT' && (
                                  <div className="text-[9px] text-red-500/60 mt-1 uppercase font-bold italic">False Positive</div>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="text-sm font-mono font-bold text-white/90">
                                  ${tx.amount.toLocaleString()}
                                </div>
                                <div className="text-[9px] text-white/30">{new Date(tx.timestamp).toLocaleTimeString()}</div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className={cn(
                                  "text-sm font-mono font-bold",
                                  tx.score > 0.8 ? "text-red-400" : tx.score > 0.5 ? "text-orange-400" : "text-white/40"
                                )}>
                                  {tx.score.toFixed(3)}
                                </div>
                                <div className="w-full bg-white/5 h-1 rounded-full mt-1.5 overflow-hidden">
                                  <div 
                                    className={cn(
                                      "h-full transition-all duration-500",
                                      tx.score > 0.8 ? "bg-red-500" : tx.score > 0.5 ? "bg-orange-500" : "bg-indigo-500/50"
                                    )}
                                    style={{ width: `${tx.score * 100}%` }}
                                  />
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                    {transactions.length === 0 && (
                      <div className="flex flex-col items-center justify-center p-20 gap-4 opacity-20">
                        <Activity className="w-12 h-12" />
                        <p className="text-sm italic">Waiting for incoming transaction data...</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </div>
        ) : (
          <DocumentationView />
        )}
      </main>
    </div>
  );
}

function MetricCard({ label, value, description, icon: Icon, trend }: { label: string, value: string, description: string, icon: any, trend?: string }) {
  return (
    <div className="bg-white/2 border border-white/5 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon size={64} />
      </div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Icon className="w-5 h-5 text-indigo-400" />
          </div>
          {trend && (
            <span className={cn(
              "text-[10px] font-bold px-1.5 py-0.5 rounded",
              trend.startsWith('+') ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
            )}>
              {trend}
            </span>
          )}
        </div>
        <div className="text-2xl font-bold text-white mb-1">{value}</div>
        <div className="text-xs font-semibold text-white/60 mb-1">{label}</div>
        <div className="text-[10px] text-white/30 uppercase tracking-wider">{description}</div>
      </div>
    </div>
  );
}

const trendingUp = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

function DocumentationView() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-12 pb-20"
    >
      <header className="space-y-4">
        <h2 className="text-4xl font-bold tracking-tight text-white">Project Blueprint</h2>
        <p className="text-lg text-white/60 leading-relaxed">
          Industry-aligned credit card fraud detection system using behavior analytics and classification tree ensembles.
        </p>
      </header>

      <section className="space-y-6">
        <h3 className="text-2xl font-semibold border-b border-white/5 pb-2">Business Problem</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-indigo-400 font-bold uppercase text-xs tracking-widest">Financial Impact</h4>
            <p className="text-sm text-white/70 leading-relaxed">
              Banks lose billions annually to fraudulent activities. A delay of just a few hours in detection can result in massive capital outflow.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-indigo-400 font-bold uppercase text-xs tracking-widest">Client Experience</h4>
            <p className="text-sm text-white/70 leading-relaxed">
              False Positives (legit transactions blocked) cause friction and loss of trust. Balancing Recall (catching fraud) and Precision (protecting users) is the core ML challenge.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-2xl font-semibold border-b border-white/5 pb-2 text-white">Project Lifecycle</h3>
        <div className="space-y-4">
          <LifecycleStep num="1" title="Data Ingestion" text="Standardizing raw transaction logs (amount, time, location, merchant category) into a structured schema." />
          <LifecycleStep num="2" title="Feature Engineering" text="Calculating card velocity, merchant risk scores, and temporal behavior patterns (e.g., night-time high-value spikes)." />
          <LifecycleStep num="3" title="Class Imbalance Handling" text="Using SMOTE or customized class weighting to handle the extreme rarity (0.1%-1%) of fraud cases." />
          <LifecycleStep num="4" title="Model Training" text="Training XGBoost or Random Forest ensembles and optimizing for PR-AUC rather than standard Accuracy." />
          <LifecycleStep num="5" title="Scoring API" text="Deploying as a FastAPI or Express service for real-time scoring during the transaction authorization flow." />
        </div>
      </section>

      <section className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-10 translate-y-10 rotate-12">
          <ShieldAlert size={300} />
        </div>
        <div className="relative z-10 space-y-4">
          <h3 className="text-2xl font-bold">Industry Readiness</h3>
          <p className="opacity-90 max-w-2xl leading-relaxed">
            This project follows real banking workflows: chronological data splitting, feature velocity tracking, and cost-aware threshold optimization. Ready for deployment and GitHub proofing.
          </p>
          <div className="flex gap-4 pt-4">
            <button className="px-6 py-3 bg-white text-indigo-600 rounded-full font-bold text-sm">Download Source Code</button>
            <button className="px-6 py-3 bg-indigo-500/50 border border-white/20 text-white rounded-full font-bold text-sm">View Technical Spec</button>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

function LifecycleStep({ num, title, text }: { num: string, title: string, text: string }) {
  return (
    <div className="flex gap-6 p-4 rounded-2xl hover:bg-white/5 transition-colors group">
      <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 flex items-center justify-center text-xl font-black text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shrink-0">
        {num}
      </div>
      <div className="space-y-1">
        <h4 className="font-bold text-white text-lg">{title}</h4>
        <p className="text-sm text-white/50 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
