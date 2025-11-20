'use client';

import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface LogoProps {
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LogoMoby({ href = '/', size = 'md', className = '' }: LogoProps) {
  const { resolvedTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Avoid hydration mismatch by rendering only after component is mounted
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Determine if dark theme is active
  const isDark = mounted && (
    resolvedTheme === 'dark' || 
    (resolvedTheme === undefined && theme === 'dark') || 
    (theme === 'system' && window?.matchMedia?.('(prefers-color-scheme: dark)')?.matches)
  );
  
  // Define sizes based on the size parameter
  const sizes = {
    sm: { width: 90, height: 30 },
    md: { width: 120, height: 40 },
    lg: { width: 160, height: 53 },
  };
  
  const { width, height } = sizes[size];

  // If not mounted yet, return an empty div with the same dimensions to prevent layout shift
  if (!mounted) {
    return <div style={{ width, height }} className={`${className}`} />;
  }

  const logoContent = (
    <div className={`relative ${className} pt-1`}>
      <Image
        src={isDark ? '/images/logo-dark.png' : '/images/logo-light.png'}
        alt="Moby"
        width={width}
        height={height}
        priority
        className="object-contain transition-all duration-300"
        onLoad={(e) => {
          // Add subtle animation when the image loads
          (e.target as HTMLImageElement).style.opacity = '1';
        }}
        style={{ opacity: 0.95 }}
      />
    </div>
  );

  if (href) {
    return <Link href={href}>{logoContent}</Link>;
  }

  return logoContent;
}