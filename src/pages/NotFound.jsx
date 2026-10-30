import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#0F766E]/15 border border-[#0F766E]/30 text-[#0F766E] dark:text-[#2DD4BF] flex items-center justify-center mb-4 shadow-xs">
        <HeartHandshake className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-[#132226] dark:text-[#F4F7F6] font-heading">404 - Page Not Found</h1>
      <p className="text-sm text-[#5A7178] dark:text-[#9DB4BA] mt-2 max-w-sm">
        The page you are looking for does not exist or has been relocated within the clinic network.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#0D9488] dark:hover:bg-[#0F766E] text-[#F4F7F6] text-xs font-semibold rounded-xl transition-colors shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Home
      </Link>
    </div>
  );
}
