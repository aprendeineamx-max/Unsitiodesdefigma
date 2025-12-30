/**
 * USE COLLABORATION HOOK
 * Hook para gestionar colaboración en documentos
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  collaborationService,
  type Document,
  type DocumentComment,
  type DocumentPresence,
  type DocumentActivity,
  type DocumentVersion,
  type DocumentCollaborator,
  type CollaboratorRole,
  type PresenceStatus,
} from '../services/collaborationService';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface UseCollaborationOptions {
  documentId: string;
  enableRealtime?: boolean;
  enablePresence?: boolean;
}

export function useCollaboration(options: UseCollaborationOptions) {
  const { documentId, enableRealtime = true, enablePresence = true } = options;

  // State
  const [document, setDocument] = useState<Document | null>(null);
  const [comments, setComments] = useState<DocumentComment[]>([]);
  const [presence, setPresence] = useState<DocumentPresence[]>([]);
  const [activities, setActivities] = useState<DocumentActivity[]>([]);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [collaborators, setCollaborators] = useState<DocumentCollaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  // Refs
  const channelRef = useRef<RealtimeChannel | null>(null);
  const cursorUpdateTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Load document data
   */
  const loadDocument = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: docData, error: docError } = await collaborationService.getDocument(documentId);
      if (docError) throw docError;
      setDocument(docData);

      // Load related data in parallel
      await Promise.all([
        loadComments(),
        loadActivities(),
        loadVersions(),
        loadCollaborators(),
        enablePresence && loadPresence(),
      ]);
    } catch (err) {
      console.error('Error loading document:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [documentId, enablePresence]);

  /**
   * Load comments
   */
  const loadComments = useCallback(async () => {
    const { data, error: err } = await collaborationService.getComments(documentId);
    if (err) {
      console.error('Error loading comments:', err);
    } else {
      setComments(data || []);
    }
  }, [documentId]);

  /**
   * Load presence
   */
  const loadPresence = useCallback(async () => {
    const { data, error: err } = await collaborationService.getPresence(documentId);
    if (err) {
      console.error('Error loading presence:', err);
    } else {
      setPresence(data || []);
    }
  }, [documentId]);

  /**
   * Load activities
   */
  const loadActivities = useCallback(async (limit = 20) => {
    const { data, error: err } = await collaborationService.getActivities(documentId, limit);
    if (err) {
      console.error('Error loading activities:', err);
    } else {
      setActivities(data || []);
    }
  }, [documentId]);

  /**
   * Load versions
   */
  const loadVersions = useCallback(async (limit = 10) => {
    const { data, error: err } = await collaborationService.getVersions(documentId, limit);
    if (err) {
      console.error('Error loading versions:', err);
    } else {
      setVersions(data || []);
    }
  }, [documentId]);

  /**
   * Load collaborators
   */
  const loadCollaborators = useCallback(async () => {
    const { data, error: err } = await collaborationService.getCollaborators(documentId);
    if (err) {
      console.error('Error loading collaborators:', err);
    } else {
      setCollaborators(data || []);
    }
  }, [documentId]);

  /**
   * Update document
   */
  const updateDocument = useCallback(
    async (updates: Partial<Document>, commitMessage?: string) => {
      const { data, error: err } = await collaborationService.updateDocument(
        documentId,
        updates,
        commitMessage
      );
      if (err) {
        console.error('Error updating document:', err);
        throw err;
      }
      setDocument(data);
      return data;
    },
    [documentId]
  );

  /**
   * Add comment
   */
  const addComment = useCallback(
    async (comment: {
      content: string;
      anchor_start?: number;
      anchor_end?: number;
      anchor_text?: string;
      parent_id?: string;
    }) => {
      const { data, error: err } = await collaborationService.createComment({
        document_id: documentId,
        ...comment,
      });
      if (err) {
        console.error('Error adding comment:', err);
        throw err;
      }
      // Refresh comments
      await loadComments();
      return data;
    },
    [documentId, loadComments]
  );

  /**
   * Delete comment
   */
  const deleteComment = useCallback(
    async (commentId: string) => {
      const { error: err } = await collaborationService.deleteComment(commentId);
      if (err) {
        console.error('Error deleting comment:', err);
        throw err;
      }
      // Refresh comments
      await loadComments();
    },
    [loadComments]
  );

  /**
   * Toggle comment resolution
   */
  const toggleCommentResolution = useCallback(
    async (commentId: string, resolved: boolean) => {
      const { data, error: err } = await collaborationService.toggleCommentResolution(
        commentId,
        resolved
      );
      if (err) {
        console.error('Error toggling resolution:', err);
        throw err;
      }
      // Refresh comments
      await loadComments();
      return data;
    },
    [loadComments]
  );

  /**
   * Update presence
   */
  const updatePresence = useCallback(
    async (
      status: PresenceStatus,
      cursorPosition?: { line: number; column: number; selection?: { start: number; end: number } }
    ) => {
      if (!enablePresence) return;

      const { data, error: err } = await collaborationService.updatePresence(
        documentId,
        status,
        cursorPosition
      );
      if (err) {
        console.error('Error updating presence:', err);
      }
      return data;
    },
    [documentId, enablePresence]
  );

  /**
   * Update cursor position (debounced)
   */
  const updateCursor = useCallback(
    (line: number, column: number, selection?: { start: number; end: number }) => {
      if (cursorUpdateTimerRef.current) {
        clearTimeout(cursorUpdateTimerRef.current);
      }

      cursorUpdateTimerRef.current = setTimeout(() => {
        updatePresence('editing', { line, column, selection });
      }, 100); // Debounce 100ms
    },
    [updatePresence]
  );

  /**
   * Invite collaborator
   */
  const inviteCollaborator = useCallback(
    async (userEmail: string, role: CollaboratorRole) => {
      const { data, error: err } = await collaborationService.inviteCollaborator(
        documentId,
        userEmail,
        role
      );
      if (err) {
        console.error('Error inviting collaborator:', err);
        throw err;
      }
      // Refresh collaborators
      await loadCollaborators();
      return data;
    },
    [documentId, loadCollaborators]
  );

  /**
   * Update collaborator role
   */
  const updateCollaboratorRole = useCallback(
    async (collaboratorId: string, role: CollaboratorRole) => {
      const { data, error: err } = await collaborationService.updateCollaboratorRole(
        collaboratorId,
        role
      );
      if (err) {
        console.error('Error updating role:', err);
        throw err;
      }
      // Refresh collaborators
      await loadCollaborators();
      return data;
    },
    [loadCollaborators]
  );

  /**
   * Remove collaborator
   */
  const removeCollaborator = useCallback(
    async (collaboratorId: string) => {
      const { error: err } = await collaborationService.removeCollaborator(collaboratorId);
      if (err) {
        console.error('Error removing collaborator:', err);
        throw err;
      }
      // Refresh collaborators
      await loadCollaborators();
    },
    [loadCollaborators]
  );

  /**
   * Restore version
   */
  const restoreVersion = useCallback(
    async (versionNumber: number) => {
      const { data, error: err } = await collaborationService.restoreVersion(
        documentId,
        versionNumber
      );
      if (err) {
        console.error('Error restoring version:', err);
        throw err;
      }
      // Refresh document and versions
      await loadDocument();
      return data;
    },
    [documentId, loadDocument]
  );

  /**
   * Setup realtime subscriptions
   */
  useEffect(() => {
    if (!enableRealtime || !documentId) return;

    const channel = collaborationService.subscribeToDocument(documentId, {
      onDocumentUpdate: (updatedDoc) => {
        setDocument(updatedDoc);
      },
      onCommentAdded: () => {
        loadComments();
      },
      onPresenceUpdate: (updatedPresence) => {
        setPresence(updatedPresence);
      },
      onActivityAdded: (newActivity) => {
        setActivities((prev) => [newActivity, ...prev]);
      },
    });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        collaborationService.unsubscribeFromDocument(documentId);
        channelRef.current = null;
      }
    };
  }, [documentId, enableRealtime, loadComments]);

  /**
   * Load initial data
   */
  useEffect(() => {
    if (documentId) {
      loadDocument();
    }
  }, [documentId, loadDocument]);

  /**
   * Update presence on mount and cleanup on unmount
   */
  useEffect(() => {
    if (!enablePresence || !documentId) return;

    // Join document
    updatePresence('viewing');

    // Cleanup on unmount
    return () => {
      collaborationService.cleanupPresence(documentId);
    };
  }, [documentId, enablePresence, updatePresence]);

  /**
   * Cleanup cursor timer
   */
  useEffect(() => {
    return () => {
      if (cursorUpdateTimerRef.current) {
        clearTimeout(cursorUpdateTimerRef.current);
      }
    };
  }, []);

  return {
    // State
    document,
    comments,
    presence,
    activities,
    versions,
    collaborators,
    loading,
    error,

    // Actions
    updateDocument,
    addComment,
    deleteComment,
    toggleCommentResolution,
    updatePresence,
    updateCursor,
    inviteCollaborator,
    updateCollaboratorRole,
    removeCollaborator,
    restoreVersion,

    // Refresh functions
    refresh: loadDocument,
    refreshComments: loadComments,
    refreshPresence: loadPresence,
    refreshActivities: loadActivities,
    refreshVersions: loadVersions,
    refreshCollaborators: loadCollaborators,
  };
}
