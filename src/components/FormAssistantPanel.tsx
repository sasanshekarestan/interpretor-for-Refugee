import React, { useRef, useEffect } from 'react';
import { FormQuestion, UserLanguage } from '../types';
import { ChatMessage } from './FormCompanion';
import { Bot, User, Send } from 'lucide-react';

export interface FormAssistantPanelProps {
  currentQ: FormQuestion;
  userLanguage: UserLanguage;
  chatMessages: ChatMessage[];
  chatInput: string;
  setChatInput: (text: string) => void;
  isChatProcessing: boolean;
  handleSendChatMessage: (customText?: string) => Promise<void>;
  isRecording?: boolean;
  toggleRecording?: () => void;
  onPlayAudio?: (text: string, lang: string) => void;
}

export const FormAssistantPanel: React.FC<FormAssistantPanelProps> = ({
  currentQ,
  userLanguage,
  chatMessages,
  chatInput,
  setChatInput,
  isChatProcessing,
  handleSendChatMessage,
  isRecording,
  toggleRecording,
  onPlayAudio,
}) => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatProcessing]);

  return (
    <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl flex flex-col overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="p-3.5 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center shadow-xs">
            <Bot className="w-4 h-4 text-slate-300" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white font-farsi dir-rtl">
              {userLanguage === 'dari' ? 'دستیار فرم • Form Assistant' : 'دستیار فرم • Form Assistant'}
            </h3>
            <p className="text-[11px] text-slate-400 font-farsi dir-rtl">
              {userLanguage === 'dari'
                ? 'پاسخ به سوالات و رفع ابهام این خانه'
                : 'پاسخ به سوالات و رفع ابهام این بخش از فرم'}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="p-3.5 max-h-[220px] md:max-h-[360px] overflow-y-auto space-y-3 bg-slate-950/40 scrollbar-thin">
        {chatMessages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white shadow-2xs ${
                  isUser ? 'bg-slate-800 border border-slate-700' : 'bg-slate-800 border border-slate-700 text-slate-300'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 text-slate-300" />}
              </div>

              <div className={`max-w-[85%] space-y-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-3 rounded-2xl text-xs shadow-2xs ${
                    isUser
                      ? 'bg-slate-800 text-white rounded-tr-none font-farsi dir-rtl text-right border border-slate-700'
                      : 'bg-slate-950 text-slate-100 border border-slate-800 rounded-tl-none font-farsi dir-rtl text-right space-y-1.5'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.textFa}</p>
                </div>

                {!isUser && msg.quickSuggestions && msg.quickSuggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-0.5 dir-rtl text-right">
                    {msg.quickSuggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendChatMessage(sug)}
                        className="min-h-[44px] px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-[11px] font-bold transition cursor-pointer"
                      >
                        💬 {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isChatProcessing && (
          <div className="flex items-center gap-2 text-xs text-slate-300 font-bold font-farsi dir-rtl bg-slate-950 p-2.5 rounded-xl border border-slate-800 w-fit animate-fade-in shadow-2xs">
            <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
              <Bot className="w-3 h-3 text-slate-300" />
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
              <span className="text-slate-300 pr-1 text-xs">
                {userLanguage === 'dari' ? 'دستیار در حال تنظیم پاسخ...' : 'دستیار در حال تنظیم پاسخ...'}
              </span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-2">
        <div className="flex items-end gap-2">
          <div className="relative flex-1">
            <textarea
              rows={2}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendChatMessage();
                }
              }}
              placeholder="سوال خود را بپرسید یا ابهام این خانه را مطرح کنید..."
              className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-400 focus:ring-2 focus:ring-slate-500 text-xs font-farsi dir-rtl shadow-xs resize-none"
            />
          </div>

          <button
            type="button"
            onClick={() => handleSendChatMessage()}
            disabled={!chatInput.trim() || isChatProcessing}
            className="min-h-[44px] px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-600 text-slate-200 border border-slate-700 rounded-xl transition shadow-xs self-end mb-1 cursor-pointer flex items-center justify-center"
            title="ارسال پیام • Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
