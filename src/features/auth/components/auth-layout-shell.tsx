import React from "react";

export interface AuthLayoutShellProps {
  children: React.ReactNode;
}

export const AuthLayoutShell: React.FC<AuthLayoutShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen text-slate-900 flex flex-col justify-center py-8 sm:py-12 px-3 sm:px-6 lg:px-8 relative overflow-hidden bg-purple-50/50">
      {/* Background Soft Gradients */}
      <div className="absolute top-10 start-1/4 w-96 h-96 bg-purple-300/25 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 end-1/4 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Container */}
      <div className="w-full max-w-5xl mx-auto relative rounded-[2.5rem] overflow-hidden border-2 border-purple-200/90 shadow-[0_20px_60px_rgba(139,92,246,0.18)] p-4 sm:p-8 lg:p-10">
        {/* Background Artwork */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-20 scale-105 transition-transform duration-1000"
          style={{ backgroundImage: "url('/images/auth-bg.jpg')" }}
        />
        
        {/* Soft Translucent Overlay */}
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px] -z-10 pointer-events-none" />

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
};
