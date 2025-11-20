'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LogIn } from 'lucide-react';
import { LogoMoby } from '@/components/ui/logo';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
      ${isScrolled ? 'py-3 dark-glass-strong shadow-md' : 'py-5 bg-transparent'}`}
    >
      <div className="container px-4 mx-auto flex justify-between items-center">
        <LogoMoby size="md" />

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
          <Link 
            href="/" 
            className={`text-sm font-medium hover:text-accent transition-colors ${pathname === '/' ? 'text-accent' : 'text-gray-300'}`}
          >
            Home
          </Link>
          <Link 
            href="/calculadora-maturidade" 
            className={`text-sm font-medium hover:text-accent transition-colors ${pathname === '/calculadora-maturidade' ? 'text-accent' : 'text-gray-300'}`}
          >
            Calculadora de Maturidade
          </Link>
          <Link 
            href="/contato" 
            className={`text-sm font-medium hover:text-accent transition-colors ${pathname === '/contato' ? 'text-accent' : 'text-gray-300'}`}
          >
            Contato
          </Link>
          
          <Link 
            href="/admin/dashboard" 
            className="flex items-center space-x-1 px-4 py-2 rounded-md bg-gray-850 border border-accent/20 hover:border-accent/50 transition-colors shadow-neon group"
          >
            <LogIn className="w-4 h-4 text-accent group-hover:text-accent-light transition-colors" />
            <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">Acessar Sistema</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-gray-300 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Abrir menu"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 dark-glass-strong shadow-lg py-4">
          <div className="container px-4 mx-auto flex flex-col space-y-4">
            <Link 
              href="/" 
              className={`text-sm font-medium py-2 hover:text-accent transition-colors ${pathname === '/' ? 'text-accent' : 'text-gray-300'}`}
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/calculadora-maturidade" 
              className={`text-sm font-medium py-2 hover:text-accent transition-colors ${pathname === '/calculadora-maturidade' ? 'text-accent' : 'text-gray-300'}`}
              onClick={() => setIsOpen(false)}
            >
              Calculadora de Maturidade
            </Link>
            <Link 
              href="/contato" 
              className={`text-sm font-medium py-2 hover:text-accent transition-colors ${pathname === '/contato' ? 'text-accent' : 'text-gray-300'}`}
              onClick={() => setIsOpen(false)}
            >
              Contato
            </Link>
            <Link 
              href="/admin/dashboard" 
              className="flex items-center space-x-1 px-4 py-2 rounded-md bg-gray-850 border border-accent/20 w-max"
              onClick={() => setIsOpen(false)}
            >
              <LogIn className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-gray-200">Acessar Sistema</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;