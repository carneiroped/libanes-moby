'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50 z-50">
      <Card className="max-w-md w-full mx-4">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-orange-100 rounded-full">
              <Settings className="w-10 h-10 text-orange-600" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl">Acesso Temporariamente Bloqueado</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600 mb-4">
            As configurações do sistema estão temporariamente indisponíveis.
          </p>
          <p className="text-center text-sm text-gray-500">
            Por favor, entre em contato com o suporte para ajustes necessários.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}