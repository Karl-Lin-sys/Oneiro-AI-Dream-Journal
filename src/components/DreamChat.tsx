import { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
import { motion } from "motion/react";
import { Send, User, Bot, Loader2 } from "lucide-react";
import { createDreamChatSession } from "../services/geminiService";

interface DreamChatProps {
  transcription: string;
  interpretation: string;
}

interface Message {
  id: string;
  role: "user" | "model";
  text: string;
}

export function DreamChat({ transcription, interpretation }: DreamChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "model",
      text: "I am ready to explore the symbols and themes of your dream further. What specific elements would you like to discuss?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat session
    chatSessionRef.current = createDreamChatSession(transcription, interpretation);
  }, [transcription, interpretation]);

  useEffect(() => {
    // Scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: input.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await chatSessionRef.current.sendMessage({ message: userMsg.text });
      
      const modelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: response.text || "I'm not sure how to interpret that.",
      };
      
      setMessages((prev) => [...prev, modelMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: "I'm sorry, I encountered an error while trying to respond. Please try again.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="glass-panel max-w-4xl mx-auto flex flex-col h-[600px] mt-8">
      <div className="p-4 border-b border-purple-500/20">
        <h2 className="text-xl font-serif text-white flex items-center gap-2">
          <Bot className="w-5 h-5 text-purple-400" />
          Dream Analyst
        </h2>
        <p className="text-sm text-purple-200/60">Ask follow-up questions about your dream</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === "user" ? "bg-purple-600" : "bg-purple-500/20 border border-purple-500/50"
            }`}>
              {msg.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-purple-400" />}
            </div>
            
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              msg.role === "user" 
                ? "bg-purple-600 text-white rounded-tr-none" 
                : "bg-black/40 border border-purple-500/20 text-purple-50 rounded-tl-none"
            }`}>
              {msg.role === "user" ? (
                <p>{msg.text}</p>
              ) : (
                <div className="markdown-body text-sm">
                  <Markdown>{msg.text}</Markdown>
                </div>
              )}
            </div>
          </motion.div>
        ))}
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4"
          >
            <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-purple-400" />
            </div>
            <div className="bg-black/40 border border-purple-500/20 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
              <span className="text-sm text-purple-200/60">Analyzing...</span>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-purple-500/20">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a specific symbol..."
            disabled={isTyping}
            className="flex-1 bg-black/50 border border-purple-500/30 rounded-full px-6 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5 text-white ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
