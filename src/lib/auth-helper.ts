import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function generateUserToken(email: string): Promise<string | null> {
  try {
    const dbUser = await prisma.user.findUnique({
      where: { email }
    })

    if (!dbUser) {
      console.error('User not found in database:', email)
      return null
    }

    const token = jwt.sign(
      { 
        userId: dbUser.id, 
        email: dbUser.email 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    )

    return token
  } catch (error) {
    console.error('Error generating token:', error)
    return null
  }
}

export async function ensureUserInDatabase(user: any): Promise<void> {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email! }
    })

    if (!existingUser) {
      await prisma.user.create({
        data: {
          id: user.id || crypto.randomUUID(),
          email: user.email!,
          name: user.name || '',
          image: user.image,
          emailVerified: user.emailVerified ? new Date(user.emailVerified) : new Date(),
          isActive: true
        }
      })
    } else {
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
    console.error('Error ensuring user in database:', error)
  }
}