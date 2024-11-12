// src/services/chatService.js
import { supabase } from '../supabaseClient';

export const chatService = {
  // Create a new chat session
  async createSession(userId, title) {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert([
          { user_id: userId, title }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw error;
    }
  },

  // Get all chat sessions for a user
  async getUserSessions(userId) {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      throw error;
    }
  },

  // Get messages for a specific session
  async getSessionMessages(sessionId) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching session messages:', error);
      throw error;
    }
  },

  // Add a new message to a session
  async addMessage(sessionId, role, content) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([
          { session_id: sessionId, role, content }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  },

  // Set up real-time subscription for new messages
  subscribeToSessionMessages(sessionId, callback) {
    return supabase
      .channel(`chat_messages:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${sessionId}`
        },
        callback
      )
      .subscribe();
  }
};

export default chatService;