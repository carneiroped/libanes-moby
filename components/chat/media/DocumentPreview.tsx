'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  FileText,
  Download,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Search,
  Copy,
  Loader2,
  X
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface DocumentPreviewProps {
  src: string;
  title?: string;
  pageCount?: number;
  extractedText?: string;
  onTextExtract?: (text: string) => void;
  className?: string;
}

export function DocumentPreview({ 
  src, 
  title = 'Documento',
  pageCount: initialPageCount,
  extractedText,
  onTextExtract,
  className = ''
}: DocumentPreviewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(initialPageCount || 1);
  const [zoom, setZoom] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTextView, setShowTextView] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset ao mudar documento
  useEffect(() => {
    setCurrentPage(1);
    setZoom(1);
    setSearchTerm('');
    setShowTextView(false);
    setError(null);
  }, [src]);

  // Navegação entre páginas
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= pageCount) {
      setCurrentPage(page);
    }
  }, [pageCount]);

  const handlePageInput = (value: string) => {
    const page = parseInt(value);
    if (!isNaN(page)) {
      goToPage(page);
    }
  };

  // Controles de zoom
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleZoomReset = () => {
    setZoom(1);
  };

  // Download do documento
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = title;
    link.click();
  };

  // Copiar texto extraído
  const handleCopyText = () => {
    if (extractedText) {
      navigator.clipboard.writeText(extractedText);
    }
  };

  // Busca no texto
  const highlightSearchTerm = (text: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-300">$1</mark>');
  };

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPage(currentPage - 1);
      if (e.key === 'ArrowRight') goToPage(currentPage + 1);
      if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false);
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, isFullscreen, goToPage]);

  const documentContent = (
    <div className={`bg-background rounded-lg overflow-hidden ${isFullscreen ? 'h-screen' : ''} ${className}`}>
      {/* Barra de ferramentas */}
      <div className="border-b p-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium truncate max-w-[200px]">{title}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Busca */}
            {extractedText && (
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-input"
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-40"
                />
              </div>
            )}
            
            {/* Toggle visualização */}
            {extractedText && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTextView(!showTextView)}
              >
                {showTextView ? 'PDF' : 'Texto'}
              </Button>
            )}
            
            {/* Zoom */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomReset}
                className="min-w-[60px]"
              >
                {Math.round(zoom * 100)}%
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomIn}
                disabled={zoom >= 3}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Ações */}
            <div className="flex items-center gap-1">
              {extractedText && showTextView && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyText}
                  title="Copiar texto"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                title="Baixar documento"
              >
                <Download className="h-4 w-4" />
              </Button>
              
              {!isFullscreen && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsFullscreen(true)}
                  title="Tela cheia"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              )}
              
              {isFullscreen && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsFullscreen(false)}
                  title="Sair da tela cheia"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Área de visualização */}
      <div className={`relative bg-muted/30 ${isFullscreen ? 'h-[calc(100%-120px)]' : 'h-[600px]'}`}>
        {error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">{error}</p>
            </div>
          </div>
        ) : showTextView && extractedText ? (
          // Visualização de texto
          <div className="h-full overflow-auto p-6">
            <div
              className="max-w-4xl mx-auto bg-background rounded-lg p-6 shadow-sm"
              style={{ fontSize: `${zoom * 100}%` }}
              dangerouslySetInnerHTML={{
                __html: highlightSearchTerm(extractedText.replace(/\n/g, '<br>'))
              }}
            />
          </div>
        ) : (
          // Visualização PDF (iframe ou embed)
          <div className="h-full w-full flex items-center justify-center">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
            
            <iframe
              src={`${src}#page=${currentPage}&zoom=${zoom * 100}`}
              className="w-full h-full"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setError('Não foi possível carregar o documento');
              }}
            />
          </div>
        )}
      </div>
      
      {/* Controles de navegação */}
      {!showTextView && pageCount > 1 && (
        <div className="border-t p-3">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={pageCount}
                value={currentPage}
                onChange={(e) => handlePageInput(e.target.value)}
                className="w-16 text-center"
              />
              <span className="text-sm text-muted-foreground">
                de {pageCount}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= pageCount}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  if (isFullscreen) {
    return (
      <Dialog open={true} onOpenChange={() => setIsFullscreen(false)}>
        <DialogContent className="max-w-[100vw] max-h-[100vh] w-screen h-screen p-0">
          {documentContent}
        </DialogContent>
      </Dialog>
    );
  }

  return documentContent;
}

interface DocumentListProps {
  documents: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    uploadedAt: Date;
  }>;
  onSelect: (doc: any) => void;
  className?: string;
}

export function DocumentList({ documents, onSelect, className = '' }: DocumentListProps) {
  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    // Adicionar ícones específicos por tipo se necessário
    return <FileText className="h-5 w-5" />;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
          onClick={() => onSelect(doc)}
        >
          <div className="text-muted-foreground">
            {getFileIcon(doc.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{doc.name}</p>
            <p className="text-sm text-muted-foreground">
              {formatFileSize(doc.size)} • {new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
          
          <Button variant="ghost" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}