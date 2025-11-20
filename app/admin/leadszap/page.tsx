'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function LeadsZapPage() {
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-amber-500" />
          </div>
          <CardTitle className="text-xl mb-2">Módulo Desativado</CardTitle>
          <CardDescription className="text-base">
            O módulo de integração com o Grupo Zap está desativado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-muted p-4 rounded-md">
              <p className="text-center font-medium">
                Entre em contato com a administração Moby para ativar esta funcionalidade.
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <Button asChild>
                <Link href="/admin/leads">
                  Voltar para Leads
                </Link>
              </Button>
              
              <Button variant="outline" asChild>
                <a href="mailto:adm@moby.casa">
                  <Mail className="mr-2 h-4 w-4" />
                  Contatar Administração
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}