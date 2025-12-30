/**
 * COLLABORATION SERVICE - SISTEMA DE COLABORACIÓN EN TIEMPO REAL
 * Gestiona documentos, versiones, comentarios, presencia y permisos
 * Compatible con: Google Docs, Notion, Confluence
 * 
 * CARACTERÍSTICAS:
 * - Realtime updates con Supabase
 * - Cursores colaborativos
 * - Comentarios inline
 * - Historial de versiones
 * - Sistema de permisos
 * - Activity logging
 */

import { supabase } from '../../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

// =====================================================
// TYPES Y INTERFACES
// =====================================================

export type DocumentCategory = 'roadmap' | 'guide' | 'api' | 'tutorial' | 'best-practices' | 'other';
export type DocumentStatus = 'draft' | 'review' | 'published' | 'archived';
export type DocumentVisibility = 'private' | 'team' | 'public';
export type CollaboratorRole = 'owner' | 'editor' | 'commenter' | 'viewer';
export type PresenceStatus = 'viewing' | 'editing' | 'idle';
export type CommentAnchorType = 'selection' | 'line' | 'general';

export interface Document {
  id: string;
  title: string;
  slug: string;
  file_path: string;
  category: DocumentCategory;
  content: string;
  frontmatter: Record<string, any>;
  owner_id: string;
  visibility: DocumentVisibility;
  status: DocumentStatus;
  version: number;
  views_count: number;
  comments_count: number;
  collaborators_count: number;
  last_edited_by: string | null;
  last_edited_at: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  content: string;
  frontmatter: Record<string, any>;
  diff_from_previous: string | null;
  changes_summary: {
    lines_added: number;
    lines_removed: number;
    chars_changed: number;
  };
  created_by: string;
  commit_message: string | null;
  created_at: string;
}

export interface DocumentCollaborator {
  id: string;
  document_id: string;
  user_id: string;
  role: CollaboratorRole;
  invited_by: string | null;
  invited_at: string;
  last_accessed_at: string | null;
  user?: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface DocumentComment {
  id: string;
  document_id: string;
  content: string;
  anchor_type: CommentAnchorType;
  anchor_start: number | null;
  anchor_end: number | null;
  anchor_text: string | null;
  parent_id: string | null;
  thread_resolved: boolean;
  resolved_by: string | null;
  resolved_at: string | null;
  author_id: string;
  likes_count: number;
  replies_count: number;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  replies?: DocumentComment[];
}

export interface DocumentPresence {
  id: string;
  document_id: string;
  user_id: string;
  status: PresenceStatus;
  cursor_position: {
    line: number;
    column: number;
    selection?: { start: number; end: number };
  } | null;
  connection_id: string;
  last_seen_at: string;
  joined_at: string;
  user?: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface DocumentActivity {
  id: string;
  document_id: string;
  activity_type: string;
  user_id: string;
  metadata: Record<string, any>;
  description: string | null;
  created_at: string;
  user?: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface DocumentShare {
  id: string;
  document_id: string;
  share_token: string;
  password_hash: string | null;
  allow_download: boolean;
  allow_comment: boolean;
  allow_edit: boolean;
  expires_at: string | null;
  access_count: number;
  last_accessed_at: string | null;
  created_by: string;
  created_at: string;
}

// =====================================================
// COLLABORATION SERVICE CLASS
// =====================================================

class CollaborationService {
  private activeChannels: Map<string, RealtimeChannel> = new Map();
  private presenceHeartbeat: NodeJS.Timeout | null = null;

  // =====================================================
  // DOCUMENTS CRUD
  // =====================================================

  /**
   * Obtener todos los documentos accesibles para el usuario
   */
  async getDocuments(options?: {
    category?: DocumentCategory;
    status?: DocumentStatus;
    visibility?: DocumentVisibility;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      let query = supabase
        .from('documents')
        .select('*')
        .order('updated_at', { ascending: false });

      if (options?.category) {
        query = query.eq('category', options.category);
      }

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.visibility) {
        query = query.eq('visibility', options.visibility);
      }

      if (options?.search) {
        query = query.or(`title.ilike.%${options.search}%,content.ilike.%${options.search}%`);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data: data as Document[], error: null };
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      return { data: null, error };
    }
  }

  /**
   * Obtener un documento por ID
   */
  async getDocument(documentId: string) {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error) throw error;

      // Incrementar contador de vistas
      await supabase
        .from('documents')
        .update({ views_count: (data.views_count || 0) + 1 })
        .eq('id', documentId);

      // Log activity
      await this.logActivity(documentId, 'viewed');

      return { data: data as Document, error: null };
    } catch (error: any) {
      console.error('Error fetching document:', error);
      return { data: null, error };
    }
  }

  /**
   * Crear nuevo documento
   */
  async createDocument(document: {
    title: string;
    slug: string;
    file_path: string;
    category: DocumentCategory;
    content: string;
    frontmatter?: Record<string, any>;
    visibility?: DocumentVisibility;
    status?: DocumentStatus;
  }) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('documents')
        .insert({
          ...document,
          owner_id: user.user.id,
          visibility: document.visibility || 'private',
          status: document.status || 'draft',
          frontmatter: document.frontmatter || {},
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await this.logActivity(data.id, 'created');

      return { data: data as Document, error: null };
    } catch (error: any) {
      console.error('Error creating document:', error);
      return { data: null, error };
    }
  }

  /**
   * Actualizar documento
   */
  async updateDocument(
    documentId: string, 
    updates: Partial<Document>,
    commitMessage?: string
  ) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('documents')
        .update({
          ...updates,
          last_edited_by: user.user.id,
          last_edited_at: new Date().toISOString(),
        })
        .eq('id', documentId)
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await this.logActivity(documentId, 'edited', {
        commit_message: commitMessage,
      });

      return { data: data as Document, error: null };
    } catch (error: any) {
      console.error('Error updating document:', error);
      return { data: null, error };
    }
  }

  /**
   * Eliminar documento
   */
  async deleteDocument(documentId: string) {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      console.error('Error deleting document:', error);
      return { error };
    }
  }

  // =====================================================
  // VERSIONS
  // =====================================================

  /**
   * Obtener historial de versiones
   */
  async getVersions(documentId: string, limit?: number) {
    try {
      let query = supabase
        .from('document_versions')
        .select('*, created_by_user:profiles!created_by(id, email, full_name, avatar_url)')
        .eq('document_id', documentId)
        .order('version_number', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data: data as DocumentVersion[], error: null };
    } catch (error: any) {
      console.error('Error fetching versions:', error);
      return { data: null, error };
    }
  }

  /**
   * Obtener versión específica
   */
  async getVersion(versionId: string) {
    try {
      const { data, error } = await supabase
        .from('document_versions')
        .select('*')
        .eq('id', versionId)
        .single();

      if (error) throw error;
      return { data: data as DocumentVersion, error: null };
    } catch (error: any) {
      console.error('Error fetching version:', error);
      return { data: null, error };
    }
  }

  /**
   * Restaurar versión anterior
   */
  async restoreVersion(documentId: string, versionNumber: number) {
    try {
      // Get the version
      const { data: version, error: versionError } = await supabase
        .from('document_versions')
        .select('*')
        .eq('document_id', documentId)
        .eq('version_number', versionNumber)
        .single();

      if (versionError) throw versionError;

      // Update document with version content
      const { data, error } = await this.updateDocument(
        documentId,
        {
          content: version.content,
          frontmatter: version.frontmatter,
        },
        `Restored to version ${versionNumber}`
      );

      if (error) throw error;

      // Log activity
      await this.logActivity(documentId, 'restored', {
        version_number: versionNumber,
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Error restoring version:', error);
      return { data: null, error };
    }
  }

  // =====================================================
  // COLLABORATORS
  // =====================================================

  /**
   * Obtener colaboradores de un documento
   */
  async getCollaborators(documentId: string) {
    try {
      const { data, error } = await supabase
        .from('document_collaborators')
        .select('*, user:profiles!user_id(id, email, full_name, avatar_url)')
        .eq('document_id', documentId)
        .order('invited_at', { ascending: false });

      if (error) throw error;
      return { data: data as DocumentCollaborator[], error: null };
    } catch (error: any) {
      console.error('Error fetching collaborators:', error);
      return { data: null, error };
    }
  }

  /**
   * Invitar colaborador
   */
  async inviteCollaborator(
    documentId: string,
    userEmail: string,
    role: CollaboratorRole
  ) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Find user by email
      const { data: invitedUser, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userEmail)
        .single();

      if (userError) throw new Error('User not found');

      const { data, error } = await supabase
        .from('document_collaborators')
        .insert({
          document_id: documentId,
          user_id: invitedUser.id,
          role,
          invited_by: user.user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Update collaborators count
      await supabase.rpc('increment', {
        table_name: 'documents',
        id: documentId,
        column_name: 'collaborators_count',
      });

      // Log activity
      await this.logActivity(documentId, 'shared', {
        invited_user: userEmail,
        role,
      });

      return { data: data as DocumentCollaborator, error: null };
    } catch (error: any) {
      console.error('Error inviting collaborator:', error);
      return { data: null, error };
    }
  }

  /**
   * Actualizar rol de colaborador
   */
  async updateCollaboratorRole(
    collaboratorId: string,
    role: CollaboratorRole
  ) {
    try {
      const { data, error } = await supabase
        .from('document_collaborators')
        .update({ role })
        .eq('id', collaboratorId)
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await this.logActivity(data.document_id, 'permission_changed', {
        collaborator_id: collaboratorId,
        new_role: role,
      });

      return { data: data as DocumentCollaborator, error: null };
    } catch (error: any) {
      console.error('Error updating collaborator:', error);
      return { data: null, error };
    }
  }

  /**
   * Remover colaborador
   */
  async removeCollaborator(collaboratorId: string) {
    try {
      const { error } = await supabase
        .from('document_collaborators')
        .delete()
        .eq('id', collaboratorId);

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Error removing collaborator:', error);
      return { error };
    }
  }

  // =====================================================
  // COMMENTS
  // =====================================================

  /**
   * Obtener comentarios de un documento
   */
  async getComments(documentId: string, includeResolved: boolean = false) {
    try {
      let query = supabase
        .from('document_comments')
        .select('*, author:profiles!author_id(id, email, full_name, avatar_url)')
        .eq('document_id', documentId)
        .is('parent_id', null)
        .order('created_at', { ascending: false });

      if (!includeResolved) {
        query = query.eq('thread_resolved', false);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch replies for each comment
      const commentsWithReplies = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: replies } = await supabase
            .from('document_comments')
            .select('*, author:profiles!author_id(id, email, full_name, avatar_url)')
            .eq('parent_id', comment.id)
            .order('created_at', { ascending: true });

          return { ...comment, replies: replies || [] };
        })
      );

      return { data: commentsWithReplies as DocumentComment[], error: null };
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      return { data: null, error };
    }
  }

  /**
   * Crear comentario
   */
  async createComment(comment: {
    document_id: string;
    content: string;
    anchor_type?: CommentAnchorType;
    anchor_start?: number;
    anchor_end?: number;
    anchor_text?: string;
    parent_id?: string;
  }) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('document_comments')
        .insert({
          ...comment,
          author_id: user.user.id,
        })
        .select('*, author:profiles!author_id(id, email, full_name, avatar_url)')
        .single();

      if (error) throw error;

      // Log activity
      await this.logActivity(comment.document_id, 'commented');

      return { data: data as DocumentComment, error: null };
    } catch (error: any) {
      console.error('Error creating comment:', error);
      return { data: null, error };
    }
  }

  /**
   * Resolver/reabrir hilo de comentarios
   */
  async toggleCommentResolution(commentId: string, resolved: boolean) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('document_comments')
        .update({
          thread_resolved: resolved,
          resolved_by: resolved ? user.user.id : null,
          resolved_at: resolved ? new Date().toISOString() : null,
        })
        .eq('id', commentId)
        .select()
        .single();

      if (error) throw error;
      return { data: data as DocumentComment, error: null };
    } catch (error: any) {
      console.error('Error toggling comment resolution:', error);
      return { data: null, error };
    }
  }

  /**
   * Eliminar comentario
   */
  async deleteComment(commentId: string) {
    try {
      const { error } = await supabase
        .from('document_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      return { error };
    }
  }

  // =====================================================
  // PRESENCE (Real-time)
  // =====================================================

  /**
   * Obtener usuarios presentes en un documento
   */
  async getPresence(documentId: string) {
    try {
      const { data, error } = await supabase
        .from('document_presence')
        .select('*, user:profiles!user_id(id, email, full_name, avatar_url)')
        .eq('document_id', documentId)
        .gt('last_seen_at', new Date(Date.now() - 2 * 60 * 1000).toISOString()) // Last 2 minutes
        .order('last_seen_at', { ascending: false });

      if (error) throw error;
      return { data: data as DocumentPresence[], error: null };
    } catch (error: any) {
      console.error('Error fetching presence:', error);
      return { data: null, error };
    }
  }

  /**
   * Actualizar presencia del usuario
   */
  async updatePresence(
    documentId: string,
    status: PresenceStatus,
    cursorPosition?: { line: number; column: number; selection?: { start: number; end: number } }
  ) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const connectionId = `${user.user.id}-${Date.now()}`;

      const { data, error } = await supabase
        .from('document_presence')
        .upsert({
          document_id: documentId,
          user_id: user.user.id,
          status,
          cursor_position: cursorPosition || null,
          connection_id: connectionId,
          last_seen_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Start heartbeat if not already running
      if (!this.presenceHeartbeat) {
        this.startPresenceHeartbeat(documentId, connectionId);
      }

      return { data: data as DocumentPresence, error: null };
    } catch (error: any) {
      console.error('Error updating presence:', error);
      return { data: null, error };
    }
  }

  /**
   * Heartbeat para mantener presencia activa
   */
  private startPresenceHeartbeat(documentId: string, connectionId: string) {
    this.presenceHeartbeat = setInterval(async () => {
      try {
        await supabase
          .from('document_presence')
          .update({ last_seen_at: new Date().toISOString() })
          .eq('connection_id', connectionId);
      } catch (error) {
        console.error('Presence heartbeat error:', error);
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Limpiar presencia al salir
   */
  async cleanupPresence(documentId: string) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      await supabase
        .from('document_presence')
        .delete()
        .eq('document_id', documentId)
        .eq('user_id', user.user.id);

      // Stop heartbeat
      if (this.presenceHeartbeat) {
        clearInterval(this.presenceHeartbeat);
        this.presenceHeartbeat = null;
      }
    } catch (error) {
      console.error('Error cleaning up presence:', error);
    }
  }

  // =====================================================
  // ACTIVITIES
  // =====================================================

  /**
   * Obtener actividades recientes
   */
  async getActivities(documentId: string, limit?: number) {
    try {
      let query = supabase
        .from('document_activities')
        .select('*, user:profiles!user_id(id, email, full_name, avatar_url)')
        .eq('document_id', documentId)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data: data as DocumentActivity[], error: null };
    } catch (error: any) {
      console.error('Error fetching activities:', error);
      return { data: null, error };
    }
  }

  /**
   * Log activity
   */
  private async logActivity(
    documentId: string,
    activityType: string,
    metadata: Record<string, any> = {}
  ) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      await supabase.from('document_activities').insert({
        document_id: documentId,
        user_id: user.user.id,
        activity_type: activityType,
        metadata,
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  // =====================================================
  // REALTIME SUBSCRIPTIONS
  // =====================================================

  /**
   * Suscribirse a cambios en tiempo real
   */
  subscribeToDocument(
    documentId: string,
    callbacks: {
      onDocumentUpdate?: (document: Document) => void;
      onCommentAdded?: (comment: DocumentComment) => void;
      onPresenceUpdate?: (presence: DocumentPresence[]) => void;
      onActivityAdded?: (activity: DocumentActivity) => void;
    }
  ): RealtimeChannel {
    const channel = supabase.channel(`document:${documentId}`);

    // Subscribe to document changes
    if (callbacks.onDocumentUpdate) {
      channel.on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'documents',
          filter: `id=eq.${documentId}`,
        },
        (payload) => {
          callbacks.onDocumentUpdate?.(payload.new as Document);
        }
      );
    }

    // Subscribe to comments
    if (callbacks.onCommentAdded) {
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'document_comments',
          filter: `document_id=eq.${documentId}`,
        },
        (payload) => {
          callbacks.onCommentAdded?.(payload.new as DocumentComment);
        }
      );
    }

    // Subscribe to presence
    if (callbacks.onPresenceUpdate) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'document_presence',
          filter: `document_id=eq.${documentId}`,
        },
        async () => {
          // Fetch updated presence
          const { data } = await this.getPresence(documentId);
          if (data) callbacks.onPresenceUpdate?.(data);
        }
      );
    }

    // Subscribe to activities
    if (callbacks.onActivityAdded) {
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'document_activities',
          filter: `document_id=eq.${documentId}`,
        },
        (payload) => {
          callbacks.onActivityAdded?.(payload.new as DocumentActivity);
        }
      );
    }

    channel.subscribe();
    this.activeChannels.set(documentId, channel);

    return channel;
  }

  /**
   * Desuscribirse de un documento
   */
  unsubscribeFromDocument(documentId: string) {
    const channel = this.activeChannels.get(documentId);
    if (channel) {
      supabase.removeChannel(channel);
      this.activeChannels.delete(documentId);
    }
  }

  /**
   * Limpiar todas las suscripciones
   */
  cleanup() {
    this.activeChannels.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    this.activeChannels.clear();

    if (this.presenceHeartbeat) {
      clearInterval(this.presenceHeartbeat);
      this.presenceHeartbeat = null;
    }
  }
}

// Export singleton instance
export const collaborationService = new CollaborationService();

// Export helper functions
export const collaborationHelpers = {
  /**
   * Calculate diff between two text strings
   */
  calculateDiff(oldText: string, newText: string): {
    diff: string;
    summary: {
      lines_added: number;
      lines_removed: number;
      chars_changed: number;
    };
  } {
    const oldLines = oldText.split('\n');
    const newLines = newText.split('\n');

    let linesAdded = 0;
    let linesRemoved = 0;
    let charsChanged = Math.abs(newText.length - oldText.length);

    // Simple diff calculation
    const maxLength = Math.max(oldLines.length, newLines.length);
    for (let i = 0; i < maxLength; i++) {
      if (i >= oldLines.length) {
        linesAdded++;
      } else if (i >= newLines.length) {
        linesRemoved++;
      } else if (oldLines[i] !== newLines[i]) {
        if (oldLines[i].length < newLines[i].length) {
          linesAdded++;
        } else {
          linesRemoved++;
        }
      }
    }

    return {
      diff: `Old length: ${oldText.length}, New length: ${newText.length}`,
      summary: {
        lines_added: linesAdded,
        lines_removed: linesRemoved,
        chars_changed: charsChanged,
      },
    };
  },

  /**
   * Generate shareable link token
   */
  generateShareToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  },

  /**
   * Format activity description
   */
  formatActivity(activity: DocumentActivity): string {
    const userName = activity.user?.full_name || activity.user?.email || 'Someone';
    
    switch (activity.activity_type) {
      case 'created':
        return `${userName} created this document`;
      case 'edited':
        return `${userName} edited this document`;
      case 'commented':
        return `${userName} added a comment`;
      case 'shared':
        return `${userName} shared this document with ${activity.metadata.invited_user}`;
      case 'version_created':
        return `${userName} created version ${activity.metadata.version_number}`;
      case 'restored':
        return `${userName} restored version ${activity.metadata.version_number}`;
      default:
        return activity.description || `${userName} performed an action`;
    }
  },

  /**
   * Get color for user cursor
   */
  getUserColor(userId: string): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
      '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
    ];
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  },
};
