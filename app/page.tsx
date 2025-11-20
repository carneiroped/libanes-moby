'use client';

import React from 'react';
import LandingPage from './landing/page';

export default function Home() {
  // Renderiza diretamente o componente da landing page, evitando o redirecionamento
  return <LandingPage />;
}
