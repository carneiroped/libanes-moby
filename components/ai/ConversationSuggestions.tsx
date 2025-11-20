'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MessageSquare, Home, Calendar, HelpCircle } from 'lucide-react'

interface ConversationSuggestionsProps {
  suggestions: string[]
  onSelect: (suggestion: string) => void
  context?: 'greeting' | 'qualification' | 'search' | 'scheduling'
  className?: string
}

const contextIcons = {
  greeting: MessageSquare,
  qualification: HelpCircle,
  search: Home,
  scheduling: Calendar
}

const defaultSuggestions = {
  greeting: [
    'Quero comprar um imóvel',
    'Estou procurando para alugar',
    'Gostaria de vender meu imóvel',
    'Só estou conhecendo'
  ],
  qualification: [
    'Apartamento de 2 quartos',
    'Casa com quintal',
    'Até R$ 500 mil',
    'Próximo ao metrô'
  ],
  search: [
    'Ver mais detalhes',
    'Tem outros similares?',
    'Posso visitar?',
    'Qual o valor do condomínio?'
  ],
  scheduling: [
    'Sábado de manhã',
    'Durante a semana',
    'Qualquer horário',
    'Preciso verificar agenda'
  ]
}

export function ConversationSuggestions({
  suggestions,
  onSelect,
  context = 'greeting',
  className
}: ConversationSuggestionsProps) {
  const Icon = contextIcons[context] || MessageSquare
  const displaySuggestions = suggestions.length > 0 
    ? suggestions 
    : defaultSuggestions[context] || []

  if (displaySuggestions.length === 0) return null

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="w-4 h-4" />
        <span>Sugestões rápidas:</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {displaySuggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onSelect(suggestion)}
            className="text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  )
}