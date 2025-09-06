import { NextRequest, NextResponse } from 'next/server'

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5001'

export async function GET(_request: NextRequest) {
  try {
    // Make request to backend (no authentication required for status endpoint)
    const response = await fetch(`${SERVER_URL}/api/raffles/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Backend request failed: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Raffle status API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}