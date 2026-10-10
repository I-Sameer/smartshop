import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useStore } from '../store/useStore.jsx';

export const Toast = () => {
  const { toastMessage } = useStore();
  if (!toastMessage) return null;

  const { message, type } = toastMessage;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-[#34c759]" />,
    error: <AlertCircle className="w-4 h-4 text-[#ff3b30]" />,
    warning: <AlertTriangle className="w-4 h-4 text-[#ff9500]" />,
    info: <Info className="w-4 h-4 text-[#0071e3]" />
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in pointer-events-none">
      <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-black/85 backdrop-blur-2xl text-white text-[13px] font-medium shadow-[0_12px_36px_rgba(0,0,0,0.28)] border border-white/10 tracking-tight">
        {icons[type] || icons.info}
        <span className="leading-snug">{message}</span>
      </div>
    </div>
  );
};

