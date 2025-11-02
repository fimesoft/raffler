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
  body('image').optional().custom((value) => {
    if (!value) return true; // Allow empty/null images
    
    // Check if it's a data URL
    if (typeof value === 'string' && value.startsWith('data:image/')) {
      // Calculate approximate size of base64 string (base64 is ~33% larger than original)
      const base64Size = value.length * 0.75; // Approximate original size
      const maxSizeBytes = 2 * 1024 * 1024; // 2MB limit
      
      if (base64Size > maxSizeBytes) {
        throw new Error('Image size too large. Maximum allowed size is 2MB');
      }
      
      return true;
    }
    
    // If it's a URL, validate URL format
    if (typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'))) {
      return true;
    }
    
    throw new Error('Image must be a valid URL or base64 data URL');
  }),
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
    .isArray({ min: 1, max: 1000 })
    .withMessage('Numbers must be an array of 1 to 1000 integers')
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
    console.log('🎫 Purchase tickets request received:', {
      raffleId: req.params.id,
      userId: req.user?.id,
      numbers: req.body.numbers
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('❌ Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { id: raffleIdParam } = req.params;
    const { numbers } = req.body;
    const userId = req.user!.id;
    
    // Convert string ID from params to integer
    const raffleId = parseInt(raffleIdParam);

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
    console.error('❌ Purchase tickets error:', error);
    console.error('❌ Error details:', {
      message: (error as Error)?.message,
      stack: (error as Error)?.stack,
      raffleId: req.params.id,
      userId: req.user?.id
    });
    res.status(500).json({ 
      error: 'Error interno del servidor al procesar la compra',
      details: process.env.NODE_ENV === 'development' ? (error as Error)?.message : undefined
    });
  }
};

// Get sales data for user's raffles
export const getRaffleSales = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { raffleId, page = 1, limit = 10, buyerEmail } = req.query;

    // Build where clause
    const whereClause: any = {
      raffle: {
        userId: userId
      }
    };

    // Filter by specific raffle if provided
    if (raffleId) {
      whereClause.raffleId = raffleId as string;
    }

    // Filter by buyer email if provided
    if (buyerEmail) {
      whereClause.buyer = {
        email: {
          contains: buyerEmail as string,
          mode: 'insensitive'
        }
      };
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    // Get tickets with buyer and raffle information
    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            documentNumber: true,
            phone: true
          }
        },
        raffle: {
          select: {
            id: true,
            title: true,
            ticketPrice: true,
            maxTickets: true
          }
        }
      },
      orderBy: {
        purchaseDate: 'desc'
      },
      skip,
      take
    });

    // Get total count for pagination
    const totalCount = await prisma.ticket.count({
      where: whereClause
    });

    // Group tickets by buyer and raffle for better presentation
    const salesData = tickets.reduce((acc: any[], ticket: any) => {
      const existingPurchase = acc.find(
        p => p.buyerId === ticket.buyerId && p.raffleId === ticket.raffleId
      );

      if (existingPurchase) {
        existingPurchase.numbers.push(ticket.number);
        existingPurchase.totalAmount += ticket.raffle.ticketPrice;
        existingPurchase.ticketCount += 1;
      } else {
        acc.push({
          id: ticket.id,
          buyerId: ticket.buyerId,
          raffleId: ticket.raffleId,
          buyer: ticket.buyer,
          raffle: ticket.raffle,
          numbers: [ticket.number],
          ticketCount: 1,
          totalAmount: ticket.raffle.ticketPrice,
          purchaseDate: ticket.purchaseDate,
          status: ticket.status
        });
      }

      return acc;
    }, []);

    const totalPages = Math.ceil(totalCount / take);

    res.json({
      sales: salesData,
      pagination: {
        current: parseInt(page as string),
        pages: totalPages,
        total: totalCount,
        limit: take
      }
    });

  } catch (error) {
    console.error('❌ Get raffle sales error:', error);
    res.status(500).json({ error: 'Error al obtener las ventas' });
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

// Draw winners for a raffle (only by creator)
export const drawRaffleWinners = async (req: Request, res: Response) => {
  try {
    const { id: raffleId } = req.params;
    const userId = req.user!.id;

    // Find the raffle and verify ownership
    const raffle = await prisma.raffle.findFirst({
      where: {
        id: raffleId,
        userId: userId
      },
      include: {
        tickets: {
          include: {
            buyer: {
              select: {
                id: true,
                name: true,
                email: true,
                documentNumber: true,
                phone: true
              }
            }
          }
        }
      }
    });

    if (!raffle) {
      return res.status(404).json({ error: 'Raffle not found or access denied' });
    }

    // Check if raffle has enough sold tickets for drawing
    if (raffle.tickets.length < 3) {
      return res.status(400).json({ 
        error: 'At least 3 tickets must be sold to draw winners' 
      });
    }

    // Check if winners have already been drawn
    if (raffle.winnerId) {
      return res.status(400).json({ 
        error: 'Winners have already been drawn for this raffle' 
      });
    }

    // Create a shuffled array of all sold tickets
    const soldTickets = [...raffle.tickets];
    
    // Fisher-Yates shuffle algorithm
    for (let i = soldTickets.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [soldTickets[i], soldTickets[j]] = [soldTickets[j], soldTickets[i]];
    }

    // Select 3 winners (or all available tickets if less than 3)
    const winnersCount = Math.min(3, soldTickets.length);
    const winners = [];

    for (let i = 0; i < winnersCount; i++) {
      const ticket = soldTickets[i];
      const position = i + 1; // 1st, 2nd, 3rd place
      
      winners.push({
        position,
        ticketNumber: ticket.number,
        ticketId: ticket.id,
        buyer: ticket.buyer,
        medal: position === 1 ? 'gold' : position === 2 ? 'silver' : 'bronze'
      });
    }

    // Update the raffle with the first place winner ID (for compatibility)
    await prisma.raffle.update({
      where: { id: raffleId },
      data: {
        winnerId: winners[0].buyer.id,
        isActive: false // Close the raffle after drawing
      }
    });

    // Store the draw results (you might want to create a winners table for this)
    // For now, we'll just return the results
    const drawResult = {
      raffleId,
      raffleTitle: raffle.title,
      drawDate: new Date(),
      winners,
      totalParticipants: raffle.tickets.length,
      drawNumber: `${Date.now()}`
    };

    res.json({
      message: 'Winners drawn successfully',
      draw: drawResult
    });

  } catch (error) {
    console.error('❌ Draw raffle winners error:', error);
    res.status(500).json({ error: 'Error al sortear ganadores' });
  }
};

// Get raffle draw results (if available)
export const getRaffleDrawResults = async (req: Request, res: Response) => {
  try {
    const { id: raffleId } = req.params;
    const userId = req.user!.id;

    // Find the raffle and verify ownership
    const raffle = await prisma.raffle.findFirst({
      where: {
        id: raffleId,
        userId: userId
      },
      include: {
        tickets: {
          include: {
            buyer: {
              select: {
                id: true,
                name: true,
                email: true,
                documentNumber: true,
                phone: true
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
      return res.status(404).json({ error: 'Raffle not found or access denied' });
    }

    // If no winner has been drawn yet
    if (!raffle.winnerId) {
      return res.json({
        raffleId,
        hasWinners: false,
        message: 'No winners have been drawn yet'
      });
    }

    // Since we don't have a winners table yet, we can't recreate the full draw results
    // But we can return the winner information
    const winnerTicket = raffle.tickets.find(ticket => ticket.buyerId === raffle.winnerId);

    if (winnerTicket) {
      res.json({
        raffleId,
        raffleTitle: raffle.title,
        hasWinners: true,
        winner: {
          position: 1,
          ticketNumber: winnerTicket.number,
          ticketId: winnerTicket.id,
          buyer: winnerTicket.buyer,
          medal: 'gold'
        },
        totalParticipants: raffle.tickets.length,
        note: 'Legacy draw result - only first place winner available'
      });
    } else {
      res.json({
        raffleId,
        hasWinners: false,
        message: 'Winner data not found'
      });
    }

  } catch (error) {
    console.error('❌ Get raffle draw results error:', error);
    res.status(500).json({ error: 'Error al obtener resultados del sorteo' });
  }
};

// Get raffle status statistics
export const getRaffleStatus = async (_req: Request, res: Response) => {
  try {
    const now = new Date();

    const [activeRaffles, expiredRaffles] = await Promise.all([
      prisma.raffle.count({
        where: {
          isActive: true,
          endDate: {
            gt: now
          }
        }
      }),
      prisma.raffle.count({
        where: {
          OR: [
            {
              isActive: false
            },
            {
              endDate: {
                lte: now
              }
            }
          ]
        }
      })
    ]);

    res.json({
      activeRaffles,
      expiredRaffles
    });

  } catch (error) {
    console.error('❌ Get raffle status error:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas de rifas' });
  }
};

// Get user's raffle sales statistics
export const getUserRaffleSales = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    // Get user's raffles with ticket sales information
    const userRaffles = await prisma.raffle.findMany({
      where: {
        userId: userId
      },
      select: {
        id: true,
        title: true,
        ticketPrice: true,
        maxTickets: true,
        soldTickets: true,
        isActive: true,
        endDate: true,
        createdAt: true
      }
    });

    // Calculate statistics
    const totalRaffles = userRaffles.length;
    const activeRaffles = userRaffles.filter(raffle => raffle.isActive && new Date() <= raffle.endDate).length;
    const expiredRaffles = userRaffles.filter(raffle => !raffle.isActive || new Date() > raffle.endDate).length;
    
    const totalTicketsSold = userRaffles.reduce((sum, raffle) => sum + raffle.soldTickets, 0);
    const totalRevenue = userRaffles.reduce((sum, raffle) => sum + (raffle.soldTickets * raffle.ticketPrice), 0);
    const totalPossibleTickets = userRaffles.reduce((sum, raffle) => sum + raffle.maxTickets, 0);
    
    const conversionRate = totalPossibleTickets > 0 ? Math.round((totalTicketsSold / totalPossibleTickets) * 100) : 0;
    const averageTicketPrice = totalRaffles > 0 ? Math.round(userRaffles.reduce((sum, raffle) => sum + raffle.ticketPrice, 0) / totalRaffles) : 0;

    res.json({
      totalRaffles,
      activeRaffles,
      expiredRaffles,
      totalTicketsSold,
      totalRevenue,
      averageTicketPrice,
      conversionRate,
      raffles: userRaffles
    });

  } catch (error) {
    console.error('❌ Get user raffle sales error:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas de ventas del usuario' });
  }
};