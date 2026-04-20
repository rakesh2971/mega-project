import express from 'express';
import * as Sentry from '@sentry/node';
import { supabase } from '../db.js';

const router = express.Router();

// POST /api/beta/signup — public endpoint, no auth required
router.post('/signup', async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Name, email, and phone are required' });
    }

    const { data, error } = await supabase
      .from('beta_signups')
      .insert({ name: name.trim(), email: email.trim(), phone: phone.trim() })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Beta signup successful', id: data.id });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Beta signup error:', error);
    res.status(500).json({ error: 'Failed to process beta signup' });
  }
});

export default router;
