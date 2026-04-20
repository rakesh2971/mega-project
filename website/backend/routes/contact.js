import express from 'express';
import * as Sentry from '@sentry/node';
import { supabase } from '../db.js';

const router = express.Router();

// POST /api/contact — public endpoint, no auth required
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    const { data, error } = await supabase
      .from('contact_messages')
      .insert({ name: name.trim(), email: email.trim(), message: message.trim() })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Message sent successfully', id: data.id });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Contact message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
