import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import symposiumRoutes from './routes/symposiumRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import registrationRoutes from './routes/registrationRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import prisma from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Required for Render and other PaaS platforms

// Trust the single Nginx reverse-proxy hop so req.ip and rate-limiting use the real client address
app.set('trust proxy', 1);

// ── CORS ──
// In production CLIENT_URL must be your deployed frontend URL.
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server requests (no origin) or listed origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' not allowed`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json({ limit: '2mb' }));

// ── Security: Rate Limiting ──
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Tighter limit for auth attempts
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts. Please wait 15 minutes before retrying.' },
});

app.use('/api', generalLimiter);
app.use('/api/auth', authLimiter);

// ── Structured Logging & Audit Middleware ──
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    // Never log Authorization header values
    console.log(
      `[AUDIT] ${timestamp} | ${req.method} ${req.originalUrl} | Status: ${res.statusCode} | ${duration}ms | IP: ${req.ip}`
    );
  });
  next();
});

// ── Health Check ──
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Unified Symposium Management Platform API',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
});

// Legacy alias kept for backward compatibility
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Unified Symposium Management Platform API is running smoothly.',
    timestamp: new Date().toISOString(),
  });
});

// ── API Route Registrations ──
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/symposiums', symposiumRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/certificates', certificateRoutes);

// ── 404 Handler ──
app.use((req, res) => {
  res.status(404).json({ message: `Route '${req.method} ${req.originalUrl}' not found.` });
});

// ── Global Error Handler ──
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Do not expose stack traces in production
  const isDev = process.env.NODE_ENV !== 'production';
  console.error('[SERVER ERROR]', err.stack || err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error occurred.',
    ...(isDev && { stack: err.stack }),
  });
});

// ── Server Startup ──
const isDirectRun = process.argv[1] && (process.argv[1].endsWith('app.js') || process.argv[1].endsWith('app'));
if (isDirectRun && process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, HOST, () => {
    console.log(`[SERVER] Running on http://${HOST}:${PORT} (NODE_ENV=${process.env.NODE_ENV || 'development'})`);
    console.log(`[SERVER] Allowed CORS origins: ${allowedOrigins.join(', ')}`);
  });

  // ── Graceful Shutdown ──
  const shutdown = async (signal) => {
    console.log(`[SERVER] ${signal} received. Shutting down gracefully…`);
    server.close(async () => {
      try {
        await prisma.$disconnect();
        console.log('[SERVER] Prisma disconnected. Process exiting.');
      } catch (e) {
        console.error('[SERVER] Error disconnecting Prisma:', e.message);
      }
      process.exit(0);
    });

    // Force-exit if still alive after 10 s
    setTimeout(() => {
      console.error('[SERVER] Graceful shutdown timed out. Force exiting.');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

export default app;
