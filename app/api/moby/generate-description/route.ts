import { NextRequest, NextResponse } from 'next/server';
import { AzureOpenAI } from 'openai';

// Configuração do Azure OpenAI
const azureOpenAI = new AzureOpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiVersion: '2024-08-01-preview',
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o-mini'
});

export async function POST(request: NextRequest) {
  try {
    const { propertyData } = await request.json();

    if (!propertyData) {
      return NextResponse.json(
        { error: 'Dados do imóvel não fornecidos' },
        { status: 400 }
      );
    }

    // Construir prompt detalhado para gerar descrição
    const tipoImovel = propertyData.tipo === 'apartamento' ? 'Apartamento' :
                       propertyData.tipo === 'casa' ? 'Casa' :
                       propertyData.tipo === 'comercial' ? 'Imóvel Comercial' :
                       propertyData.tipo === 'terreno' ? 'Terreno' :
                       propertyData.tipo || 'Imóvel';

    const finalidade = propertyData.loc_venda === 'venda' ? 'Venda' :
                       propertyData.loc_venda === 'locacao' ? 'Locação' :
                       'Venda/Locação';

    const valor = propertyData.valor ? `R$ ${propertyData.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Consulte';

    const prompt = `Você é um corretor de imóveis experiente. Crie uma descrição publicitária atraente e profissional para o seguinte imóvel:

**Informações do Imóvel:**
- Título: ${propertyData.titulo || 'Imóvel'}
- Tipo: ${tipoImovel}
- Finalidade: ${finalidade}
- Localização: ${propertyData.bairro || 'N/A'}, ${propertyData.cidade || 'N/A'}
- Área Total: ${propertyData.m2 ? `${propertyData.m2}m²` : 'N/A'}
- Quartos: ${propertyData.quartos || 0}
- Banheiros: ${propertyData.banheiros || 0}
- Valor: ${valor}${finalidade === 'Locação' ? '/mês' : ''}
${propertyData.descricao ? `- Descrição Atual: ${propertyData.descricao}` : ''}

**Instruções:**
1. Crie uma descrição envolvente de 3-4 parágrafos
2. Destaque os pontos fortes do imóvel e da localização
3. Use linguagem persuasiva mas profissional
4. Inclua call-to-action no final
5. NÃO invente informações que não foram fornecidas
6. Seja específico sobre os dados fornecidos
7. Adapte o tom para o tipo de imóvel (residencial é mais acolhedor, comercial é mais corporativo)

Gere APENAS a descrição, sem títulos ou formatações extras.`;

    // Chamada à API do Azure OpenAI
    const completion = await azureOpenAI.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Você é um corretor de imóveis experiente especializado em criar descrições publicitárias atraentes e persuasivas para imóveis.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 800,
    });

    const description = completion.choices[0]?.message?.content || 'Não foi possível gerar a descrição.';

    return NextResponse.json({ description });
  } catch (error: any) {
    console.error('[API /moby/generate-description] Erro:', error);

    // Tratamento de erros específicos
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Não foi possível conectar ao Azure OpenAI. Verifique as configurações.' },
        { status: 503 }
      );
    }

    if (error.status === 401) {
      return NextResponse.json(
        { error: 'Credenciais do Azure OpenAI inválidas. Verifique a API Key.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Erro ao gerar descrição' },
      { status: 500 }
    );
  }
}
