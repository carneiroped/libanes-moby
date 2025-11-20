import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const accountId = request.headers.get('x-account-id')
    if (!accountId) {
      return NextResponse.json({ error: 'Account ID not found' }, { status: 401 })
    }

    // Redirecionar para a API de geração de relatórios
    const body = await request.json()
    const generateUrl = new URL('/api/admin/analytics/reports/generate', request.url)
    
    const response = await fetch(generateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-account-id': accountId
      },
      body: JSON.stringify({
        ...body,
        type: 'export'
      })
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error exporting report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}