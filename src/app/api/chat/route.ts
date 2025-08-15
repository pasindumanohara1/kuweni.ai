import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message, model } = await request.json()
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    console.log('Chat API: Sending request to Pollinations.AI:', message)

    // Use Pollinations.AI text generation API
    const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(message)}`, {
      method: 'GET',
      headers: {
        'Accept': 'text/plain',
      }
    })
    
    console.log('Chat API: Response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Chat API: Error response:', errorText)
      throw new Error(`Failed to generate response: ${response.status} ${errorText}`)
    }

    const text = await response.text()
    console.log('Chat API: Response text:', text.substring(0, 100) + '...')
    
    return NextResponse.json({ 
      response: text,
      model: model || 'default'
    })
  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate response' },
      { status: 500 }
    )
  }
}