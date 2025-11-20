'use client';

import React from 'react';
import { Ship } from 'lucide-react';
import Link from 'next/link';

const Logo: React.FC = () => {
  return (
    <Link href="/" className="flex items-center space-x-2 group">
      <div className="relative">
        <Ship className="w-7 h-7 sm:w-8 sm:h-8 text-accent transition-all duration-300 group-hover:text-accent-light" />
        <div className="absolute inset-0 bg-accent/10 rounded-full scale-110 animate-pulse-slow"></div>
      </div>
      <span className="text-lg sm:text-xl font-bold tracking-tight">
        <span className="text-gradient">Moby</span>
      </span>
    </Link>
  );
};

export default Logo;