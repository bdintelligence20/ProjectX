import React from 'react';

export default function AuthLayout({ children, quote = { 
  title: "Get Everything You Want", 
  subtitle: "You can get everything you want if you work hard, trust the process, and stick to the plan." 
} }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-900 via-pink-600 to-blue-500 p-4 sm:p-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
        {/* Left Panel - Quote */}
        <div className="hidden md:flex md:w-1/2 bg-black text-white p-12 flex-col justify-between relative overflow-hidden">
          {/* Animated gradient background */}
          <div 
            className="absolute inset-0 opacity-50"
            style={{
              background: 'linear-gradient(-45deg, #6366f1, #a855f7, #ec4899, #3b82f6)',
              backgroundSize: '400% 400%',
              animation: 'gradient 15s ease infinite',
            }}
          />
          
          <style>{`
            @keyframes gradient {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
          `}</style>
          
          {/* Content */}
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="uppercase tracking-wider text-sm font-medium text-gray-300">
              A Wise Quote
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-4 font-serif">
                {quote.title}
              </h1>
              <p className="text-sm text-gray-300">
                {quote.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Auth Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 bg-white">
          {children}
        </div>
      </div>
    </div>
  );
}