'use client'

import { useState } from 'react'
import { PropertyCard } from './PropertyCard'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Search, 
  Filter, 
  SlidersHorizontal,
  AlertCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchResultsProps {
  results: any[]
  totalCount: number
  searchExplanation?: string
  alternativeSuggestions?: string[]
  onPropertySelect?: (property: any) => void
  onRefineSearch?: () => void
  onSuggestionClick?: (suggestion: string) => void
  className?: string
  viewMode?: 'grid' | 'list' | 'carousel'
}

export function SearchResults({
  results,
  totalCount,
  searchExplanation,
  alternativeSuggestions,
  onPropertySelect,
  onRefineSearch,
  onSuggestionClick,
  className,
  viewMode = 'grid'
}: SearchResultsProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = viewMode === 'carousel' ? 3 : 6
  const totalPages = Math.ceil(results.length / itemsPerPage)

  const paginatedResults = results.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  )

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header com explicação */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">
              {totalCount > 0 
                ? `${totalCount} imóveis encontrados`
                : 'Nenhum imóvel encontrado'
              }
            </h3>
          </div>
          
          {totalCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefineSearch}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Refinar busca
            </Button>
          )}
        </div>

        {searchExplanation && (
          <p className="text-sm text-muted-foreground">
            {searchExplanation}
          </p>
        )}
      </div>

      {/* Resultados ou mensagem vazia */}
      {totalCount === 0 ? (
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Não encontramos imóveis com os critérios especificados. 
              Que tal ajustar sua busca?
            </AlertDescription>
          </Alert>

          {alternativeSuggestions && alternativeSuggestions.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium">Tente também:</p>
              <div className="space-y-2">
                {alternativeSuggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start text-left"
                    onClick={() => onSuggestionClick?.(suggestion)}
                  >
                    <Sparkles className="w-4 h-4 mr-2 text-primary" />
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Grid de resultados */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedResults.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  recommendation={property.recommendation}
                  onScheduleVisit={() => onPropertySelect?.(property)}
                />
              ))}
            </div>
          )}

          {/* Carousel de resultados */}
          {viewMode === 'carousel' && (
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto snap-x">
                {paginatedResults.map((property) => (
                  <div 
                    key={property.id} 
                    className="flex-none w-full md:w-1/2 lg:w-1/3 snap-center"
                  >
                    <PropertyCard
                      property={property}
                      recommendation={property.recommendation}
                      onScheduleVisit={() => onPropertySelect?.(property)}
                    />
                  </div>
                ))}
              </div>
              
              {/* Navegação do carousel */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <span className="text-sm text-muted-foreground">
                    {currentPage + 1} / {totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage === totalPages - 1}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Paginação para grid */}
          {viewMode === 'grid' && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
              >
                Anterior
              </Button>
              
              <span className="text-sm text-muted-foreground px-4">
                Página {currentPage + 1} de {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
              >
                Próxima
              </Button>
            </div>
          )}

          {/* Sugestões alternativas no final */}
          {alternativeSuggestions && alternativeSuggestions.length > 0 && (
            <div className="border-t pt-6 space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                Não encontrou o que procura? Tente também:
              </p>
              <div className="flex flex-wrap gap-2">
                {alternativeSuggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => onSuggestionClick?.(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}