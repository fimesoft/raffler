import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createRaffle,
  createRaffleValidation,
  getAllRaffles,
  getRaffleById,
  getUserRaffles,
  updateRaffle,
  deleteRaffle,
  purchaseTickets,
  purchaseTicketsValidation,
  getRaffleTickets,
  getRaffleSales,
  drawRaffleWinners,
  getRaffleDrawResults
} from '../controllers/raffleController';

const router = express.Router();

/**
 * @swagger
 * /api/raffles:
 *   post:
 *     summary: Crear una nueva rifa
 *     description: Crea una nueva rifa (requiere autenticación)
 *     tags: [Raffles]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRaffleRequest'
 *     responses:
 *       201:
 *         description: Rifa creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RaffleResponse'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', authenticateToken, createRaffleValidation, createRaffle);

/**
 * @swagger
 * /api/raffles:
 *   get:
 *     summary: Obtener todas las rifas activas
 *     description: Lista todas las rifas activas con paginación
 *     tags: [Raffles]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Elementos por página
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Filtrar por rifas activas
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Campo para ordenar
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Orden de clasificación
 *     responses:
 *       200:
 *         description: Lista de rifas exitosamente obtenida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 raffles:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Raffle'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/', getAllRaffles);

/**
 * @swagger
 * /api/raffles/my:
 *   get:
 *     summary: Obtener rifas del usuario autenticado
 *     description: Lista todas las rifas creadas por el usuario autenticado
 *     tags: [Raffles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Elementos por página
 *     responses:
 *       200:
 *         description: Lista de rifas del usuario obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 raffles:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Raffle'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/my', authenticateToken, getUserRaffles);
router.get('/my/sales', authenticateToken, getRaffleSales);

/**
 * @swagger
 * /api/raffles/{id}:
 *   get:
 *     summary: Obtener una rifa por ID
 *     description: Obtiene los detalles completos de una rifa incluyendo boletos
 *     tags: [Raffles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la rifa
 *     responses:
 *       200:
 *         description: Rifa obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 raffle:
 *                   $ref: '#/components/schemas/RaffleDetail'
 *       404:
 *         description: Rifa no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', getRaffleById);

/**
 * @swagger
 * /api/raffles/{id}:
 *   put:
 *     summary: Actualizar una rifa
 *     description: Actualiza una rifa (solo el creador, y solo si no tiene boletos vendidos)
 *     tags: [Raffles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la rifa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRaffleRequest'
 *     responses:
 *       200:
 *         description: Rifa actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RaffleResponse'
 *       400:
 *         description: Error de validación o rifa con boletos vendidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Rifa no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', authenticateToken, updateRaffle);

/**
 * @swagger
 * /api/raffles/{id}:
 *   delete:
 *     summary: Eliminar una rifa
 *     description: Elimina una rifa (solo el creador, y solo si no tiene boletos vendidos)
 *     tags: [Raffles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la rifa
 *     responses:
 *       200:
 *         description: Rifa eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: No se puede eliminar rifa con boletos vendidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Rifa no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', authenticateToken, deleteRaffle);

/**
 * @swagger
 * /api/raffles/{id}/tickets:
 *   get:
 *     summary: Obtener boletos vendidos de una rifa
 *     description: Lista los números de boletos ya vendidos para una rifa específica
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la rifa
 *     responses:
 *       200:
 *         description: Lista de números vendidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 soldNumbers:
 *                   type: array
 *                   items:
 *                     type: integer
 *                   description: Array de números ya vendidos
 *       404:
 *         description: Rifa no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id/tickets', getRaffleTickets);

/**
 * @swagger
 * /api/raffles/{id}/purchase:
 *   post:
 *     summary: Comprar boletos de una rifa
 *     description: Compra uno o más boletos para una rifa específica
 *     tags: [Tickets]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la rifa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - numbers
 *             properties:
 *               numbers:
 *                 type: array
 *                 items:
 *                   type: integer
 *                   minimum: 1
 *                 minItems: 1
 *                 maxItems: 10
 *                 description: Array de números a comprar (máximo 10)
 *             example:
 *               numbers: [5, 23, 47, 89]
 *     responses:
 *       201:
 *         description: Boletos comprados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Boletos comprados exitosamente"
 *                 purchasedNumbers:
 *                   type: array
 *                   items:
 *                     type: integer
 *                   description: Números comprados
 *                 totalCost:
 *                   type: number
 *                   description: Costo total de la compra
 *                 transactionId:
 *                   type: string
 *                   description: ID de la transacción
 *       400:
 *         description: Error de validación o números ya vendidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Rifa no encontrada o finalizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/:id/purchase', authenticateToken, purchaseTicketsValidation, purchaseTickets);

// Draw winners for a raffle (only by creator)
router.post('/:id/draw-winners', authenticateToken, drawRaffleWinners);

// Get raffle draw results (if available)
router.get('/:id/draw-results', authenticateToken, getRaffleDrawResults);

export default router;