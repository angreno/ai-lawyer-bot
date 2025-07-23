import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import {
  ArrowRight,
  MessageCircle,
  Shield,
  Zap,
  Building2,
} from "lucide-react";

interface HeroSectionProps {
  onChatClick?: () => void;
}

interface Message {
  type: "bot" | "user";
  text: string;
}

const DynamicChatPreview = () => {
  const [currentConversation, setCurrentConversation] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);

  const conversations: { messages: Message[] }[] = [
    {
      messages: [
        { type: "bot", text: "Hello! How can I assist you with Building Safety Act?" },
        { type: "user", text: "What are the key provisions?" },
        { type: "bot", text: "Key provisions include:\n• Building Safety Regulator\n• Accountable Persons\n• Golden Thread of Information" },
      ],
    },
    {
      messages: [
        { type: "bot", text: "Hi there! Ready to learn about building safety?" },
        { type: "user", text: "Who is an Accountable Person?" },
        { type: "bot", text: "An Accountable Person is responsible for:\n• Building safety risks\n• Resident engagement\n• Safety case reports" },
      ],
    },
    {
      messages: [
        { type: "bot", text: "Welcome! I'm here to help with building regulations." },
        { type: "user", text: "What is the Golden Thread?" },
        { type: "bot", text: "The Golden Thread is:\n• Digital record of building info\n• Maintained throughout lifecycle\n• Accessible to residents" },
      ],
    },
  ];

  useEffect(() => {
    const convo = conversations[currentConversation];

    if (currentMessage < convo.messages.length) {
      const message = convo.messages[currentMessage];

      const timer = setTimeout(() => {
        if (message.type === "bot") {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            setDisplayedMessages((prev) => [...prev, message]);
            setCurrentMessage((prev) => prev + 1);
          }, 1500);
        } else {
          setDisplayedMessages((prev) => [...prev, message]);
          setCurrentMessage((prev) => prev + 1);
        }
      }, currentMessage === 0 ? 1000 : 2000);

      return () => clearTimeout(timer);
    } else {
      const reset = setTimeout(() => {
        setDisplayedMessages([]);
        setCurrentMessage(0);
        setCurrentConversation((prev) => (prev + 1) % conversations.length);
      }, 3000);

      return () => clearTimeout(reset);
    }
  }, [currentMessage, currentConversation]);

  return (
    <div className="p-6 space-y-4 bg-slate-800/30 min-h-[300px]">
      <AnimatePresence mode="wait">
        {displayedMessages.map((message, index) => (
          <motion.div
            key={`${currentConversation}-${index}`}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`p-4 rounded-2xl max-w-[85%] ${
              message.type === "bot"
                ? "bg-blue-600/20 text-blue-100 rounded-tl-md"
                : "bg-slate-700/50 text-slate-200 rounded-tr-md ml-auto"
            }`}
          >
            {message.text.includes("\n") ? (
              <div className="space-y-2">
                {message.text.split("\n").map((line, i) => (
                  <div key={i} className={i === 0 ? "" : "text-sm opacity-90"}>
                    {line}
                  </div>
                ))}
              </div>
            ) : (
              message.text
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {isTyping && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center gap-2 text-slate-400"
        >
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
          <span className="text-sm">Bot is typing...</span>
        </motion.div>
      )}
    </div>
  );
};

const HeroSection = ({ onChatClick = () => {} }: HeroSectionProps) => {
  const handleChatClick = () => {
    onChatClick();
  };

  const floatingElements = [
    { icon: Shield, delay: 0.2, x: "10%", y: "20%" },
    { icon: Building2, delay: 0.4, x: "85%", y: "15%" },
    { icon: Zap, delay: 0.6, x: "15%", y: "75%" },
    { icon: MessageCircle, delay: 0.8, x: "80%", y: "70%" },
  ];

  return (
    <section className="relative w-full min-h-screen bg-slate-900 overflow-hidden">
      {/* Background & Floating Elements */}
      <div className="absolute inset-0 gradient-mesh opacity-40"></div>

      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-20"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ y: [-20, 20, -20], opacity: [0.2, 0.5, 0.2] }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Floating Icons */}
      {floatingElements.map(({ icon: Icon, delay, x, y }, index) => (
        <motion.div
          key={index}
          className="absolute hidden lg:block"
          style={{ left: x, top: y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.1, scale: 1, rotate: [0, 360] }}
          transition={{
            delay,
            duration: 20,
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          }}
        >
          <Icon className="w-8 h-8 text-blue-300" />
        </motion.div>
      ))}

      {/* Hero Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Text */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col space-y-8 text-center lg:text-left"
            >
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/20 text-blue-300 text-sm font-medium mb-6 glass-effect">
                  <Shield className="w-4 h-4 mr-2" />
                  AI-Powered Building Safety Guidance
                </span>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
                  Building Safety Act
                  <span className="block text-gradient mt-2">Bot</span>
                </h1>
              </motion.div>

              <motion.p
                className="text-xl text-slate-300 max-w-2xl leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                An intelligent chatbot to help you understand and navigate the
                Building Safety Act. Get instant, accurate guidance tailored to
                your specific building safety questions.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button onClick={handleChatClick} size="lg" className="bg-slate-800/80 hover:bg-slate-700/90 text-white border border-slate-600/50 hover:border-blue-500/50 px-8 py-6 text-lg rounded-xl flex items-center gap-3 shadow-2xl hover:shadow-slate-500/25 transition-all duration-300 transform hover:scale-105 glass-effect">
                  <MessageCircle className="w-5 h-5" />
                  Let's Chat
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="lg" className="bg-slate-900/50 border-slate-500/50 text-slate-200 hover:bg-slate-800/70 hover:text-white hover:border-slate-400 px-8 py-6 text-lg rounded-xl transition-all duration-300 glass-effect backdrop-blur-sm">
                  <Shield className="w-5 h-5 mr-2" />
                  Learn More
                </Button>
              </motion.div>

              {/* Stats */}
              <motion.div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-700" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                {[
                  { number: "24/7", label: "Available" },
                  { number: "1000+", label: "Regulations" },
                  { number: "99%", label: "Accuracy" },
                ].map((stat, i) => (
                  <div key={i} className="text-center lg:text-left">
                    <div className="text-2xl font-bold text-white">{stat.number}</div>
                    <div className="text-sm text-slate-400">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Preview */}
            <motion.div
              className="relative hidden lg:block"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="relative">
                <motion.div className="relative w-full max-w-md mx-auto glass-effect rounded-2xl overflow-hidden shadow-2xl" whileHover={{ scale: 1.02 }}>
                  <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/30">
                        <Building2 className="w-4 h-4 text-blue-300" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-medium">Building Safety Act Bot</span>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                          <span className="text-xs text-slate-400">Online</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DynamicChatPreview />
                </motion.div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-xl"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent"></div>
    </section>
  );
};

export default HeroSection;
