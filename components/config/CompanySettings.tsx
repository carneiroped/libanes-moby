'use client';

import { useState, useEffect } from 'react';
import { useConfig } from '@/hooks/useConfig';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, Building2, Mail, Phone, MapPin } from 'lucide-react';

const BILLING_CYCLES = [
  { value: 'monthly', label: 'Mensal' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'yearly', label: 'Anual' }
];

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  trial: { label: 'Trial', color: 'bg-gray-100 text-gray-700' },
  basic: { label: 'Básico', color: 'bg-blue-100 text-blue-700' },
  pro: { label: 'Profissional', color: 'bg-green-100 text-green-700' },
  enterprise: { label: 'Enterprise', color: 'bg-purple-100 text-purple-700' }
};

export function CompanySettings() {
  const { config, updateConfig, isUpdating, isLoading } = useConfig();
  const [companyData, setCompanyData] = useState({
    name: '',
    cnpj: '',
    creci: '',
    email: '',
    phone: '',
    whatsapp: '',
    billing_email: '',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipcode: ''
    }
  });

  useEffect(() => {
    if (config) {
      setCompanyData({
        name: config.name || '',
        cnpj: config.cnpj || '',
        creci: config.creci || '',
        email: config.email || '',
        phone: config.phone || '',
        whatsapp: config.whatsapp || '',
        billing_email: config.billing_email || '',
        address: {
          street: config.address?.street || '',
          number: config.address?.number || '',
          complement: config.address?.complement || '',
          neighborhood: config.address?.neighborhood || '',
          city: config.address?.city || '',
          state: config.address?.state || '',
          zipcode: config.address?.zipcode || ''
        }
      });
    }
  }, [config]);

  const handleSave = () => {
    updateConfig({
      section: 'company',
      data: companyData
    });
  };

  const handleAddressChange = (field: string, value: string) => {
    setCompanyData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 11) {
      return numbers.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    }
    return numbers.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const planInfo = PLAN_LABELS[config?.plan || 'trial'] || PLAN_LABELS.trial;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
            <CardDescription>
              Dados principais da sua imobiliária
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Empresa</Label>
              <Input
                id="name"
                value={companyData.name}
                onChange={(e) => setCompanyData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Digite o nome da empresa"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  value={companyData.cnpj}
                  onChange={(e) => {
                    const formatted = formatCNPJ(e.target.value);
                    setCompanyData(prev => ({ ...prev, cnpj: formatted }));
                  }}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="creci">CRECI</Label>
                <Input
                  id="creci"
                  value={companyData.creci}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, creci: e.target.value }))}
                  placeholder="CRECI/SP 12345"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan">Plano Atual</Label>
              <div className="flex items-center gap-2">
                <Badge className={planInfo.color}>
                  {planInfo.label}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {config?.max_users} usuários • {config?.max_properties} imóveis
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contato
            </CardTitle>
            <CardDescription>
              Informações de contato da empresa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Principal</Label>
              <Input
                id="email"
                type="email"
                value={companyData.email}
                onChange={(e) => setCompanyData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="contato@suaimobiliaria.com.br"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={companyData.phone}
                onChange={(e) => {
                  const formatted = formatPhone(e.target.value);
                  setCompanyData(prev => ({ ...prev, phone: formatted }));
                }}
                placeholder="(11) 99999-9999"
                maxLength={15}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                value={companyData.whatsapp}
                onChange={(e) => {
                  const formatted = formatPhone(e.target.value);
                  setCompanyData(prev => ({ ...prev, whatsapp: formatted }));
                }}
                placeholder="(11) 99999-9999"
                maxLength={15}
              />
              <p className="text-xs text-muted-foreground">
                Número principal para integração WhatsApp Business
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing_email">Email para Faturamento</Label>
              <Input
                id="billing_email"
                type="email"
                value={companyData.billing_email}
                onChange={(e) => setCompanyData(prev => ({ ...prev, billing_email: e.target.value }))}
                placeholder="financeiro@suaimobiliaria.com.br"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Endereço
          </CardTitle>
          <CardDescription>
            Endereço da sede da empresa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="street">Logradouro</Label>
              <Input
                id="street"
                value={companyData.address.street}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                placeholder="Rua, Avenida, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="number">Número</Label>
              <Input
                id="number"
                value={companyData.address.number}
                onChange={(e) => handleAddressChange('number', e.target.value)}
                placeholder="123"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="complement">Complemento</Label>
              <Input
                id="complement"
                value={companyData.address.complement}
                onChange={(e) => handleAddressChange('complement', e.target.value)}
                placeholder="Sala, Andar, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input
                id="neighborhood"
                value={companyData.address.neighborhood}
                onChange={(e) => handleAddressChange('neighborhood', e.target.value)}
                placeholder="Centro"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={companyData.address.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                placeholder="São Paulo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Select 
                value={companyData.address.state} 
                onValueChange={(value) => handleAddressChange('state', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SP">São Paulo</SelectItem>
                  <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                  <SelectItem value="MG">Minas Gerais</SelectItem>
                  <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                  <SelectItem value="PR">Paraná</SelectItem>
                  <SelectItem value="SC">Santa Catarina</SelectItem>
                  <SelectItem value="BA">Bahia</SelectItem>
                  <SelectItem value="GO">Goiás</SelectItem>
                  <SelectItem value="PE">Pernambuco</SelectItem>
                  <SelectItem value="CE">Ceará</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipcode">CEP</Label>
              <Input
                id="zipcode"
                value={companyData.address.zipcode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  const formatted = value.replace(/^(\d{5})(\d{3})$/, '$1-$2');
                  handleAddressChange('zipcode', formatted);
                }}
                placeholder="00000-000"
                maxLength={9}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isUpdating}>
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Informações
            </>
          )}
        </Button>
      </div>
    </div>
  );
}