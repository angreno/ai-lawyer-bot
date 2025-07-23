import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, Paperclip, X, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import MessageBubble from "./MessageBubble";
import { motion } from "framer-motion";

// ✨ FIX: Corrected the import path to your api.ts file
import { queryBot, sendImageQuery } from "@/services/api";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  file?: File;
}

interface ChatInterfaceProps {
  initialMessage?: string;
}

const ChatInterface = ({
  initialMessage = "Hello! I'm the Building Safety Act Bot. How can I help you today?",
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: initialMessage,
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !selectedFile) return;

    // --- Display user message immediately ---
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue || `Uploaded file: ${selectedFile?.name}`,
      sender: "user",
      timestamp: new Date(),
      file: selectedFile || undefined,
    };
    setMessages((prev) => [...prev, userMessage]);

    // --- Reset inputs and set typing indicator ---
    const currentInputValue = inputValue;
    const currentSelectedFile = selectedFile;
    setInputValue("");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsTyping(true);

    try {
      let botAnswer = "";

      // --- CRITICAL LOGIC: Route to the correct API function ---
      if (currentSelectedFile) {
        // If a file is attached, use the image/document query function
        botAnswer = await sendImageQuery(currentSelectedFile, currentInputValue);
      } else {
        // Otherwise, use the standard text query function
        const historyForApi = messages.map((m) => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.content,
        }));
        botAnswer = await queryBot(currentInputValue, historyForApi);
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botAnswer || "❗ Sorry, I couldn't generate a response.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content: `⚠️ An error occurred: ${error instanceof Error ? error.message : String(error)}`,
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };


  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const navigateHome = () => {
    window.location.href = "/";
  };

  // --- The rest of your component's JSX remains the same ---
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
       <header className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Button
              onClick={navigateHome}
              variant="ghost"
              size="sm"
              className="mr-4 text-slate-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <div className="flex items-center">
              <motion.div initial={{ rotate: -10 }} animate={{ rotate: 0 }} transition={{ duration: 0.5 }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </motion.div>
              <h1 className="text-xl font-semibold text-white">Building Safety Act Bot</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex justify-center items-center p-4">
        <div className="flex flex-col w-full max-w-4xl h-[700px] bg-slate-800/50 border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden glass-effect backdrop-blur-sm">
          <div className="p-4 border-b border-slate-700/50 bg-slate-800/30">
            <h2 className="text-xl font-semibold text-white">Ask me anything</h2>
            <p className="text-sm text-slate-300">about building safety regulations</p>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-slate-900/30">
            <div className="space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <MessageBubble
                    message={message.content}
                    isBot={message.sender === "bot"}
                    timestamp={message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  />
                  {message.file && (
                    <div className="ml-12 mt-2">
                      <div className="bg-slate-700/50 border border-slate-600/50 rounded-lg p-3 max-w-xs">
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-300 truncate">{message.file.name}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {(message.file.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center space-x-2 ml-2">
                  <Card className="p-3 inline-flex items-center space-x-2 bg-slate-700/50 border-slate-600/50">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                    <span className="text-sm text-slate-300">Bot is typing...</span>
                  </Card>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {selectedFile && (
            <div className="px-4 py-2 border-t border-slate-700/50 bg-slate-800/30">
              <div className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300">{selectedFile.name}</span>
                  <span className="text-xs text-slate-400">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <Button
                  onClick={removeSelectedFile}
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
            <div className="flex space-x-2">
              <div className="flex items-end">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="sm"
                  className="mb-1 mr-2"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message here..."
                className="min-h-[50px] resize-none flex-1 text-white placeholder-slate-400 bg-slate-800"
                rows={1}
              />
              <Button
                onClick={handleSendMessage}
                disabled={(!inputValue.trim() && !selectedFile) || isTyping}
                className="flex-shrink-0"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;