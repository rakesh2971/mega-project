import express from 'express';
import * as Sentry from '@sentry/node';
import { supabase } from '../db.js';
import { verifyToken } from './auth.js';

const router = express.Router();

// ============================================================
// GET /api/activities?type=<type>&startDate=&endDate=
// ============================================================
router.get('/', verifyToken, async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    const userId = req.userId;
    let query;

    switch (type) {
      case 'tasks':
        query = supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (startDate) query = query.gte('created_at', startDate);
        if (endDate) query = query.lte('created_at', endDate);
        break;

      case 'moods':
        query = supabase.from('mood_checkins').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (startDate) query = query.gte('created_at', startDate);
        if (endDate) query = query.lte('created_at', endDate);
        break;

      case 'focus':
        query = supabase.from('focus_sessions').select('*').eq('user_id', userId).order('started_at', { ascending: false });
        if (startDate) query = query.gte('started_at', startDate);
        if (endDate) query = query.lte('started_at', endDate);
        break;

      case 'journals':
        query = supabase.from('journal_entries').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (startDate) query = query.gte('created_at', startDate);
        if (endDate) query = query.lte('created_at', endDate);
        break;

      case 'routines':
        query = supabase.from('routines').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (startDate) query = query.gte('created_at', startDate);
        if (endDate) query = query.lte('created_at', endDate);
        break;

      case 'meditations':
        query = supabase.from('meditation_sessions').select('*').eq('user_id', userId).order('started_at', { ascending: false });
        if (startDate) query = query.gte('started_at', startDate);
        if (endDate) query = query.lte('started_at', endDate);
        break;

      case 'posts':
        // Global community feed — include poster's profile
        query = supabase
          .from('posts')
          .select('*, profiles(username, avatar_url)')
          .order('created_at', { ascending: false });
        break;

      case 'my-posts':
        query = supabase
          .from('posts')
          .select('*, profiles(username, avatar_url)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        break;

      default:
        return res.status(400).json({ error: 'Invalid activity type' });
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    Sentry.captureException(error);
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// ============================================================
// TASKS
// ============================================================
router.post('/tasks', verifyToken, async (req, res) => {
  try {
    const { title, description, completed } = req.body;
    const completedAt = completed ? new Date().toISOString() : null;

    const { data, error } = await supabase
      .from('tasks')
      .insert({ user_id: req.userId, title, description: description || null, completed: completed || false, completed_at: completedAt })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    Sentry.captureException(error);
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

router.put('/tasks/:id', verifyToken, async (req, res) => {
  try {
    const updates = req.body;
    if (updates.completed !== undefined && updates.completed) {
      updates.completed_at = new Date().toISOString();
    } else if (updates.completed === false) {
      updates.completed_at = null;
    }
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

router.delete('/tasks/:id', verifyToken, async (req, res) => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId);

    if (error) throw error;
    res.json({ message: 'Task deleted' });
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// ============================================================
// MOODS
// ============================================================
router.post('/moods', verifyToken, async (req, res) => {
  try {
    const { mood_level, mood_type, notes } = req.body;
    const { data, error } = await supabase
      .from('mood_checkins')
      .insert({ user_id: req.userId, mood_level, mood_type, notes })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ error: 'Failed to create mood checkin' });
  }
});

router.delete('/moods/:id', verifyToken, async (req, res) => {
  try {
    const { error } = await supabase
      .from('mood_checkins')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId);

    if (error) throw error;
    res.json({ message: 'Mood deleted' });
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ error: 'Failed to delete mood' });
  }
});

// ============================================================
// FOCUS SESSIONS
// ============================================================
router.post('/focus', verifyToken, async (req, res) => {
  try {
    const { activity, duration_minutes, notes } = req.body;
    const { data, error } = await supabase
      .from('focus_sessions')
      .insert({ user_id: req.userId, activity, duration_minutes, notes })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ error: 'Failed to create focus session' });
  }
});

router.delete('/focus/:id', verifyToken, async (req, res) => {
  try {
    const { error } = await supabase
      .from('focus_sessions')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId);

    if (error) throw error;
    res.json({ message: 'Focus session deleted' });
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ error: 'Failed to delete focus session' });
  }
});

// ============================================================
// JOURNALS
// ============================================================
router.post('/journals', verifyToken, async (req, res) => {
  try {
    const { title, content, mood } = req.body;
    const { data, error } = await supabase
      .from('journal_entries')
      .insert({ user_id: req.userId, title, content, mood })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ error: 'Failed to create journal entry' });
  }
});

router.delete('/journals/:id', verifyToken, async (req, res) => {
  try {
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId);

    if (error) throw error;
    res.json({ message: 'Journal entry deleted' });
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ error: 'Failed to delete journal entry' });
  }
});

// ============================================================
// ROUTINES
// ============================================================
router.post('/routines', verifyToken, async (req, res) => {
  try {
    const { name, description, completed } = req.body;
    const completedAt = completed ? new Date().toISOString() : null;

    const { data, error } = await supabase
      .from('routines')
      .insert({ user_id: req.userId, name, description: description || null, completed: completed || false, completed_at: completedAt })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ error: 'Failed to create routine' });
  }
});

router.put('/routines/:id', verifyToken, async (req, res) => {
  try {
    const updates = req.body;
    if (updates.completed !== undefined && updates.completed) {
      updates.completed_at = new Date().toISOString();
    } else if (updates.completed === false) {
      updates.completed_at = null;
    }
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('routines')
      .update(updates)
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ error: 'Failed to update routine' });
  }
});

router.delete('/routines/:id', verifyToken, async (req, res) => {
  try {
    const { error } = await supabase
      .from('routines')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId);

    if (error) throw error;
    res.json({ message: 'Routine deleted' });
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ error: 'Failed to delete routine' });
  }
});

// ============================================================
// MEDITATION SESSIONS
// ============================================================
router.post('/meditations', verifyToken, async (req, res) => {
  try {
    const { type, duration_minutes, notes } = req.body;
    const { data, error } = await supabase
      .from('meditation_sessions')
      .insert({ user_id: req.userId, type, duration_minutes, notes })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ error: 'Failed to create meditation session' });
  }
});

router.delete('/meditations/:id', verifyToken, async (req, res) => {
  try {
    const { error } = await supabase
      .from('meditation_sessions')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId);

    if (error) throw error;
    res.json({ message: 'Meditation session deleted' });
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ error: 'Failed to delete meditation session' });
  }
});

// ============================================================
// COMMUNITY POSTS
// ============================================================
router.post('/posts', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Post content is required' });
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({ user_id: req.userId, content: content.trim() })
      .select('*, profiles(username, avatar_url)')
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

router.delete('/posts/:id', verifyToken, async (req, res) => {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId);

    if (error) throw error;
    res.json({ message: 'Post deleted' });
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

export default router;
