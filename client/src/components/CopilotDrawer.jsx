import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  ArrowUp, 
  ShoppingBag, 
  CheckCircle2, 
  ShieldCheck, 
  ExternalLink, 
  Clock,
  ChevronRight,
  Package,
  Trash2,
  User
} from 'lucide-react';
import { useStore } from '../store/useStore.jsx';

export const CopilotDrawer = () => {
  const { 
    user,
    isCopilotOpen, 
    setIsCopilotOpen, 
    copilotMessages, 
    sendCopilotMessage, 
    clearChatHistory,
    addToCart, 
    setActiveOrderTrackId 
  } = useStore();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [copilotMessages, loading]);

  if (!isCopilotOpen) return null;

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;
    setInput('');
    setLoading(true);
    await sendCopilotMessage(text);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden text-[14px]">
      {/* Frosted Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCopilotOpen(false)}
      ></div>

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div className="w-screen max-w-lg bg-[#f5f5f7] border-l border-[#d2d2d7] shadow-2xl flex flex-col justify-between relative">
          
          {/* 1. Header (Apple Intelligence Header with Individual Customer Badge & Clear Action) */}
          <div className="p-4 sm:p-5 border-b border-[#e5e5ea] bg-white/80 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0071e3] via-[#5e5ce6] to-[#ff2d55] p-0.5 flex items-center justify-center shadow-xs">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#0071e3]" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[16px] font-semibold text-[#1d1d1f] tracking-tight">Shop AI Intellegence</h3>
                  <span className="text-[10px] font-medium bg-[#0071e3]/10 text-[#0071e3] border border-[#0071e3]/20 px-2 py-0.5 rounded-full">
                    LangChain RAG
                  </span>
                </div>
                {/* Individual Identity Badge */}
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${user ? 'bg-[#34c759]' : 'bg-[#ff9500]'}`}></span>
                  <p className="text-[11px] text-[#86868b] font-medium">
                    {user ? `${user.full_name} (${user.membership_tier})` : 'Guest Session Memory'}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions: Clear Chat & Close */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={clearChatHistory}
                title="Clear conversation history for this profile"
                className="p-2 rounded-full hover:bg-black/5 text-[#86868b] hover:text-[#ff3b30] transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsCopilotOpen(false)}
                className="apple-icon-circle text-[#1d1d1f]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 2. Messages Stream */}
          <div className="p-5 overflow-y-auto flex-1 space-y-4">
            {copilotMessages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[88%] rounded-2xl p-4 ${
                  msg.sender === 'user'
                    ? 'bg-[#0071e3] text-white rounded-br-xs'
                    : 'bg-white border border-[#e5e5ea] text-[#1d1d1f] shadow-xs space-y-3 rounded-bl-xs'
                }`}>
                  
                  {/* Agent Tag */}
                  {msg.sender === 'ai' && msg.agent && (
                    <div className="flex items-center justify-between pb-2 border-b border-[#f0f0f0] text-[12px]">
                      <span className="font-semibold text-[#0071e3]">
                        {msg.agent}
                      </span>
                      <div className="flex items-center gap-2 text-[#86868b]">
                        {msg.latencyMs !== undefined && (
                          <span className="text-[11px]">{msg.latencyMs}ms</span>
                        )}
                        {msg.confidence !== undefined && (
                          <span className="text-[#34c759] font-medium text-[11px]">
                            {Math.round(msg.confidence * 100)}% Match
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Message Text */}
                  {msg.text && (
                    <p className="leading-relaxed text-[15px]">{msg.text}</p>
                  )}

                  {/* MODULE 1: AI Recommendation Card */}
                  {msg.data?.interpretedRequirement && (
                    <div className="space-y-3 pt-1">
                      <div className="p-3 rounded-xl bg-[#f5f5f7] border border-[#e5e5ea]">
                        <span className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider block mb-1">
                          Requirement
                        </span>
                        <p className="font-medium text-[#1d1d1f] text-[14px]">
                          {msg.data.interpretedRequirement}
                        </p>
                        {msg.data.extractedFeatures && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {msg.data.extractedFeatures.map((f, i) => (
                              <span key={i} className="px-2.5 py-0.5 rounded-full bg-white text-[#1d1d1f] border border-[#d2d2d7] text-[11px]">
                                {f}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Product Recommendations List */}
                      <div className="space-y-2.5">
                        <span className="text-[12px] font-semibold text-[#86868b] uppercase tracking-wider block">
                          Top Recommendations
                        </span>
                        {msg.data.recommendations?.map((rec) => (
                          <div key={rec.productId} className="p-3.5 rounded-xl bg-white border border-[#d2d2d7] shadow-xs space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-[11px] font-semibold text-[#0071e3]">{rec.productId}</span>
                                <h4 className="font-semibold text-[#1d1d1f] text-[15px]">{rec.productName}</h4>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-[15px] font-semibold text-[#1d1d1f]">${rec.price}</span>
                                <div className="text-[11px] text-[#34c759] font-medium">
                                  {Math.round(rec.matchScore * 100)}% match
                                </div>
                              </div>
                            </div>

                            {/* Human-Readable Specs Justification */}
                            <p className="text-[13px] text-[#515154] bg-[#f5f5f7] p-2.5 rounded-lg leading-normal">
                              {rec.reason}
                            </p>

                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[12px] text-[#86868b]">{rec.rating}★ Rating</span>
                              <button
                                onClick={() => addToCart(rec.productId, 1)}
                                className="apple-btn-primary text-[12px] py-1 px-3.5 gap-1"
                              >
                                <ShoppingBag className="w-3 h-3" />
                                Add to Bag
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {msg.data.clarifyingQuestion && (
                        <div className="p-3 rounded-xl bg-[#fff8eb] border border-[#ffe5b5] text-[#b25e00] text-[13px]">
                          {msg.data.clarifyingQuestion}
                        </div>
                      )}
                    </div>
                  )}

                  {/* MODULE 2: Grounded Knowledge Policy Card */}
                  {msg.data?.sources && msg.data?.answer && (
                    <div className="space-y-3 pt-1">
                      <div className="p-3.5 rounded-xl bg-[#f5f5f7] border border-[#e5e5ea] space-y-2">
                        <div className="flex items-center gap-1.5 text-[#34c759] text-[12px] font-semibold">
                          <ShieldCheck className="w-4 h-4" />
                          <span>Grounded Policy Answer (Zero-Hallucination)</span>
                        </div>
                        <p className="text-[14px] text-[#1d1d1f] leading-relaxed font-normal">
                          {msg.data.answer}
                        </p>
                      </div>

                      {/* Source Citations */}
                      <div>
                        <span className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider block mb-1.5">
                          Verified Policy Sources:
                        </span>
                        <div className="space-y-1.5">
                          {msg.data.sources.map((src, i) => (
                            <div key={i} className="p-2.5 rounded-lg bg-white border border-[#e5e5ea] flex items-center justify-between text-[12px]">
                              <div>
                                <span className="font-semibold text-[#1d1d1f] block">{src.document}</span>
                                <span className="text-[11px] text-[#86868b]">{src.section} · Version {src.version}</span>
                              </div>
                              <span className="text-[#0071e3] font-medium text-[11px]">
                                {Math.round(src.relevanceScore * 100)}% match
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* LOGISTICS AGENT: Tracking Data Card */}
                  {msg.data?.order && (
                    <div className="p-3.5 rounded-xl bg-white border border-[#d2d2d7] space-y-2.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#1d1d1f]">Order #{msg.data.order.orderNumber}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#f5f5f7] text-[#0071e3] font-medium text-[12px]">
                          {msg.data.order.status}
                        </span>
                      </div>
                      <p className="text-[13px] text-[#515154]">{msg.data.message}</p>
                      <button
                        onClick={() => setActiveOrderTrackId(msg.data.order.orderNumber)}
                        className="w-full py-2 rounded-full bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#0071e3] font-medium text-[13px] flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View Live Delivery Tracking
                      </button>
                    </div>
                  )}

                  {/* Quick Prompts Suggestions */}
                  {msg.suggestions && (
                    <div className="pt-2 border-t border-[#f0f0f0] space-y-1.5">
                      <span className="text-[11px] text-[#86868b] uppercase font-semibold">
                        Suggested Inquiries:
                      </span>
                      <div className="flex flex-col gap-1.5">
                        {msg.suggestions.map((sug, i) => (
                          <button
                            key={i}
                            onClick={() => handleSend(sug)}
                            className="text-left px-3 py-1.5 rounded-xl bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] text-[13px] transition-colors"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-[#86868b] text-[13px] pl-2">
                <span className="w-2 h-2 rounded-full bg-[#0071e3] animate-ping"></span>
                <span>Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 3. Prompt Input Box */}
          <div className="p-4 border-t border-[#e5e5ea] bg-white">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="relative flex items-center"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about laptops, specs, return policy..."
                className="w-full pl-4 pr-12 py-3 bg-[#f5f5f7] rounded-full text-[14px] text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0071e3] transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="absolute right-2 w-8 h-8 rounded-full bg-[#0071e3] disabled:opacity-40 text-white flex items-center justify-center transition-all hover:bg-[#0077ed] active:scale-95 shadow-sm"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};
