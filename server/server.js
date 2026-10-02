import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { PrismaClient } from '@prisma/client';
import userRoutes from './routes/userRoute.js';
import adminRoutes from './routes/adminRoute.js';
import authRoutes from './routes/authRoute.js';
import cartRoutes from './routes/cartRoute.js';
import orderRoutes from './routes/orderRoute.js';
import productRoutes from './routes/productRoute.js';
import reviewRoutes from './routes/reviewRoute.js';
import wishlistRoutes from './routes/wishlistRoute.js';
import checkoutRoutes from './routes/checkoutRoute.js';
import heroRoutes from './routes/heroRoute.js';
import passport from './middleware/passport.js';

dotenv.config();
const app = express();
const prisma = new PrismaClient();

// Enable trust proxy for production (e.g., Vercel, Cloudflare)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Consolidated CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
  'https://hadibookstore.shop',
  'https://www.hadibookstore.shop',
  'https://hadi-books-store-frontend.vercel.app',
  'https://admin-panel-alpha-five.vercel.app',
];

const corsOptions = {
  origin: (origin, callback) => {
    console.log('🔍 CORS Check - Origin:', origin);
    
    // Allow requests with no origin (e.g., Postman, mobile apps)
    if (!origin) {
      console.log('✅ No origin - allowed');
      return callback(null, true);
    }

    // Allow exact matches from our list
    if (allowedOrigins.includes(origin)) {
      console.log('✅ Exact match - allowed:', origin);
      return callback(null, true);
    }

    // Allow any subdomain of hadibookstore.shop or vercel.app, plus localhost
    try {
      const url = new URL(origin);
      if (
        url.hostname &&
        (url.hostname === 'localhost' ||
          url.hostname === '127.0.0.1' ||
          url.hostname.endsWith('.hadibookstore.shop') ||
          url.hostname.endsWith('.vercel.app'))
      ) {
        console.log('✅ Wildcard match - allowed:', origin);
        return callback(null, true);
      }
    } catch (e) {
      // Fall through to block
    }

    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) return callback(null, true);
    if (process.env.ADMIN_URL && origin === process.env.ADMIN_URL) return callback(null, true);

    console.warn('❌ CORS blocked for origin:', origin);
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Handle OPTIONS requests for all routes
app.options('*', cors(corsOptions));

// Prevent Cloudflare from caching API responses (especially CORS headers)
app.use('/api', (req, res, next) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    'Pragma': 'no-cache',
    'Expires': '0',
  });
  next();
});

// Session middleware for Google OAuth
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-key-for-development',
    resave: false,
    saveUninitialized: false,
    cookie: (function () {
      const cookieCfg = {
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 10 * 60 * 1000, // 10 minutes
      };
      if (process.env.COOKIE_DOMAIN && !process.env.COOKIE_DOMAIN.includes('vercel.app') && !process.env.COOKIE_DOMAIN.includes('hadibookstore.shop')) {
        cookieCfg.domain = process.env.COOKIE_DOMAIN;
      }
      return cookieCfg;
    })(),
  })
);

app.use(passport.initialize());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/adminCtrl', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/hero', heroRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// Simple health check - NO DATABASE QUERY (to save database hours)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
    }
  });
});

// Database health check - ONLY USE THIS MANUALLY FOR DEBUGGING
app.get('/health/db', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ 
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// Error handler - Enhanced with detailed logging and safe error responses
app.use((err, req, res, next) => {
  console.error('❌ Global Error Handler Caught:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString()
  });
  
  // Don't crash the server, always respond
  if (!res.headersSent) {
    res.status(err.status || 500).json({ 
      success: false, 
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
});

// Start server locally (on Vercel Serverless, app is exported)
const PORT = process.env.PORT || 4000;
let server;

if (!process.env.VERCEL) {
  server = app.listen(PORT, async () => {
    try {
      await prisma.$connect();
      console.log(`✅ Server running on port ${PORT}`);
      console.log('✅ Connected to Neon PostgreSQL database');
      console.log('✅ Session middleware configured for Google OAuth');
    } catch (error) {
      console.error('❌ Database connection error:', error);
      console.log('⚠️ Retrying database connection in 5 seconds...');
      setTimeout(async () => {
        try {
          await prisma.$connect();
          console.log('✅ Database reconnected successfully');
        } catch (retryError) {
          console.error('❌ Database reconnection failed:', retryError);
          process.exit(1);
        }
      }, 5000);
    }
  });

  // Handle server errors
  server.on('error', (error) => {
    console.error('❌ Server error:', error);
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use`);
      process.exit(1);
    }
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('📴 SIGTERM signal received: closing HTTP server');
    server.close(async () => {
      console.log('📴 HTTP server closed');
      await prisma.$disconnect();
      console.log('📴 Database connection closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', async () => {
    console.log('📴 SIGINT signal received: closing HTTP server');
    server.close(async () => {
      console.log('📴 HTTP server closed');
      await prisma.$disconnect();
      console.log('📴 Database connection closed');
      process.exit(0);
    });
  });
}

export default app;
