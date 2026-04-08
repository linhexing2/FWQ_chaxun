/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Server, Users, Globe, ShieldCheck, ShieldAlert, Copy, Check, Info, Github, History, Star, Trash2 } from 'lucide-react';

interface ServerStatus {
  online: boolean;
  ip: string;
  port: number;
  hostname?: string;
  version?: string;
  players?: {
    online: number;
    max: number;
    list?: string[];
  };
  motd?: {
    clean: string[];
    html: string[];
  };
  icon?: string;
  map?: string;
  gamemode?: string;
  software?: string;
  latency?: number;
}

export default function App() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBedrock, setIsBedrock] = useState(false);
  const [copied, setCopied] = useState(false);
  const [repoInfo, setRepoInfo] = useState<{ stars: number; forks: number } | null>(null);
  const [history, setHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('mc-search-history');
    return saved ? JSON.parse(saved) : [];
  });
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('mc-favorites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('mc-search-history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('mc-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addToHistory = (addr: string) => {
    setHistory(prev => {
      const filtered = prev.filter(item => item !== addr);
      return [addr, ...filtered].slice(0, 5);
    });
  };

  const toggleFavorite = (addr: string) => {
    setFavorites(prev => {
      if (prev.includes(addr)) {
        return prev.filter(item => item !== addr);
      }
      return [addr, ...prev];
    });
  };

  const clearHistory = () => setHistory([]);

  useEffect(() => {
    fetch('https://api.github.com/repos/linhexing2/FWQ_chaxun')
      .then(res => res.json())
      .then(data => {
        if (data.stargazers_count !== undefined) {
          setRepoInfo({
            stars: data.stargazers_count,
            forks: data.forks_count
          });
        }
      })
      .catch(err => console.error("GitHub API error:", err));
  }, []);

  const fetchStatus = useCallback(async (isPolling = false) => {
    if (!address.trim()) return;
    
    if (!isPolling) {
      setLoading(true);
      setError(null);
      setStatus(null);
    }

    const startTime = Date.now();
    try {
      const type = isBedrock ? 'bedrock' : 'java';
      // 直接调用 mcstatus.io 的 API，因为它支持跨域 (CORS)
      const apiUrl = `https://api.mcstatus.io/v2/status/${type}/${encodeURIComponent(address.trim())}`;
      
      const response = await fetch(apiUrl, { cache: 'no-store' });
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const msData = await response.json();

      if (msData.online) {
        if (!isPolling) {
          addToHistory(address.trim());
        }
        // 将数据格式化为我们组件需要的结构
        setStatus({
          online: true,
          ip: msData.host,
          port: msData.port,
          version: msData.version?.name_clean || msData.version?.name,
          players: {
            online: msData.players.online,
            max: msData.players.max,
            list: msData.players.list?.map((p: any) => p.name_clean)
          },
          motd: {
            clean: msData.motd?.clean?.split('\n') || []
          },
          icon: msData.icon,
          latency: latency
        });
      } else if (!isPolling) {
        setError('服务器当前处于离线状态或地址错误。');
      }
    } catch (err) {
      if (!isPolling) {
        setError('查询失败，请检查网络连接或稍后再试。');
      }
    } finally {
      if (!isPolling) {
        setLoading(false);
      }
    }
  }, [address, isBedrock]);

  // Real-time latency update polling
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    // Only start polling if we have a status and it's online
    if (status?.online) {
      interval = setInterval(() => {
        fetchStatus(true);
      }, 1000); // Poll every 1 second
    }

    return () => {
      if (interval) clearInterval(interval);
    };
    // We only want to restart the interval if the online status changes or the address/type changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status?.online, fetchStatus]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] text-slate-800 font-sans p-4 md:p-8 selection:bg-blue-100 relative">
      {/* Top Left Text */}
      <div className="absolute top-4 left-4 text-[10px] font-bold text-slate-300 pointer-events-none select-none">
        ™木鈑
      </div>

      {/* GitHub Link */}
      <div className="absolute top-4 right-4 z-50">
        <motion.a
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          href="https://github.com/linhexing2/FWQ_chaxun"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 text-slate-600 hover:text-blue-600 transition-colors"
        >
          <Github className="w-4 h-4" />
          <span className="text-sm font-medium">GitHub</span>
        </motion.a>
      </div>

      <a href="https://github.com/linhexing2/FWQ_chaxun" className="github-corner" aria-label="View source on GitHub" target="_blank" rel="noopener noreferrer">
        <svg width="80" height="80" viewBox="0 0 250 250" style={{ fill: '#2563eb', color: '#fff', position: 'absolute', top: 0, border: 0, right: 0 }} aria-hidden="true">
          <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path>
          <path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.5 120.5,78.5 C116.4,70.1 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.5 120.5,78.5 C116.4,70.1 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.5 120.5,78.5 C116.4,70.1 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.5 120.5,78.5 C116.4,70.1 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.5 120.5,78.5 C116.4,70.1 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.5 120.5,78.5 C116.4,70.1 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.5 120.5,78.5 C116.4,70.1 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.5 120.5,78.5 C116.4,70.1 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.5 120.5,78.5 C116.4,70.1 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.5 120.5,78.5 C116.4,70.1 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.5 120.5,78.5 C116.4,70.1 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.5 120.5,78.5 C116.4,70.1 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.5 120.5,78.5 C116.4,70.1 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.5 120.5,78.5 C116.4,70.1 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.5 120.5,78.5 C116.4,70.1 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.5 120.5,78.5 C116.4,70.1 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.5 120.5,78.5 C116.4,70.1 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.5 120.5,78.5 C116.4,70.1 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.5 120.5,78.5 C116.4,70.1 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.5 120.5,78.5 C116.4,70.1 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.5 120.5,78.5 C116.4,70.1 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.5 120.5,78.5 C116.4,70.1 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.5 120.5,78.5 C116.4,70.1 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.5 120.5,78.5 C116.4,70.1 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.5 120.5,78.5 C116.4,70.1 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.5 120.5,78.5 C116.4,70.1 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.5 120.5,78.5 C116.4,70.1 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.5 120.5,78.5 C116.4,70.1 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.5 120.5,78.5 C116.4,70.1 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.5 120.5,78.5 C116.4,70.1 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.5 120.5,78.5 C116.4,70.1 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.5 120.5,78.5 C116.4,70.1 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.5 120.5,78.5 C116.4,70.1 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.5 120.5,78.5 C116.4,70.1 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.5 120.5,78.5 C116.4,70.1 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.5 120.5,78.5 C116.4,70.1" fill="currentColor" style={{ transformOrigin: '130px 106px' }} className="octo-arm"></path>
          <path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.3 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.9 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" className="octo-body"></path>
        </svg>
      </a>

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
            木鈑MC <span className="text-blue-600">服务器查询</span>
          </h1>
          <p className="text-slate-500 text-lg">输入服务器地址，即刻获取实时状态</p>
        </motion.header>

        {/* Search Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-blue-100/50 mb-8"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-full border-2 border-transparent focus-within:border-blue-400 transition-all duration-300">
              <div className="flex-1 flex items-center px-4">
                <Search className="w-5 h-5 text-slate-400 mr-3" />
                <input 
                  type="text" 
                  placeholder="例如: play.hypixel.net" 
                  className="w-full bg-transparent outline-none text-lg py-2"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchStatus()}
                />
                {address && (
                  <button
                    onClick={() => toggleFavorite(address.trim())}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <Star className={`w-5 h-5 transition-colors ${favorites.includes(address.trim()) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                  </button>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fetchStatus()}
                disabled={loading}
                className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-blue-200 flex items-center gap-2 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "查询"
                )}
              </motion.button>
            </div>

            <div className="flex justify-center gap-4">
              <button 
                onClick={() => setIsBedrock(false)}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${!isBedrock ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-slate-400 hover:bg-slate-100'}`}
              >
                Java 版
              </button>
              <button 
                onClick={() => setIsBedrock(true)}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${isBedrock ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-slate-400 hover:bg-slate-100'}`}
              >
                基岩版 (BE)
              </button>
            </div>

            {/* History & Favorites Quick Access */}
            {(history.length > 0 || favorites.length > 0) && (
              <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-4">
                {favorites.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Star className="w-3 h-3" /> 我的收藏
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {favorites.map((fav) => (
                        <button
                          key={fav}
                          onClick={() => { setAddress(fav); fetchStatus(); }}
                          className="px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg text-xs font-medium border border-yellow-100 hover:bg-yellow-100 transition-colors"
                        >
                          {fav}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {history.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <History className="w-3 h-3" /> 最近查询
                      </span>
                      <button onClick={clearHistory} className="text-[10px] text-slate-300 hover:text-red-400 transition-colors flex items-center gap-1">
                        <Trash2 className="w-3 h-3" /> 清空
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {history.map((item) => (
                        <button
                          key={item}
                          onClick={() => { setAddress(item); fetchStatus(); }}
                          className="px-3 py-1.5 bg-slate-50 text-slate-500 rounded-lg text-xs font-medium border border-slate-100 hover:bg-slate-100 transition-colors"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
              <p className="text-slate-400 font-medium">正在连接服务器...</p>
            </motion.div>
          )}

          {error && (
            <motion.div 
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 text-red-600 p-6 rounded-[2rem] border border-red-100 flex items-center gap-4"
            >
              <ShieldAlert className="w-8 h-8 shrink-0" />
              <p className="font-medium">{error}</p>
            </motion.div>
          )}

          {status && (
            <motion.div 
              key="status"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Main Info Card */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-blue-100/30 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-6">
                  <div className="flex items-center gap-2 bg-green-50 text-green-600 px-4 py-1.5 rounded-full text-sm font-bold border border-green-100">
                    <ShieldCheck className="w-4 h-4" />
                    在线
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                  {status.icon ? (
                    <img 
                      src={status.icon} 
                      alt="Server Icon" 
                      className="w-24 h-24 rounded-2xl shadow-md bg-slate-100"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300">
                      <Server className="w-12 h-12" />
                    </div>
                  )}

                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">
                        {status.hostname || status.ip}
                      </h2>
                      <div className="flex items-center gap-2">
                        <code className="bg-slate-100 px-3 py-1 rounded-lg text-sm font-mono text-slate-600">
                          {status.ip}:{status.port}
                        </code>
                        <button 
                          onClick={() => handleCopy(`${status.ip}:${status.port}`)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400"
                          title="复制地址"
                        >
                          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {status.motd?.clean.map((line, idx) => (
                        <p key={idx} className="text-slate-600 leading-relaxed font-medium">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="bg-white p-6 rounded-[2rem] shadow-lg shadow-blue-100/20 flex items-center gap-4 relative overflow-hidden"
                >
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-slate-400 text-sm font-medium">在线人数</p>
                      <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" title="实时刷新中" />
                    </div>
                    <p className="text-xl font-bold text-slate-900">
                      {status.players?.online} / {status.players?.max}
                    </p>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -5 }}
                  className="bg-white p-6 rounded-[2rem] shadow-lg shadow-blue-100/20 flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-400 text-sm font-medium">服务器版本</p>
                    <p className="text-xl font-bold text-slate-900 break-words">
                      {status.version || "未知"}
                    </p>
                  </div>
                </motion.div>

                {status.software && (
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-white p-6 rounded-[2rem] shadow-lg shadow-blue-100/20 flex items-center gap-4"
                  >
                    <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                      <Info className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm font-medium">服务端软件</p>
                      <p className="text-xl font-bold text-slate-900">
                        {status.software}
                      </p>
                    </div>
                  </motion.div>
                )}

                {status.map && (
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-white p-6 rounded-[2rem] shadow-lg shadow-blue-100/20 flex items-center gap-4"
                  >
                    <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                      <Server className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm font-medium">当前地图</p>
                      <p className="text-xl font-bold text-slate-900">
                        {status.map}
                      </p>
                    </div>
                  </motion.div>
                )}

                {status.latency !== undefined && (
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-white p-6 rounded-[2rem] shadow-lg shadow-blue-100/20 flex items-center gap-4"
                  >
                    <div className="w-12 h-12 bg-cyan-50 rounded-2xl flex items-center justify-center text-cyan-600">
                      <Search className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm font-medium">查询延迟</p>
                      <p className="text-xl font-bold text-slate-900">
                        {status.latency} ms
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Player List (if available) */}
              {status.players?.list && status.players.list.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-blue-100/30"
                >
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    在线玩家列表
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {status.players.list.map((player, idx) => (
                      <span 
                        key={idx} 
                        className="bg-slate-50 text-slate-600 px-4 py-1.5 rounded-full text-sm font-medium border border-slate-100"
                      >
                        {player}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="mt-20 text-center text-slate-400 text-sm pb-8 flex flex-col items-center gap-4">
          <div>
            <p>© 2026 木鈑MC 服务器状态查询工具</p>
            <p className="mt-1">数据由 mcstatus.io 提供</p>
            {repoInfo && (
              <div className="mt-4 flex items-center justify-center gap-4 text-xs font-medium text-slate-400">
                <span className="flex items-center gap-1">
                  <Check className="w-3 h-3" /> {repoInfo.stars} Stars
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3" /> {repoInfo.forks} Forks
                </span>
              </div>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
