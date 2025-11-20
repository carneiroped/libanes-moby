#!/bin/bash

echo "🚀 Push para GitHub - libanes-moby"
echo "=================================="
echo ""
echo "Executando push..."
echo ""

cd /home/user/minhamoby-libanes

# Garantir que está na branch main
git branch -M main

# Fazer push
git push -u origin main

echo ""
echo "✅ Push concluído com sucesso!"
echo ""
echo "Verifique em: https://github.com/carneiroped/libanes-moby"
