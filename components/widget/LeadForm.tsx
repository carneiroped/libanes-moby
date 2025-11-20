'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface LeadFormProps {
  onSubmit: (data: LeadFormData) => void;
  requiredFields?: ('name' | 'email' | 'phone')[];
  primaryColor?: string;
}

export interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  interest: 'comprar' | 'vender' | 'alugar';
}

export function LeadForm({ onSubmit, requiredFields = ['name', 'phone'], primaryColor }: LeadFormProps) {
  const [formData, setFormData] = useState<LeadFormData>({
    name: '',
    email: '',
    phone: '',
    interest: 'comprar'
  });
  const [errors, setErrors] = useState<Partial<LeadFormData>>({});

  const validateForm = () => {
    const newErrors: Partial<LeadFormData> = {};
    
    if (requiredFields.includes('name') && !formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (requiredFields.includes('email') && !formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (requiredFields.includes('phone') && !formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (formData.phone && !/^\d{10,11}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Telefone inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Vamos começar!</h3>
        <p className="text-sm text-gray-600 mb-4">
          Preencha seus dados para que possamos ajudá-lo melhor
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="name">
            Nome {requiredFields.includes('name') && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Seu nome completo"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        <div>
          <Label htmlFor="email">
            Email {requiredFields.includes('email') && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="seu@email.com"
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>

        <div>
          <Label htmlFor="phone">
            Telefone {requiredFields.includes('phone') && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
            placeholder="(11) 99999-9999"
            className={errors.phone ? 'border-red-500' : ''}
          />
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
        </div>

        <div>
          <Label>Qual seu interesse?</Label>
          <RadioGroup
            value={formData.interest}
            onValueChange={(value) => setFormData({ ...formData, interest: value as LeadFormData['interest'] })}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="comprar" id="comprar" />
              <Label htmlFor="comprar" className="font-normal cursor-pointer">
                Quero comprar
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="alugar" id="alugar" />
              <Label htmlFor="alugar" className="font-normal cursor-pointer">
                Quero alugar
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="vender" id="vender" />
              <Label htmlFor="vender" className="font-normal cursor-pointer">
                Quero vender
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full"
        style={{ backgroundColor: primaryColor }}
      >
        Iniciar conversa
      </Button>
    </form>
  );
}