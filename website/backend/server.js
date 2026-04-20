// Sentry MUST be the very first import
import './instrument.js';

import * as Sentry from '@sentry/node';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import activityRoutes from './routes/activities.js';
import betaRoutes from './routes/beta.js';
import contactRoutes from './routes/contact.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
// Increase payload limit for base64 encoded avatars
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'NeuroMate API is running', db: 'Supabase (PostgreSQL)' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/beta', betaRoutes);
app.use('/api/contact', contactRoutes);

// Sentry error handler — must be after routes, before other error handlers
Sentry.setupExpressErrorHandler(app);

// Generic error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 NeuroMate API server running on http://localhost:${PORT}`);
});
