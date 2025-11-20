'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useConfig } from '@/hooks/useConfig';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, Palette, Upload, Eye } from 'lucide-react';

export function CustomizationSettings() {
  const { config, updateConfig, isUpdating, isLoading } = useConfig();
  const [customization, setCustomization] = useState({
    primaryColor: '#00B87C',
    secondaryColor: '#00A66C',
    logo: null as string | null,
    favicon: null as string | null,
    emailSignature: '<p>Atenciosamente,<br/>Equipe Imobiliária Demo</p>'
  });

  useEffect(() => {
    if (config?.customization) {
      setCustomization({
        primaryColor: config.customization.primaryColor || '#00B87C',
        secondaryColor: config.customization.secondaryColor || '#00A66C',
        logo: config.customization.logo || null,
        favicon: config.customization.favicon || null,
        emailSignature: config.customization.emailSignature || '<p>Atenciosamente,<br/>Equipe Imobiliária Demo</p>'
      });
    }
  }, [config]);

  const handleSave = () => {
    updateConfig({
      section: 'customization',
      data: customization
    });
  };

  const handleColorChange = (field: 'primaryColor' | 'secondaryColor', value: string) => {
    setCustomization(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (field: 'logo' | 'favicon', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCustomization(prev => ({
          ...prev,
          [field]: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const resetToDefault = () => {
    setCustomization({
      primaryColor: '#00B87C',
      secondaryColor: '#00A66C',
      logo: null,
      favicon: null,
      emailSignature: '<p>Atenciosamente,<br/>Equipe Imobiliária Demo</p>'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Cores da Marca
            </CardTitle>
            <CardDescription>
              Configure as cores principais da sua marca na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Cor Primária</Label>
              <div className="flex gap-3 items-center">
                <Input
                  id="primaryColor"
                  type="color"
                  value={customization.primaryColor}
                  onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  type="text"
                  value={customization.primaryColor}
                  onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                  placeholder="#00B87C"
                  className="flex-1 font-mono"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Usada em botões principais, links e elementos de destaque
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Cor Secundária</Label>
              <div className="flex gap-3 items-center">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={customization.secondaryColor}
                  onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  type="text"
                  value={customization.secondaryColor}
                  onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                  placeholder="#00A66C"
                  className="flex-1 font-mono"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Usada em elementos secundários e hover states
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium mb-3">Preview das Cores</h4>
              <div className="flex gap-2">
                <div 
                  className="w-12 h-12 rounded-lg border-2 border-white shadow-sm"
                  style={{ backgroundColor: customization.primaryColor }}
                  title="Cor Primária"
                />
                <div 
                  className="w-12 h-12 rounded-lg border-2 border-white shadow-sm"
                  style={{ backgroundColor: customization.secondaryColor }}
                  title="Cor Secundária"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logotipo e Ícones</CardTitle>
            <CardDescription>
              Configure o logo da sua empresa e favicon do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logo">Logotipo</Label>
              <div className="space-y-3">
                {customization.logo && (
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                    <Image 
                      src={customization.logo} 
                      alt="Logo atual" 
                      width={120}
                      height={48}
                      className="h-12 w-auto object-contain"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Logo atual</p>
                      <p className="text-xs text-muted-foreground">Usado no header e emails</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCustomization(prev => ({ ...prev, logo: null }))}
                    >
                      Remover
                    </Button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="relative overflow-hidden">
                    <Upload className="w-4 h-4 mr-2" />
                    Escolher arquivo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('logo', e)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    PNG, JPG ou SVG (máx. 2MB)
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="favicon">Favicon</Label>
              <div className="space-y-3">
                {customization.favicon && (
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                    <Image 
                      src={customization.favicon} 
                      alt="Favicon atual" 
                      width={32}
                      height={32}
                      className="h-8 w-8 object-contain"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Favicon atual</p>
                      <p className="text-xs text-muted-foreground">Ícone da aba do navegador</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCustomization(prev => ({ ...prev, favicon: null }))}
                    >
                      Remover
                    </Button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="relative overflow-hidden">
                    <Upload className="w-4 h-4 mr-2" />
                    Escolher arquivo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('favicon', e)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    ICO, PNG 32x32px
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assinatura de Email</CardTitle>
          <CardDescription>
            Configure a assinatura padrão para emails enviados pelo sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emailSignature">Assinatura HTML</Label>
            <Textarea
              id="emailSignature"
              value={customization.emailSignature}
              onChange={(e) => setCustomization(prev => ({ ...prev, emailSignature: e.target.value }))}
              placeholder="Digite sua assinatura de email em HTML..."
              className="font-mono text-sm"
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              Use HTML para formatação. Variáveis disponíveis: {'{nome_usuario}'}, {'{nome_empresa}'}, {'{telefone}'}
            </p>
          </div>
          
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">Preview da Assinatura</span>
            </div>
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: customization.emailSignature }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={resetToDefault}>
          Restaurar Padrão
        </Button>
        <Button onClick={handleSave} disabled={isUpdating}>
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Personalização
            </>
          )}
        </Button>
      </div>
    </div>
  );
}