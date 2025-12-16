
import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Copy, 
  Trash2, 
  ArrowLeft, 
  Loader2, 
  Plus, 
  Mic, 
  MicOff, 
  FileUp, 
  Search, 
  Type, 
  X,
  History,
  MonitorDown,
  Share2,
  Key,
  Send,
  MessageCircle,
  Bot,
  ChevronDown,
  Download,
  HelpCircle
} from 'lucide-react';
import { DEFAULT_SPELLS, ICON_MAP, APP_VERSION } from './constants';
import { AlchemyMode, Spell, TransformationResult, AI_MODELS } from './types';
import { transformText } from './services/geminiService';
import { SpellButton } from './components/SpellButton';
import { SpellModal } from './components/SpellModal';
import { HistoryModal } from './components/HistoryModal';
import { InstallGuideModal } from './components/InstallGuideModal';
import { ApiKeyModal } from './components/ApiKeyModal';

function App() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [spells, setSpells] = useState<Spell[]>(() => {
    try {
      const saved = localStorage.getItem('alchemy_spells');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load spells", e);
    }
    return DEFAULT_SPELLS;
  });

  const [history, setHistory] = useState<TransformationResult[]>(() => {
    try {
      const saved = localStorage.getItem('alchemy_history');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
    return [];
  });

  // User API Key State
  const [userApiKey, setUserApiKey] = useState<string>(() => {
    return localStorage.getItem('user_gemini_api_key') || '';
  });

  const [selectedSpellId, setSelectedSpellId] = useState<string>(AlchemyMode.SUMMARIZE);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showResult, setShowResult] = useState(false);
  
  // Model Selection State
  const [selectedModelId, setSelectedModelId] = useState(AI_MODELS[0].id);

  // Voice Typing State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isCaseSensitive, setIsCaseSensitive] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpell, setEditingSpell] = useState<Spell | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  // API Key State (Environment / AI Studio)
  const [hasEnvKey, setHasEnvKey] = useState(true);

  // Share Menu State
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  // Mini App Mode State (for embedding in Bale/Telegram)
  const [isMiniApp, setIsMiniApp] = useState(false);

  const selectedSpell = spells.find(s => s.id === selectedSpellId) || spells[0];
  const selectedModel = AI_MODELS.find(m => m.id === selectedModelId) || AI_MODELS[0];
  
  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize text area
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputText]);

  // Check for Mini App Mode via URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'bale' || params.get('mode') === 'miniapp') {
      setIsMiniApp(true);
    }
  }, []);

  // Persist spells & history
  useEffect(() => {
    localStorage.setItem('alchemy_spells', JSON.stringify(spells));
  }, [spells]);

  useEffect(() => {
    localStorage.setItem('alchemy_history', JSON.stringify(history));
  }, [history]);

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setIsShareMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // PWA Install Event Listener
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isMiniApp) { 
        setShowInstallBtn(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isMiniApp]);

  // Check for API Key on mount (AI Studio logic)
  useEffect(() => {
    const checkApiKey = async () => {
      const win = window as any;
      if (win.aistudio && win.aistudio.hasSelectedApiKey) {
        try {
          const hasKey = await win.aistudio.hasSelectedApiKey();
          setHasEnvKey(hasKey);
        } catch (e) {
          console.error("Error checking API key", e);
        }
      }
    };
    checkApiKey();
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBtn(false);
    }
    setDeferredPrompt(null);
  };

  const handleApiKeySave = (key: string) => {
    setUserApiKey(key);
    localStorage.setItem('user_gemini_api_key', key);
    // If we have a key now, we assume we can proceed
    setHasEnvKey(true);
  };

  const handleKeyButton = () => {
    const win = window as any;
    // If we are in AI Studio, prefer their selector, otherwise show our modal
    if (win.aistudio && win.aistudio.openSelectKey && !isMiniApp) {
      win.aistudio.openSelectKey().then(() => setHasEnvKey(true)).catch(console.error);
    } else {
      setIsApiKeyModalOpen(true);
    }
  };

  const handleTransmute = async () => {
    if (!inputText.trim()) return;

    // Logic: If user has a manual key, use it.
    // If not, and we are in AI Studio without a key selected, try to select.
    // If simply no key anywhere, prompt the user.

    const win = window as any;
    if (!userApiKey && win.aistudio && !hasEnvKey && !isMiniApp) {
       handleKeyButton();
       return;
    }

    setIsLoading(true);
    setShowResult(true);
    setOutputText(''); 
    
    setTimeout(async () => {
        // Pass userApiKey (if exists) as override
        const result = await transformText(inputText, selectedSpell, customPrompt, selectedModelId, userApiKey);
        
        // Check specifically for missing key error from service
        if (result.includes("API_KEY missing") || result.includes("کلید API یافت نشد")) {
           // If error indicates missing key, open the modal for the user to fix it
           setOutputText("لطفاً کلید API خود را وارد کنید.");
           setIsApiKeyModalOpen(true);
           setHasEnvKey(false);
        } else if (result.includes("API Key") || result.includes("API_KEY")) {
           // Other API key errors (invalid, etc)
           setOutputText(result);
           setIsApiKeyModalOpen(true); 
        } else {
           setOutputText(result);
           
           if (!result.startsWith("Error:") && !result.startsWith("خطا:")) {
             const newHistoryItem: TransformationResult = {
               id: crypto.randomUUID(),
               original: inputText,
               transformed: result,
               mode: `${selectedSpell.title} (${selectedModel.name})`,
               timestamp: Date.now()
             };
             setHistory(prev => [newHistoryItem, ...prev]);
           }
        }

        setIsLoading(false);
    }, 100);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleSystemShare = async (text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'نتیجه کیمیاگر متن',
          text: text,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      alert('اشتراک‌گذاری سیستمی در این دستگاه پشتیبانی نمی‌شود.');
    }
    setIsShareMenuOpen(false);
  };

  const handleBaleShare = async (text: string) => {
    await copyToClipboard(text);
    window.open('https://web.bale.ai/*', '_blank');
    alert('متن کپی شد. اکنون می‌توانید در بله (Bale) جایگذاری کنید.');
    setIsShareMenuOpen(false);
  };

  const handleTelegramShare = (text: string) => {
    const url = `https://t.me/share/url?url=&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setIsShareMenuOpen(false);
  };

  const clearAll = () => {
    setInputText('');
    setOutputText('');
    setShowResult(false);
    setCustomPrompt('');
    setSearchQuery('');
    setIsSearchOpen(false);
    setIsShareMenuOpen(false);
  };

  // --- Voice Typing Logic ---
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("متاسفانه مرورگر شما از تایپ صوتی پشتیبانی نمی‌کند.");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'fa-IR';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
             finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
           setInputText(prev => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    }
  };

  // --- File Upload Logic ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setInputText(text);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // --- Spell Management ---
  const handleSaveSpell = (spell: Spell) => {
    if (editingSpell) {
      setSpells(prev => prev.map(s => s.id === spell.id ? spell : s));
    } else {
      setSpells(prev => [...prev, spell]);
      setSelectedSpellId(spell.id); // Select new spell
    }
    setIsModalOpen(false);
    setEditingSpell(null);
  };

  const handleDeleteSpell = (id: string) => {
    if (window.confirm('آیا از حذف این قالب اطمینان دارید؟')) {
      const newSpells = spells.filter(s => s.id !== id);
      setSpells(newSpells);
      if (selectedSpellId === id) {
        setSelectedSpellId(newSpells[0].id);
      }
    }
  };

  const openAddModal = () => {
    setEditingSpell(null);
    setIsModalOpen(true);
  };

  const openEditModal = (spell: Spell) => {
    setEditingSpell(spell);
    setIsModalOpen(true);
  };

  // --- History Management ---
  const downloadHistory = (selectedItems: TransformationResult[]) => {
    const content = selectedItems.map(item => 
      `--- تاریخ: ${new Date(item.timestamp).toLocaleString('fa-IR')} ---\n` +
      `نوع عملیات: ${item.mode}\n\n` +
      `[ورودی]:\n${item.original}\n\n` +
      `[خروجی]:\n${item.transformed}\n` +
      `----------------------------------------\n`
    ).join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Alchemy_History_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteHistoryItems = (ids: string[]) => {
    setHistory(prev => prev.filter(item => !ids.includes(item.id)));
  };

  // --- Search Highlighting Helper ---
  const renderHighlightedText = (text: string) => {
    if (!searchQuery) return text;
    const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, isCaseSensitive ? 'g' : 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) => {
      const isMatch = isCaseSensitive ? part === searchQuery : part.toLowerCase() === searchQuery.toLowerCase();
      if (isMatch) return <mark key={index} className="bg-yellow-500/40 text-white rounded px-0.5 mx-0.5">{part}</mark>;
      return part;
    });
  };

  // If missing key in AI Studio environment, show the forced overlay (unless user has manually set one)
  const win = window as any;
  if (!userApiKey && !hasEnvKey && win.aistudio && !isMiniApp) {
    return (
      <div className="min-h-screen font-sans bg-alchemy-dark flex items-center justify-center p-4">
        <div className="bg-alchemy-surface border border-slate-700 rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-alchemy-primary/20 rounded-full flex items-center justify-center mx-auto">
            <Key className="text-alchemy-primary" size={32} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white mb-2">اتصال به هوش مصنوعی</h1>
            <p className="text-slate-400">
              برای استفاده از کیمیاگر متن، لطفاً ابتدا یک کلید API معتبر انتخاب کنید.
            </p>
          </div>
          <button 
            onClick={handleKeyButton}
            className="w-full bg-alchemy-primary hover:bg-indigo-600 text-white py-3 px-6 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20"
          >
            انتخاب کلید API
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans selection:bg-alchemy-primary selection:text-white pb-20">
      
      {/* Header */}
      <header className={`sticky top-0 z-50 bg-alchemy-dark/80 backdrop-blur-md border-b border-slate-800 ${isMiniApp ? 'py-2' : 'py-3'}`}>
        <div className={`mx-auto px-4 flex flex-col md:flex-row md:items-center justify-between gap-3 ${isMiniApp ? 'max-w-full' : 'max-w-5xl'}`}>
          
          {/* Logo & Model Selector */}
          <div className="flex items-center justify-between md:justify-start w-full md:w-auto gap-4">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-tr from-alchemy-primary to-purple-600 rounded-lg shadow-lg">
                  <Sparkles className="text-white" size={isMiniApp ? 20 : 24} />
                </div>
                {!isMiniApp && (
                  <div>
                    <h1 className="text-xl font-bold text-white tracking-tight">کیمیاگر متن</h1>
                  </div>
                )}
             </div>
             
             {/* Model Dropdown */}
             <div className="relative group flex-1 md:flex-none">
                <div className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg px-3 py-1.5 cursor-pointer transition-colors w-full md:w-auto justify-between md:justify-start">
                  <div className="flex items-center gap-2">
                    <Bot size={16} className={selectedModel.isPro ? 'text-alchemy-accent' : 'text-slate-400'} />
                    <div className="flex flex-col">
                       {!isMiniApp && <span className="text-xs text-slate-400">مدل هوش مصنوعی</span>}
                       <span className="text-sm font-medium text-white flex items-center gap-1">
                          {selectedModel.name}
                          {isMiniApp && <span className="text-xs text-slate-500 opacity-70">({selectedModel.description.split(' ')[0]})</span>}
                       </span>
                    </div>
                  </div>
                  <ChevronDown size={12} className="opacity-50" />
                  <select 
                    value={selectedModelId}
                    onChange={(e) => setSelectedModelId(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  >
                    {AI_MODELS.map(model => (
                      <option key={model.id} value={model.id}>
                         {model.name} - {model.description}
                      </option>
                    ))}
                  </select>
                </div>
             </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            
            {/* Always show Key button now */}
            <button 
              onClick={handleKeyButton}
              className={`text-slate-400 hover:text-alchemy-accent transition-colors p-2 rounded-full hover:bg-slate-800 ${userApiKey ? 'text-alchemy-accent' : ''}`}
              title="تغییر کلید API"
            >
              <Key size={20} />
            </button>

            <button 
              onClick={() => setIsGuideOpen(true)}
              className="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-slate-800"
              title="راهنما و درباره"
            >
              <HelpCircle size={20} />
            </button>

            {showInstallBtn && (
              <button 
                onClick={handleInstallClick}
                className="flex items-center gap-1 bg-alchemy-primary text-white text-xs px-3 py-2 rounded-full hover:bg-indigo-600 transition-colors animate-in fade-in shadow-[0_0_10px_rgba(99,102,241,0.5)] font-bold"
                title="نصب اپلیکیشن (اندروید و ویندوز)"
              >
                <Download size={16} />
                <span className="inline">نصب اپلیکیشن</span>
              </button>
            )}
            <button 
              onClick={() => setIsHistoryOpen(true)}
              className="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-slate-800"
              title="تاریخچه"
            >
              <History size={20} />
            </button>
            {!isMiniApp && (
              <button 
                onClick={clearAll}
                className="text-slate-400 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-slate-800"
                title="پاک کردن همه"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className={`mx-auto px-4 ${isMiniApp ? 'py-4 max-w-full' : 'py-8 max-w-4xl'} space-y-6`}>
        
        {/* Input Section */}
        <section className="space-y-4">
          <div className="relative group">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="متن خود را اینجا بنویسید، جایگذاری کنید، یا فایل متنی آپلود کنید..."
              className={`w-full bg-alchemy-surface border-2 border-slate-700 rounded-2xl p-6 pl-16 text-lg focus:outline-none focus:border-alchemy-primary focus:ring-4 focus:ring-alchemy-primary/10 transition-all resize-none shadow-xl ${isMiniApp ? 'min-h-[120px]' : 'min-h-[160px]'}`}
              dir="auto"
            />
            
            {/* Input Toolbar */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
               {/* Voice Typing Button */}
               <button 
                 onClick={toggleListening}
                 className={`p-2 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 ${
                   isListening 
                     ? 'bg-red-500 text-white animate-pulse' 
                     : 'bg-slate-700/50 text-slate-400 hover:bg-alchemy-primary hover:text-white'
                 }`}
                 title={isListening ? "توقف ضبط" : "تایپ صوتی"}
               >
                 {isListening ? <MicOff size={20} /> : <Mic size={20} />}
               </button>

               {/* File Upload Button */}
               <button 
                 onClick={triggerFileUpload}
                 className="p-2 rounded-full shadow-lg backdrop-blur-sm bg-slate-700/50 text-slate-400 hover:bg-alchemy-primary hover:text-white transition-all duration-300"
                 title="آپلود فایل متنی (txt)"
               >
                 <FileUp size={20} />
               </button>
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 onChange={handleFileUpload} 
                 accept=".txt" 
                 className="hidden" 
               />
               
               {isMiniApp && inputText.length > 0 && (
                 <button 
                  onClick={() => setInputText('')}
                  className="p-2 rounded-full shadow-lg backdrop-blur-sm bg-slate-700/50 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300"
                 >
                   <Trash2 size={20} />
                 </button>
               )}
            </div>

            <div className="absolute bottom-4 left-4 text-xs text-slate-500">
              {inputText.length} کاراکتر
            </div>
          </div>
        </section>

        {/* Spells Grid */}
        <section>
          {!isMiniApp && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-slate-300">
                <Sparkles size={18} className="text-alchemy-accent" />
                <h2 className="font-semibold">انتخاب ورد جادویی</h2>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {spells.map((spell) => (
              <SpellButton
                key={spell.id}
                spell={spell}
                isSelected={selectedSpellId === spell.id}
                onClick={() => setSelectedSpellId(spell.id)}
                onEdit={openEditModal}
                onDelete={handleDeleteSpell}
                disabled={isLoading}
              />
            ))}
            
            {/* Add Button */}
            <button
              onClick={openAddModal}
              disabled={isLoading}
              className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/30 text-slate-400 hover:border-alchemy-primary hover:text-alchemy-primary hover:bg-alchemy-primary/5 transition-all cursor-pointer min-h-[120px] group"
            >
              <div className="mb-2 p-3 rounded-full bg-slate-800 group-hover:bg-alchemy-primary group-hover:text-white transition-colors">
                <Plus size={24} />
              </div>
              <span className="text-sm font-medium">افزودن قالب</span>
            </button>
          </div>

          {/* Custom Prompt Input */}
          {selectedSpellId === AlchemyMode.Custom && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-2">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="دستور خود را بنویسید (مثلاً: این متن را به صورت طنز بازنویسی کن)..."
                className="w-full bg-slate-800 border border-slate-600 rounded-xl p-4 text-white focus:border-alchemy-primary focus:outline-none"
              />
            </div>
          )}
        </section>

        {/* Action Button */}
        <div className={`flex justify-center pt-2 ${isMiniApp ? 'sticky bottom-4 z-40' : ''}`}>
          <button
            onClick={handleTransmute}
            disabled={!inputText.trim() || isLoading}
            className={`group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-alchemy-primary to-purple-600 text-white rounded-full font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${isMiniApp ? 'w-full py-3 text-base' : 'px-10 py-4 text-lg'}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" />
                <span>در حال کیمیاگری...</span>
              </>
            ) : (
              <>
                <Sparkles className="group-hover:rotate-12 transition-transform" />
                <span>تبدیل کن</span>
              </>
            )}
          </button>
        </div>

        {/* Output Section */}
        {showResult && (
          <section className="animate-in fade-in slide-in-from-bottom-8 duration-500 pb-20">
             <div className="relative bg-gradient-to-b from-slate-800 to-alchemy-surface rounded-2xl p-1 border border-slate-700 shadow-2xl">
                
                {/* Result Toolbar */}
                <div className="flex flex-col border-b border-slate-700/50">
                  <div className="flex items-center justify-between px-4 py-3">
                     <h3 className="font-semibold text-alchemy-accent flex items-center gap-2">
                       <ArrowLeft size={16} />
                       نتیجه
                     </h3>
                     <div className="flex items-center gap-2 relative">
                       {/* Search Toggle */}
                       <button 
                          onClick={() => {
                            setIsSearchOpen(!isSearchOpen);
                            if (!isSearchOpen) setSearchQuery('');
                          }}
                          className={`p-2 rounded-lg transition-colors ${isSearchOpen ? 'bg-alchemy-primary text-white' : 'hover:bg-slate-700 text-slate-400 hover:text-white'}`}
                          title="جستجو در متن"
                       >
                         <Search size={18} />
                       </button>

                       <button 
                          onClick={() => copyToClipboard(outputText)}
                          className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                          title="کپی کردن"
                       >
                         <Copy size={18} />
                       </button>

                       {/* Share Button & Dropdown */}
                       <div ref={shareMenuRef} className="relative">
                         <button 
                            onClick={() => setIsShareMenuOpen(!isShareMenuOpen)}
                            className={`p-2 rounded-lg transition-colors ${isShareMenuOpen ? 'bg-slate-700 text-white' : 'hover:bg-slate-700 text-slate-400 hover:text-white'}`}
                            title="اشتراک‌گذاری"
                         >
                           <Share2 size={18} />
                         </button>
                         
                         {isShareMenuOpen && (
                           <div className="absolute left-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden left-0 origin-top-left md:right-0 md:left-auto md:origin-top-right">
                              <button 
                                onClick={() => handleSystemShare(outputText)}
                                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-white text-right transition-colors border-b border-slate-700/50"
                              >
                                <Share2 size={16} />
                                اشتراک‌گذاری سیستم
                              </button>
                              <button 
                                onClick={() => handleBaleShare(outputText)}
                                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-white text-right transition-colors border-b border-slate-700/50"
                              >
                                <MessageCircle size={16} className="text-green-500" />
                                ارسال به بله (Web)
                              </button>
                              <button 
                                onClick={() => handleTelegramShare(outputText)}
                                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-white text-right transition-colors"
                              >
                                <Send size={16} className="text-blue-400" />
                                ارسال به تلگرام
                              </button>
                           </div>
                         )}
                       </div>
                     </div>
                  </div>

                  {/* Search Bar (Collapsible) */}
                  {isSearchOpen && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border-t border-slate-700 animate-in slide-in-from-top-1">
                      <Search size={16} className="text-slate-500" />
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="عبارت مورد نظر را جستجو کنید..."
                        className="bg-transparent border-none outline-none text-sm text-white flex-1 placeholder:text-slate-600"
                        autoFocus
                      />
                      <div className="h-4 w-[1px] bg-slate-600 mx-1"></div>
                      <button 
                        onClick={() => setIsCaseSensitive(!isCaseSensitive)}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${isCaseSensitive ? 'bg-alchemy-primary text-white' : 'text-slate-500 hover:text-slate-300'}`}
                        title="حساس به بزرگی و کوچکی حروف"
                      >
                        <Type size={14} />
                        Aa
                      </button>
                      <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="text-slate-500 hover:text-white ml-1">
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 min-h-[120px]">
                   {isLoading ? (
                     <div className="flex flex-col items-center justify-center h-32 space-y-4 text-slate-500">
                        <Loader2 className="animate-spin w-8 h-8 text-alchemy-primary" />
                        <p className="text-sm animate-pulse">هوش مصنوعی در حال تفکر است...</p>
                     </div>
                   ) : (
                     <div className="prose prose-invert prose-p:leading-relaxed max-w-none dir-rtl" dir="auto">
                        <p className="whitespace-pre-wrap">
                          {renderHighlightedText(outputText)}
                        </p>
                     </div>
                   )}
                </div>
             </div>
          </section>
        )}
      </main>

      {/* Footer Version */}
      <div 
        onClick={() => window.location.reload()}
        className="fixed bottom-2 left-3 text-[10px] font-mono text-slate-600 opacity-50 hover:opacity-100 hover:text-alchemy-primary cursor-pointer transition-all z-40 select-none"
        title="نسخه برنامه (برای بروزرسانی کلیک کنید)"
      >
        v{APP_VERSION}
      </div>

      {/* Modals */}
      <SpellModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSpell}
        editingSpell={editingSpell}
      />
      
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onDownload={downloadHistory}
        onDelete={deleteHistoryItems}
      />

      <InstallGuideModal 
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={handleApiKeySave}
        initialKey={userApiKey}
      />
    </div>
  );
}

export default App;
