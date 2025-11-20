'use client';

import { useRouter } from 'next/navigation';
import { useState, useCallback, useRef } from 'react';
import { useCreateProperty } from '@/hooks/useImoveis';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import type { PropertyType, PropertyPurpose, PropertyStatus } from '@/types/database-schema.types';
import { useAccount } from '@/hooks/useAccount';
import { 
  ValidatedForm, 
  ValidatedInput, 
  ValidatedSelect, 
  ValidatedTextarea,
  ValidatedEmailInput,
  ValidatedPhoneInput,
  ValidatedCurrencyInput,
  ValidatedDescriptionTextarea,
  FormSection,
  FormGrid,
  FormField,
  CommonValidations,
  COMMON_FORM_RULES,
  ValidationRules
} from '@/components/forms';
import { StandardDragDrop, StandardLoadingState } from '@/components/ui/ux-patterns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Upload, 
  X, 
  Eye, 
  Star,
  MapPin,
  Home as HomeIcon,
  Video,
  Youtube,
  Globe,
  ChevronDown,
  ChevronUp,
  GripVertical
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface PropertyFormData {
  // Basic Info (Required)
  title: string;
  type: PropertyType;
  purpose: PropertyPurpose;
  status: PropertyStatus;
  
  // Location
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  latitude?: string;
  longitude?: string;
  
  // Features
  total_area?: string;
  built_area?: string;
  land_area?: string;
  bedrooms?: string;
  suites?: string;
  bathrooms?: string;
  parking_spaces?: string;
  floor?: string;
  
  // Values
  sale_price?: string;
  rent_price?: string;
  condo_fee?: string;
  iptu?: string;
  
  // Description
  description?: string;
  
  // Owner
  owner_name?: string;
  owner_phone?: string;
  owner_email?: string;
  commission?: string;
  
  // Media
  virtual_tour_url?: string;
  video_url?: string;
  youtube_url?: string;
  
  // SEO
  meta_title?: string;
  meta_description?: string;
  site?: string;
  
  // Pricing Options
  cash_price?: string;
  standard_72x_total?: string;
  standard_72x_monthly?: string;
  standard_72x_down_payment?: string;
  special_25_75_total?: string;
  special_25_75_balloon?: string;
  special_25_75_monthly_24x?: string;
  special_25_75_down_payment?: string;
}

interface PropertyImage {
  id: string;
  file: File;
  preview: string;
  isMain: boolean;
  uploading?: boolean;
  uploaded?: boolean;
}

interface PropertyVideo {
  file: File;
  preview: string;
  uploading?: boolean;
  uploaded?: boolean;
}

// Common amenities for checkbox selection
const AMENITIES = [
  { id: 'pool', label: 'Piscina' },
  { id: 'gym', label: 'Academia' },
  { id: 'playground', label: 'Playground' },
  { id: 'barbecue', label: 'Churrasqueira' },
  { id: 'balcony', label: 'Sacada' },
  { id: 'furnished', label: 'Mobiliado' },
  { id: 'elevator', label: 'Elevador' },
  { id: 'security', label: 'Portaria 24h' },
  { id: 'garden', label: 'Jardim' },
  { id: 'aircon', label: 'Ar Condicionado' },
  { id: 'fireplace', label: 'Lareira' },
  { id: 'closet', label: 'Closet' }
];

export default function NewPropertyPage() {
  const router = useRouter();
  const createProperty = useCreateProperty();
  const { account } = useAccount();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  // Form defaults (handled by ValidatedForm)
  const formDefaults = {
    type: 'apartment',
    purpose: 'sale',
    status: 'available',
  };
  
  // Advanced form state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [video, setVideo] = useState<PropertyVideo | null>(null);
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  
  // Form validation configuration with manual rules (avoiding SSR issues)
  const formValidationRules = {
    title: [
      { type: 'required' as const, message: 'Título é obrigatório' },
      { type: 'min' as const, value: 10, message: 'Título deve ter pelo menos 10 caracteres' },
      { type: 'max' as const, value: 100, message: 'Título deve ter no máximo 100 caracteres' }
    ],
    type: [{ type: 'required' as const, message: 'Seleção obrigatória' }],
    purpose: [{ type: 'required' as const, message: 'Seleção obrigatória' }],
    status: [{ type: 'required' as const, message: 'Seleção obrigatória' }],
    sale_price: [{ type: 'currency' as const, message: 'Valor monetário inválido' }],
    rent_price: [{ type: 'currency' as const, message: 'Valor monetário inválido' }],
    condo_fee: [{ type: 'currency' as const, message: 'Valor monetário inválido' }],
    iptu: [{ type: 'currency' as const, message: 'Valor monetário inválido' }],
    owner_email: [{ type: 'email' as const, message: 'E-mail inválido' }],
    owner_phone: [{ type: 'phone' as const, message: 'Telefone inválido' }],
    virtual_tour_url: [{ type: 'url' as const, message: 'URL inválida' }],
    total_area: [{ type: 'pattern' as const, value: /^\d+(\.\d{1,2})?$/, message: 'Área deve ser um número válido' }],
    built_area: [{ type: 'pattern' as const, value: /^\d+(\.\d{1,2})?$/, message: 'Área deve ser um número válido' }],
    land_area: [{ type: 'pattern' as const, value: /^\d+(\.\d{1,2})?$/, message: 'Área deve ser um número válido' }],
  };

  // Handle file uploads
  const handleImageDrop = useCallback(async (files: FileList) => {
    const newImages: PropertyImage[] = [];
    
    // Check total limit (30 images)
    if (images.length + files.length > 30) {
      alert('Máximo de 30 imagens permitido');
      return;
    }
    
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      
      const id = `img-${Date.now()}-${Math.random()}`;
      const preview = URL.createObjectURL(file);
      
      newImages.push({
        id,
        file,
        preview,
        isMain: images.length === 0 && newImages.length === 0, // First image is main
        uploading: true
      });
      
      // Simulate upload progress
      simulateUploadProgress(id);
    });
    
    setImages(prev => [...prev, ...newImages]);
  }, [images.length]);
  
  const handleVideoDrop = useCallback(async (files: FileList) => {
    const file = files[0];
    if (!file.type.startsWith('video/')) return;
    
    // Max 100MB
    if (file.size > 100 * 1024 * 1024) {
      alert('Vídeo deve ter no máximo 100MB');
      return;
    }
    
    const preview = URL.createObjectURL(file);
    const newVideo: PropertyVideo = {
      file,
      preview,
      uploading: true
    };
    
    setVideo(newVideo);
    
    // Simulate upload
    const uploadId = 'video-upload';
    simulateUploadProgress(uploadId);
  }, []);
  
  const simulateUploadProgress = (id: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      
      setUploadProgress(prev => ({ ...prev, [id]: Math.min(progress, 100) }));
      
      if (progress >= 100) {
        clearInterval(interval);
        // Mark as uploaded
        if (id === 'video-upload') {
          setVideo(prev => prev ? { ...prev, uploading: false, uploaded: true } : null);
        } else {
          setImages(prev => prev.map(img => 
            img.id === id ? { ...img, uploading: false, uploaded: true } : img
          ));
        }
        
        // Clean up progress
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[id];
            return newProgress;
          });
        }, 1000);
      }
    }, 200);
  };
  
  const removeImage = (id: string) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      // If we removed the main image, make the first one main
      if (filtered.length > 0 && !filtered.some(img => img.isMain)) {
        filtered[0].isMain = true;
      }
      return filtered;
    });
  };
  
  const setMainImage = (id: string) => {
    setImages(prev => prev.map(img => ({
      ...img,
      isMain: img.id === id
    })));
  };
  
  // Drag and drop for image reordering
  const handleDragStart = (index: number) => {
    setDraggedImageIndex(index);
  };
  
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedImageIndex === null) return;
    
    const newImages = [...images];
    const draggedImage = newImages[draggedImageIndex];
    
    newImages.splice(draggedImageIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);
    
    setImages(newImages);
    setDraggedImageIndex(null);
  };
  
  const handleAmenityChange = (amenityId: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenityId) 
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const onSubmit = async (data: Record<string, any>) => {
    try {
      if (!account?.id) {
        throw new Error('Account context required');
      }

      // Basic validation (form validation handles most cases)
      if (!data.title) {
        throw new Error('Título é obrigatório');
      }

      // TODO: Upload images and video to blob storage
      // Mapear dados para estrutura da tabela imoveis (campos em português)
      const imovelData = {
        // Campos obrigatórios
        account_id: account.id,
        titulo: data.title,
        descricao: data.description || null,
        tipo: data.type || 'apartment',
        status: data.status || 'available',

        // Localização
        rua: data.street || null,
        numero: data.number || null,
        complemento: data.complement || null,
        bairro: data.neighborhood || null,
        cidade: data.city || null,
        estado: data.state || null,
        cep: data.zipCode || null,
        lat: data.latitude ? String(data.latitude) : null,
        long: data.longitude ? String(data.longitude) : null,

        // Áreas
        m2: data.total_area ? parseFloat(data.total_area) : null,
        area_construida: data.built_area ? parseFloat(data.built_area) : null,
        area_terreno: data.land_area ? parseFloat(data.land_area) : null,

        // Características
        quartos: data.bedrooms ? parseInt(data.bedrooms) : null,
        suites: data.suites ? parseInt(data.suites) : null,
        banheiros: data.bathrooms ? parseInt(data.bathrooms) : null,
        vagas_garagem: data.parking_spaces ? parseInt(data.parking_spaces) : null,
        andar: data.floor ? parseInt(data.floor) : null,
        garagem: data.parking_spaces ? parseInt(data.parking_spaces) > 0 : null,

        // Valores - mapear purpose para loc_venda e determinar valor
        loc_venda: data.purpose === 'sale' ? 'venda' : data.purpose === 'rent' ? 'locacao' : null,
        valor: data.purpose === 'sale'
          ? (data.sale_price ? parseFloat(data.sale_price) : null)
          : (data.rent_price ? parseFloat(data.rent_price) : null),
        condominio_mensal: data.condo_fee ? parseFloat(data.condo_fee) : null,
        iptu_mensal: data.iptu ? parseFloat(data.iptu) : null,

        // Proprietário
        proprietario_nome: data.owner_name || null,
        proprietario_telefone: data.owner_phone || null,
        proprietario_email: data.owner_email || null,
        comissao_percentual: data.commission ? parseFloat(data.commission) : null,

        // Mídia
        foto: images.length > 0 ? images[0].preview : null,
        galeria_fotos: images.length > 0 ? images.map(img => img.preview) : null,
        video_url: video ? video.preview : null,
        tour_virtual_url: data.virtual_tour_url || null,

        // SEO e Marketing
        meta_titulo: data.meta_title || null,
        meta_descricao: data.meta_description || null,
        site: data.site || null,

        // Características adicionais (JSONB)
        caracteristicas: selectedAmenities.length > 0 ? selectedAmenities : null,

        // Outros campos opcionais
        aceita_financiamento: true,
        aceita_permuta: false,
        documentacao_ok: false,
        archived: false
      };

      await createProperty.mutateAsync(imovelData as any);
      router.push('/admin/imoveis');
    } catch (error) {
      console.error('Erro ao criar:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/admin/imoveis')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Novo Imóvel</h1>
          <p className="text-muted-foreground">Cadastre um novo imóvel no sistema</p>
        </div>
      </div>

      <ValidatedForm
        formId="new-property"
        fields={formValidationRules}
        onSubmit={onSubmit}
        submitText="Criar Imóvel"
        showValidationSummary={true}
        isLoading={createProperty.isPending}
        loadingText="Salvando imóvel..."
        onReset={() => router.push('/admin/imoveis')}
      >
        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic">Básico</TabsTrigger>
            <TabsTrigger value="location">Localização</TabsTrigger>
            <TabsTrigger value="features">Características</TabsTrigger>
            <TabsTrigger value="media">Mídia</TabsTrigger>
            <TabsTrigger value="values">Valores</TabsTrigger>
            <TabsTrigger value="advanced">Avançado</TabsTrigger>
          </TabsList>

          {/* BASIC INFO TAB */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>
                  Dados essenciais do imóvel (campos obrigatórios)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormSection title="Informações Obrigatórias" required>
                  <FormField>
                    <ValidatedInput
                      id="title"
                      name="title"
                      formId="new-property"
                      rules={formValidationRules.title}
                      label="Título"
                      placeholder="Ex: Apartamento 3 quartos em Copacabana"
                      required
                      helpText="Título atrativo e descritivo do imóvel"
                    />
                  </FormField>

                  <FormGrid columns={3}>
                    <ValidatedSelect
                      id="type"
                      name="type"
                      formId="new-property"
                      rules={formValidationRules.type}
                      label="Tipo"
                      placeholder="Selecione o tipo..."
                      required
                      options={[
                        { value: 'apartment', label: 'Apartamento' },
                        { value: 'house', label: 'Casa' },
                        { value: 'commercial', label: 'Comercial' },
                        { value: 'land', label: 'Terreno' },
                        { value: 'rural', label: 'Rural' }
                      ]}
                    />
                    
                    <ValidatedSelect
                      id="purpose"
                      name="purpose"
                      formId="new-property"
                      rules={formValidationRules.purpose}
                      label="Finalidade"
                      placeholder="Selecione..."
                      required
                      options={[
                        { value: 'sale', label: 'Venda' },
                        { value: 'rent', label: 'Locação' }
                      ]}
                    />
                    
                    <ValidatedSelect
                      id="status"
                      name="status"
                      formId="new-property"
                      rules={formValidationRules.status}
                      label="Status"
                      defaultValue="available"
                      options={[
                        { value: 'available', label: 'Disponível' },
                        { value: 'reserved', label: 'Reservado' },
                        { value: 'sold', label: 'Vendido' },
                        { value: 'rented', label: 'Alugado' },
                        { value: 'unavailable', label: 'Indisponível' }
                      ]}
                    />
                  </FormGrid>
                </FormSection>

                <FormSection title="Descrição e Valores">
                  <FormField>
                    <ValidatedDescriptionTextarea
                      id="description"
                      name="description"
                      formId="new-property"
                      label="Descrição"
                      placeholder="Descreva os principais atributos e diferenciais do imóvel..."
                      minWords={10}
                      maxWords={200}
                    />
                  </FormField>

                  <FormGrid columns={2}>
                    <ValidatedCurrencyInput
                      id="sale_price"
                      name="sale_price"
                      formId="new-property"
                      label="Preço de Venda"
                      placeholder="R$ 0,00"
                      helpText="Valor para venda do imóvel"
                    />
                    
                    <ValidatedCurrencyInput
                      id="rent_price"
                      name="rent_price"
                      formId="new-property"
                      label="Preço de Aluguel"
                      placeholder="R$ 0,00"
                      helpText="Valor mensal de locação"
                    />
                  </FormGrid>
                </FormSection>
              </CardContent>
            </Card>
          </TabsContent>

          {/* LOCATION TAB */}
          <TabsContent value="location">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Localização
                </CardTitle>
                <CardDescription>
                  Endereço completo e coordenadas geográficas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormSection title="Endereço Principal">
                  <FormGrid columns={3}>
                    <div className="col-span-2">
                      <ValidatedInput
                        id="street"
                        name="street"
                        formId="new-property"
                        rules={[]}
                        label="Rua/Avenida"
                        placeholder="Nome da rua"
                      />
                    </div>
                    <ValidatedInput
                      id="number"
                      name="number"
                      formId="new-property"
                      rules={[]}
                      label="Número"
                      placeholder="123"
                    />
                  </FormGrid>

                  <ValidatedInput
                    id="complement"
                    name="complement"
                    formId="new-property"
                    rules={[]}
                    label="Complemento"
                    placeholder="Apartamento, bloco, etc."
                    helpText="Informações adicionais do endereço"
                  />
                </FormSection>

                <FormSection title="Localização">
                  <FormGrid columns={3}>
                    <ValidatedInput
                      id="neighborhood"
                      name="neighborhood"
                      formId="new-property"
                      rules={[]}
                      label="Bairro"
                      placeholder="Nome do bairro"
                    />
                    
                    <ValidatedInput
                      id="city"
                      name="city"
                      formId="new-property"
                      rules={[]}
                      label="Cidade"
                      placeholder="Nome da cidade"
                    />
                    
                    <ValidatedInput
                      id="state"
                      name="state"
                      formId="new-property"
                      rules={[{ type: 'pattern' as const, value: /^[A-Z]{2}$/, message: 'Use formato: SP' }]}
                      label="Estado"
                      placeholder="SP"
                      helpText="Sigla do estado (2 letras)"
                    />
                  </FormGrid>

                  <FormGrid columns={3}>
                    <ValidatedInput
                      id="zipCode"
                      name="zipCode"
                      formId="new-property"
                      rules={[{ type: 'pattern' as const, value: /^\d{5}-?\d{3}$/, message: 'Formato: 00000-000' }]}
                      label="CEP"
                      placeholder="00000-000"
                      formatter="phone"
                    />
                    
                    <ValidatedInput
                      id="latitude"
                      name="latitude"
                      formId="new-property"
                      rules={[]}
                      label="Latitude"
                      type="number"
                      placeholder="-23.5505"
                      helpText="Coordenada geográfica"
                    />
                    
                    <ValidatedInput
                      id="longitude"
                      name="longitude"
                      formId="new-property"
                      rules={[]}
                      label="Longitude"
                      type="number"
                      placeholder="-46.6333"
                      helpText="Coordenada geográfica"
                    />
                  </FormGrid>
                </FormSection>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FEATURES TAB */}
          <TabsContent value="features">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HomeIcon className="h-5 w-5" />
                    Características Físicas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormSection title="Áreas">
                    <FormGrid columns={3}>
                      <ValidatedInput
                        id="total_area"
                        name="total_area"
                        formId="new-property"
                        rules={formValidationRules.total_area}
                        label="Área Total (m²)"
                        type="number"
                        placeholder="120.50"
                        helpText="Área total do imóvel"
                      />
                      
                      <ValidatedInput
                        id="built_area"
                        name="built_area"
                        formId="new-property"
                        rules={formValidationRules.built_area}
                        label="Área Construída (m²)"
                        type="number"
                        placeholder="95.00"
                        helpText="Área útil construída"
                      />
                      
                      <ValidatedInput
                        id="land_area"
                        name="land_area"
                        formId="new-property"
                        rules={formValidationRules.land_area}
                        label="Área do Terreno (m²)"
                        type="number"
                        placeholder="200.00"
                        helpText="Área do terreno (casas/lotes)"
                      />
                    </FormGrid>
                  </FormSection>

                  <FormSection title="Cômodos">
                    <FormGrid columns={5}>
                      <ValidatedInput
                        id="bedrooms"
                        name="bedrooms"
                        formId="new-property"
                        rules={[{ type: 'pattern' as const, value: /^\d+$/, message: 'Deve ser um número inteiro' }]}
                        label="Quartos"
                        type="number"
                        placeholder="3"
                      />

                      <ValidatedInput
                        id="suites"
                        name="suites"
                        formId="new-property"
                        rules={[{ type: 'pattern' as const, value: /^\d+$/, message: 'Deve ser um número inteiro' }]}
                        label="Suítes"
                        type="number"
                        placeholder="1"
                      />

                      <ValidatedInput
                        id="bathrooms"
                        name="bathrooms"
                        formId="new-property"
                        rules={[{ type: 'pattern' as const, value: /^\d+$/, message: 'Deve ser um número inteiro' }]}
                        label="Banheiros"
                        type="number"
                        placeholder="2"
                      />

                      <ValidatedInput
                        id="parking_spaces"
                        name="parking_spaces"
                        formId="new-property"
                        rules={[{ type: 'pattern' as const, value: /^\d+$/, message: 'Deve ser um número inteiro' }]}
                        label="Vagas"
                        type="number"
                        placeholder="2"
                      />

                      <ValidatedInput
                        id="floor"
                        name="floor"
                        formId="new-property"
                        rules={[{ type: 'pattern' as const, value: /^\d+$/, message: 'Deve ser um número inteiro' }]}
                        label="Andar"
                        type="number"
                        placeholder="5"
                      />
                    </FormGrid>
                  </FormSection>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Comodidades</CardTitle>
                  <CardDescription>
                    Selecione as comodidades disponíveis no imóvel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {AMENITIES.map((amenity) => (
                      <div key={amenity.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity.id}
                          checked={selectedAmenities.includes(amenity.id)}
                          onCheckedChange={() => handleAmenityChange(amenity.id)}
                        />
                        <label
                          htmlFor={amenity.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {amenity.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* MEDIA TAB */}
          <TabsContent value="media">
            <div className="space-y-6">
              {/* Image Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Imagens ({images.length}/30)
                  </CardTitle>
                  <CardDescription>
                    Faça upload de até 30 imagens. Arraste para reordenar. A primeira imagem será a principal.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <StandardDragDrop
                    onDrop={handleImageDrop}
                    accept={['image/*']}
                    multiple
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
                  >
                    <div className="space-y-2">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">Arraste imagens aqui ou clique para selecionar</p>
                        <p>Suporte para JPG, PNG, WebP (máx. 10MB por imagem)</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Escolher Arquivos
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files && handleImageDrop(e.target.files)}
                      />
                    </div>
                  </StandardDragDrop>

                  {/* Image Preview Grid */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {images.map((image, index) => (
                        <div
                          key={image.id}
                          className="relative group"
                          draggable
                          onDragStart={() => handleDragStart(index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDrop={(e) => handleDrop(e, index)}
                        >
                          <div className="aspect-square relative rounded-lg overflow-hidden border-2 border-gray-200">
                            <Image
                              src={image.preview}
                              alt="Property preview"
                              fill
                              className="object-cover"
                            />
                            
                            {/* Main image badge */}
                            {image.isMain && (
                              <Badge className="absolute top-2 left-2 bg-yellow-500">
                                <Star className="h-3 w-3 mr-1" />
                                Principal
                              </Badge>
                            )}
                            
                            {/* Upload progress */}
                            {image.uploading && uploadProgress[image.id] !== undefined && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <div className="text-center text-white">
                                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-1" />
                                  <div className="text-xs">
                                    {Math.round(uploadProgress[image.id])}%
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Actions overlay */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => setMainImage(image.id)}
                                  disabled={image.isMain}
                                >
                                  <Star className="h-3 w-3" />
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => removeImage(image.id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            
                            {/* Drag handle */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
                              <GripVertical className="h-4 w-4 text-white drop-shadow-lg" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Video Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Vídeo
                  </CardTitle>
                  <CardDescription>
                    Faça upload de um vídeo do imóvel (máx. 100MB)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!video ? (
                    <StandardDragDrop
                      onDrop={handleVideoDrop}
                      accept={['video/*']}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
                    >
                      <div className="space-y-2">
                        <Video className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="text-sm text-gray-600">
                          <p className="font-medium">Arraste um vídeo aqui ou clique para selecionar</p>
                          <p>Suporte para MP4, WebM, AVI (máx. 100MB)</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => videoInputRef.current?.click()}
                        >
                          Escolher Vídeo
                        </Button>
                        <input
                          ref={videoInputRef}
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={(e) => e.target.files && handleVideoDrop(e.target.files)}
                        />
                      </div>
                    </StandardDragDrop>
                  ) : (
                    <div className="relative">
                      <div className="aspect-video relative rounded-lg overflow-hidden border">
                        <video
                          src={video.preview}
                          className="w-full h-full object-cover"
                          controls
                        />
                        
                        {video.uploading && uploadProgress['video-upload'] !== undefined && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <div className="text-center text-white">
                              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                              <div className="text-sm">
                                Enviando... {Math.round(uploadProgress['video-upload'])}%
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setVideo(null)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Online Media Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Links Externos
                  </CardTitle>
                  <CardDescription>
                    Links para tours virtuais, vídeos no YouTube, etc.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormSection title="Links de Mídia">
                    <ValidatedInput
                      id="virtual_tour_url"
                      name="virtual_tour_url"
                      formId="new-property"
                      rules={formValidationRules.virtual_tour_url}
                      label="Tour Virtual 360°"
                      type="url"
                      placeholder="https://my.matterport.com/show/?m=..."
                      helpText="Link para tour virtual Matterport ou similar"
                    />
                    
                    <ValidatedInput
                      id="youtube_url"
                      name="youtube_url"
                      formId="new-property"
                      rules={[{ type: 'url' as const, message: 'URL inválida' }]}
                      label="Vídeo no YouTube"
                      type="url"
                      placeholder="https://youtube.com/watch?v=..."
                      helpText="Link para vídeo promocional no YouTube"
                    />
                  </FormSection>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* VALUES TAB */}
          <TabsContent value="values">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Valores Principais</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormSection title="Preços Principais">
                    <FormGrid columns={2}>
                      <ValidatedCurrencyInput
                        id="sale_price_full"
                        name="sale_price"
                        formId="new-property"
                        label="Preço de Venda"
                        placeholder="R$ 850.000,00"
                        helpText="Valor total para venda"
                      />
                      
                      <ValidatedCurrencyInput
                        id="rent_price_full"
                        name="rent_price"
                        formId="new-property"
                        label="Preço de Aluguel"
                        placeholder="R$ 3.500,00"
                        helpText="Valor mensal de locação"
                      />
                    </FormGrid>
                  </FormSection>

                  <FormSection title="Custos Mensais">
                    <FormGrid columns={2}>
                      <ValidatedCurrencyInput
                        id="condo_fee"
                        name="condo_fee"
                        formId="new-property"
                        label="Condomínio"
                        placeholder="R$ 450,00"
                        helpText="Taxa mensal de condomínio"
                      />
                      
                      <ValidatedCurrencyInput
                        id="iptu"
                        name="iptu"
                        formId="new-property"
                        label="IPTU"
                        placeholder="R$ 250,00"
                        helpText="Imposto predial mensal"
                      />
                    </FormGrid>
                  </FormSection>
                </CardContent>
              </Card>

              {/* Advanced Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle
                    className="cursor-pointer flex items-center justify-between"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                  >
                    <span>Opções de Financiamento</span>
                    {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CardTitle>
                </CardHeader>
                
                {showAdvanced && (
                  <CardContent className="space-y-6">
                    {/* Cash Price */}
                    <ValidatedCurrencyInput
                      id="cash_price"
                      name="cash_price"
                      formId="new-property"
                      label="Preço à Vista"
                      placeholder="R$ 800.000,00"
                      helpText="Valor para pagamento à vista"
                    />

                    {/* Standard 72x Plan */}
                    <div className="space-y-4 border-t pt-4">
                      <h4 className="font-medium">Parcelamento Padrão (72x)</h4>
                      <FormGrid columns={3}>
                        <ValidatedCurrencyInput
                          id="standard_72x_total"
                          name="standard_72x_total"
                          formId="new-property"
                          label="Valor Total"
                          placeholder="R$ 850.000,00"
                        />
                        <ValidatedCurrencyInput
                          id="standard_72x_monthly"
                          name="standard_72x_monthly"
                          formId="new-property"
                          label="Parcela Mensal"
                          placeholder="R$ 11.805,00"
                        />
                        <ValidatedCurrencyInput
                          id="standard_72x_down_payment"
                          name="standard_72x_down_payment"
                          formId="new-property"
                          label="Entrada"
                          placeholder="R$ 85.000,00"
                        />
                      </FormGrid>
                    </div>

                    {/* Special 25/75 Plan */}
                    <div className="space-y-4 border-t pt-4">
                      <h4 className="font-medium">Plano Especial 25/75</h4>
                      <FormGrid columns={2}>
                        <ValidatedCurrencyInput
                          id="special_25_75_total"
                          name="special_25_75_total"
                          formId="new-property"
                          label="Valor Total"
                          placeholder="R$ 900.000,00"
                        />
                        <ValidatedCurrencyInput
                          id="special_25_75_balloon"
                          name="special_25_75_balloon"
                          formId="new-property"
                          label="Parcela Balão"
                          placeholder="R$ 675.000,00"
                        />
                        <ValidatedCurrencyInput
                          id="special_25_75_monthly_24x"
                          name="special_25_75_monthly_24x"
                          formId="new-property"
                          label="Parcela Mensal 24x"
                          placeholder="R$ 9.375,00"
                        />
                        <ValidatedCurrencyInput
                          id="special_25_75_down_payment"
                          name="special_25_75_down_payment"
                          formId="new-property"
                          label="Entrada"
                          placeholder="R$ 225.000,00"
                        />
                      </FormGrid>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* ADVANCED TAB */}
          <TabsContent value="advanced">
            <div className="space-y-6">
              {/* Owner Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Proprietário</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormSection title="Dados do Proprietário">
                    <ValidatedInput
                      id="owner_name"
                      name="owner_name"
                      formId="new-property"
                      rules={[]}
                      label="Nome"
                      placeholder="Nome completo do proprietário"
                    />

                    <FormGrid columns={2}>
                      <ValidatedPhoneInput
                        id="owner_phone"
                        name="owner_phone"
                        formId="new-property"
                        label="Telefone"
                        placeholder="(11) 99999-9999"
                      />

                      <ValidatedEmailInput
                        id="owner_email"
                        name="owner_email"
                        formId="new-property"
                        label="E-mail"
                        placeholder="proprietario@email.com"
                        checkDomain={true}
                      />
                    </FormGrid>

                    <ValidatedInput
                      id="commission"
                      name="commission"
                      formId="new-property"
                      rules={[{ type: 'pattern' as const, value: /^\d+(\.\d{1,2})?$/, message: 'Formato inválido. Ex: 5.50' }]}
                      label="Comissão (%)"
                      type="number"
                      placeholder="5.00"
                      helpText="Percentual de comissão do corretor"
                    />
                  </FormSection>
                </CardContent>
              </Card>

              {/* SEO & Marketing */}
              <Card>
                <CardHeader>
                  <CardTitle>SEO e Marketing</CardTitle>
                  <CardDescription>
                    Otimização para mecanismos de busca e marketing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormSection title="SEO e Marketing">
                    <ValidatedInput
                      id="meta_title"
                      name="meta_title"
                      formId="new-property"
                      rules={[{ type: 'max' as const, value: 60, message: 'Máximo de 60 caracteres' }]}
                      label="Meta Título (SEO)"
                      placeholder="Título otimizado para buscadores"
                      helpText="Título que aparecerá nos resultados de busca (máx. 60 chars)"
                    />

                    <ValidatedTextarea
                      id="meta_description"
                      name="meta_description"
                      formId="new-property"
                      rules={[{ type: 'max' as const, value: 160, message: 'Máximo de 160 caracteres' }]}
                      label="Meta Descrição (SEO)"
                      placeholder="Descrição otimizada para buscadores"
                      rows={3}
                      helpText="Descrição que aparecerá nos resultados de busca (máx. 160 chars)"
                    />

                    <ValidatedInput
                      id="site"
                      name="site"
                      formId="new-property"
                      rules={[]}
                      label="Site de Origem"
                      placeholder="ex: imovelweb, zapimoveis, etc."
                      helpText="Portal onde o imóvel foi originalmente anunciado"
                    />
                  </FormSection>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </ValidatedForm>
    </div>
  );
}