'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
// import { useRouter } from 'next/navigation';

interface UnauthorizedAlertProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UnauthorizedAlert({ isOpen, onClose }: UnauthorizedAlertProps) {
  // Router não é mais necessário pois não estamos mais redirecionando

  const handleClose = () => {
    onClose();
    // Removida a navegação para a página inicial
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Acesso não autorizado
          </AlertDialogTitle>
          <AlertDialogDescription>
            Você não tem autorização para acessar este conteúdo. Para obter acesso à documentação completa, entre em contato com nosso suporte ou adquira um plano.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleClose}>OK</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}