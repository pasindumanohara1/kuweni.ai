import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const imageUrl = request.nextUrl.searchParams.get('url')
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
    }

    console.log('Proxy Image: Fetching image from:', imageUrl)

    // Fetch the image from the external URL with better error handling
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      timeout: 10000 // 10 second timeout
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer()
    
    // Get the content type from the response
    const contentType = response.headers.get('content-type') || 'image/png'
    
    // Validate that we actually got image data
    if (!imageBuffer || imageBuffer.byteLength === 0) {
      throw new Error('Received empty image data')
    }

    console.log('Proxy Image: Successfully fetched image, size:', imageBuffer.byteLength, 'bytes, type:', contentType)

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': imageBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept',
      },
    })
  } catch (error) {
    console.error('Proxy Image Error:', error)
    
    // Return a more detailed error message
    const errorMessage = error instanceof Error ? error.message : 'Failed to proxy image'
    const statusCode = errorMessage.includes('timeout') ? 504 : 500
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: 'The image could not be loaded. This might be due to network issues or the image service being temporarily unavailable.'
      },
      { status: statusCode }
    )
  }
}