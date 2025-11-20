"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, CalendarCheck, BarChart3, Users, Building, Shield, Zap } from "lucide-react";
import Image from "next/image";

export function HowItWorks() {
  const [activeTab, setActiveTab] = useState("atendimento");

  return (
    <section className="py-8 md:py-12 bg-[#f9f7f2] dark:bg-muted/30" id="como-funciona">
      <div className="container">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">Como o Moby funciona</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
          Conheça os recursos tecnológicos que automatizam todo o ciclo de vendas imobiliárias com inteligência artificial
          </p>
        </div>

        <Tabs defaultValue="atendimento" className="w-full overflow-hidden" onValueChange={setActiveTab}>
          <div className="flex justify-center mb-8 md:mb-10">
            <div className="w-full max-w-5xl">
              <TabsList className="grid grid-cols-4 md:flex md:flex-wrap justify-center w-full gap-y-2 gap-x-2 md:gap-3 lg:gap-4 bg-transparent p-0">
                <TabsTrigger value="atendimento" className="flex-1 min-w-0 md:min-w-[80px] md:max-w-[130px] relative overflow-hidden border-b-2 border-transparent data-[state=active]:text-[#4A9850] data-[state=active]:border-[#4A9850] transition-all hover:bg-[#f9f7f2] rounded-t-lg h-[42px] md:h-auto">
                  <div className="flex flex-col items-center justify-center py-1 px-1">
                    <MessageSquare className="h-3.5 w-3.5 md:h-6 md:w-6 mb-0.5" />
                    <span className="text-[9px] md:text-xs font-medium truncate w-full text-center leading-none">Atendimento</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="qualificacao" className="flex-1 min-w-0 md:min-w-[80px] md:max-w-[130px] relative overflow-hidden border-b-2 border-transparent data-[state=active]:text-[#4A9850] data-[state=active]:border-[#4A9850] transition-all hover:bg-[#f9f7f2] rounded-t-lg h-[42px] md:h-auto">
                  <div className="flex flex-col items-center justify-center py-1 px-1">
                    <Users className="h-3.5 w-3.5 md:h-6 md:w-6 mb-0.5" />
                    <span className="text-[9px] md:text-xs font-medium truncate w-full text-center leading-none">Qualificação</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="agendamento" className="flex-1 min-w-0 md:min-w-[80px] md:max-w-[130px] relative overflow-hidden border-b-2 border-transparent data-[state=active]:text-[#4A9850] data-[state=active]:border-[#4A9850] transition-all hover:bg-[#f9f7f2] rounded-t-lg h-[42px] md:h-auto">
                  <div className="flex flex-col items-center justify-center py-1 px-1">
                    <CalendarCheck className="h-3.5 w-3.5 md:h-6 md:w-6 mb-0.5" />
                    <span className="text-[9px] md:text-xs font-medium truncate w-full text-center leading-none">Agendamento</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="analise" className="flex-1 min-w-0 md:min-w-[80px] md:max-w-[130px] relative overflow-hidden border-b-2 border-transparent data-[state=active]:text-[#4A9850] data-[state=active]:border-[#4A9850] transition-all hover:bg-[#f9f7f2] rounded-t-lg h-[42px] md:h-auto">
                  <div className="flex flex-col items-center justify-center py-1 px-1">
                    <BarChart3 className="h-3.5 w-3.5 md:h-6 md:w-6 mb-0.5" />
                    <span className="text-[9px] md:text-xs font-medium truncate w-full text-center leading-none">Análise</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="personalizacao" className="flex-1 min-w-0 md:min-w-[80px] md:max-w-[130px] relative overflow-hidden border-b-2 border-transparent data-[state=active]:text-[#4A9850] data-[state=active]:border-[#4A9850] transition-all hover:bg-[#f9f7f2] rounded-t-lg h-[42px] md:h-auto">
                  <div className="flex flex-col items-center justify-center py-1 px-1">
                    <Building className="h-3.5 w-3.5 md:h-6 md:w-6 mb-0.5" />
                    <span className="text-[9px] md:text-xs font-medium truncate w-full text-center leading-none">Personalização</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="seguranca" className="flex-1 min-w-0 md:min-w-[80px] md:max-w-[130px] relative overflow-hidden border-b-2 border-transparent data-[state=active]:text-[#4A9850] data-[state=active]:border-[#4A9850] transition-all hover:bg-[#f9f7f2] rounded-t-lg h-[42px] md:h-auto">
                  <div className="flex flex-col items-center justify-center py-1 px-1">
                    <Shield className="h-3.5 w-3.5 md:h-6 md:w-6 mb-0.5" />
                    <span className="text-[9px] md:text-xs font-medium truncate w-full text-center leading-none">Segurança</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="integracao" className="flex-1 min-w-0 md:min-w-[80px] md:max-w-[130px] relative overflow-hidden border-b-2 border-transparent data-[state=active]:text-[#4A9850] data-[state=active]:border-[#4A9850] transition-all hover:bg-[#f9f7f2] rounded-t-lg h-[42px] md:h-auto">
                  <div className="flex flex-col items-center justify-center py-1 px-1">
                    <Zap className="h-3.5 w-3.5 md:h-6 md:w-6 mb-0.5" />
                    <span className="text-[9px] md:text-xs font-medium truncate w-full text-center leading-none">Integração</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="multicanal" className="flex-1 min-w-0 md:min-w-[80px] md:max-w-[130px] relative overflow-hidden border-b-2 border-transparent data-[state=active]:text-[#4A9850] data-[state=active]:border-[#4A9850] transition-all hover:bg-[#f9f7f2] rounded-t-lg h-[42px] md:h-auto">
                  <div className="flex flex-col items-center justify-center py-1 px-1">
                    <MessageSquare className="h-3.5 w-3.5 md:h-6 md:w-6 mb-0.5" />
                    <span className="text-[9px] md:text-xs font-medium truncate w-full text-center leading-none">Multicanal</span>
                  </div>
                </TabsTrigger>
              </TabsList>
              
              <div className="w-full h-[1px] bg-gray-200 mt-2 mb-6 md:mb-8"></div>
            </div>
          </div>

          <div className="mt-12 md:mt-16">
            <TabsContent value="atendimento" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Atendimento automatizado 24/7</h3>
                  <p className="text-muted-foreground mb-4 md:mb-6 text-sm md:text-base">
                    O Moby atende seus clientes a qualquer hora do dia ou da noite, respondendo dúvidas, apresentando imóveis e coletando informações essenciais para qualificação.
                  </p>
                  <ul className="space-y-3 md:space-y-4">
                    <li className="flex gap-3">
                      <div className="bg-[#4A9850]/10 p-1.5 md:p-2 rounded-full h-min">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="#4A9850" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm md:text-base">Respostas instantâneas</h4>
                        <p className="text-xs md:text-sm text-muted-foreground">Sem tempo de espera, seus clientes recebem atenção imediata</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="bg-[#4A9850]/10 p-1.5 md:p-2 rounded-full h-min">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="#4A9850" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm md:text-base">Personalização avançada</h4>
                        <p className="text-xs md:text-sm text-muted-foreground">Comunicação adaptada ao perfil e necessidades de cada cliente</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="bg-[#4A9850]/10 p-1.5 md:p-2 rounded-full h-min">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="#4A9850" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm md:text-base">Integração com WhatsApp, Site e Redes Sociais</h4>
                        <p className="text-xs md:text-sm text-muted-foreground">Atendimento diversificado e personalizado</p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="order-1 lg:order-2 relative">
                  <div className="relative rounded-xl overflow-hidden shadow-lg border border-border aspect-[4/3]">
                    <Image 
                      src="/images/atendimento-automatizado.jpg" 
                      alt="Atendimento automatizado" 
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority
                      className="object-cover"
                      quality={85}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 md:p-6 z-20">
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#4A9850] flex items-center justify-center flex-shrink-0">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 md:p-3 max-w-xs">
                            <p className="text-white text-xs md:text-sm"> Temos otimas opções em apartamento na zona sul, como prefere ver esses imóveis, posso enviar as fotos por aqui!</p>
                          </div>
                          <div className="bg-[#4A9850]/90 backdrop-blur-sm rounded-lg p-2 md:p-3 self-start">
                            <p className="text-white text-xs md:text-sm">Sim, gostaria sim.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-3 -right-3 md:-bottom-4 md:-right-4 -z-10 w-full h-full rounded-xl bg-[#4A9850]/20"></div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="qualificacao" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Qualificação inteligente de leads</h3>
                  <p className="text-muted-foreground mb-4 md:mb-6 text-sm md:text-base">
                    O Moby identifica o perfil, necessidades e potencial de cada lead, priorizando os mais qualificados para sua equipe de vendas.
                  </p>
                  <ul className="space-y-3 md:space-y-4">
                    <li className="flex gap-3">
                      <div className="bg-[#4A9850]/10 p-1.5 md:p-2 rounded-full h-min">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="#4A9850" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm md:text-base">Análise de intenção</h4>
                        <p className="text-xs md:text-sm text-muted-foreground">Identifica o real interesse e urgência do cliente</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="bg-[#4A9850]/10 p-1.5 md:p-2 rounded-full h-min">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="#4A9850" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm md:text-base">Coleta de dados estratégicos</h4>
                        <p className="text-xs md:text-sm text-muted-foreground">Obtém informações relevantes de forma natural na conversa</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="bg-[#4A9850]/10 p-1.5 md:p-2 rounded-full h-min">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="#4A9850" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm md:text-base">Scoring automático</h4>
                        <p className="text-xs md:text-sm text-muted-foreground">Classifica leads por potencial de conversão</p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="order-1 lg:order-2 relative">
                  <div className="relative rounded-xl overflow-hidden shadow-lg border border-border aspect-[4/3]">
                    <Image 
                      src="/images/agendamento.jpg" 
                      alt="Qualificação de leads" 
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                      quality={85}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 md:p-6 z-20">
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#4A9850] flex items-center justify-center flex-shrink-0">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 md:p-3 max-w-xs">
                            <p className="text-white text-xs md:text-sm">Para ajudar a encontrar o imóvel ideal, poderia me dizer qual sua faixa de preço e se prefere financiamento ou pagamento à vista?</p>
                          </div>
                          <div className="bg-[#4A9850]/90 backdrop-blur-sm rounded-lg p-2 md:p-3 self-start">
                            <p className="text-white text-xs md:text-sm">Estou pensando em imóveis até R$ 650 mil e pretendo financiar pelo banco. Minha entrada seria de 30%.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-3 -right-3 md:-bottom-4 md:-right-4 -z-10 w-full h-full rounded-xl bg-[#4A9850]/20"></div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="agendamento" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Agendamento automático de visitas</h3>
                  <p className="text-muted-foreground mb-4 md:mb-6 text-sm md:text-base">
                    O Moby agenda visitas diretamente na agenda dos corretores, otimizando o tempo da sua equipe e acelerando o processo de vendas.
                  </p>
                  <ul className="space-y-3 md:space-y-4">
                    <li className="flex gap-3">
                      <div className="bg-[#4A9850]/10 p-1.5 md:p-2 rounded-full h-min">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="#4A9850" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm md:text-base">Sincronização com calendários</h4>
                        <p className="text-xs md:text-sm text-muted-foreground">Integração com Google Calendar e outros sistemas</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="bg-[#4A9850]/10 p-1.5 md:p-2 rounded-full h-min">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="#4A9850" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm md:text-base">Confirmações automáticas</h4>
                        <p className="text-xs md:text-sm text-muted-foreground">Lembretes e confirmações para reduzir no-shows</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="bg-[#4A9850]/10 p-1.5 md:p-2 rounded-full h-min">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="#4A9850" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm md:text-base">Reagendamento inteligente</h4>
                        <p className="text-xs md:text-sm text-muted-foreground">Gerencia alterações e cancelamentos sem intervenção humana</p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="order-1 lg:order-2 relative">
                  <div className="relative rounded-xl overflow-hidden shadow-lg border border-border aspect-[4/3]">
                    <Image 
                      src="/images/agendamento-visitas-novo.jpg" 
                      alt="Agendamento de visitas" 
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                      quality={85}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 md:p-6 z-20">
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#4A9850] flex items-center justify-center flex-shrink-0">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 md:p-3 self-start">
                            <p className="text-white text-xs md:text-sm">Ótimo! Podemos agendar uma visita ao imóvel da Vila Mariana. A Imobiliária IAnovar tem horários disponíveis na quinta ou sexta.</p>
                          </div>
                          <div className="bg-[#4A9850]/90 backdrop-blur-sm rounded-lg p-2 md:p-3 self-start">
                            <p className="text-white text-xs md:text-sm">Sexta-feira às 15h seria perfeito! Pode confirmar para mim?</p>
                          </div>
                          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 md:p-3 self-start">
                            <p className="text-white text-xs md:text-sm">Confirmado sexta-feira às 15h no apartamento da Vila Mariana. Enviarei um lembrete no dia.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-3 -right-3 md:-bottom-4 md:-right-4 -z-10 w-full h-full rounded-xl bg-[#4A9850]/20"></div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analise" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Análise e insights de desempenho</h3>
                  <p className="text-muted-foreground mb-4 md:mb-6 text-sm md:text-base">
                    O Moby fornece análises detalhadas sobre o desempenho das conversas, taxas de conversão e oportunidades de melhoria.
                  </p>
                  <ul className="space-y-3 md:space-y-4">
                    <li className="flex gap-3">
                      <div className="bg-[#4A9850]/10 p-1.5 md:p-2 rounded-full h-min">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="#4A9850" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm md:text-base">Dashboard em tempo real</h4>
                        <p className="text-xs md:text-sm text-muted-foreground">Visualize métricas e KPIs importantes instantaneamente</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="bg-[#4A9850]/10 p-1.5 md:p-2 rounded-full h-min">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="#4A9850" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm md:text-base">Análise de sentimento</h4>
                        <p className="text-xs md:text-sm text-muted-foreground">Identifique a satisfação dos clientes nas interações</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="bg-[#4A9850]/10 p-1.5 md:p-2 rounded-full h-min">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="#4A9850" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm md:text-base">Relatórios personalizados</h4>
                        <p className="text-xs md:text-sm text-muted-foreground">Exporte dados e crie relatórios específicos para sua gestão</p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="order-1 lg:order-2 relative">
                  <div className="relative rounded-xl overflow-hidden shadow-lg border border-border aspect-[4/3]">
                    <Image 
                      src="/images/analise-desempenho.jpg" 
                      alt="Análise de desempenho" 
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover object-center"
                      quality={85}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 md:p-6 z-20">
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#4A9850] flex items-center justify-center flex-shrink-0">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 md:p-3 max-w-xs">
                            <p className="text-white text-xs md:text-sm">Análise completa: 78% dos seus leads buscam imóveis de 2-3 quartos na faixa de R$500-700 mil. Sugiro destacar mais esses imóveis no site da IAnovar.</p>
                          </div>
                          <div className="bg-[#4A9850]/90 backdrop-blur-sm rounded-lg p-2 md:p-3 self-start">
                            <p className="text-white text-xs md:text-sm">Excelente análise! Vamos ajustar nossa estratégia de marketing com base nesses dados.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-3 -right-3 md:-bottom-4 md:-right-4 -z-10 w-full h-full rounded-xl bg-[#4A9850]/20"></div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="personalizacao" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Personalização por imobiliária</h3>
                  <p className="text-muted-foreground mb-4 md:mb-6 text-sm md:text-base">
                    O Moby se adapta completamente à identidade e aos processos da sua imobiliária, mantendo a consistência da sua marca em todos os pontos de contato com clientes.
                  </p>
                  <ul className="space-y-3 md:space-y-4">
                    <li className="flex gap-3">
                      <div className="bg-[#4A9850]/10 p-1.5 md:p-2 rounded-full h-min">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="#4A9850" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm md:text-base">Personalização visual</h4>
                        <p className="text-xs md:text-sm text-muted-foreground">Adapta-se às cores, logotipo e estilo da sua imobiliária</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="bg-[#4A9850]/10 p-1.5 md:p-2 rounded-full h-min">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="#4A9850" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm md:text-base">Fluxos de trabalho customizados</h4>
                        <p className="text-xs md:text-sm text-muted-foreground">Respeita e otimiza seus processos de vendas existentes</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="bg-[#4A9850]/10 p-1.5 md:p-2 rounded-full h-min">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="#4A9850" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm md:text-base">Linguagem personalizada</h4>
                        <p className="text-xs md:text-sm text-muted-foreground">Comunicação alinhada com os valores e tom de voz da sua marca</p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="order-1 lg:order-2 relative">
                  <div className="relative rounded-xl overflow-hidden shadow-lg border border-border aspect-[4/3]">
                    <Image 
                      src="/images/personalização.png" 
                      alt="Personalização por imobiliária" 
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                      quality={85}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 md:p-6 z-20">
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#4A9850] flex items-center justify-center flex-shrink-0">
                          <Building className="h-4 w-4 md:h-5 md:w-5 text-white" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 md:p-3 max-w-xs">
                            <p className="text-white text-xs md:text-sm">O Moby está completamente personalizado para a Imobiliária IAnovar, mantendo sua identidade visual e processos específicos para uma experiência consistente.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-3 -right-3 md:-bottom-4 md:-right-4 -z-10 w-full h-full rounded-xl bg-[#4A9850]/20"></div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="seguranca" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Segurança e conformidade com LGPD</h3>
                  <p className="text-muted-foreground mb-4 md:mb-6 text-sm md:text-base">
                    O Moby foi desenvolvido com segurança como prioridade, garantindo proteção total aos dados dos seus clientes e conformidade com a Lei Geral de Proteção de Dados (LGPD).
                  </p>
                  <ul className="space-y-3 md:space-y-4">
                    <li className="flex gap-3">
                      <div className="bg-[#4A9850]/10 p-1.5 md:p-2 rounded-full h-min">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="#4A9850" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm md:text-base">Criptografia avançada</h4>
                        <p className="text-xs md:text-sm text-muted-foreground">Dados protegidos com criptografia de ponta a ponta</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="bg-[#4A9850]/10 p-1.5 md:p-2 rounded-full h-min">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="#4A9850" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm md:text-base">Gestão de consentimento</h4>
                        <p className="text-xs md:text-sm text-muted-foreground">Controle total sobre permissões e uso de dados</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="bg-[#4A9850]/10 p-1.5 md:p-2 rounded-full h-min">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="#4A9850" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm md:text-base">Auditorias regulares</h4>
                        <p className="text-xs md:text-sm text-muted-foreground">Monitoramento contínuo e testes de segurança</p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="order-1 lg:order-2 relative">
                  <div className="relative rounded-xl overflow-hidden shadow-lg border border-border aspect-[4/3]">
                    <Image 
                      src="/images/segurança.jpeg" 
                      alt="Segurança e conformidade com LGPD" 
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                      quality={85}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 md:p-6 z-20">
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#4A9850] flex items-center justify-center flex-shrink-0">
                          <Shield className="h-4 w-4 md:h-5 md:w-5 text-white" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 md:p-3 max-w-xs">
                            <p className="text-white text-xs md:text-sm">Seus dados e os de seus clientes estão protegidos com os mais altos padrões de segurança e em total conformidade com a LGPD.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-3 -right-3 md:-bottom-4 md:-right-4 -z-10 w-full h-full rounded-xl bg-[#4A9850]/20"></div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="integracao" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Integração rápida e sem complicação</h3>
                  <p className="text-muted-foreground mb-4 md:mb-6 text-sm md:text-base">
                    Implementação do Moby em menos de 48 horas, sem necessidade de alterações significativas em seus sistemas atuais ou processos internos.
                  </p>
                  <ul className="space-y-3 md:space-y-4">
                    <li className="flex gap-3">
                      <div className="bg-[#4A9850]/10 p-1.5 md:p-2 rounded-full h-min">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="#4A9850" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm md:text-base">Sem código necessário</h4>
                        <p className="text-xs md:text-sm text-muted-foreground">Integração sem precisar de desenvolvedores ou equipe técnica</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="bg-[#4A9850]/10 p-1.5 md:p-2 rounded-full h-min">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="#4A9850" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm md:text-base">Configuração assistida</h4>
                        <p className="text-xs md:text-sm text-muted-foreground">Suporte completo na implementação e configuração inicial</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="bg-[#4A9850]/10 p-1.5 md:p-2 rounded-full h-min">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="#4A9850" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm md:text-base">Compatibilidade universal</h4>
                        <p className="text-xs md:text-sm text-muted-foreground">Integra-se facilmente com CRMs e sistemas existentes</p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="order-1 lg:order-2 relative">
                  <div className="relative rounded-xl overflow-hidden shadow-lg border border-border aspect-[4/3]">
                    <Image 
                      src="/images/integracao.avif" 
                      alt="Integração rápida e sem complicação" 
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                      quality={85}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 md:p-6 z-20">
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#4A9850] flex items-center justify-center flex-shrink-0">
                          <Zap className="h-4 w-4 md:h-5 md:w-5 text-white" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 md:p-3 max-w-xs">
                            <p className="text-white text-xs md:text-sm">Implementação super rápida - em menos de 48 horas seu Moby estará configurado e pronto para uso sem interromper suas operações.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-3 -right-3 md:-bottom-4 md:-right-4 -z-10 w-full h-full rounded-xl bg-[#4A9850]/20"></div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="multicanal" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Atendimento multicanal integrado</h3>
                  <p className="text-muted-foreground mb-4 md:mb-6 text-sm md:text-base">
                    O Moby unifica todos os seus canais de comunicação em uma única plataforma, proporcionando uma experiência consistente aos clientes, independentemente do canal escolhido.
                  </p>
                  <ul className="space-y-3 md:space-y-4">
                    <li className="flex gap-3">
                      <div className="bg-[#4A9850]/10 p-1.5 md:p-2 rounded-full h-min">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="#4A9850" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm md:text-base">WhatsApp integrado</h4>
                        <p className="text-xs md:text-sm text-muted-foreground">Atendimento automatizado no canal preferido dos clientes</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="bg-[#4A9850]/10 p-1.5 md:p-2 rounded-full h-min">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="#4A9850" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm md:text-base">Chat no site</h4>
                        <p className="text-xs md:text-sm text-muted-foreground">Atendimento instantâneo para visitantes do seu website</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="bg-[#4A9850]/10 p-1.5 md:p-2 rounded-full h-min">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="#4A9850" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm md:text-base">Redes sociais</h4>
                        <p className="text-xs md:text-sm text-muted-foreground">Resposta automática em Instagram, Facebook e mais</p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="order-1 lg:order-2 relative">
                  <div className="relative rounded-xl overflow-hidden shadow-lg border border-border aspect-[4/3]">
                    <Image 
                      src="/images/multi-canal.png" 
                      alt="Atendimento multicanal integrado" 
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                      quality={85}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 md:p-6 z-20">
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#4A9850] flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="h-4 w-4 md:h-5 md:w-5 text-white" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 md:p-3 max-w-xs">
                            <p className="text-white text-xs md:text-sm">Um único ponto de contato para todos os canais - WhatsApp, Instagram, Facebook e seu site - proporcionando atendimento consistente em qualquer plataforma.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-3 -right-3 md:-bottom-4 md:-right-4 -z-10 w-full h-full rounded-xl bg-[#4A9850]/20"></div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
        
        <div className="mt-8 text-center">
          <a href="/demo" className="inline-flex items-center justify-center px-6 py-3 bg-[#4A9850] hover:bg-[#3d7e42] text-white font-medium rounded-md transition-colors">
            Revolucione agora sua imobiliária!
          </a>
        </div>
      </div>
    </section>
  );
}