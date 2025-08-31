import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../[...nextauth]/route'
import { generateUserToken, ensureUserInDatabase } from '../../../../lib/auth-helper'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Ensure user exists in database
    await ensureUserInDatabase(session.user)
    
    // Generate token
    const token = await generateUserToken(session.user.email)
    
    if (!token) {
      return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 })
    }

    return NextResponse.json({ 
      accessToken: token,
      user: session.user 
    })
  } catch (error) {
    console.error('Token generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}