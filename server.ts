import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';

// Import Controllers
import * as authCtrl from './backend/src/controllers/authController.js';
import * as propCtrl from './backend/src/controllers/propertyController.js';
import * as inqCtrl from './backend/src/controllers/inquiryController.js';
import * as aptCtrl from './backend/src/controllers/appointmentController.js';
import * as txCtrl from './backend/src/controllers/transactionController.js';
import * as geminiCtrl from './backend/src/controllers/geminiController.js';
import * as analyticsCtrl from './backend/src/controllers/analyticsController.js';

import { authenticateToken, requireRole } from './backend/src/middleware/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  // CORS configuration for Vercel frontend
const allowedOrigins = [
  'https://kunlexcity.vercel.app',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.options('*', cors());
  // AI Studio Dev server must run on port 3000
  const PORT = Number(process.env.PORT) || 3000;

  // Body parser with 35mb limit to support file picture uploads as base64 data URLs
  app.use(express.json({ limit: '35mb' }));
  app.use(express.urlencoded({ extended: true, limit: '35mb' }));

  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // ----------------------------------------------------
  // AUTHENTICATION ROUTES (Admin & Client/Buyer)
  // ----------------------------------------------------
  app.post('/api/auth/register', authCtrl.register);
  app.post('/api/auth/login', authCtrl.login);
  app.post('/api/auth/verify-email', authCtrl.verifyEmail);
app.post('/api/auth/resend-verification', authCtrl.resendVerification);
  app.get('/api/auth/me', authenticateToken, authCtrl.getMe);
  app.post('/api/auth/switch-demo', authCtrl.switchDemoRole);
  app.post('/api/auth/forgot-password', authCtrl.forgotPassword);

  // ----------------------------------------------------
  // PROPERTY ROUTES (Admin has full access, public can view)
  // ----------------------------------------------------
  app.get('/api/properties', propCtrl.getProperties);
  app.get('/api/properties/user/favorites', authenticateToken, propCtrl.getUserFavorites);
  app.get('/api/properties/:id', propCtrl.getPropertyById);
  app.post('/api/properties', authenticateToken, requireRole(['ADMIN']), propCtrl.createProperty);
  app.put('/api/properties/:id', authenticateToken, requireRole(['ADMIN']), propCtrl.updateProperty);
  app.delete('/api/properties/:id', authenticateToken, requireRole(['ADMIN']), propCtrl.deleteProperty);
  app.patch('/api/properties/:id/status', authenticateToken, requireRole(['ADMIN']), propCtrl.updatePropertyStatus);
  app.post('/api/properties/:id/favorite', authenticateToken, propCtrl.toggleFavorite);

  // ----------------------------------------------------
  // INQUIRIES & INSPECTIONS (Client/Buyer submits, Admin manages)
  // ----------------------------------------------------
  app.post('/api/inquiries', inqCtrl.createInquiry);
  app.get('/api/inquiries', authenticateToken, inqCtrl.getInquiries);
  app.patch('/api/inquiries/:id', authenticateToken, requireRole(['ADMIN']), inqCtrl.updateInquiryStatus);

  app.post('/api/appointments', aptCtrl.scheduleAppointment);
  app.get('/api/appointments', authenticateToken, aptCtrl.getAppointments);
  app.patch('/api/appointments/:id', authenticateToken, requireRole(['ADMIN']), aptCtrl.updateAppointmentStatus);

  // ----------------------------------------------------
  // TRANSACTIONS & CLIENT PURCHASE ORDERS (Paid / Pending to Buy)
  // ----------------------------------------------------
  app.get('/api/transactions', authenticateToken, txCtrl.getTransactions);
  app.post('/api/transactions', authenticateToken, txCtrl.recordTransaction);
  app.patch('/api/transactions/:id/status', authenticateToken, requireRole(['ADMIN']), txCtrl.updateTransactionStatus);

  // ----------------------------------------------------
  // ANALYTICS & REGISTERED CLIENTS
  // ----------------------------------------------------
  app.get('/api/analytics/dashboard', analyticsCtrl.getDashboardAnalytics);
  app.get('/api/clients', authenticateToken, requireRole(['ADMIN']), analyticsCtrl.getClients);

  // ----------------------------------------------------
  // GEMINI AI ASSISTANT ROUTES
  // ----------------------------------------------------
  app.post('/api/gemini/chat', geminiCtrl.handleAIChat);
  app.post('/api/gemini/generate-description', geminiCtrl.handleGenerateDescription);
  app.post('/api/gemini/compare', geminiCtrl.handleCompareProperties);

  // ----------------------------------------------------
  // VITE / STATIC SERVING
  // ----------------------------------------------------
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 KunlexCity PrimeNest Realty server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting KunlexCity server:', err);
  process.exit(1);
});

