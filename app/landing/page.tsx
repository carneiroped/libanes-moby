'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Componente 3D - Cubo girando
const Cube3D = () => (
  <div className="relative w-64 h-64 sm:w-96 sm:h-96 md:w-[500px] md:h-[500px] perspective">
    {/* Logo Moby clicável no centro */}
    <Link href="/admin/dashboard" className="absolute inset-0 flex items-center justify-center z-10">
      <Image 
        src="/images/logo-light.png" 
        alt="Moby" 
        width={300}
        height={300} 
        className="w-40 h-40 sm:w-56 sm:h-56 md:w-72 md:h-72 object-contain cursor-pointer hover:scale-105 transition-transform duration-300"
        priority
      />
    </Link>
    
    {/* Cubo girando em volta do logo */}
    <div className="cube-3d absolute inset-0 w-full h-full">
      {/* Faces do cubo com transparência verde */}
      <div className="absolute top-0 left-0 w-full h-full border-2 border-green-500/30 rounded-xl bg-green-500/5 backdrop-blur-sm transform translate-z-40"></div>
      <div className="absolute top-0 left-0 w-full h-full border-2 border-green-500/20 rounded-xl bg-green-500/5 backdrop-blur-sm transform -translate-z-40"></div>
      <div className="absolute top-0 left-0 w-full h-full border-2 border-green-500/10 rounded-xl bg-green-500/5 backdrop-blur-sm transform translate-x-40"></div>
      <div className="absolute top-0 left-0 w-full h-full border-2 border-green-500/10 rounded-xl bg-green-500/5 backdrop-blur-sm transform -translate-x-40"></div>
      <div className="absolute top-0 left-0 w-full h-full border-2 border-green-500/10 rounded-xl bg-green-500/5 backdrop-blur-sm transform translate-y-40"></div>
      <div className="absolute top-0 left-0 w-full h-full border-2 border-green-500/10 rounded-xl bg-green-500/5 backdrop-blur-sm transform -translate-y-40"></div>
    </div>
  </div>
);

export default function LandingPage() {
  useEffect(() => {
    // Força o fundo cinza escuro neutro ao montar o componente
    document.body.style.backgroundColor = '#262626'; // neutral-800
    document.documentElement.style.backgroundColor = '#262626'; // neutral-800

    // Remove qualquer classe ou estilo que possa interferir
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');

    // Força remoção de qualquer background padrão
    document.body.classList.add('landing-page');

    return () => {
      // Limpa ao desmontar
      document.body.style.backgroundColor = '';
      document.documentElement.style.backgroundColor = '';
      document.body.classList.remove('landing-page');
    };
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: '#262626' }}>
      <div className="text-center">
        {/* Cubo 3D com logo */}
        <Cube3D />
      </div>
    </div>
  );
}