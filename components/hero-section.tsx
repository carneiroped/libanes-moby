"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Building2 } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export function HeroSection() {

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/30 py-16 md:py-20 lg:py-24">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="flex flex-col gap-4 md:gap-6 text-center lg:text-left">
            <div>
              <span className="inline-block px-2 md:px-3 py-1 text-xs md:text-sm font-medium rounded-full bg-[#4A9850]/10 text-[#4A9850] mb-3 md:mb-4">
                Inteligência Artificial para Imobiliárias
              </span>
              <h1 className="font-bold tracking-tight">
                <span className="text-[#4A9850] text-3xl md:text-4xl lg:text-5xl">Moby:</span>{" "}
                <span className="text-2xl md:text-3xl lg:text-4xl">Aumente em até 35% as Vendas. Atendimento Omnichanel Ininterrupto.</span>{" "}
                <span className="text-[#4A9850] text-3xl md:text-4xl lg:text-5xl">Fim das Perdas.</span>
              </h1>
            </div>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
            Transformamos o desafio de gerenciar múltiplos canais de atendimento em oportunidades reais de negócio com Inteligência Artificial.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start mt-2">
              <Link href="/demo">
                <Button size="lg" className="bg-[#4A9850] hover:bg-[#3d7e42] text-white w-full sm:w-auto text-sm md:text-base">
                  Experimente o Moby <ArrowRight className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 mt-2 md:mt-3 text-center sm:text-left justify-items-center sm:justify-items-start">
              <div className="flex items-center gap-2">
                <div className="bg-[#4A9850]/10 p-1.5 md:p-2 rounded-full">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="#4A9850" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-xs md:text-sm font-medium">Atendimento instantâneo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-[#4A9850]/10 p-1.5 md:p-2 rounded-full">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="#4A9850" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-xs md:text-sm font-medium">Até 35% de crescimento em vendas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-[#4A9850]/10 p-1.5 md:p-2 rounded-full">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="#4A9850" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-xs md:text-sm font-medium">Tratamento dos Leads frios</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-[#4A9850]/10 p-1.5 md:p-2 rounded-full">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="#4A9850" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-xs md:text-sm font-medium">Dashboard Analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-[#4A9850]/10 p-1.5 md:p-2 rounded-full">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="#4A9850" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-xs md:text-sm font-medium">Solução otimizada com dados exclusivos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-[#4A9850]/10 p-1.5 md:p-2 rounded-full">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="#4A9850" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-xs md:text-sm font-medium">Segurança e conformidade com a LGPD</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="relative rounded-xl overflow-hidden shadow-2xl border border-border">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#4A9850]/20 to-transparent z-10"></div>
              <Image 
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                alt="Moby AI Assistant Demo" 
                width={600}
                height={400}
                className="w-full h-auto object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 md:p-6 z-20">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#4A9850] flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 md:p-3 max-w-xs">
                      <p className="text-white text-xs md:text-sm">Olá! Sou o Moby, assistente virtual da Imobiliária IAnovar. Como posso ajudar na busca pelo seu imóvel ideal?</p>
                    </div>
                    <div className="bg-[#4A9850]/90 backdrop-blur-sm rounded-lg p-2 md:p-3 self-start">
                      <p className="text-white text-xs md:text-sm">Estou procurando um apartamento de 2 quartos na zona sul.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 -z-10 w-full h-full rounded-xl bg-[#4A9850]/20"></div>
          </div>
        </div>
      </div>
    </section>
  );
}