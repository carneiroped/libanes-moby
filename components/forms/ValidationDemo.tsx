/**
 * Validation Demo Component for Moby CRM
 * 
 * Demonstrates all validation features including real-time validation,
 * visual feedback, password strength, suggestions, and form submission.
 */

'use client';

import React from 'react';
import {
  ValidatedForm,
  ValidatedInput,
  ValidatedEmailInput,
  ValidatedPhoneInput,
  ValidatedPasswordInput,
  ValidatedCurrencyInput,
  ValidatedSelect,
  ValidatedTextarea,
  ValidatedDescriptionTextarea,
  FormSection,
  FormGrid,
  FormField,
  COMMON_FORM_RULES,
  type ValidationRule
} from './index';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ValidationDemoProps {
  className?: string;
}

export function ValidationDemo({ className }: ValidationDemoProps) {
  // Form validation rules - convert readonly to mutable
  const demoFormRules: Record<string, ValidationRule[]> = {
    name: [...COMMON_FORM_RULES.USER_NAME],
    email: [...COMMON_FORM_RULES.USER_EMAIL],
    phone: [{ type: 'phone' as const, message: 'Telefone inválido' }],
    password: [...COMMON_FORM_RULES.USER_PASSWORD],
    confirm_password: [
      { type: 'required' as const, message: 'Confirmação de senha é obrigatória' },
      {
        type: 'custom' as const,
        message: 'Senhas não coincidem',
        validator: (value: any) => {
          // Validação será feita no componente com acesso aos formValues
          return Promise.resolve(true);
        }
      }
    ],
    salary: [{ type: 'currency' as const, message: 'Salário deve ser um valor monetário válido' }],
    role: [{ type: 'required' as const, message: 'Função é obrigatória' }],
    bio: [{ type: 'min' as const, value: 20, message: 'Bio deve ter pelo menos 20 caracteres' }],
    experience: []
  };

  const handleSubmit = async (values: Record<string, any>) => {
    console.log('Form submitted with values:', values);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    alert('Formulário enviado com sucesso! Verifique o console para ver os dados.');
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Demonstração do Sistema de Validação</CardTitle>
            <Badge variant="outline">Real-time</Badge>
          </div>
          <CardDescription>
            Este formulário demonstra todas as funcionalidades de validação em tempo real,
            incluindo formatação automática, sugestões, e feedback visual.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <ValidatedForm
            formId="validation-demo"
            fields={demoFormRules}
            onSubmit={handleSubmit}
            submitText="Enviar Formulário"
            showValidationSummary={true}
            loadingText="Processando..."
          >
            <FormSection title="Informações Pessoais" required>
              <FormField>
                <ValidatedInput
                  id="name"
                  name="name"
                  formId="validation-demo"
                  rules={demoFormRules.name}
                  label="Nome Completo"
                  placeholder="Digite seu nome completo"
                  required
                  helpText="Nome deve ter pelo menos 2 caracteres"
                />
              </FormField>

              <FormGrid columns={2}>
                <ValidatedEmailInput
                  id="email"
                  name="email"
                  formId="validation-demo"
                  label="E-mail"
                  placeholder="seu.email@exemplo.com"
                  required
                  checkDomain={true}
                  helpText="Verificamos se o domínio parece correto"
                />

                <ValidatedPhoneInput
                  id="phone"
                  name="phone"
                  formId="validation-demo"
                  label="Telefone"
                  placeholder="(11) 99999-9999"
                  helpText="Formato brasileiro com DDD"
                />
              </FormGrid>
            </FormSection>

            <FormSection title="Senha e Segurança" required>
              <ValidatedPasswordInput
                id="password"
                name="password"
                formId="validation-demo"
                label="Senha"
                placeholder="Digite uma senha forte"
                required
                showStrengthMeter={true}
                helpText="Deve ter pelo menos 8 caracteres com letras, números e símbolos"
              />

              <ValidatedPasswordInput
                id="confirm_password"
                name="confirm_password"
                formId="validation-demo"
                label="Confirmar Senha"
                placeholder="Digite a senha novamente"
                required
                helpText="Deve ser igual à senha anterior"
              />
            </FormSection>

            <FormSection title="Informações Profissionais">
              <FormGrid columns={2}>
                <ValidatedSelect
                  id="role"
                  name="role"
                  formId="validation-demo"
                  rules={demoFormRules.role}
                  label="Função"
                  placeholder="Selecione sua função..."
                  required
                  options={[
                    { value: 'developer', label: 'Desenvolvedor' },
                    { value: 'designer', label: 'Designer' },
                    { value: 'manager', label: 'Gerente' },
                    { value: 'analyst', label: 'Analista' },
                    { value: 'other', label: 'Outro' }
                  ]}
                />

                <ValidatedCurrencyInput
                  id="salary"
                  name="salary"
                  formId="validation-demo"
                  label="Salário Desejado"
                  placeholder="R$ 0,00"
                  helpText="Valor mensal esperado"
                />
              </FormGrid>

              <ValidatedDescriptionTextarea
                id="bio"
                name="bio"
                formId="validation-demo"
                label="Biografia Profissional"
                placeholder="Conte um pouco sobre sua experiência profissional..."
                minWords={5}
                maxWords={100}
                helpText="Descreva sua experiência e objetivos profissionais"
              />

              <ValidatedTextarea
                id="experience"
                name="experience"
                formId="validation-demo"
                rules={demoFormRules.experience}
                label="Experiências Anteriores"
                placeholder="Descreva suas principais experiências..."
                rows={4}
                maxLength={1000}
                showCharacterCount={true}
                autoResize={true}
                allowExpand={true}
                helpText="Experiências relevantes para a posição"
              />
            </FormSection>
          </ValidatedForm>
        </CardContent>
      </Card>
    </div>
  );
}

export default ValidationDemo;