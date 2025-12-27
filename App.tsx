
import React, { useState, useEffect, useRef } from 'react';
import { DashboardTab, ChatMessage, MarketInsight } from './types';
import { getMarketInsights, analyzeData, streamAIChat } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>(DashboardTab.OVERVIEW);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Mock Data
  const stats = [
    { label: 'Total Revenue', value: '$128,430', change: '+12.5%', trend: 'up' },
    { label: 'Active Users', value: '14,392', change: '+18.2%', trend: 'up' },
    { label: 'Conversion Rate', value: '3.24%', change: '-0.4%', trend: 'down' },
    { label: 'Avg. Session', value: '4m 32s', change: '+2.1%', trend: 'up' },
  ];

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-zinc-900 border-r border-zinc-800 transition-all duration-300 flex flex-col`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">A</div>
          {isSidebarOpen && <span className="font-bold text-xl tracking-tight">Aura</span>}
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          <NavItem 
            icon="📊" 
            label="Overview" 
            active={activeTab === DashboardTab.OVERVIEW} 
            isOpen={isSidebarOpen}
            onClick={() => setActiveTab(DashboardTab.OVERVIEW)}
          />
          <NavItem 
            icon="📈" 
            label="Market Intel" 
            active={activeTab === DashboardTab.MARKET_INTEL} 
            isOpen={isSidebarOpen}
            onClick={() => setActiveTab(DashboardTab.MARKET_INTEL)}
          />
          <NavItem 
            icon="💬" 
            label="AI Assistant" 
            active={activeTab === DashboardTab.AI_CHAT} 
            isOpen={isSidebarOpen}
            onClick={() => setActiveTab(DashboardTab.AI_CHAT)}
          />
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            {isSidebarOpen ? '← Collapse' : '→'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1 capitalize">
              {activeTab.replace('_', ' ')}
            </h1>
            <p className="text-zinc-400">Welcome back, Administrator. Here's what's happening today.</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right hidden md:block">
                <div className="text-sm font-medium">Oct 24, 2024</div>
                <div className="text-xs text-zinc-500">System Status: Optimal</div>
             </div>
             <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
             </div>
          </div>
        </header>

        {activeTab === DashboardTab.OVERVIEW && <Overview stats={stats} />}
        {activeTab === DashboardTab.MARKET_INTEL && <MarketIntel />}
        {activeTab === DashboardTab.AI_CHAT && <AIChat />}
      </main>
    </div>
  );
};

const NavItem: React.FC<{ icon: string; label: string; active: boolean; isOpen: boolean; onClick: () => void }> = ({ icon, label, active, isOpen, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
      active ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
    }`}
  >
    <span className="text-xl">{icon}</span>
    {isOpen && <span className="font-medium">{label}</span>}
  </button>
);

const Overview: React.FC<{ stats: any[] }> = ({ stats }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleRunAnalysis = async () => {
    setLoading(true);
    const result = await analyzeData(stats);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-sm hover:border-zinc-700 transition-colors group">
            <p className="text-sm text-zinc-500 mb-1">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-bold">{stat.value}</h3>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {stat.change}
              </span>
            </div>
            <div className="mt-4 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div className={`h-full ${stat.trend === 'up' ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: '65%' }}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 h-80 flex flex-col justify-center items-center text-zinc-500">
          <p className="mb-4">Visualizing Trends (Interactive Chart Simulation)</p>
          <div className="flex items-end gap-2 h-32">
             {[40, 70, 45, 90, 65, 80, 50, 60, 85, 95, 40, 75].map((h, i) => (
               <div key={i} className="w-8 bg-indigo-500/20 hover:bg-indigo-500/40 transition-all rounded-t-sm" style={{ height: `${h}%` }}></div>
             ))}
          </div>
        </div>
        <div className="bg-gradient-to-br from-indigo-900/20 to-zinc-900 border border-indigo-500/20 rounded-2xl p-6 flex flex-col">
          <h4 className="text-lg font-semibold mb-2">Aura Deep Insights</h4>
          <p className="text-sm text-zinc-400 mb-4 flex-1">
            {analysis || "Our Gemini 3 Pro reasoning model can analyze your current dashboard performance and predict future trends."}
          </p>
          <button 
            disabled={loading}
            onClick={handleRunAnalysis}
            className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-zinc-800 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></span>
            ) : '✨ Generate Analysis'}
          </button>
        </div>
      </div>
    </div>
  );
};

const MarketIntel: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<{ text: string; sources: any[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const data = await getMarketInsights(query);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl">
        <h2 className="text-xl font-bold mb-4">Search Global Market Intelligence</h2>
        <form onSubmit={handleSearch} className="flex gap-4">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Current trends in semiconductor manufacturing..."
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
          <button 
            type="submit"
            disabled={loading}
            className="bg-zinc-100 text-zinc-950 font-bold px-8 rounded-2xl hover:bg-white disabled:bg-zinc-700 transition-all flex items-center justify-center min-w-[120px]"
          >
            {loading ? 'Searching...' : 'Explore'}
          </button>
        </form>
      </div>

      {result && (
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl leading-relaxed text-zinc-300">
            <h3 className="text-lg font-bold text-white mb-4">Market Analysis Result</h3>
            <div className="prose prose-invert max-w-none whitespace-pre-wrap">
              {result.text}
            </div>
          </div>
          
          {result.sources.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.sources.slice(0, 4).map((source, i) => (
                <a 
                  key={i} 
                  href={source.web?.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl hover:bg-zinc-800 transition-colors flex flex-col justify-between"
                >
                  <span className="text-sm font-medium text-indigo-400 mb-1 truncate">{source.web?.title || 'Source'}</span>
                  <span className="text-xs text-zinc-500 truncate">{source.web?.uri}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const modelMsg: ChatMessage = { role: 'model', content: '', timestamp: new Date() };
      setMessages(prev => [...prev, modelMsg]);

      const stream = await streamAIChat(input, messages);
      let fullText = '';
      
      for await (const chunk of stream) {
        fullText += chunk.text;
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1].content = fullText;
          return newMsgs;
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col max-w-4xl mx-auto bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden animate-in zoom-in-95 duration-500">
      <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4">
             <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center text-3xl">✨</div>
             <div>
               <h3 className="text-xl font-bold">I'm Aura, your AI strategist</h3>
               <p className="text-zinc-500">Ask me about market trends, data analysis, or dashboard features.</p>
             </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-5 py-3 rounded-2xl ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-tl-none'
            }`}>
              {m.content || (loading && i === messages.length - 1 ? 'Typing...' : '')}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-6 bg-zinc-950/50 border-t border-zinc-800">
        <form onSubmit={handleSend} className="flex gap-3">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold p-4 rounded-2xl transition-all disabled:opacity-50"
          >
            <span className="w-6 h-6 flex items-center justify-center">→</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;
