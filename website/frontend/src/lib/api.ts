// API Client for NeuroMate Backend
// Auth is handled via Supabase; other endpoints go through Express
import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Get auth token from the active Supabase session
export const getToken = async (): Promise<string | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
};

// API request helper — attaches Supabase Bearer token automatically
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = await getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const error = await response.json();
        errorMessage = error.error || error.message || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return response;
  } catch (error) {
    if (error instanceof Error && error.message.includes('fetch')) {
      throw new Error('Failed to connect to server. Please make sure the backend is running.');
    }
    throw error;
  }
};

// ============================================================
// Auth API — uses Supabase Auth directly (no Express calls)
// ============================================================
export const authAPI = {
  signUp: async (email: string, password: string, username?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: username || email.split('@')[0] },
      },
    });
    if (error) throw new Error(error.message);
    return { user: data.user, error: null };
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return { user: data.user, error: null };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  changePassword: async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      return { error: error ? new Error(error.message) : null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error(String(error)) };
    }
  },

  getCurrentUser: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      // Also fetch profile from backend to get username, avatar, etc.
      try {
        const response = await apiRequest('/profile');
        const profile = await response.json();
        return { ...user, ...profile };
      } catch {
        return user;
      }
    } catch {
      return null;
    }
  },
};

// ============================================================
// Profile API
// ============================================================
export const profileAPI = {
  get: async (_userId?: string) => {
    const response = await apiRequest('/profile');
    return await response.json();
  },

  update: async (updates: Record<string, string | number | boolean | null>) => {
    try {
      const response = await apiRequest('/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return await response.json();
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  },
};

// ============================================================
// Activities API
// ============================================================
export const activitiesAPI = {
  get: async (type: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams({ type });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await apiRequest(`/activities?${params.toString()}`);
    return await response.json();
  },

  createTask: async (title: string, description?: string, completed?: boolean) => {
    const response = await apiRequest('/activities/tasks', {
      method: 'POST',
      body: JSON.stringify({ title, description, completed }),
    });
    return await response.json();
  },

  updateTask: async (id: string, updates: Record<string, unknown>) => {
    const response = await apiRequest(`/activities/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return await response.json();
  },

  deleteTask: async (id: string) => {
    const response = await apiRequest(`/activities/tasks/${id}`, { method: 'DELETE' });
    return await response.json();
  },

  createMood: async (mood_level: number, mood_type?: string, notes?: string) => {
    const response = await apiRequest('/activities/moods', {
      method: 'POST',
      body: JSON.stringify({ mood_level, mood_type, notes }),
    });
    return await response.json();
  },

  deleteMood: async (id: string) => {
    const response = await apiRequest(`/activities/moods/${id}`, { method: 'DELETE' });
    return await response.json();
  },

  createFocusSession: async (activity: string, duration_minutes: number, notes?: string) => {
    const response = await apiRequest('/activities/focus', {
      method: 'POST',
      body: JSON.stringify({ activity, duration_minutes, notes }),
    });
    return await response.json();
  },

  deleteFocusSession: async (id: string) => {
    const response = await apiRequest(`/activities/focus/${id}`, { method: 'DELETE' });
    return await response.json();
  },

  createJournal: async (title: string, content: string, mood?: string) => {
    const response = await apiRequest('/activities/journals', {
      method: 'POST',
      body: JSON.stringify({ title, content, mood }),
    });
    return await response.json();
  },

  deleteJournal: async (id: string) => {
    const response = await apiRequest(`/activities/journals/${id}`, { method: 'DELETE' });
    return await response.json();
  },

  createRoutine: async (name: string, description?: string, completed?: boolean) => {
    const response = await apiRequest('/activities/routines', {
      method: 'POST',
      body: JSON.stringify({ name, description, completed }),
    });
    return await response.json();
  },

  updateRoutine: async (id: string, updates: Record<string, unknown>) => {
    const response = await apiRequest(`/activities/routines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return await response.json();
  },

  deleteRoutine: async (id: string) => {
    const response = await apiRequest(`/activities/routines/${id}`, { method: 'DELETE' });
    return await response.json();
  },

  createMeditation: async (type: string, duration_minutes: number, notes?: string) => {
    const response = await apiRequest('/activities/meditations', {
      method: 'POST',
      body: JSON.stringify({ type, duration_minutes, notes }),
    });
    return await response.json();
  },

  deleteMeditation: async (id: string) => {
    const response = await apiRequest(`/activities/meditations/${id}`, { method: 'DELETE' });
    return await response.json();
  },

  createPost: async (content: string) => {
    const response = await apiRequest('/activities/posts', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
    return await response.json();
  },

  deletePost: async (id: string) => {
    const response = await apiRequest(`/activities/posts/${id}`, { method: 'DELETE' });
    return await response.json();
  },
};

// ============================================================
// Beta Signup API
// ============================================================
export const betaAPI = {
  signup: async (name: string, email: string, phone: string) => {
    const response = await apiRequest('/beta/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone }),
    });
    return await response.json();
  },
};

// ============================================================
// Contact API
// ============================================================
export const contactAPI = {
  sendMessage: async (name: string, email: string, message: string) => {
    const response = await apiRequest('/contact', {
      method: 'POST',
      body: JSON.stringify({ name, email, message }),
    });
    return await response.json();
  },
};
