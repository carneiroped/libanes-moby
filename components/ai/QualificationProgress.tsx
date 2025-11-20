'use client'

import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Circle, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QualificationProgressProps {
  progress: number
  completedFields: string[]
  currentField?: string
  totalFields?: number
  className?: string
}

const fieldLabels: Record<string, string> = {
  interest_type: 'Interesse',
  property_type: 'Tipo de Imóvel',
  location: 'Localização',
  budget: 'Orçamento',
  urgency: 'Prazo',
  bedrooms: 'Quartos',
  parking: 'Vagas',
  specific_needs: 'Necessidades'
}

export function QualificationProgress({
  progress,
  completedFields,
  currentField,
  totalFields = 8,
  className
}: QualificationProgressProps) {
  const steps = Object.keys(fieldLabels).slice(0, totalFields)
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* Barra de progresso principal */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progresso da Qualificação</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Steps visuais */}
      <div className="flex items-center justify-between">
        {steps.map((field, index) => {
          const isCompleted = completedFields.includes(field)
          const isCurrent = currentField === field
          const isLast = index === steps.length - 1
          
          return (
            <div key={field} className="flex items-center flex-1">
              <div className="relative">
                {/* Ícone do step */}
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                    isCompleted
                      ? 'bg-primary text-primary-foreground'
                      : isCurrent
                      ? 'bg-primary/20 text-primary border-2 border-primary'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : isCurrent ? (
                    <MessageSquare className="w-4 h-4 animate-pulse" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </div>
                
                {/* Label do campo */}
                <span
                  className={cn(
                    'absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap',
                    isCompleted || isCurrent
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground'
                  )}
                >
                  {fieldLabels[field]}
                </span>
              </div>
              
              {/* Linha conectora */}
              {!isLast && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2',
                    completedFields.includes(steps[index + 1])
                      ? 'bg-primary'
                      : 'bg-muted'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Mensagem motivacional */}
      {progress > 0 && progress < 100 && (
        <p className="text-sm text-center text-muted-foreground mt-8">
          {progress < 50
            ? 'Ótimo começo! Continue respondendo para encontrarmos o imóvel perfeito.'
            : progress < 80
            ? 'Quase lá! Mais algumas perguntas e teremos seu perfil completo.'
            : 'Último passo! Finalize para ver imóveis selecionados especialmente para você.'}
        </p>
      )}
    </div>
  )
}