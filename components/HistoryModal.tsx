
import React, { useState, useMemo } from 'react';
import { X, Download, Trash2, CheckSquare, Square, FileDown, Calendar, Search, Type, Share2 } from 'lucide-react';
import { TransformationResult } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: TransformationResult[];
  onDownload: (selectedItems: TransformationResult[]) => void;
  onDelete: (selectedIds: string[]) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ 
  isOpen, onClose, history, onDownload, onDelete 
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCaseSensitive, setIsCaseSensitive] = useState(false);

  // Filter history based on search query
  const filteredHistory = useMemo(() => {
    if (!searchQuery) return history;

    return history.filter(item => {
      const q = isCaseSensitive ? searchQuery : searchQuery.toLowerCase();
      const original = isCaseSensitive ? item.original : item.original.toLowerCase();
      const transformed = isCaseSensitive ? item.transformed : item.transformed.toLowerCase();
      const mode = isCaseSensitive ? item.mode : item.mode.toLowerCase();

      return original.includes(q) || transformed.includes(q) || mode.includes(q);
    });
  }, [history, searchQuery, isCaseSensitive]);

  if (!isOpen) return null;

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredHistory.length && filteredHistory.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredHistory.map(item => item.id));
    }
  };

  const handleDownload = () => {
    // Only download selected items that are currently visible/filtered (or all selected? usually selected from the current view)
    // Here we download any selected ID that exists in the main history, but typically user acts on what they see.
    // Let's stick to downloading all selected items regardless of filter, or just visible. 
    // UX Convention: Actions apply to selection.
    const selectedItems = history.filter(item => selectedIds.includes(item.id));
    onDownload(selectedItems);
  };

  const handleDelete = () => {
    if (window.confirm(`آیا از حذف ${selectedIds.length} مورد انتخاب شده اطمینان دارید؟`)) {
      onDelete(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleShare = async (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
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
       await navigator.clipboard.writeText(text);
       alert('متن کپی شد');
    }
  };

  // Helper to highlight text
  const HighlightedText = ({ text }: { text: string }) => {
    if (!searchQuery) return <>{text}</>;

    const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapeRegExp(searchQuery)})`, isCaseSensitive ? 'g' : 'gi');
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, i) => 
          regex.test(part) ? (
            <mark key={i} className="bg-yellow-500/40 text-white rounded px-0.5">{part}</mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-alchemy-surface border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-alchemy-dark/50">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar size={20} className="text-alchemy-accent" />
              تاریخچه تغییرات
            </h2>
            <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
              {filteredHistory.length} / {history.length}
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 bg-slate-800/30 border-b border-slate-700 flex gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در متن ورودی، خروجی یا نوع عملیات..."
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pr-10 pl-3 py-2 text-sm text-white focus:border-alchemy-primary focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button 
            onClick={() => setIsCaseSensitive(!isCaseSensitive)}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg border transition-all text-sm ${
              isCaseSensitive 
                ? 'bg-alchemy-primary/20 border-alchemy-primary text-alchemy-primary' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
            }`}
            title="حساس به بزرگی و کوچکی حروف"
          >
            <Type size={16} />
            <span className="hidden sm:inline">Aa</span>
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-slate-700">
          <button 
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
          >
            {selectedIds.length > 0 && selectedIds.length === filteredHistory.length ? (
              <CheckSquare size={18} className="text-alchemy-primary" />
            ) : (
              <Square size={18} />
            )}
            انتخاب همه
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={selectedIds.length === 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
            >
              <Trash2 size={16} />
              حذف ({selectedIds.length})
            </button>
            <button
              onClick={handleDownload}
              disabled={selectedIds.length === 0}
              className="flex items-center gap-1 px-3 py-1.5qc rounded-lg bg-alchemy-primary text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm shadow-lg shadow-indigo-500/20"
            >
              <FileDown size={16} />
              دانلود ({selectedIds.length})
            </button>
          </div>
        </div>
        
        {/* List */}
        <div className="overflow-y-auto p-4 space-y-3 flex-1">
          {filteredHistory.length === 0 ? (
            <div className="text-center text-slate-500 py-10">
              {history.length === 0 ? 'هنوز هیچ موردی در تاریخچه ثبت نشده است.' : 'موردی با این مشخصات یافت نشد.'}
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div 
                key={item.id} 
                onClick={() => toggleSelection(item.id)}
                className={`
                  group relative border rounded-xl p-4 cursor-pointer transition-all duration-200
                  ${selectedIds.includes(item.id) 
                    ? 'bg-indigo-900/20 border-alchemy-primary shadow-sm' 
                    : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
                  }
                `}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`text-slate-400 ${selectedIds.includes(item.id) ? 'text-alchemy-primary' : ''}`}>
                      {selectedIds.includes(item.id) ? <CheckSquare size={20} /> : <Square size={20} />}
                    </div>
                    <div>
                      <span className="text-xs text-alchemy-accent font-medium bg-alchemy-accent/10 px-2 py-0.5 rounded">
                        <HighlightedText text={item.mode} />
                      </span>
                      <span className="text-xs text-slate-500 mx-2">
                        {new Date(item.timestamp).toLocaleString('fa-IR')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div className="bg-black/20 p-2 rounded border border-white/5">
                    <p className="text-xs text-slate-500 mb-1">ورودی:</p>
                    <p className="text-sm text-slate-300 line-clamp-2">
                      <HighlightedText text={item.original} />
                    </p>
                  </div>
                  <div className="bg-alchemy-primary/5 p-2 rounded border border-alchemy-primary/10 relative">
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-xs text-alchemy-primary">خروجی:</p>
                         <button
                            onClick={(e) => handleShare(e, item.transformed)}
                            className="text-slate-500 hover:text-alchemy-primary p-1 rounded hover:bg-alchemy-primary/10 transition-colors"
                            title="اشتراک‌گذاری"
                         >
                           <Share2 size={14} />
                         </button>
                    </div>
                    <p className="text-sm text-slate-200 line-clamp-2">
                      <HighlightedText text={item.transformed} />
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
