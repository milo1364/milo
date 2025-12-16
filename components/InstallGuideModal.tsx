
import React from 'react';
import { X, Monitor, Smartphone, Globe, Info, Code, MessageCircle, RefreshCw } from 'lucide-react';
import { APP_VERSION } from '../constants';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        for(let registration of registrations) {
          registration.update();
        }
      });
    }
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-alchemy-surface border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-alchemy-dark/50">
          <div className="flex items-center gap-2">
            <Info className="text-alchemy-accent" size={24} />
            <h2 className="text-lg font-bold text-white">راهنما و درباره</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 dir-rtl" dir="rtl">
          
          {/* Version & Update Section */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex items-center justify-between shadow-sm">
             <div className="flex flex-col gap-1">
               <span className="text-slate-300 font-bold text-sm">نسخه فعلی برنامه</span>
               <span className="text-alchemy-primary font-mono text-xs tracking-wider">v{APP_VERSION}</span>
             </div>
             <button
               onClick={handleUpdate}
               className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded-lg transition-colors border border-slate-600"
               title="بررسی و دریافت آخرین نسخه"
             >
               <RefreshCw size={14} />
               بروزرسانی
             </button>
          </div>

          {/* Bale Bot Section */}
          <div className="space-y-3 bg-indigo-900/20 p-4 rounded-xl border border-indigo-500/30">
            <div className="flex items-center gap-2 text-indigo-400">
              <MessageCircle size={24} />
              <h3 className="font-bold text-lg">تبدیل به ربات بله (Bale Bot)</h3>
            </div>
            <div className="space-y-2 text-sm text-slate-300 leading-relaxed">
              <p>شما می‌توانید این برنامه را به عنوان یک <b>Mini App</b> (وب‌اپلیکیشن) داخل ربات بله خود قرار دهید:</p>
              <ol className="list-decimal list-inside space-y-2 marker:text-indigo-500 pr-2">
                <li>در پیام‌رسان بله به بازوی <code>@BotFather</code> بروید.</li>
                <li>یک ربات جدید بسازید یا ربات فعلی را انتخاب کنید.</li>
                <li>به بخش <b>Bot Settings</b> و سپس <b>Menu Button</b> بروید.</li>
                <li>گزینه <b>Configure Menu Button</b> را بزنید.</li>
                <li>آدرس (URL) این برنامه را وارد کنید و در انتهای آن عبارت <code>?mode=bale</code> را اضافه کنید.</li>
                <li className="text-xs text-slate-500 font-mono mt-1 bg-slate-900/50 p-2 rounded">مثال: https://your-site.com/?mode=bale</li>
              </ol>
            </div>
          </div>

          {/* Windows Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-alchemy-primary">
              <Monitor size={24} />
              <h3 className="font-bold text-lg">نسخه ویندوز (Windows)</h3>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-2 text-sm text-slate-300 leading-relaxed">
              <p>این برنامه یک وب‌اپلیکیشن پیشرفته (PWA) است. برای نصب مشابه فایل exe:</p>
              <ol className="list-decimal list-inside space-y-2 marker:text-alchemy-primary pr-2">
                <li>برنامه را با مرورگر <b>Chrome</b> یا <b>Edge</b> باز کنید.</li>
                <li>در نوار آدرس (بالای صفحه)، روی آیکون <span className="inline-flex items-center justify-center border border-slate-500 rounded px-1 mx-1 h-5 text-[10px]">نصب</span> یا <span className="inline-flex items-center justify-center border border-slate-500 rounded px-1 mx-1 h-5 w-5 text-[12px]">+</span> کلیک کنید.</li>
                <li>اگر آیکون را نمی‌بینید، روی سه نقطه منوی مرورگر کلیک کرده و گزینه <b>Install Persian Text Alchemy</b> را انتخاب کنید.</li>
              </ol>
            </div>
          </div>

          {/* Android Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-400">
              <Smartphone size={24} />
              <h3 className="font-bold text-lg">نسخه اندروید (Android)</h3>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-2 text-sm text-slate-300 leading-relaxed">
              <p>برای نصب مشابه فایل APK و اضافه شدن به لیست برنامه‌ها:</p>
              <ol className="list-decimal list-inside space-y-2 marker:text-green-500 pr-2">
                <li>برنامه را در مرورگر <b>Chrome</b> باز کنید.</li>
                <li>روی دکمه <b>"نصب اپلیکیشن"</b> در بالای همین صفحه کلیک کنید.</li>
                <li>اگر دکمه کار نکرد، روی سه نقطه (منو) مرورگر کلیک کنید.</li>
                <li>گزینه <b>Install App</b> یا <b>Add to Home Screen</b> را انتخاب کنید.</li>
              </ol>
            </div>
          </div>

          {/* iOS Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-200">
              <Globe size={24} />
              <h3 className="font-bold text-lg">نسخه iOS (آیفون)</h3>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-2 text-sm text-slate-300 leading-relaxed">
              <ol className="list-decimal list-inside space-y-2 marker:text-white pr-2">
                <li>در مرورگر <b>Safari</b>، دکمه <b>Share</b> (مربع با فلش بالا) را بزنید.</li>
                <li>در منوی باز شده به پایین اسکرول کنید و گزینه <b>Add to Home Screen</b> را انتخاب کنید.</li>
                <li>در بالا سمت راست، دکمه <b>Add</b> را بزنید.</li>
              </ol>
            </div>
          </div>

          {/* Developers Section */}
          <div className="space-y-3 pt-4 border-t border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400">
              <Code size={24} />
              <h3 className="font-bold text-lg">نکته برای توسعه‌دهندگان</h3>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-2 text-sm text-slate-300 leading-relaxed">
              <p>اگر برنامه را به صورت لوکال (Localhost) اجرا می‌کنید و با خطای <b>API Key</b> مواجه می‌شوید:</p>
              <ol className="list-decimal list-inside space-y-2 marker:text-slate-500 pr-2">
                <li>یک فایل به نام <code>.env</code> در ریشه پروژه بسازید.</li>
                <li>مقدار <code>API_KEY=YOUR_GEMINI_API_KEY</code> را در آن قرار دهید.</li>
                <li>برنامه را مجدداً راه‌اندازی کنید.</li>
              </ol>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
