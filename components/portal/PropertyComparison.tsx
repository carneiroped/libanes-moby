'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Home,
  MapPin,
  Bed,
  Bath,
  Car,
  Maximize,
  DollarSign,
  Check,
  X,
  ArrowRight
} from 'lucide-react';

interface Property {
  id: string;
  title: string;
  neighborhood: string;
  city: string;
  purpose: 'sale' | 'rent';
  sale_price?: number;
  rent_price?: number;
  bedrooms: number;
  bathrooms: number;
  parking_spaces: number;
  total_area: number;
  built_area?: number;
  images?: { url: string }[];
  amenities?: string[];
  description?: string;
}

interface PropertyComparisonProps {
  properties: Property[];
  open: boolean;
  onClose: () => void;
}

export function PropertyComparison({ properties, open, onClose }: PropertyComparisonProps) {
  const getAllAmenities = (properties: Property[]): string[] => {
    const amenitiesSet = new Set<string>();
    properties.forEach(property => {
      if (property.amenities) {
        property.amenities.forEach(amenity => amenitiesSet.add(amenity));
      }
    });
    return Array.from(amenitiesSet).sort();
  };

  const features = [
    { key: 'purpose', label: 'Tipo', icon: Home },
    { key: 'price', label: 'Preço', icon: DollarSign },
    { key: 'bedrooms', label: 'Quartos', icon: Bed },
    { key: 'bathrooms', label: 'Banheiros', icon: Bath },
    { key: 'parking_spaces', label: 'Vagas', icon: Car },
    { key: 'total_area', label: 'Área Total', icon: Maximize },
    { key: 'built_area', label: 'Área Construída', icon: Maximize },
  ];

  const getPropertyValue = (property: Property, key: string) => {
    switch (key) {
      case 'purpose':
        return property.purpose === 'sale' ? 'Venda' : 'Aluguel';
      case 'price':
        if (property.purpose === 'sale' && property.sale_price) {
          return `R$ ${property.sale_price.toLocaleString('pt-BR')}`;
        }
        if (property.purpose === 'rent' && property.rent_price) {
          return `R$ ${property.rent_price.toLocaleString('pt-BR')}/mês`;
        }
        return '-';
      case 'total_area':
      case 'built_area':
        const value = property[key as keyof Property];
        return value ? `${value}m²` : '-';
      default:
        return property[key as keyof Property] || '-';
    }
  };

  const getHighestValue = (key: string) => {
    let highest = 0;
    properties.forEach(property => {
      let value = 0;
      switch (key) {
        case 'price':
          value = property.purpose === 'sale' 
            ? (property.sale_price || 0)
            : (property.rent_price || 0);
          break;
        case 'bedrooms':
        case 'bathrooms':
        case 'parking_spaces':
        case 'total_area':
        case 'built_area':
          value = Number(property[key as keyof Property]) || 0;
          break;
      }
      if (value > highest) highest = value;
    });
    return highest;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Comparar Imóveis</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-full max-h-[calc(90vh-100px)]">
          <div className="p-6">
            {/* Cabeçalho com imagens e títulos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {properties.map((property) => (
                <Card key={property.id} className="overflow-hidden">
                  <div className="aspect-video relative bg-gray-100">
                    {property.images && property.images.length > 0 ? (
                      <Image
                        src={property.images[0].url}
                        alt={property.title}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg line-clamp-2">
                      {property.title}
                    </CardTitle>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      <MapPin className="h-3 w-3" />
                      <span>{property.neighborhood}, {property.city}</span>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {/* Tabela de comparação */}
            <div className="space-y-2">
              {features.map((feature) => {
                const highest = getHighestValue(feature.key);
                return (
                  <div key={feature.key} className="grid grid-cols-4 gap-4 p-3 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <feature.icon className="h-4 w-4" />
                      {feature.label}
                    </div>
                    {properties.map((property) => {
                      const value = getPropertyValue(property, feature.key);
                      const numericValue = Number(property[feature.key as keyof Property]) || 0;
                      const isHighest = feature.key !== 'purpose' && feature.key !== 'price' && numericValue === highest && highest > 0;
                      
                      return (
                        <div
                          key={property.id}
                          className={`text-sm ${isHighest ? 'font-semibold text-green-600' : 'text-gray-900'}`}
                        >
                          {String(value)}
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* Comodidades */}
              {properties.some(p => p.amenities && p.amenities.length > 0) && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium text-gray-700 mb-3">Comodidades</h4>
                  {getAllAmenities(properties).map((amenity) => (
                    <div key={amenity} className="grid grid-cols-4 gap-4 p-2 hover:bg-gray-50">
                      <div className="text-sm text-gray-700">
                        {amenity}
                      </div>
                      {properties.map((property) => (
                        <div key={property.id} className="text-center">
                          {property.amenities?.includes(amenity) ? (
                            <Check className="h-4 w-4 text-green-500 inline-block" />
                          ) : (
                            <X className="h-4 w-4 text-gray-300 inline-block" />
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ações */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {properties.map((property) => (
                <div key={property.id} className="text-center">
                  <Button className="w-full" asChild>
                    <a href={`/imoveis/${property.id}`} target="_blank" rel="noopener noreferrer">
                      Ver detalhes
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function getAllAmenities(properties: Property[]): string[] {
  const amenitiesSet = new Set<string>();
  properties.forEach(property => {
    property.amenities?.forEach(amenity => amenitiesSet.add(amenity));
  });
  return Array.from(amenitiesSet).sort();
}