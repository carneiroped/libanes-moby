'use client';

import { useParams, useRouter } from 'next/navigation';
import { usePropertyById, useUpdateProperty, useDeleteProperty } from '@/hooks/useImoveis';
import { Button } from '@/components/ui/button';
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Trash2, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { use } from 'react';

export default function EditPropertyPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const propertyId = resolvedParams.id;

  const { data: property, isLoading } = usePropertyById(propertyId);
  const updateProperty = useUpdateProperty();
  const deleteProperty = useDeleteProperty();

  const { register, handleSubmit, setValue, watch } = useForm();

  // Preencher formulário quando dados carregarem
  useEffect(() => {
    if (property) {
      // Informações básicas
      setValue('code', property.code);
      setValue('title', property.title);
      setValue('description', property.description);
      setValue('type', property.type);
      setValue('purpose', property.purpose);
      setValue('status', property.status);

      // Localização
      setValue('neighborhood', property.neighborhood);
      setValue('city', property.city);
      setValue('state', property.state);
      setValue('street', property.address?.street || '');
      setValue('number', property.address?.number || '');
      setValue('complement', property.address?.complement || '');
      setValue('zipCode', property.address?.zipCode || '');

      // Coordenadas
      setValue('latitude', property.latitude);
      setValue('longitude', property.longitude);

      // Características
      setValue('total_area', property.total_area);
      setValue('built_area', property.built_area);
      setValue('land_area', property.land_area);
      setValue('bedrooms', property.bedrooms);
      setValue('suites', property.suites);
      setValue('bathrooms', property.bathrooms);
      setValue('parking_spaces', property.parking_spaces);
      setValue('floor', property.floor);

      // Valores
      setValue('sale_price', property.sale_price);
      setValue('rent_price', property.rent_price);
      setValue('condo_fee', property.condo_fee);
      setValue('iptu', property.iptu);

      // Proprietário
      setValue('owner_name', property.owner_name);
      setValue('owner_phone', property.owner_phone);
      setValue('owner_email', property.owner_email);
      setValue('commission', property.commission);

      // Marketing
      setValue('virtual_tour_url', property.virtual_tour_url);
      setValue('meta_title', property.meta_title);
      setValue('meta_description', property.meta_description);
      setValue('site', property.site);
    }
  }, [property, setValue]);

  const onSubmit = async (data: any) => {
    try {
      // Converter purpose para loc_venda
      let loc_venda = 'venda';
      if (data.purpose === 'rent') loc_venda = 'locacao';
      else if (data.purpose === 'both') loc_venda = 'ambos';

      // Montar objeto de atualização mapeado para colunas do banco
      const updateData = {
        // Colunas básicas
        codigo_referencia: data.code,
        titulo: data.title,
        descricao: data.description,
        tipo: data.type,
        loc_venda,
        status: data.status,

        // Endereço
        rua: data.street || null,
        numero: data.number || null,
        complemento: data.complement || null,
        bairro: data.neighborhood,
        cidade: data.city,
        estado: data.state || null,
        cep: data.zipCode || null,
        lat: data.latitude ? data.latitude.toString() : null, // TEXT no banco
        long: data.longitude ? data.longitude.toString() : null, // TEXT no banco
        andar: data.floor ? parseInt(data.floor) : null,

        // Características
        m2: data.total_area ? parseInt(data.total_area) : null,
        area_construida: data.built_area ? parseFloat(data.built_area) : null,
        area_terreno: data.land_area ? parseFloat(data.land_area) : null,
        quartos: data.bedrooms ? parseInt(data.bedrooms) : null,
        suites: data.suites ? parseInt(data.suites) : null,
        banheiros: data.bathrooms ? parseInt(data.bathrooms) : null,
        vagas_garagem: data.parking_spaces ? parseInt(data.parking_spaces) : null,
        garagem: data.parking_spaces > 0,

        // Valores
        valor: data.sale_price || data.rent_price ? parseFloat(data.sale_price || data.rent_price) : null,
        condominio_mensal: data.condo_fee ? parseFloat(data.condo_fee) : null,
        iptu_mensal: data.iptu ? parseFloat(data.iptu) : null,

        // Proprietário
        proprietario_nome: data.owner_name || null,
        proprietario_telefone: data.owner_phone || null,
        proprietario_email: data.owner_email || null,
        comissao_percentual: data.commission ? parseFloat(data.commission) : null,

        // Marketing e SEO
        tour_virtual_url: data.virtual_tour_url || null,
        meta_titulo: data.meta_title || null,
        meta_descricao: data.meta_description || null,
        site: data.site || null,

        // Timestamp
        updated_at: new Date().toISOString()
      };

      await updateProperty.mutateAsync({ id: propertyId, data: updateData });
      toast({
        title: 'Sucesso!',
        description: 'Imóvel atualizado com sucesso',
      });
      router.push('/admin/imoveis');
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar imóvel',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProperty.mutateAsync(propertyId);
      router.push('/admin/imoveis');
    } catch (error) {
      console.error('Erro ao deletar:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto p-6">
        <p>Imóvel não encontrado</p>
        <Button onClick={() => router.push('/admin/imoveis')} className="mt-4">
          Voltar para listagem
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/admin/imoveis')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Editar Imóvel</h1>
            <p className="text-muted-foreground">Código: {property.code}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Informações</TabsTrigger>
            <TabsTrigger value="location">Localização</TabsTrigger>
            <TabsTrigger value="features">Características</TabsTrigger>
            <TabsTrigger value="values">Valores</TabsTrigger>
            <TabsTrigger value="owner">Proprietário</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>
                  Dados principais do imóvel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="code">Código</Label>
                    <Input id="code" {...register('code')} />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={watch('status')}
                      onValueChange={(value) => setValue('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Disponível</SelectItem>
                        <SelectItem value="reserved">Reservado</SelectItem>
                        <SelectItem value="sold">Vendido</SelectItem>
                        <SelectItem value="rented">Alugado</SelectItem>
                        <SelectItem value="unavailable">Indisponível</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input id="title" {...register('title')} />
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    {...register('description')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Tipo</Label>
                    <Select
                      value={watch('type')}
                      onValueChange={(value) => setValue('type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartment">Apartamento</SelectItem>
                        <SelectItem value="house">Casa</SelectItem>
                        <SelectItem value="commercial">Comercial</SelectItem>
                        <SelectItem value="land">Terreno</SelectItem>
                        <SelectItem value="rural">Rural</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="purpose">Finalidade</Label>
                    <Select
                      value={watch('purpose')}
                      onValueChange={(value) => setValue('purpose', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sale">Venda</SelectItem>
                        <SelectItem value="rent">Locação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="location">
            <Card>
              <CardHeader>
                <CardTitle>Localização</CardTitle>
                <CardDescription>
                  Endereço e coordenadas do imóvel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="street">Rua</Label>
                    <Input id="street" {...register('street')} />
                  </div>
                  <div>
                    <Label htmlFor="number">Número</Label>
                    <Input id="number" {...register('number')} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="complement">Complemento</Label>
                  <Input id="complement" {...register('complement')} />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input id="neighborhood" {...register('neighborhood')} />
                  </div>
                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <Input id="city" {...register('city')} />
                  </div>
                  <div>
                    <Label htmlFor="state">Estado</Label>
                    <Input id="state" {...register('state')} maxLength={2} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input id="zipCode" {...register('zipCode')} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="0.00000001"
                      {...register('latitude')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="0.00000001"
                      {...register('longitude')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle>Características</CardTitle>
                <CardDescription>
                  Detalhes físicos do imóvel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="total_area">Área Total (m²)</Label>
                    <Input
                      id="total_area"
                      type="number"
                      step="0.01"
                      {...register('total_area')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="built_area">Área Construída (m²)</Label>
                    <Input
                      id="built_area"
                      type="number"
                      step="0.01"
                      {...register('built_area')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="land_area">Área do Terreno (m²)</Label>
                    <Input
                      id="land_area"
                      type="number"
                      step="0.01"
                      {...register('land_area')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="bedrooms">Quartos</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      {...register('bedrooms')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="suites">Suítes</Label>
                    <Input
                      id="suites"
                      type="number"
                      {...register('suites')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bathrooms">Banheiros</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      {...register('bathrooms')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="parking_spaces">Vagas</Label>
                    <Input
                      id="parking_spaces"
                      type="number"
                      {...register('parking_spaces')}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="floor">Andar</Label>
                  <Input
                    id="floor"
                    type="number"
                    {...register('floor')}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="values">
            <Card>
              <CardHeader>
                <CardTitle>Valores</CardTitle>
                <CardDescription>
                  Preços e taxas do imóvel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sale_price">Preço de Venda (R$)</Label>
                    <Input
                      id="sale_price"
                      type="number"
                      step="0.01"
                      {...register('sale_price')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rent_price">Preço de Aluguel (R$)</Label>
                    <Input
                      id="rent_price"
                      type="number"
                      step="0.01"
                      {...register('rent_price')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="condo_fee">Condomínio (R$)</Label>
                    <Input
                      id="condo_fee"
                      type="number"
                      step="0.01"
                      {...register('condo_fee')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="iptu">IPTU (R$)</Label>
                    <Input
                      id="iptu"
                      type="number"
                      step="0.01"
                      {...register('iptu')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="owner">
            <Card>
              <CardHeader>
                <CardTitle>Proprietário</CardTitle>
                <CardDescription>
                  Informações do dono do imóvel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="owner_name">Nome</Label>
                  <Input id="owner_name" {...register('owner_name')} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="owner_phone">Telefone</Label>
                    <Input id="owner_phone" {...register('owner_phone')} />
                  </div>
                  <div>
                    <Label htmlFor="owner_email">E-mail</Label>
                    <Input
                      id="owner_email"
                      type="email"
                      {...register('owner_email')}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="commission">Comissão (%)</Label>
                  <Input
                    id="commission"
                    type="number"
                    step="0.01"
                    {...register('commission')}
                  />
                </div>

                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold">Marketing</h3>
                  
                  <div>
                    <Label htmlFor="virtual_tour_url">URL Tour Virtual</Label>
                    <Input id="virtual_tour_url" {...register('virtual_tour_url')} />
                  </div>

                  <div>
                    <Label htmlFor="meta_title">Meta Título (SEO)</Label>
                    <Input id="meta_title" {...register('meta_title')} />
                  </div>

                  <div>
                    <Label htmlFor="meta_description">Meta Descrição (SEO)</Label>
                    <Textarea
                      id="meta_description"
                      rows={3}
                      {...register('meta_description')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="site">Site de Origem</Label>
                    <Input id="site" {...register('site')} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/imoveis')}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={updateProperty.isPending}>
            {updateProperty.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}