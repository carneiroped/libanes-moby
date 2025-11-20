'use client'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Bed, 
  Car, 
  MapPin, 
  Maximize2, 
  Heart, 
  Share2, 
  Calendar,
  TrendingUp,
  Sparkles,
  Users
} from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface PropertyCardProps {
  property: {
    id: string
    title: string
    type: string
    neighborhood: string
    city: string
    price: number
    bedrooms: number
    bathrooms: number
    parking_spaces: number
    total_area: number
    images?: string[]
  }
  recommendation?: {
    score: number
    matchPercentage: number
    reasons: string[]
    explanation: string
    recommendationType: 'profile_based' | 'behavior_based' | 'similar_leads' | 'trending'
  }
  onInterest?: () => void
  onScheduleVisit?: () => void
  onShare?: () => void
  className?: string
}

const recommendationIcons = {
  profile_based: Sparkles,
  behavior_based: TrendingUp,
  similar_leads: Users,
  trending: TrendingUp
}

const recommendationLabels = {
  profile_based: 'Combina com você',
  behavior_based: 'Baseado em suas buscas',
  similar_leads: 'Escolha de perfis similares',
  trending: 'Em alta na região'
}

export function PropertyCard({
  property,
  recommendation,
  onInterest,
  onScheduleVisit,
  onShare,
  className
}: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [imageError, setImageError] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const RecommendationIcon = recommendation 
    ? recommendationIcons[recommendation.recommendationType]
    : null

  return (
    <Card className={cn('overflow-hidden hover:shadow-lg transition-shadow', className)}>
      {/* Header com imagem */}
      <div className="relative aspect-[16/9] bg-muted">
        {property.images?.[0] && !imageError ? (
          <Image
            src={property.images[0]}
            alt={property.title}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Maximize2 className="w-12 h-12" />
          </div>
        )}
        
        {/* Badge de match */}
        {recommendation && (
          <Badge className="absolute top-2 left-2 gap-1">
            {RecommendationIcon && <RecommendationIcon className="w-3 h-3" />}
            {recommendation.matchPercentage}% match
          </Badge>
        )}
        
        {/* Botão de favorito */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/80 hover:bg-white"
          onClick={() => setIsFavorite(!isFavorite)}
        >
          <Heart 
            className={cn(
              'w-5 h-5 transition-colors',
              isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
            )}
          />
        </Button>
      </div>

      <CardHeader className="pb-3">
        <div className="space-y-1">
          <h3 className="font-semibold text-lg line-clamp-1">{property.title}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{property.neighborhood}, {property.city}</span>
          </div>
        </div>
        
        {/* Preço */}
        <div className="text-2xl font-bold text-primary mt-2">
          {formatPrice(property.price)}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Características */}
        <div className="grid grid-cols-4 gap-2 text-sm">
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4 text-muted-foreground" />
            <span>{property.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Car className="w-4 h-4 text-muted-foreground" />
            <span>{property.parking_spaces}</span>
          </div>
          <div className="flex items-center gap-1">
            <Maximize2 className="w-4 h-4 text-muted-foreground" />
            <span>{property.total_area}m²</span>
          </div>
        </div>

        {/* Recomendação */}
        {recommendation && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm">
              {RecommendationIcon && (
                <RecommendationIcon className="w-4 h-4 text-primary" />
              )}
              <span className="font-medium">
                {recommendationLabels[recommendation.recommendationType]}
              </span>
            </div>
            
            {recommendation.explanation && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {recommendation.explanation}
              </p>
            )}
            
            {recommendation.reasons.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {recommendation.reasons.slice(0, 3).map((reason, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {reason}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 gap-2">
        <Button 
          variant="default" 
          className="flex-1"
          onClick={onScheduleVisit}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Agendar Visita
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onShare}
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}