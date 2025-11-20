'use client';

import React from 'react';
import Link from 'next/link';
import Logo from './logo';
import { Github, Twitter, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-800 mt-16 sm:mt-20 pt-12 sm:pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-4 col-span-2 sm:col-span-2 md:col-span-1">
            <Logo />
            <p className="text-gray-400 text-sm mt-4">
              Revolucionando o mercado imobiliário com inteligência artificial avançada e análise preditiva.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-gray-400 hover:text-accent transition-colors" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-accent transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-accent transition-colors" aria-label="GitHub">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">Produto</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-accent text-sm transition-colors">Visão Geral</Link></li>
              <li><Link href="/" className="text-gray-400 hover:text-accent text-sm transition-colors">Funcionalidades</Link></li>
              <li><Link href="/calculadora-maturidade" className="text-gray-400 hover:text-accent text-sm transition-colors">Calculadora de Maturidade</Link></li>
              <li><Link href="/" className="text-gray-400 hover:text-accent text-sm transition-colors">Integrações</Link></li>
              <li><Link href="/" className="text-gray-400 hover:text-accent text-sm transition-colors">Preços</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">Suporte</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-accent text-sm transition-colors">Documentação</Link></li>
              <li><Link href="/" className="text-gray-400 hover:text-accent text-sm transition-colors">Tutoriais</Link></li>
              <li><Link href="/contato" className="text-gray-400 hover:text-accent text-sm transition-colors">Contato</Link></li>
              <li><Link href="/" className="text-gray-400 hover:text-accent text-sm transition-colors">FAQ</Link></li>
              <li><Link href="/" className="text-gray-400 hover:text-accent text-sm transition-colors">Status</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-accent text-sm transition-colors">Política de Privacidade</Link></li>
              <li><Link href="/" className="text-gray-400 hover:text-accent text-sm transition-colors">Termos de Serviço</Link></li>
              <li><Link href="/" className="text-gray-400 hover:text-accent text-sm transition-colors">LGPD</Link></li>
              <li><Link href="/" className="text-gray-400 hover:text-accent text-sm transition-colors">Segurança</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">&copy; {currentYear} Moby. Todos os direitos reservados.</p>
          <div className="mt-4 md:mt-0">
            <p className="text-gray-500 text-xs">Desenvolvido com <span className="text-accent">❤</span> no Brasil</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;