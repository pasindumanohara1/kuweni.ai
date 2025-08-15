import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt, voice } = await request.json()
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    console.log('Voice API: Generating voice for prompt:', prompt)

    // Use Pollinations.AI audio generation API
    const voiceParam = voice || 'alloy'
    const audioUrl = `https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=openai-audio&voice=${voiceParam}`
    
    console.log('Voice API: Generated URL:', audioUrl)
    
    // Test if the URL is accessible by making a quick HEAD request
    const testResponse = await fetch(audioUrl, { method: 'HEAD' })
    console.log('Voice API: URL accessibility test:', testResponse.status)
    
    return NextResponse.json({ 
      audioUrl: audioUrl,
      voice: voiceParam
    })
  } catch (error) {
    console.error('Voice Generation API Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate voice' },
      { status: 500 }
    )
  }
}