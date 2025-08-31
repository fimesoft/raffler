import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Validation rules
export const createRaffleValidation = [
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('prize').trim().isLength({ min: 3, max: 200 }).withMessage('Prize description must be between 3 and 200 characters'),
  body('ticketPrice').isFloat({ min: 0.01 }).withMessage('Ticket price must be greater than 0'),
  body('maxTickets').isInt({ min: 1, max: 10000 }).withMessage('Max tickets must be between 1 and 10,000'),
  body('endDate').isISO8601().withMessage('Invalid date format').custom((value) => {
    const endDate = new Date(value);
    const now = new Date();
    
    // Must be at least 1 hour from now
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    
    if (endDate <= oneHourFromNow) {
      throw new Error('End date must be at least 1 hour from now');
    }
    
    // Cannot be more than 1 year from now
    const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    if (endDate > oneYearFromNow) {
      throw new Error('End date cannot be more than 1 year from now');
    }
    
    return true;
  }),
  body('image').optional().isURL().withMessage('Image must be a valid URL'),
];

// Create new raffle
export const createRaffle = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, prize, ticketPrice, maxTickets, endDate, image } = req.body;
    const userId = req.user!.id; // From auth middleware

    // Create raffle
    const raffle = await prisma.raffle.create({
      data: {
        title,
        description,
        prize,
        ticketPrice: parseFloat(ticketPrice),
        maxTickets: parseInt(maxTickets),
        endDate: new Date(endDate),
        image: image || null,
        userId
      },
      select: {
        id: true,
        title: true,
        description: true,
        prize: true,
        ticketPrice: true,
        maxTickets: true,
        soldTickets: true,
        endDate: true,
        image: true,
        isActive: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Raffle created successfully',
      raffle
    });

  } catch (error) {
    console.error('Create raffle error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all raffles (public)
export const getAllRaffles = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      isActive = true,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const raffles = await prisma.raffle.findMany({
      where: {
        // Show all raffles for now
      },
      select: {
        id: true,
        title: true,
        description: true,
        prize: true,
        ticketPrice: true,
        maxTickets: true,
        soldTickets: true,
        endDate: true,
        image: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        [sortBy as string]: sortOrder as 'asc' | 'desc'
      },
      skip,
      take: parseInt(limit as string)
    });

    const total = await prisma.raffle.count({
      where: {
        // Count all raffles for now
      }
    });

    res.json({
      raffles,
      pagination: {
        current: parseInt(page as string),
        pages: Math.ceil(total / parseInt(limit as string)),
        total
      }
    });

  } catch (error) {
    console.error('Get raffles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get raffle by ID
export const getRaffleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const raffle = await prisma.raffle.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        prize: true,
        ticketPrice: true,
        maxTickets: true,
        soldTickets: true,
        endDate: true,
        image: true,
        isActive: true,
        winnerId: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tickets: {
          select: {
            id: true,
            number: true,
            status: true,
            purchaseDate: true,
            buyer: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            number: 'asc'
          }
        }
      }
    });

    if (!raffle) {
      return res.status(404).json({ error: 'Raffle not found' });
    }

    res.json({ raffle });

  } catch (error) {
    console.error('Get raffle error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user's raffles (authenticated)
export const getUserRaffles = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const raffles = await prisma.raffle.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        description: true,
        prize: true,
        ticketPrice: true,
        maxTickets: true,
        soldTickets: true,
        endDate: true,
        image: true,
        isActive: true,
        winnerId: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: parseInt(limit as string)
    });

    const total = await prisma.raffle.count({
      where: { userId }
    });

    res.json({
      raffles,
      pagination: {
        current: parseInt(page as string),
        pages: Math.ceil(total / parseInt(limit as string)),
        total
      }
    });

  } catch (error) {
    console.error('Get user raffles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update raffle (only by creator)
export const updateRaffle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    // Check if raffle exists and belongs to user
    const existingRaffle = await prisma.raffle.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingRaffle) {
      return res.status(404).json({ error: 'Raffle not found or access denied' });
    }

    // Prevent updates if raffle has sold tickets
    if (existingRaffle.soldTickets > 0) {
      return res.status(400).json({ error: 'Cannot update raffle with sold tickets' });
    }

    const { title, description, prize, ticketPrice, maxTickets, endDate, image } = req.body;

    const raffle = await prisma.raffle.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(prize && { prize }),
        ...(ticketPrice && { ticketPrice: parseFloat(ticketPrice) }),
        ...(maxTickets && { maxTickets: parseInt(maxTickets) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(image !== undefined && { image: image || null })
      },
      select: {
        id: true,
        title: true,
        description: true,
        prize: true,
        ticketPrice: true,
        maxTickets: true,
        soldTickets: true,
        endDate: true,
        image: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'Raffle updated successfully',
      raffle
    });

  } catch (error) {
    console.error('Update raffle error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete raffle (only by creator)
export const deleteRaffle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if raffle exists and belongs to user
    const existingRaffle = await prisma.raffle.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingRaffle) {
      return res.status(404).json({ error: 'Raffle not found or access denied' });
    }

    // Prevent deletion if raffle has sold tickets
    if (existingRaffle.soldTickets > 0) {
      return res.status(400).json({ error: 'Cannot delete raffle with sold tickets' });
    }

    await prisma.raffle.delete({
      where: { id }
    });

    res.json({ message: 'Raffle deleted successfully' });

  } catch (error) {
    console.error('Delete raffle error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Validation rules for ticket purchase
export const purchaseTicketsValidation = [
  body('numbers')
    .isArray({ min: 1, max: 10 })
    .withMessage('Numbers must be an array of 1 to 10 integers')
    .custom((numbers) => {
      // Check if all elements are positive integers
      if (!numbers.every((num: any) => Number.isInteger(num) && num > 0)) {
        throw new Error('All numbers must be positive integers');
      }
      
      // Check for duplicates
      const uniqueNumbers = new Set(numbers);
      if (uniqueNumbers.size !== numbers.length) {
        throw new Error('Numbers must be unique');
      }
      
      return true;
    }),
];

// Purchase tickets for a raffle
export const purchaseTickets = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id: raffleId } = req.params;
    const { numbers } = req.body;
    const userId = req.user!.id;

    // Get user information for ticket creation
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true,
        documentNumber: true,
        phone: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find the raffle
    const raffle = await prisma.raffle.findUnique({
      where: { id: raffleId },
      include: {
        tickets: {
          select: {
            number: true
          }
        }
      }
    });

    if (!raffle) {
      return res.status(404).json({ error: 'Raffle not found' });
    }

    // Check if raffle is still active
    if (!raffle.isActive || new Date() > raffle.endDate) {
      return res.status(400).json({ error: 'Raffle is no longer active' });
    }

    // Check if user is trying to buy tickets from their own raffle
    if (raffle.userId === userId) {
      return res.status(400).json({ error: 'Cannot buy tickets from your own raffle' });
    }

    // Get already sold numbers
    const soldNumbers = raffle.tickets.map(ticket => ticket.number);
    
    // Validate that numbers are within range
    const invalidNumbers = numbers.filter((num: number) => num < 1 || num > raffle.maxTickets);
    if (invalidNumbers.length > 0) {
      return res.status(400).json({ 
        error: `Invalid numbers: ${invalidNumbers.join(', ')}. Must be between 1 and ${raffle.maxTickets}` 
      });
    }

    // Check if any numbers are already sold
    const alreadySoldNumbers = numbers.filter((num: number) => soldNumbers.includes(num));
    if (alreadySoldNumbers.length > 0) {
      return res.status(400).json({ 
        error: `Numbers already sold: ${alreadySoldNumbers.join(', ')}` 
      });
    }

    // Check if there's enough space for the purchase
    const availableTickets = raffle.maxTickets - raffle.soldTickets;
    if (numbers.length > availableTickets) {
      return res.status(400).json({ 
        error: `Only ${availableTickets} tickets available, but trying to buy ${numbers.length}` 
      });
    }

    // Calculate total cost
    const totalCost = numbers.length * raffle.ticketPrice;

    // Start transaction to create tickets and update raffle
    const result = await prisma.$transaction(async (tx) => {
      // Create tickets
      const createdTickets = await Promise.all(
        numbers.map((number: number) =>
          tx.ticket.create({
            data: {
              number,
              raffleId: raffle.id,
              buyerId: userId,
              buyerDocument: user.documentNumber || 'N/A',
              buyerPhone: user.phone
            }
          })
        )
      );

      // Update raffle sold tickets count
      const updatedRaffle = await tx.raffle.update({
        where: { id: raffleId },
        data: {
          soldTickets: {
            increment: numbers.length
          }
        }
      });

      return { createdTickets, updatedRaffle };
    });

    res.status(201).json({
      message: 'Boletos comprados exitosamente',
      purchasedNumbers: numbers.sort((a: number, b: number) => a - b),
      totalCost,
      transactionId: `tx_${Date.now()}_${userId.substring(0, 8)}`,
      ticketsRemaining: result.updatedRaffle.maxTickets - result.updatedRaffle.soldTickets
    });

  } catch (error) {
    console.error('Purchase tickets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get sold ticket numbers for a raffle
export const getRaffleTickets = async (req: Request, res: Response) => {
  try {
    const { id: raffleId } = req.params;

    // Find the raffle
    const raffle = await prisma.raffle.findUnique({
      where: { id: raffleId },
      include: {
        tickets: {
          select: {
            number: true
          },
          orderBy: {
            number: 'asc'
          }
        }
      }
    });

    if (!raffle) {
      return res.status(404).json({ error: 'Raffle not found' });
    }

    const soldNumbers = raffle.tickets.map(ticket => ticket.number);

    res.json({
      raffleId,
      soldNumbers,
      totalSold: soldNumbers.length,
      maxTickets: raffle.maxTickets,
      available: raffle.maxTickets - soldNumbers.length
    });

  } catch (error) {
    console.error('Get raffle tickets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};