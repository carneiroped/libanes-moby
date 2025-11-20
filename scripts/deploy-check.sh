#!/bin/bash

# 🚀 Moby CRM - Pre-Deploy Checklist
# Execute antes de fazer deploy para Vercel

set -e

echo "🔍 Moby CRM - Pre-Deploy Checklist"
echo "=================================="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contadores
PASSED=0
FAILED=0
WARNINGS=0

# Função para check
check() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED++))
  else
    echo -e "${RED}❌ $1${NC}"
    ((FAILED++))
  fi
}

warn() {
  echo -e "${YELLOW}⚠️  $1${NC}"
  ((WARNINGS++))
}

# 1. Verificar .env.local não commitado
echo "1️⃣  Verificando .gitignore..."
if git ls-files | grep -q ".env.local"; then
  echo -e "${RED}❌ CRÍTICO: .env.local está commitado!${NC}"
  echo "   Execute: git rm --cached .env.local && git commit -m 'Remove .env.local'"
  ((FAILED++))
else
  check ".env.local NÃO está no git"
fi

# 2. Verificar TypeScript
echo ""
echo "2️⃣  Verificando TypeScript..."
npm run typecheck > /dev/null 2>&1
check "TypeScript sem erros"

# 3. Verificar build
echo ""
echo "3️⃣  Verificando build..."
npm run build > /dev/null 2>&1
check "Build Next.js OK"

# 4. Verificar variáveis de ambiente críticas
echo ""
echo "4️⃣  Verificando variáveis de ambiente locais..."

if grep -q "NEXT_PUBLIC_SUPABASE_URL=" .env.local 2>/dev/null; then
  check "NEXT_PUBLIC_SUPABASE_URL presente"
else
  warn "NEXT_PUBLIC_SUPABASE_URL faltando em .env.local"
fi

if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY=" .env.local 2>/dev/null; then
  check "NEXT_PUBLIC_SUPABASE_ANON_KEY presente"
else
  warn "NEXT_PUBLIC_SUPABASE_ANON_KEY faltando"
fi

if grep -q "SUPABASE_SERVICE_ROLE_KEY=" .env.local 2>/dev/null; then
  check "SUPABASE_SERVICE_ROLE_KEY presente"
else
  warn "SUPABASE_SERVICE_ROLE_KEY faltando"
fi

if grep -q "AZURE_OPENAI_API_KEY=" .env.local 2>/dev/null; then
  check "AZURE_OPENAI_API_KEY presente"
else
  warn "AZURE_OPENAI_API_KEY faltando (IA não funcionará)"
fi

# 5. Verificar arquivos essenciais
echo ""
echo "5️⃣  Verificando arquivos essenciais..."

[ -f "middleware.ts" ] && check "middleware.ts existe" || warn "middleware.ts faltando"
[ -f "lib/middleware/auth-middleware.ts" ] && check "auth-middleware.ts existe" || warn "auth-middleware.ts faltando"
[ -f "lib/logger.ts" ] && check "logger.ts existe" || warn "logger.ts faltando"
[ -f ".env.example" ] && check ".env.example existe" || warn ".env.example faltando"

# 6. Verificar dependências
echo ""
echo "6️⃣  Verificando dependências críticas..."

npm list @supabase/supabase-js > /dev/null 2>&1
check "@supabase/supabase-js instalado"

npm list @supabase/ssr > /dev/null 2>&1
check "@supabase/ssr instalado"

npm list next > /dev/null 2>&1
check "Next.js instalado"

# 7. Verificar Git status
echo ""
echo "7️⃣  Verificando Git status..."

if [ -n "$(git status --porcelain)" ]; then
  warn "Existem mudanças não commitadas"
  echo "   Execute: git status"
else
  check "Working tree limpo"
fi

# Resumo
echo ""
echo "=================================="
echo "📊 RESUMO"
echo "=================================="
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo ""

if [ $FAILED -gt 0 ]; then
  echo -e "${RED}❌ PRÉ-DEPLOY FALHOU!${NC}"
  echo "   Corrija os erros antes de fazer deploy."
  exit 1
elif [ $WARNINGS -gt 0 ]; then
  echo -e "${YELLOW}⚠️  PRÉ-DEPLOY OK COM AVISOS${NC}"
  echo "   Verifique os avisos antes de continuar."
  echo ""
  read -p "Continuar mesmo assim? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
else
  echo -e "${GREEN}✅ PRÉ-DEPLOY OK!${NC}"
  echo ""
  echo "🚀 Pronto para deploy na Vercel!"
  echo ""
  echo "Próximos passos:"
  echo "  1. git add ."
  echo "  2. git commit -m 'fix: implementar correções de autenticação'"
  echo "  3. git push origin main"
  echo ""
  echo "Ou use Vercel CLI:"
  echo "  vercel --prod"
  echo ""
  echo "URLs de produção:"
  echo "  - https://leo.moby.casa"
  echo "  - https://minhamoby-leonardo-ok.vercel.app"
fi

exit 0
