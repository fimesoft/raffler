import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Routes
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import raffleRoutes from './routes/raffles';

// Swagger
import { setupSwagger } from './config/swagger';

// Load environment variables
dotenv.config({ path: '/Users/diegoquintero/raffler/.env.local' });

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://yourproductiondomain.com' 
    : 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// More strict rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 50 : 5 // More permissive in development
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging - Formato personalizado más detallado
const morganFormat = process.env.NODE_ENV === 'development' 
  ? ':method :url :status :response-time ms - :res[content-length] bytes :date[iso]'
  : 'combined';

app.use(morgan(morganFormat));

// Log adicional para requests importantes
app.use((req, res, next) => {
  // Log detallado para requests de API
  if (req.path.startsWith('/api/')) {
    console.log(`\n🔹 ${req.method} ${req.path}`);
    if (req.method === 'POST' || req.method === 'PUT') {
      console.log('📦 Body:', req.body ? Object.keys(req.body) : 'empty');
    }
    if (req.headers.authorization) {
      console.log('🔐 Auth:', req.headers.authorization ? 'Bearer token present' : 'No auth');
    }
  }
  next();
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verificar estado del servidor
 *     description: Endpoint para verificar que el servidor está funcionando correctamente
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Servidor funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Setup Swagger documentation
setupSwagger(app);

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/raffles', raffleRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('\n🚨 ERROR OCCURRED:');
  console.error('Path:', req.method, req.path);
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.error('Request body keys:', Object.keys(req.body));
  }
  
  if (err.name === 'ValidationError') {
    console.error('💥 Validation Error Details:', err.details || err.errors);
    return res.status(400).json({ error: err.message, details: err.details });
  }
  
  if (err.name === 'UnauthorizedError') {
    console.error('🔒 Unauthorized access attempt');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  console.error('❌ Internal Server Error');
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 RAFFLER API SERVER STARTED');
  console.log('='.repeat(50));
  console.log(`📍 Port: ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📖 Docs: http://localhost:${PORT}/api/docs`);
  console.log('='.repeat(50));
  console.log('✅ Server ready for requests...\n');
});

export default app;