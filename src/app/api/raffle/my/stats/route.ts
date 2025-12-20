import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { generateUserToken } from '../../../../../lib/auth-helper'

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5001'

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Generate token for backend request
    const token = await generateUserToken(session.user.email)
    
    if (!token) {
      return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 })
    }

    // Make request to backend
    const response = await fetch(`${SERVER_URL}/api/raffles/my/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Backend request failed: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('User raffle stats API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}