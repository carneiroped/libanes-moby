'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Upload,
  FileText,
  Image,
  File,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { azureClient } from '@/lib/azure-client';
import { toast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface FileWithPreview extends File {
  preview?: string;
}

const documentTypes = [
  { value: 'identity', label: 'Documento de Identidade' },
  { value: 'cpf', label: 'CPF' },
  { value: 'proof_of_income', label: 'Comprovante de Renda' },
  { value: 'proof_of_address', label: 'Comprovante de Endereço' },
  { value: 'bank_statement', label: 'Extrato Bancário' },
  { value: 'contract', label: 'Contrato' },
  { value: 'other', label: 'Outro' }
];

const allowedTypes = {
  'application/pdf': { icon: FileText, color: 'text-red-500' },
  'image/jpeg': { icon: Image, color: 'text-green-500' },
  'image/jpg': { icon: Image, color: 'text-green-500' },
  'image/png': { icon: Image, color: 'text-green-500' },
  'image/webp': { icon: Image, color: 'text-green-500' },
};

interface DocumentUploadProps {
  open: boolean;
  onClose: () => void;
  onUploadComplete?: () => void;
}

export function DocumentUpload({ open, onClose, onUploadComplete }: DocumentUploadProps) {
  const azureApi = azureClient;
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documentType, setDocumentType] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentDescription, setDocumentDescription] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      const isValidType = Object.keys(allowedTypes).includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB

      if (!isValidType) {
        toast({
          title: 'Tipo de arquivo inválido',
          description: `${file.name} não é um tipo de arquivo permitido.`,
          variant: 'destructive',
        });
        return false;
      }

      if (!isValidSize) {
        toast({
          title: 'Arquivo muito grande',
          description: `${file.name} excede o limite de 10MB.`,
          variant: 'destructive',
        });
        return false;
      }

      return true;
    });

    const filesWithPreview = validFiles.map(file => {
      if (file.type.startsWith('image/')) {
        Object.assign(file, {
          preview: URL.createObjectURL(file)
        });
      }
      return file as FileWithPreview;
    });

    setFiles(prev => [...prev, ...filesWithPreview]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: Object.keys(allowedTypes).reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      const file = newFiles[index];
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!documentType || !documentTitle || files.length === 0) {
        throw new Error('Preencha todos os campos obrigatórios');
      }

      setUploading(true);
      const uploadedFiles = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `documents/${fileName}`;

        // Upload do arquivo
        const { error: uploadError, data } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Criar registro do documento
        const { error: dbError } = await supabase
          .from('documents')
          .insert({
            file_path: data.path,
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
            metadata: {
              type: documentType,
              title: documentTitle,
              description: documentDescription,
              original_name: file.name,
              uploaded_at: new Date().toISOString()
            }
          });

        if (dbError) throw dbError;

        uploadedFiles.push(file.name);
        setUploadProgress(((i + 1) / files.length) * 100);
      }

      return uploadedFiles;
    },
    onSuccess: (uploadedFiles) => {
      toast({
        title: 'Upload concluído',
        description: `${uploadedFiles.length} arquivo(s) enviado(s) com sucesso.`,
      });
      queryClient.invalidateQueries({ queryKey: ['client-documents', 'documents'] });
      
      // Limpar estado
      setFiles([]);
      setDocumentType('');
      setDocumentTitle('');
      setDocumentDescription('');
      setUploadProgress(0);
      
      onUploadComplete?.();
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Erro no upload',
        description: 'Não foi possível enviar os arquivos.',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setUploading(false);
    }
  });

  const handleUpload = () => {
    uploadMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload de Documentos</DialogTitle>
          <DialogDescription>
            Envie seus documentos de forma segura. Arquivos aceitos: PDF, JPG, PNG (máx. 10MB)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do documento */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="type">Tipo de Documento *</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Título do Documento *</Label>
              <Input
                id="title"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="Ex: RG Frente e Verso"
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                value={documentDescription}
                onChange={(e) => setDocumentDescription(e.target.value)}
                placeholder="Adicione detalhes relevantes sobre o documento..."
                rows={2}
              />
            </div>
          </div>

          {/* Área de upload */}
          <div>
            <Label>Arquivos *</Label>
            <div
              {...getRootProps()}
              className={`
                mt-2 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                transition-colors duration-200
                ${isDragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              {isDragActive ? (
                <p className="text-blue-600">Solte os arquivos aqui...</p>
              ) : (
                <>
                  <p className="text-gray-600">
                    Arraste arquivos aqui ou clique para selecionar
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    PDF, JPG, PNG até 10MB
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Lista de arquivos */}
          {files.length > 0 && (
            <div className="space-y-2">
              <Label>Arquivos selecionados</Label>
              {files.map((file, index) => {
                const fileType = allowedTypes[file.type as keyof typeof allowedTypes];
                const FileIcon = fileType?.icon || File;
                
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                  >
                    <div className={`${fileType?.color || 'text-gray-500'}`}>
                      <FileIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                      disabled={uploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Progress bar */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Enviando arquivos...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {/* Ações */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={uploading}>
              Cancelar
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!documentType || !documentTitle || files.length === 0 || uploading}
            >
              {uploading ? 'Enviando...' : 'Enviar Documentos'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}