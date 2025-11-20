'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useImoveis } from '@/hooks/useImoveis';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Settings,
  Car,
  Bed,
  SquareIcon,
  Home,
  Bath,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';
import { PropertyMap } from './components/PropertyMap';
import { AdminTablePage } from '@/components/admin/loading/AdminPageLoader';

// Formatar valor monetário
const formatCurrency = (value: number | string | null) => {
  if (value === null) return 'R$ 0,00';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numValue);
};

// Truncar texto longo
const truncateText = (text: string | null, maxLength: number) => {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
};

export default function ImoveisPage() {
  const [filters, setFilters] = useState({
    bairro: '',
    cidade: '',
    minValor: undefined as number | undefined,
    maxValor: undefined as number | undefined,
    minQuartos: undefined as number | undefined,
    exactQuartos: undefined as number | undefined,
    minBanheiros: undefined as number | undefined,
    minM2: undefined as number | undefined,
    locVenda: undefined as string | undefined,
    limit: 10,
    offset: 0
  });
  
  // Estado para a ordenação
  const [sorting, setSorting] = useState({
    column: 'created_at', // coluna padrão de ordenação
    direction: 'desc' as 'asc' | 'desc', // direção padrão
    locVendaOrder: 'locacao_first' as 'locacao_first' | 'venda_first' // ordem padrão para tipo
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [locationFilters, setLocationFilters] = useState<any>({});
  
  const { data, isLoading, isError } = useImoveis(filters);
  const imoveis = data?.imoveis || [];
  
  // Lidar com mudança de página
  const handlePageChange = (direction: 'next' | 'prev') => {
    if (direction === 'prev' && filters.offset >= filters.limit) {
      setFilters(prev => ({ ...prev, offset: prev.offset - prev.limit }));
    } else if (direction === 'next') {
      setFilters(prev => ({ ...prev, offset: prev.offset + prev.limit }));
    }
  };
  
  // Aplicar filtro de busca por termo
  const handleSearch = () => {
    // Por enquanto, vamos filtrar apenas por bairro
    setFilters(prev => ({ 
      ...prev, 
      bairro: searchTerm,
      offset: 0 // Reset para a primeira página
    }));
    
    // Fechar a busca após pesquisar
    if (searchTerm.trim()) {
      setIsSearchOpen(false);
    }
  };
  
  // Toggle da busca
  const toggleSearch = () => {
    setIsSearchOpen(prev => !prev);
    if (isSearchOpen && !searchTerm.trim()) {
      // Se estiver fechando a busca e não tiver termo, limpa o campo
      setSearchTerm('');
    }
  };
  
  // Limpar filtros
  const handleClearFilters = () => {
    setSearchTerm('');
    setIsSearchOpen(false);
    setFilters({
      bairro: '',
      cidade: '',
      minValor: undefined,
      maxValor: undefined,
      minQuartos: undefined,
      exactQuartos: undefined,
      minBanheiros: undefined,
      minM2: undefined,
      locVenda: undefined,
      limit: 10,
      offset: 0
    });
  };
  
  // Alterar quantidade de itens por página
  const handleLimitChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      limit: parseInt(value),
      offset: 0 // Reset para primeira página ao mudar limit
    }));
  };
  
  // Alternar ordenação ao clicar no cabeçalho
  const toggleSorting = (column: string) => {
    if (column === 'valor') {
      setSorting(prev => ({
        ...prev,
        column: 'valor',
        direction: prev.column === 'valor' && prev.direction === 'asc' ? 'desc' : 'asc'
      }));
    } else if (column === 'loc_venda') {
      setSorting(prev => ({
        ...prev,
        column: 'loc_venda',
        locVendaOrder: prev.locVendaOrder === 'locacao_first' ? 'venda_first' : 'locacao_first'
      }));
    }
  };
  
  // Ordenar os imóveis
  const sortedImoveis = [...imoveis].sort((a, b) => {
    if (sorting.column === 'valor') {
      const aValue = a.valor || 0;
      const bValue = b.valor || 0;
      
      return sorting.direction === 'asc' 
        ? aValue - bValue 
        : bValue - aValue;
    } 
    
    if (sorting.column === 'loc_venda') {
      if (sorting.locVendaOrder === 'locacao_first') {
        if (a.loc_venda === 'locacao' && b.loc_venda !== 'locacao') return -1;
        if (a.loc_venda !== 'locacao' && b.loc_venda === 'locacao') return 1;
      } else {
        if (a.loc_venda === 'venda' && b.loc_venda !== 'venda') return -1;
        if (a.loc_venda !== 'venda' && b.loc_venda === 'venda') return 1;
      }
    }
    
    return 0;
  });
  
  return (
    <AdminTablePage
      pageId="properties"
      title="Imóveis"
      subtitle="Gerencie o portfólio de propriedades e seus detalhes"
      isLoading={isLoading}
      error={isError ? "Erro ao carregar imóveis. Tente novamente." : null}
      isEmpty={!isLoading && imoveis.length === 0}
      emptyStateConfig="NO_DATA"
      showMetrics={false}
      onRetry={() => window.location.reload()}
    >
      <div className="flex items-center justify-between mb-6">
        <div />
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/imoveis/novo">
            Novo Imóvel
          </Link>
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Filtros</CardTitle>
              {/* Descrição removida conforme solicitado */}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={toggleSearch} 
                className={isSearchOpen ? 'bg-muted' : ''}
              >
                <Search size={18} />
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowMap(!showMap)}
                className={showMap ? 'bg-muted' : ''}
              >
                <MapPin size={16} className="mr-1" />
                Mapa
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isSearchOpen && (
            <div className="mb-4 pb-4 border-b">
              <div className="flex gap-2">
                <Input
                  placeholder="Buscar por descrição ou bairro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button variant="default" size="icon" onClick={handleSearch}>
                  <Search size={18} />
                </Button>
              </div>
            </div>
          )}
          
          <div className="grid gap-4 grid-cols-2 md:grid-cols-6">
            <Select
              value={filters.cidade || 'all'}
              onValueChange={(value) => setFilters(prev => ({ ...prev, cidade: value === 'all' ? '' : value, offset: 0 }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as cidades</SelectItem>
                <SelectItem value="São Paulo">São Paulo</SelectItem>
                <SelectItem value="Rio de Janeiro">Rio de Janeiro</SelectItem>
                <SelectItem value="Belo Horizonte">Belo Horizonte</SelectItem>
                <SelectItem value="Recife">Recife</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={filters.locVenda || 'all'}
              onValueChange={(value) => setFilters(prev => ({ 
                ...prev, 
                locVenda: value === 'all' ? undefined : value,
                offset: 0
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="venda">Venda</SelectItem>
                <SelectItem value="locacao">Aluguel</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={
                filters.exactQuartos !== undefined 
                  ? filters.exactQuartos.toString() 
                  : filters.minQuartos !== undefined 
                    ? `min-${filters.minQuartos}` 
                    : 'any'
              }
              onValueChange={(value) => {
                if (value === 'any') {
                  setFilters(prev => ({ 
                    ...prev, 
                    exactQuartos: undefined,
                    minQuartos: undefined,
                    offset: 0
                  }));
                } else if (value === 'min-5') {
                  setFilters(prev => ({ 
                    ...prev, 
                    exactQuartos: undefined,
                    minQuartos: 5,
                    offset: 0
                  }));
                } else {
                  setFilters(prev => ({ 
                    ...prev, 
                    minQuartos: undefined,
                    exactQuartos: parseInt(value),
                    offset: 0
                  }));
                }
              }}
            >
              <SelectTrigger>
                <div className="flex items-center">
                  <Bed size={14} className="mr-2" />
                  <span>Quartos</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Qualquer</SelectItem>
                <SelectItem value="1">1 quarto</SelectItem>
                <SelectItem value="2">2 quartos</SelectItem>
                <SelectItem value="3">3 quartos</SelectItem>
                <SelectItem value="4">4 quartos</SelectItem>
                <SelectItem value="min-5">5+ quartos</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={filters.minM2?.toString() || 'any'}
              onValueChange={(value) => setFilters(prev => ({ 
                ...prev, 
                minM2: value === 'any' ? undefined : parseInt(value),
                offset: 0
              }))}
            >
              <SelectTrigger>
                <div className="flex items-center">
                  <SquareIcon size={14} className="mr-2" />
                  <span>Área</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Qualquer</SelectItem>
                <SelectItem value="50">50+ m²</SelectItem>
                <SelectItem value="100">100+ m²</SelectItem>
                <SelectItem value="200">200+ m²</SelectItem>
                <SelectItem value="300">300+ m²</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="col-span-2">
              <Input
                placeholder="Valor máximo"
                type="number"
                value={filters.maxValor || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  maxValor: e.target.value ? parseInt(e.target.value) : undefined,
                  offset: 0
                }))}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Map Search */}
      {showMap && (
        <PropertyMap
          properties={imoveis.map(imovel => ({
            id: imovel.id,
            title: imovel.descricao || '',
            latitude: imovel.latitude || undefined,
            longitude: imovel.longitude || undefined,
            sale_price: imovel.sale_price || undefined,
            rent_price: imovel.rent_price || undefined,
            type: imovel.type || '',
            purpose: imovel.purpose || '',
            neighborhood: imovel.bairro || undefined,
            city: imovel.cidade || undefined,
          }))}
          onLocationFilter={setLocationFilters}
          className="mb-6"
        />
      )}
      
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[35%]">Descrição</TableHead>
                  <TableHead className="w-[16%]">Local</TableHead>
                  <TableHead className="w-8 text-center">
                    <div className="flex items-center justify-center" title="Quartos">
                      <Bed size={16} />
                    </div>
                  </TableHead>
                  <TableHead className="w-8 text-center">
                    <div className="flex items-center justify-center" title="Banheiros">
                      <Bath size={16} />
                    </div>
                  </TableHead>
                  <TableHead className="w-8 text-center">
                    <div className="flex items-center justify-center" title="Garagem">
                      <Car size={16} />
                    </div>
                  </TableHead>
                  <TableHead className="w-12 text-center">
                    <div className="flex items-center justify-center" title="Área m²">
                      <SquareIcon size={16} />
                    </div>
                  </TableHead>
                  <TableHead className="w-[15%] text-right pr-3">
                    <button 
                      className="flex items-center justify-end w-full focus:outline-none" 
                      onClick={() => toggleSorting('valor')}
                    >
                      Valor {sorting.column === 'valor' ? (
                        sorting.direction === 'asc' ? (
                          <ArrowUpDown size={16} className="ml-2 transform rotate-180" />
                        ) : (
                          <ArrowUpDown size={16} className="ml-2" />
                        )
                      ) : (
                        <ArrowUpDown size={16} className="ml-2 opacity-50" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead className="w-10 pr-0 mr-0">
                    <button 
                      className="flex items-center justify-start w-full focus:outline-none" 
                      onClick={() => toggleSorting('loc_venda')}
                    >
                      Tipo {sorting.column === 'loc_venda' ? (
                        sorting.locVendaOrder === 'locacao_first' ? (
                          <ArrowUpDown size={16} className="ml-1" />
                        ) : (
                          <ArrowUpDown size={16} className="ml-1 transform rotate-180" />
                        )
                      ) : (
                        <ArrowUpDown size={16} className="ml-1 opacity-50" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead className="w-20 text-right pr-4 ml-0">
                    <div className="flex items-center justify-end gap-3 mr-[-1px]">
                      <div className="w-7 flex justify-center" title="Foto">
                        <Eye size={15} />
                      </div>
                      <div className="w-7 flex justify-center" title="Ações">
                        <Settings size={15} />
                      </div>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedImoveis.map((imovel) => (
                    <TableRow key={imovel.id}>
                      <TableCell>
                        <div className="font-medium">{truncateText(imovel.descricao ?? '', 60)}</div>
                      </TableCell>
                      <TableCell>
                        {imovel.cidade}{imovel.bairro ? `, ${imovel.bairro}` : ''}
                      </TableCell>
                      <TableCell className="text-center">{imovel.quartos || '—'}</TableCell>
                      <TableCell className="text-center">{imovel.banheiros || '—'}</TableCell>
                      <TableCell className="text-center">{imovel.garagem || '—'}</TableCell>
                      <TableCell className="text-center">{imovel.m2 ? `${imovel.m2}m²` : '—'}</TableCell>
                      <TableCell className="font-mono text-right">
                        {formatCurrency(imovel.valor ?? 0)}
                      </TableCell>
                      <TableCell className="pr-0 mr-0">
                        {imovel.loc_venda === 'locacao' ? 
                          <span className="px-2 py-1 rounded-md text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Aluguel</span> : 
                          <span className="px-2 py-1 rounded-md text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Venda</span>
                        }
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        <div className="flex items-center justify-end gap-3 mr-[-1px]">
                          {imovel.foto ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedImage(imovel.foto ?? null)}
                              className="h-7 w-7 p-0"
                            >
                              <Eye size={15} className="text-muted-foreground hover:text-primary" />
                            </Button>
                          ) : (
                            <span className="w-7 inline-block text-center">—</span>
                          )}
                          
                          <Button variant="ghost" size="icon" asChild className="h-7 w-7 p-0">
                            <Link href={`/admin/imoveis/${imovel.id}`}>
                              <span className="sr-only">Editar</span>
                              <Settings size={15} />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          </div>
          
          <div className="flex items-center justify-between p-4 border-t">
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {filters.offset + 1} até {Math.min(filters.offset + filters.limit, filters.offset + imoveis.length)} de {filters.offset + imoveis.length}+
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Itens por página:</span>
                <Select
                  value={filters.limit.toString()}
                  onValueChange={handleLimitChange}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder="10" />
                  </SelectTrigger>
                  <SelectContent side="top">
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange('prev')}
                disabled={filters.offset === 0}
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange('next')}
                disabled={imoveis.length < filters.limit}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Dialog para visualização da imagem */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Visualização do Imóvel</DialogTitle>
            <DialogDescription>
              Imagem do imóvel cadastrado no sistema
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 overflow-hidden rounded-md">
            {selectedImage && (
              <div className="relative aspect-video w-full">
                <Image 
                  src={selectedImage} 
                  alt="Imóvel" 
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = 'https://placehold.co/800x600?text=Imagem+não+disponível';
                  }}
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => setSelectedImage(null)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminTablePage>
  );
}