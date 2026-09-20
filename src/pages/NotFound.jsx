import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#2D6A4F]/15 border border-[#2D6A4F]/30 text-[#2D6A4F] dark:text-[#52B788] flex items-center justify-center mb-4 shadow-xs">
        <HeartHandshake className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-[#22291F] dark:text-[#F5F1EA] font-heading">404 - Page Not Found</h1>
      <p className="text-sm text-[#6B6B63] dark:text-[#9EAA9A] mt-2 max-w-sm">
        The page you are looking for does not exist or has been relocated within the clinic network.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 bg-[#2D6A4F] hover:bg-[#245740] text-[#FAF7F2] text-xs font-semibold rounded-xl transition-colors shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Home
      </Link>
    </div>
  );
}
