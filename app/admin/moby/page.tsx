'use client';

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Icons } from "@/components/common/Icons";
import ChatInterface from "@/components/moby/chat-interface";
import Image from "next/image";

export default function MobyPage() {
  const [selectedTab, setSelectedTab] = useState("chat");
  const [selectedImovel, setSelectedImovel] = useState<string | number | null>(null);
  const [imoveis, setImoveis] = useState<any[]>([]);
  const [imovelData, setImovelData] = useState<any>(null);
  const [generatedDescription, setGeneratedDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingImoveis, setIsLoadingImoveis] = useState(false);

  const { data: metricsData } = useQuery({
    queryKey: ['mobyMetrics'],
    queryFn: async () => {
      const response = await fetch('/api/moby/metrics');
      if (!response.ok) {
        throw new Error('Erro ao carregar métricas');
      }
      return response.json();
    },
    refetchInterval: 30000 // Atualizar a cada 30 segundos
  });

  const usageMetrics = metricsData?.usage || {
    totalLeads: 0,
    totalImoveis: 0,
    totalChats: 0,
    activeChats: 0
  };

  const engagementMetrics = metricsData?.engagement || {
    messagesToday: 0,
    messagesThisMonth: 0,
    averageResponseTimeMinutes: 0
  };

  const performanceMetrics = metricsData?.performance || {
    conversionRate: 0,
    leadsWon: 0,
    leadsLost: 0,
    totalLeadsProcessed: 0
  };

  // Carregar imóveis do banco de dados
  useEffect(() => {
    const fetchImoveis = async () => {
      setIsLoadingImoveis(true);
      try {
        const response = await fetch('/api/imoveis?pageSize=100');

        if (!response.ok) {
          throw new Error('Erro ao carregar imóveis');
        }

        const data = await response.json();
        const loadedImoveis = data.imoveis || [];

        setImoveis(loadedImoveis);

        // Selecionar o primeiro imóvel por padrão
        if (loadedImoveis.length > 0) {
          setSelectedImovel(loadedImoveis[0].id);
          setImovelData(loadedImoveis[0]);
        }
      } catch (err) {
        console.error('Erro ao carregar imóveis:', err);
      } finally {
        setIsLoadingImoveis(false);
      }
    };

    fetchImoveis();
  }, []);
  
  // Atualizar dados quando o imóvel mudar
  const handleImovelChange = (id: string) => {
    if (!id) {
      setSelectedImovel(null);
      setImovelData(null);
      setGeneratedDescription('');
      return;
    }

    const imovel = imoveis.find(i => i.id === id);
    if (imovel) {
      setSelectedImovel(imovel.id);
      setImovelData(imovel);
      setGeneratedDescription(''); // Limpa a descrição anterior
    }
  };

  const handleGenerateDescription = async () => {
    if (!imovelData) {
      alert("Por favor, selecione um imóvel antes de gerar a descrição.");
      return;
    }

    setIsLoading(true);
    try {
      // Usando a rota de API
      const response = await fetch('/api/moby/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ propertyData: imovelData }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar descrição');
      }
      
      setGeneratedDescription(data.description);
    } catch (error) {
      console.error("Error generating description:", error);
      setGeneratedDescription(`Erro: ${error instanceof Error ? error.message : "Ocorreu um erro inesperado"}`);
    } finally {
      setIsLoading(false);
    }
  };


  const formatarValor = (valor: number | null) => {
    if (!valor && valor !== 0) return 'Consulte';
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src="/apple-touch-icon.png"
            alt="Moby Logo"
            width={44}
            height={44}
            className="h-11 w-11 rounded-full"
          />
          <h1 className="text-2xl font-bold text-emerald-500">Moby IA</h1>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid grid-cols-1 md:grid-cols-3 w-full">
          <TabsTrigger value="chat">
            <Icons.messageSquare className="mr-2 h-4 w-4" />
            Assistente AI
          </TabsTrigger>
          <TabsTrigger value="generator">
            <Icons.fileText className="mr-2 h-4 w-4" />
            Gerador de Conteúdo
          </TabsTrigger>
          <TabsTrigger value="metrics">
            <Icons.barChart className="mr-2 h-4 w-4" />
            Métricas e Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <ChatInterface />
        </TabsContent>

        <TabsContent value="generator" className="space-y-4">
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Ferramentas de Geração</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="descricao" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="descricao">
                    <Icons.building className="mr-2 h-4 w-4" />
                    Descrição de Imóvel
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="descricao" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col h-full">
                      <div className="flex-grow">
                        <p className="text-sm text-muted-foreground mb-2">
                          Selecione o imóvel para gerar a descrição:
                        </p>
                        <div className="mb-4">
                          <label className="text-sm font-medium mb-1 block">Imóvel</label>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={selectedImovel || ''}
                            onChange={(e) => handleImovelChange(e.target.value)}
                            disabled={isLoadingImoveis}
                            title="Selecione um imóvel"
                          >
                            <option value="">Selecione um imóvel...</option>
                            {isLoadingImoveis ? (
                              <option value="" disabled>Carregando imóveis...</option>
                            ) : imoveis.length > 0 ? (
                              imoveis.map((imovel) => (
                                <option key={imovel.id} value={imovel.id}>
                                  {imovel.titulo || `Imóvel em ${imovel.bairro || 'N/A'}, ${imovel.cidade || 'N/A'}`}
                                </option>
                              ))
                            ) : (
                              <option value="" disabled>Nenhum imóvel encontrado</option>
                            )}
                          </select>
                        </div>
                        
                        <div className="bg-muted p-4 rounded-md mb-4 min-h-[220px] flex flex-col border">
                          <h4 className="text-sm font-medium mb-1">Dados do Imóvel</h4>
                          {imovelData ? (
                            <div className="flex flex-col justify-between h-full text-sm">
                              <div>
                                <div className="grid grid-cols-2 gap-x-2 gap-y-1 mb-4">
                                  <div><span className="text-muted-foreground font-semibold inline-block w-24">ID:</span> {imovelData.codigo_referencia || imovelData.id.substring(0, 8)}</div>
                                  <div><span className="text-muted-foreground font-semibold inline-block w-24">Tipo:</span> {imovelData.loc_venda === 'venda' ? 'Venda' : imovelData.loc_venda === 'locacao' ? 'Locação' : 'Ambos'}</div>
                                  <div><span className="text-muted-foreground font-semibold inline-block w-24">Bairro:</span> {imovelData.bairro || 'N/A'}</div>
                                  <div><span className="text-muted-foreground font-semibold inline-block w-24">Cidade:</span> {imovelData.cidade || 'N/A'}</div>
                                  <div><span className="text-muted-foreground font-semibold inline-block w-24">Área:</span> {imovelData.m2 ? `${imovelData.m2}m²` : 'N/A'}</div>
                                  <div><span className="text-muted-foreground font-semibold inline-block w-24">Valor:</span> {formatarValor(imovelData.valor)}</div>
                                  <div><span className="text-muted-foreground font-semibold inline-block w-24">Quartos:</span> {imovelData.quartos || 0}</div>
                                  <div><span className="text-muted-foreground font-semibold inline-block w-24">Banheiros:</span> {imovelData.banheiros || 0}</div>
                                </div>
                              </div>
                              <div className="mt-auto">
                                <div><span className="text-muted-foreground font-semibold">Descrição:</span> {imovelData.descricao || imovelData.titulo || "Sem descrição"}</div>
                              </div>
                            </div>
                          ) : (
                            <p className="text-muted-foreground text-xs flex-grow flex items-center justify-center">Selecione um imóvel para ver as informações.</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col h-full">
                      <div className="flex-grow">
                        <p className="text-sm text-muted-foreground mb-2">
                          Descrição Gerada:
                        </p>
                        <div className="min-h-[300px] p-4 bg-muted rounded-md border">
                          {generatedDescription ? (
                            <div className="py-2">
                              <p className="text-base leading-relaxed whitespace-pre-wrap">
                                {generatedDescription}
                              </p>
                            </div>
                          ) : (
                            <p className="text-muted-foreground italic text-center flex items-center justify-center h-full">
                              A descrição gerada será exibida aqui. <br/>
                              Selecione um imóvel e clique em &quot;Gerar Descrição&quot; <br/>
                              para criar uma descrição atraente do imóvel.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center w-full pt-4">
                    <div className="flex-grow-0">
                      <Button 
                        onClick={handleGenerateDescription}
                        disabled={isLoading || !imovelData}
                        className="min-w-[180px]"
                      >
                        {isLoading ? (
                          <>
                            <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
                            Gerando...
                          </>
                        ) : (
                          <>
                            <Icons.fileText className="mr-2 h-4 w-4" />
                            Gerar Descrição
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" disabled={!generatedDescription} className="flex-shrink-0">
                        <Icons.copy className="mr-2 h-4 w-4" />
                        Copiar
                      </Button>
                      <Button variant="outline" disabled={!generatedDescription} className="flex-shrink-0">
                        <Icons.save className="mr-2 h-4 w-4" />
                        Salvar
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dados do Negócio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted p-4 rounded-md border">
                      <h3 className="text-sm text-muted-foreground">Total de Leads</h3>
                      <p className="text-2xl font-bold">{usageMetrics.totalLeads}</p>
                    </div>
                    <div className="bg-muted p-4 rounded-md border">
                      <h3 className="text-sm text-muted-foreground">Total de Imóveis</h3>
                      <p className="text-2xl font-bold">{usageMetrics.totalImoveis}</p>
                    </div>
                    <div className="bg-muted p-4 rounded-md border">
                      <h3 className="text-sm text-muted-foreground">Conversas Totais</h3>
                      <p className="text-2xl font-bold">{usageMetrics.totalChats}</p>
                    </div>
                    <div className="bg-muted p-4 rounded-md border">
                      <h3 className="text-sm text-muted-foreground">Conversas Ativas</h3>
                      <p className="text-2xl font-bold">{usageMetrics.activeChats}</p>
                      <p className="text-xs text-muted-foreground mt-1">Últimos 7 dias</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engajamento e Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted p-4 rounded-md border">
                    <h3 className="text-sm text-muted-foreground">Mensagens Hoje</h3>
                    <p className="text-2xl font-bold">{engagementMetrics.messagesToday}</p>
                  </div>
                  <div className="bg-muted p-4 rounded-md border">
                    <h3 className="text-sm text-muted-foreground">Mensagens este Mês</h3>
                    <p className="text-2xl font-bold">{engagementMetrics.messagesThisMonth}</p>
                  </div>
                  <div className="bg-muted p-4 rounded-md border">
                    <h3 className="text-sm text-muted-foreground">Tempo Médio Resposta</h3>
                    <p className="text-2xl font-bold">
                      {engagementMetrics.averageResponseTimeMinutes > 0
                        ? `${engagementMetrics.averageResponseTimeMinutes}min`
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-muted p-4 rounded-md border">
                    <h3 className="text-sm text-muted-foreground">Taxa de Conversão</h3>
                    <p className="text-2xl font-bold">{performanceMetrics.conversionRate}%</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {performanceMetrics.leadsWon} ganhos / {performanceMetrics.totalLeadsProcessed} processados
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm text-muted-foreground mb-3">Configurações do Modelo</h3>
                  <div className="bg-muted p-4 rounded-md border space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Modelo</span>
                      <Badge variant="outline">Azure gpt-5-chat</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Temperatura</span>
                      <Badge variant="outline">0.7</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Contexto Máximo</span>
                      <Badge variant="outline">128,000 tokens</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Estratégia de Fallback</span>
                      <Badge variant="outline">Escalamento Humano</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}