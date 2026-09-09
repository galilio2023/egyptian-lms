"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Send, Volume2 } from "lucide-react";
import { toast } from "sonner";

interface BusyBeeAiTutorProps {
  lessonTitle: string;
  unitTitle: string;
  studentName?: string;
}

interface Message {
  id: string;
  sender: "bee" | "student";
  text: string;
  suggestedFollowUps?: string[];
  timestamp: string;
}

export function BusyBeeAiTutor({
  lessonTitle,
  unitTitle,
  studentName = "يا بطل",
}: BusyBeeAiTutorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messageSeqRef = useRef(0);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bee",
      text: `أهلاً يا ${studentName}! 🐝 أنا النحلة النشيطة Busy Bee، رفيقتك الذكية في درس "${lessonTitle}". اسألني أي حاجة مش فاهمها في الكلمات أو القواعد وهشرحهالك ببساطة! 🌟`,
      suggestedFollowUps: [
        "ازاي أنطق كلمات الدرس دي صح؟ 🎙️",
        "اشرح لي قاعدة الدرس ده ببساطة 📚",
        "اسألني سؤال سريع اختبرني! 💡",
      ],
      timestamp: "الآن",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
      return () => window.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  const speakArabicOrEnglish = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = /[\u0600-\u06FF]/.test(text) ? "ar-EG" : "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || isLoading) return;

    messageSeqRef.current += 1;
    const userMessageId = `user-${messageSeqRef.current}`;
    setMessages((prev) => [
      ...prev,
      {
        id: userMessageId,
        sender: "student",
        text: textToSend,
        timestamp: "الآن",
      },
    ]);
    setInputQuery("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: textToSend,
          lessonTitle,
          unitTitle,
          studentName,
          chatHistory: messages.slice(-6).map((m) => ({
            role: m.sender === "student" ? "user" : "model",
            content: m.text,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "تعذر الحصول على رد.");
      }

      messageSeqRef.current += 1;
      const beeMessageId = `bee-${messageSeqRef.current}`;
      setMessages((prev) => [
        ...prev,
        {
          id: beeMessageId,
          sender: "bee",
          text: data.reply,
          suggestedFollowUps: data.suggestedFollowUps,
          timestamp: "الآن",
        },
      ]);
    } catch {
      toast.error("تعذر الاتصال بالنحلة النشيطة حالياً.");
      messageSeqRef.current += 1;
      const errMessageId = `err-${messageSeqRef.current}`;
      setMessages((prev) => [
        ...prev,
        {
          id: errMessageId,
          sender: "bee",
          text: "معلش يا بطل، شبكة الخلية ضعيفة شوية! 🐝 حاول تسألني كمان شوية وهكون جاهزة أساعدك!",
          timestamp: "الآن",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Mascot Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 start-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-slate-950 font-black shadow-2xl hover:scale-105 active:scale-95 transition-all border-2 border-white/60 group cursor-pointer"
        aria-label="المساعد الذكي النحلة النشيطة"
      >
        <span className="text-2xl animate-bounce group-hover:rotate-12 transition-transform">
          🐝
        </span>
        <div className="text-start leading-tight">
          <span className="block text-xs font-black text-amber-950">اسأل النحلة النشيطة</span>
          <span className="block text-[10px] text-amber-900 font-bold opacity-80">المعلم الذكي للدرس ✨</span>
        </div>
      </button>

      {/* Drawer / Modal Interface */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-label="مساعد الدرس الذكي النحلة النشيطة"
        >
          <div className="w-full sm:max-w-md h-[85vh] sm:h-[600px] flex flex-col bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-amber-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 flex items-center justify-between text-amber-950">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl animate-pulse" aria-hidden="true">🐝</span>
                <div>
                  <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                    <span>النحلة النشيطة Busy Bee</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/60 text-amber-900 font-bold">
                      مساعد الدرس الذكي
                    </span>
                  </h3>
                  <p className="text-[11px] text-amber-950 font-medium truncate max-w-[220px]">
                    {lessonTitle}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/40 hover:bg-white/70 flex items-center justify-center text-slate-900 transition-colors cursor-pointer min-h-[44px] min-w-[44px]"
                aria-label="إغلاق المساعد الذكي"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-gradient-to-b from-amber-50/40 to-slate-50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "student" ? "items-start" : "items-end"}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed font-medium shadow-sm relative ${
                      msg.sender === "student"
                        ? "bg-purple-600 text-white rounded-br-none"
                        : "bg-white text-slate-900 border border-amber-200 rounded-bl-none"
                    }`}
                  >
                    {msg.sender === "bee" && (
                      <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-amber-100">
                        <span className="font-black text-[11px] text-amber-700 flex items-center gap-1">
                          <span>Busy Bee</span> 🐝
                        </span>
                        <button
                          type="button"
                          onClick={() => speakArabicOrEnglish(msg.text)}
                          className="text-amber-600 hover:text-amber-800 p-0.5 rounded transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                          title="استمع للإجابة بصوت واضح"
                        >
                          <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    )}
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>

                  {/* Follow-up Quick Chips */}
                  {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 justify-end max-w-[90%]">
                      {msg.suggestedFollowUps.map((chip, idx) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleSend(chip)}
                          className="px-2.5 py-1 rounded-full bg-amber-100/80 hover:bg-amber-200/90 text-amber-900 text-[10px] font-bold border border-amber-300/60 transition-all text-end cursor-pointer disabled:opacity-50 min-h-[44px]"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-end gap-2 text-xs text-amber-800 font-bold animate-pulse">
                  <span>🐝 النحلة النشيطة تفكر في الإجابة...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-amber-200 flex items-center gap-2">
              <input
                type="text"
                aria-label="اسأل النحلة النشيطة عن كلمة أو قاعدة في الدرس"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="اسأل النحلة عن كلمة أو قاعدة في الدرس..."
                className="flex-1 min-h-[44px] py-2 px-3.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300/40 text-base sm:text-xs text-slate-800 transition-all placeholder:text-slate-400"
              />

              <button
                type="button"
                onClick={() => handleSend()}
                disabled={isLoading || !inputQuery.trim()}
                className="p-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition-colors disabled:opacity-40 cursor-pointer shadow-sm min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="إرسال السؤال"
              >
                <Send className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
