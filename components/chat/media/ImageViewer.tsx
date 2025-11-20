'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  Download,
  Maximize2,
  Move,
  Info
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ImageViewerProps {
  src: string;
  alt?: string;
  title?: string;
  metadata?: {
    width?: number;
    height?: number;
    size?: number;
    type?: string;
  };
  onClose?: () => void;
  className?: string;
}

export function ImageViewer({ 
  src, 
  alt = 'Imagem',
  title,
  metadata,
  onClose,
  className = ''
}: ImageViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showInfo, setShowInfo] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset ao fechar
  useEffect(() => {
    if (!isFullscreen) {
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  }, [isFullscreen]);

  // Controles de zoom
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 5));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleZoomReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  // Rotação
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // Download
  const handleDownload = async () => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = title || 'image.jpg';
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar imagem:', error);
    }
  };

  // Arrastar imagem
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom com scroll
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.5, Math.min(5, prev + delta)));
  };

  // Formatar tamanho do arquivo
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Desconhecido';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const imageContent = (
    <div
      ref={containerRef}
      className={`relative bg-black/90 overflow-hidden select-none ${
        isFullscreen ? 'fixed inset-0 z-50' : 'rounded-lg'
      } ${className}`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Controles */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {title && (
              <h3 className="text-white font-medium">{title}</h3>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Info */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowInfo(!showInfo)}
              className="text-white hover:bg-white/20"
            >
              <Info className="h-4 w-4" />
            </Button>
            
            {/* Download */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              className="text-white hover:bg-white/20"
            >
              <Download className="h-4 w-4" />
            </Button>
            
            {/* Fullscreen */}
            {!isFullscreen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullscreen(true)}
                className="text-white hover:bg-white/20"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            )}
            
            {/* Fechar */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsFullscreen(false);
                onClose?.();
              }}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Imagem */}
      <div className="flex items-center justify-center h-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          className={`max-w-full max-h-full transition-transform duration-200 ${
            isDragging ? 'cursor-grabbing' : zoom > 1 ? 'cursor-grab' : 'cursor-default'
          }`}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
            transformOrigin: 'center',
          }}
          onMouseDown={handleMouseDown}
          draggable={false}
        />
      </div>
      
      {/* Controles de zoom */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 rounded-full p-2 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomOut}
          disabled={zoom <= 0.5}
          className="text-white hover:bg-white/20 h-8 w-8"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomReset}
          className="text-white hover:bg-white/20 text-xs min-w-[60px]"
        >
          {Math.round(zoom * 100)}%
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomIn}
          disabled={zoom >= 5}
          className="text-white hover:bg-white/20 h-8 w-8"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-white/30 mx-1" />
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRotate}
          className="text-white hover:bg-white/20 h-8 w-8"
        >
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Informações da imagem */}
      {showInfo && metadata && (
        <div className="absolute top-16 right-4 bg-black/70 rounded-lg p-3 text-white text-sm">
          <div className="space-y-1">
            {metadata.width && metadata.height && (
              <div>Dimensões: {metadata.width} × {metadata.height}px</div>
            )}
            {metadata.size && (
              <div>Tamanho: {formatFileSize(metadata.size)}</div>
            )}
            {metadata.type && (
              <div>Tipo: {metadata.type}</div>
            )}
          </div>
        </div>
      )}
      
      {/* Indicador de arraste */}
      {zoom > 1 && (
        <div className="absolute bottom-4 right-4 text-white/50 text-xs flex items-center gap-1">
          <Move className="h-3 w-3" />
          Arraste para mover
        </div>
      )}
    </div>
  );

  if (isFullscreen) {
    return imageContent;
  }

  return imageContent;
}

interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt?: string;
    title?: string;
    metadata?: ImageViewerProps['metadata'];
  }>;
  className?: string;
}

export function ImageGallery({ images, className = '' }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  
  const handlePrevious = useCallback(() => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  }, [selectedIndex]);
  
  const handleNext = useCallback(() => {
    if (selectedIndex !== null && selectedIndex < images.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  }, [selectedIndex, images.length]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex !== null) {
        if (e.key === 'ArrowLeft') handlePrevious();
        if (e.key === 'ArrowRight') handleNext();
        if (e.key === 'Escape') setSelectedIndex(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, handlePrevious, handleNext]);
  
  return (
    <>
      <div className={`grid grid-cols-2 md:grid-cols-3 gap-2 ${className}`}>
        {images.map((image, index) => (
          <div
            key={index}
            className="relative aspect-square cursor-pointer overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
            onClick={() => setSelectedIndex(index)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
      
      {selectedIndex !== null && (
        <Dialog open={true} onOpenChange={() => setSelectedIndex(null)}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden">
            <ImageViewer
              {...images[selectedIndex]}
              onClose={() => setSelectedIndex(null)}
              className="h-[90vh]"
            />
            
            {images.length > 1 && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/70 rounded-full px-3 py-1 text-white text-sm">
                {selectedIndex + 1} / {images.length}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}