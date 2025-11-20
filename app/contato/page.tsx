'use client';

import React from 'react';
import PageTransition from '@/components/landing/page-transition';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <PageTransition>
      <div className="container mx-auto px-4 pt-28 pb-20">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center">
          Entre em <span className="text-gradient">Contato</span>
        </h1>
        
        <p className="text-gray-300 text-center max-w-2xl mx-auto mb-12">
          Estamos prontos para ajudar a transformar o seu negócio imobiliário com nossa tecnologia de ponta.
        </p>
        
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 mb-12">
          <div className="dark-glass rounded-xl p-6 border border-gray-700 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-gray-850 flex items-center justify-center mb-4 shadow-neon">
              <Mail className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-medium mb-2">Email</h3>
            <p className="text-gray-400 mb-4">Resposta em até 24h</p>
            <a href="mailto:contato@moby.casa" className="text-accent hover:text-accent-light transition-colors">
              contato@moby.casa
            </a>
          </div>
          
          <div className="dark-glass rounded-xl p-6 border border-gray-700 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-gray-850 flex items-center justify-center mb-4 shadow-neon">
              <Phone className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-medium mb-2">Telefone</h3>
            <p className="text-gray-400 mb-4">Seg-Sex, 9h às 18h</p>
            <a href="tel:+5511999999999" className="text-accent hover:text-accent-light transition-colors">
              +55 (11) 99999-9999
            </a>
          </div>
          
          <div className="dark-glass rounded-xl p-6 border border-gray-700 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-gray-850 flex items-center justify-center mb-4 shadow-neon">
              <MapPin className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-medium mb-2">Endereço</h3>
            <p className="text-gray-400 mb-4">Visite-nos</p>
            <address className="text-accent not-italic">
              Av. Paulista, 1000<br />
              São Paulo, SP
            </address>
          </div>
        </div>
        
        <div className="max-w-3xl mx-auto dark-glass rounded-xl p-8 border border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-center">Envie-nos uma mensagem</h2>
          
          <form>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                  Nome <span className="text-accent">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  className="w-full px-4 py-3 bg-gray-850 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email <span className="text-accent">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full px-4 py-3 bg-gray-850 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
                  required
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1">
                Assunto <span className="text-accent">*</span>
              </label>
              <input
                id="subject"
                type="text"
                className="w-full px-4 py-3 bg-gray-850 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                Mensagem <span className="text-accent">*</span>
              </label>
              <textarea
                id="message"
                rows={5}
                className="w-full px-4 py-3 bg-gray-850 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
                required
              ></textarea>
            </div>
            
            <button
              type="submit"
              className="px-6 py-3 bg-accent hover:bg-accent-light text-white rounded-md shadow-neon transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Enviar Mensagem
            </button>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}