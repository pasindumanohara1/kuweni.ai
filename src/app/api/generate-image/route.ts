import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt, model } = await request.json()
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    console.log('Image API: Generating image for prompt:', prompt)

    // Clean the prompt - remove newlines and extra spaces
    const cleanPrompt = prompt.replace(/\n/g, ' ').trim()
    const encodedPrompt = encodeURIComponent(cleanPrompt)
    
    // Try multiple URL formats for better compatibility
    const imageUrl1 = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&nologo=true`
    const imageUrl2 = `https://image.pollinations.ai/prompt/${encodedPrompt}`
    const proxyUrl1 = `/api/proxy-image?url=${encodeURIComponent(imageUrl1)}`
    const proxyUrl2 = `/api/proxy-image?url=${encodeURIComponent(imageUrl2)}`
    
    console.log('Image API: Primary URL:', imageUrl1)
    console.log('Image API: Secondary URL:', imageUrl2)
    
    // Test which URL works best
    let workingUrl = imageUrl1
    let workingProxyUrl = proxyUrl1
    
    try {
      // Test primary URL
      const testResponse = await fetch(imageUrl1, { 
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })
      
      if (!testResponse.ok) {
        console.log('Image API: Primary URL failed, trying secondary URL...')
        // Test secondary URL
        const testResponse2 = await fetch(imageUrl2, { 
          method: 'HEAD',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        })
        
        if (testResponse2.ok) {
          workingUrl = imageUrl2
          workingProxyUrl = proxyUrl2
          console.log('Image API: Using secondary URL')
        } else {
          console.log('Image API: Both URLs failed, using primary URL anyway')
        }
      } else {
        console.log('Image API: Primary URL accessible')
      }
    } catch (fetchError) {
      console.log('Image API: URL test failed:', fetchError)
      // Continue with the primary URL even if test fails
    }
    
    return NextResponse.json({ 
      imageUrl: workingUrl,
      proxyUrl: workingProxyUrl,
      model: model || 'default',
      prompt: cleanPrompt
    })
  } catch (error) {
    console.error('Image Generation API Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate image' },
      { status: 500 }
    )
  }
}