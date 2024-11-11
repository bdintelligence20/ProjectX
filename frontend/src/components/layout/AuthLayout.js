import React from 'react';
import { Card } from '@/components/ui/card';

const AuthLayout = ({ children, quote = { 
  title: "Get Everything You Want", 
  subtitle: "You can get everything you want if you work hard, trust the process, and stick to the plan." 
} }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-900 via-pink-600 to-blue-500 p-4 sm:p-8">
      <Card className="w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl flex">
        {/* Left Panel - Quote */}
        <div className="hidden md:flex md:w-1/2 bg-black text-white p-12 flex-col justify-between relative overflow-hidden">
          {/* Animated gradient background */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500"
            style={{
              backgroundSize: '400% 400%',
              animation: 'gradient 15s ease infinite',
            }}
          />
          
          <style jsx>{`
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
      </Card>
    </div>
  );
};

export default AuthLayout;