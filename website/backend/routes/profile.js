import express from 'express';
import * as Sentry from '@sentry/node';
import { supabase } from '../db.js';
import { verifyToken } from './auth.js';

const router = express.Router();

// GET /api/profile — get authenticated user's profile
router.get('/', verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.userId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(data);
  } catch (error) {
    Sentry.captureException(error);
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/profile — update authenticated user's profile
router.put('/', verifyToken, async (req, res) => {
  try {
    const updates = req.body;
    const allowedFields = [
      'username', 'avatar_url', 'mood', 'status',
      'first_name', 'last_name', 'phone_number',
    ];

    const fieldsToUpdate = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        fieldsToUpdate[field] = updates[field];
      }
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    // Validate avatar size if being updated
    if (fieldsToUpdate.avatar_url) {
      const avatarSize = fieldsToUpdate.avatar_url.length;
      console.log(`Updating avatar for user ${req.userId}: ${avatarSize} chars`);
      if (avatarSize > 2000000) { // ~1.5MB base64 limit
        return res.status(400).json({ error: 'Avatar image is too large. Maximum ~1MB allowed.' });
      }
    }

    fieldsToUpdate.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('profiles')
      .update(fieldsToUpdate)
      .eq('id', req.userId)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(data);
  } catch (error) {
    Sentry.captureException(error);
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
