import React from "react";
import HeroSection from "./HeroSection";
import { motion } from "framer-motion";

const HomePage = () => {
  const navigateToChat = () => {
    window.location.href = "/chat";
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 0.5 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-blue-600 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </motion.div>
            <h1 className="text-xl font-semibold text-white">
              Building Safety Act Bot
            </h1>
          </div>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <a
                  href="#"
                  className="text-slate-300 hover:text-blue-400 transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  className="text-slate-300 hover:text-blue-400 transition-colors"
                >
                  About
                </a>
              </li>
              <li>
                <button
                  onClick={navigateToChat}
                  className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                >
                  Chat Now
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <HeroSection onChatClick={navigateToChat} />

        <section id="about" className="py-24 bg-slate-800">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-4xl font-bold text-white mb-8 text-center">
                About the Building Safety Act
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                {/* Left column - Background */}
                <div className="prose prose-lg text-slate-300">
                  <h3 className="text-2xl font-semibold text-white mb-4">
                    Background
                  </h3>
                  <p>
                    The Building Safety Act 2022 introduces significant changes
                    to the regulatory framework for building safety in England.
                    It was created in response to the Grenfell Tower tragedy and
                    aims to improve building safety standards.
                  </p>
                  <p>
                    The Act establishes a new regulatory regime for higher-risk
                    buildings, introduces a Building Safety Regulator, and
                    creates new duties for those responsible for building
                    safety.
                  </p>
                </div>

                {/* Right column - Key Features */}
                <div className="prose prose-lg text-slate-300">
                  <h3 className="text-2xl font-semibold text-white mb-4">
                    Key Features
                  </h3>
                  <ul className="space-y-2">
                    <li>• New Building Safety Regulator</li>
                    <li>• Enhanced duties for Accountable Persons</li>
                    <li>• Golden Thread of Information requirements</li>
                    <li>• Stronger enforcement powers</li>
                    <li>• Resident engagement obligations</li>
                    <li>• Gateway process for higher-risk buildings</li>
                  </ul>
                </div>
              </div>

              {/* Bot Help Section */}
              <div className="bg-slate-700/50 rounded-xl p-8 glass-effect">
                <h3 className="text-2xl font-semibold text-white mb-4 text-center">
                  How Our Bot Helps
                </h3>
                <p className="text-slate-300 text-center text-lg leading-relaxed">
                  Our Building Safety Act Bot is designed to help you navigate
                  these complex regulations, providing clear guidance and
                  answering your specific questions about compliance and
                  responsibilities. Whether you're a building owner, manager, or
                  resident, our AI-powered assistant can help clarify your
                  duties and obligations under the new legislation.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-8 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Building Safety Act Bot. All
              rights reserved.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
