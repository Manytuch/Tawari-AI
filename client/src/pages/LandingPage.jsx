import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const STATS = [
  { value: '< 30s', label: 'AI triage time' },
  { value: '16+',   label: 'hospitals mapped' },
  { value: '0',     label: 'police wait required' },
];

const FEATURES = [
  {
    icon: '⚡',
    title: 'Instant AI Triage',
    desc: 'Upload a photo or describe the incident. Claude analyses severity in under 30 seconds and tells bystanders exactly what to do.',
  },
  {
    icon: '📄',
    title: 'Parallel Police Report',
    desc: 'Medical response starts immediately. The police document is auto-generated and sent to the station in the background — zero delay.',
  },
  {
    icon: '🗺️',
    title: 'Nearest Hospital Routing',
    desc: 'Real-time map showing the closest facility with emergency capacity, with driving directions from the incident location.',
  },
  {
    icon: '🩺',
    title: 'Bystander First Aid',
    desc: 'Step-by-step first aid instructions tailored to the injury type and available resources — written for non-medical bystanders.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [tick, setTick] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setTick(v => !v), 800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-rescue-dark font-body overflow-x-hidden">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-rescue-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-rescue-red rounded-sm flex items-center justify-center">
            <span className="text-white font-display font-bold text-sm">TW</span>
          </div>
          <span className="font-display font-bold text-white text-lg tracking-tight">TawariAI</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-rescue-muted">
          <span className={`w-2 h-2 rounded-full bg-green-500 ${tick ? 'opacity-100' : 'opacity-40'} transition-opacity`} />
          SYSTEM ONLINE
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 md:px-12 pt-20 pb-24 overflow-hidden">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
              backgroundImage: 'linear-gradient(var(--theme-primary) 1px, transparent 1px), linear-gradient(90deg, var(--theme-primary) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
        />

        {/* Red accent blob */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-rescue-red opacity-5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl">
          <div className="flex items-center gap-3 mb-8 animate-fade-up stagger-1">
            <span className="px-3 py-1 bg-rescue-red/10 border border-rescue-red/30 text-rescue-red text-xs font-mono rounded-full tracking-widest uppercase">
              South Sudan Emergency System
            </span>
          </div>

          <h1 className="font-display font-extrabold text-5xl md:text-7xl leading-none text-white mb-6 animate-fade-up stagger-2">
            Seconds matter.<br />
            <span className="text-rescue-red">Don't wait</span><br />
            for paperwork.
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-xl mb-10 leading-relaxed animate-fade-up stagger-3">
            TawariAI dispatches emergency medical help immediately — 
            generating the police report in parallel, not as a prerequisite.
            Powered by Claude AI.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-fade-up stagger-4">
            <button
              onClick={() => navigate('/report')}
              className="px-8 py-4 bg-rescue-red text-white font-display font-bold text-lg rounded-lg hover:bg-red-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-red-900/30"
            >
              🚨 Report Emergency
            </button>
            <a
              href="#how-it-works"
              className="px-8 py-4 border border-rescue-border text-gray-300 font-display font-semibold text-lg rounded-lg hover:border-gray-500 hover:text-white transition-all duration-200 text-center"
            >
              See how it works →
            </a>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative mt-16 grid grid-cols-3 gap-0 border border-rescue-border rounded-xl overflow-hidden max-w-xl animate-fade-up stagger-5">
          {STATS.map((s, i) => (
            <div key={i} className={`px-6 py-5 bg-rescue-panel ${i < 2 ? 'border-r border-rescue-border' : ''}`}>
              <div className="font-display font-bold text-2xl text-rescue-red">{s.value}</div>
              <div className="text-xs text-rescue-muted mt-1 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-6 md:px-12 py-20 border-t border-rescue-border">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <p className="text-rescue-red font-mono text-xs tracking-widest uppercase mb-3">The problem we solve</p>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white">
              In South Sudan, emergency victims need a<br className="hidden md:block" />
              <span className="text-rescue-red"> police document before receiving care.</span>
            </h2>
            <p className="mt-4 text-gray-400 max-w-2xl">
              This bottleneck has cost countless lives. TawariAI eliminates the wait by treating documentation as a parallel process — not a gate.
            </p>
          </div>

          {/* Features grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="p-6 bg-rescue-panel border border-rescue-border rounded-xl hover:border-rescue-red/40 transition-colors duration-300 group"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-display font-bold text-white text-lg mb-2 group-hover:text-rescue-red transition-colors">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="mx-6 md:mx-12 mb-16 p-8 md:p-12 bg-rescue-red rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="font-display font-extrabold text-white text-2xl md:text-3xl">
            An emergency is happening now.
          </h2>
          <p className="text-red-200 mt-1 text-sm">Use TawariAI to report it and get immediate AI guidance.</p>
        </div>
        <button
          onClick={() => navigate('/report')}
          className="flex-shrink-0 px-8 py-4 bg-white text-rescue-red font-display font-bold text-lg rounded-lg hover:bg-red-50 transition-all duration-200 hover:scale-105 active:scale-95 whitespace-nowrap"
        >
          Report Emergency →
        </button>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-8 border-t border-rescue-border text-rescue-muted text-xs font-mono flex flex-col md:flex-row justify-between gap-2">
        <span>TawariAI — AI for Future: African Youth Innovation 2026</span>
        <span>Built for South Sudan 🇸🇸 · Powered by Claude AI</span>
      </footer>
    </div>
  );
}
