import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import type { NextAuthOptions } from 'next-auth'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Create or update user in our database when they sign in
      if (account?.provider === 'google') {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })

          if (!existingUser) {
            // Create new user in our database
            await prisma.user.create({
              data: {
                id: user.id || crypto.randomUUID(),
                email: user.email!,
                name: user.name || '',
                image: user.image,
                emailVerified: 'emailVerified' in user && user.emailVerified ? new Date(user.emailVerified) : new Date(),
                isActive: true
              }
            })
          } else {
            // Update existing user
            await prisma.user.update({
              where: { email: user.email! },
              data: {
                name: user.name || existingUser.name,
                image: user.image || existingUser.image,
                isActive: true
              }
            })
          }
        } catch (error) {
          console.error('Error managing user in database:', error)
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      console.log('JWT callback called with:', { user: !!user, token: { email: token.email, accessToken: !!token.accessToken } })
      
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      
      // Generate a custom JWT that our backend can understand
      if (token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string }
          })
          
          console.log('Found DB user:', !!dbUser)
          
          if (dbUser) {
            const customJWT = jwt.sign(
              { 
                userId: dbUser.id, 
                email: dbUser.email 
              },
              process.env.JWT_SECRET!,
              { expiresIn: '15m' }
            )
            token.accessToken = customJWT
            token.userId = dbUser.id
            console.log('Generated JWT token successfully')
          }
        } catch (error) {
          console.error('Error generating custom JWT:', error)
        }
      }
      
      return token
    },
    async session({ session, token }) {
      console.log('Session callback called:', { tokenAccessToken: !!token.accessToken, tokenUserId: !!token.userId })
      
      if (session.user) {
        (session.user as any).id = token.userId as string;
        (session as any).accessToken = token.accessToken as string
      }
      
      console.log('Session result:', { sessionAccessToken: !!(session as any).accessToken, userId: !!(session.user as any)?.id })
      return session
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

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }