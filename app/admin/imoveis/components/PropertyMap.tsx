'use client';

import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  MapPin, 
  Search, 
  Filter, 
  Layers,
  Circle,
  Square,
  Hexagon as PolygonIcon,
  X,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Property {
  id: string;
  title: string;
  latitude?: number;
  longitude?: number;
  sale_price?: number;
  rent_price?: number;
  type: string;
  purpose: string;
  neighborhood?: string;
  city?: string;
}

interface MapSearchProps {
  properties: Property[];
  onLocationFilter: (filters: LocationFilter) => void;
  className?: string;
}

interface LocationFilter {
  center?: { lat: number; lng: number };
  radius?: number; // in km
  polygon?: { lat: number; lng: number }[];
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

type DrawingMode = 'none' | 'circle' | 'rectangle' | 'polygon';

export function PropertyMap({ properties, onLocationFilter, className }: MapSearchProps) {
  const [searchLocation, setSearchLocation] = useState('');
  const [drawingMode, setDrawingMode] = useState<DrawingMode>('none');
  const [radiusKm, setRadiusKm] = useState([5]);
  const [mapCenter, setMapCenter] = useState({ lat: -23.5505, lng: -46.6333 }); // São Paulo default
  const [activeFilters, setActiveFilters] = useState<LocationFilter>({});
  const [showFilters, setShowFilters] = useState(false);

  // Simulate map component - in real implementation, use Google Maps, Leaflet, or Mapbox
  const [selectedArea, setSelectedArea] = useState<{
    type: 'circle' | 'rectangle' | 'polygon';
    data: any;
  } | null>(null);

  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      if (!property.latitude || !property.longitude) return false;
      
      // Apply location filters
      if (activeFilters.radius && activeFilters.center) {
        const distance = calculateDistance(
          property.latitude,
          property.longitude,
          activeFilters.center.lat,
          activeFilters.center.lng
        );
        if (distance > activeFilters.radius) return false;
      }
      
      if (activeFilters.bounds) {
        const { bounds } = activeFilters;
        if (
          property.latitude < bounds.south ||
          property.latitude > bounds.north ||
          property.longitude < bounds.west ||
          property.longitude > bounds.east
        ) {
          return false;
        }
      }
      
      return true;
    });
  }, [properties, activeFilters]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleLocationSearch = async () => {
    if (!searchLocation.trim()) return;
    
    // In real implementation, use Google Geocoding API
    // For now, simulate with some preset locations
    const mockLocations: Record<string, { lat: number; lng: number }> = {
      'São Paulo': { lat: -23.5505, lng: -46.6333 },
      'Rio de Janeiro': { lat: -22.9068, lng: -43.1729 },
      'Copacabana': { lat: -22.9711, lng: -43.1822 },
      'Ipanema': { lat: -22.9834, lng: -43.2056 },
      'Belo Horizonte': { lat: -19.9167, lng: -43.9345 },
      'Recife': { lat: -8.0476, lng: -34.8770 },
    };
    
    const location = mockLocations[searchLocation] || mockLocations['São Paulo'];
    setMapCenter(location);
  };

  const handleRadiusSearch = () => {
    const newFilter: LocationFilter = {
      center: mapCenter,
      radius: radiusKm[0]
    };
    
    setActiveFilters(newFilter);
    onLocationFilter(newFilter);
    setSelectedArea({
      type: 'circle',
      data: { center: mapCenter, radius: radiusKm[0] }
    });
  };

  const handleAreaSearch = (area: { north: number; south: number; east: number; west: number }) => {
    const newFilter: LocationFilter = {
      bounds: area
    };
    
    setActiveFilters(newFilter);
    onLocationFilter(newFilter);
    setSelectedArea({
      type: 'rectangle',
      data: area
    });
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSelectedArea(null);
    onLocationFilter({});
  };

  const handleDrawingModeChange = (mode: DrawingMode) => {
    setDrawingMode(mode);
    if (mode !== 'none') {
      setShowFilters(true);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Busca por Localização
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros ({Object.keys(activeFilters).length})
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Location Search */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Buscar por bairro, cidade ou endereço..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLocationSearch()}
            />
          </div>
          <Button onClick={handleLocationSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Map Container Placeholder */}
        <div className="relative">
          <div className="w-full h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MapPin className="h-12 w-12 mx-auto mb-2" />
              <p className="font-medium">Mapa Interativo</p>
              <p className="text-sm">
                Localização: {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
              </p>
              <p className="text-sm mt-1">
                {filteredProperties.length} imóveis na área
              </p>
            </div>
          </div>
          
          {/* Drawing Tools Overlay */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            <Button
              size="sm"
              variant={drawingMode === 'circle' ? 'default' : 'outline'}
              onClick={() => handleDrawingModeChange('circle')}
              className="w-8 h-8 p-0"
            >
              <Circle className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={drawingMode === 'rectangle' ? 'default' : 'outline'}
              onClick={() => handleDrawingModeChange('rectangle')}
              className="w-8 h-8 p-0"
            >
              <Square className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={drawingMode === 'polygon' ? 'default' : 'outline'}
              onClick={() => handleDrawingModeChange('polygon')}
              className="w-8 h-8 p-0"
            >
              <PolygonIcon className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Center Target */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Target className="h-6 w-6 text-red-500" />
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="space-y-4 p-4 border rounded-lg">
            {/* Radius Search */}
            <div className="space-y-2">
              <Label>Busca por Raio</Label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Slider
                    value={radiusKm}
                    onValueChange={setRadiusKm}
                    max={50}
                    min={0.5}
                    step={0.5}
                    className="w-full"
                  />
                </div>
                <div className="text-sm font-medium w-20">
                  {radiusKm[0]}km
                </div>
                <Button 
                  size="sm" 
                  onClick={handleRadiusSearch}
                  className="shrink-0"
                >
                  Aplicar
                </Button>
              </div>
            </div>

            {/* Quick Area Buttons */}
            <div className="space-y-2">
              <Label>Áreas Predefinidas</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAreaSearch({
                    north: mapCenter.lat + 0.01,
                    south: mapCenter.lat - 0.01,
                    east: mapCenter.lng + 0.01,
                    west: mapCenter.lng - 0.01
                  })}
                >
                  Área Pequena (2km²)
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAreaSearch({
                    north: mapCenter.lat + 0.02,
                    south: mapCenter.lat - 0.02,
                    east: mapCenter.lng + 0.02,
                    west: mapCenter.lng - 0.02
                  })}
                >
                  Área Média (8km²)
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAreaSearch({
                    north: mapCenter.lat + 0.05,
                    south: mapCenter.lat - 0.05,
                    east: mapCenter.lng + 0.05,
                    west: mapCenter.lng - 0.05
                  })}
                >
                  Área Grande (50km²)
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters */}
        {Object.keys(activeFilters).length > 0 && (
          <div className="space-y-2">
            <Label>Filtros Ativos</Label>
            <div className="flex flex-wrap gap-2">
              {activeFilters.radius && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Circle className="h-3 w-3" />
                  Raio: {activeFilters.radius}km
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={clearFilters}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              {activeFilters.bounds && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Square className="h-3 w-3" />
                  Área Selecionada
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={clearFilters}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              {activeFilters.polygon && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <PolygonIcon className="h-3 w-3" />
                  Polígono ({activeFilters.polygon.length} pontos)
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={clearFilters}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="text-sm text-muted-foreground">
          {filteredProperties.length} imóveis encontrados na área selecionada
          {Object.keys(activeFilters).length > 0 && (
            <Button
              variant="link"
              size="sm"
              className="ml-2 h-auto p-0 text-primary"
              onClick={clearFilters}
            >
              Limpar filtros
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}