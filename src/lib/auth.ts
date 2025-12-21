import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { API_CONFIG } from '@/config/api'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async signIn({ user }) {
      // Allow sign in - backend will handle user creation/update
      return true
    },
    async jwt({ token, user }) {
      try {
        console.log('JWT callback called with:', { user: !!user, token: { email: token.email, accessToken: !!token.accessToken } })

        // First time login - user object is present
        if (user) {
          token.id = user.id
          token.email = user.email

          // Call backend to get JWT token only on first login
          // Verify backend URL is configured
          if (!API_CONFIG.baseURL) {
            console.error('Backend URL not configured')
            return token
          }

          try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

            const response = await fetch(`${API_CONFIG.baseURL}/api/auth/google`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: user.email,
                name: user.name,
                image: user.image,
              }),
              signal: controller.signal
            })

            clearTimeout(timeoutId)

            if (response.ok) {
              const data = await response.json()
              token.accessToken = data.accessToken
              token.refreshToken = data.refreshToken
              token.userId = data.user.id
              console.log('Got JWT token from backend successfully')
            } else {
              console.error('Failed to get JWT from backend:', response.status)
              const errorText = await response.text()
              console.error('Backend error:', errorText)
            }
          } catch (error) {
            console.error('Error calling backend for JWT:', error)
            // Continue without backend token - user will need to login again
          }
        }

        // Subsequent requests - token is already populated, just return it
        return token
      } catch (error) {
        console.error('Error in JWT callback:', error)
        // Return token even if there's an error to prevent session breakage
        return token
      }
    },
    async session({ session, token }) {
      try {
        console.log('Session callback called:', { tokenAccessToken: !!token.accessToken, tokenUserId: !!token.userId })

        if (session.user) {
          (session.user as any).id = token.userId as string;
          (session as any).accessToken = token.accessToken as string;
          (session as any).refreshToken = token.refreshToken as string
        }

        console.log('Session result:', { sessionAccessToken: !!(session as any).accessToken, userId: !!(session.user as any)?.id })
        return session
      } catch (error) {
        console.error('Error in session callback:', error)
        // Return session even if there's an error
        return session
      }
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
