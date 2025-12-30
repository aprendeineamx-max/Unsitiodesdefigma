/**
 * COLLABORATIVE EDITOR - EDITOR CON COLABORACIÓN EN TIEMPO REAL
 * Editor de documentos Markdown con todas las funcionalidades colaborativas
 * Compatible con: Google Docs, Notion, Confluence
 * 
 * CARACTERÍSTICAS:
 * - Edición colaborativa en tiempo real
 * - Cursores de usuarios visibles
 * - Comentarios inline
 * - Historial de versiones
 * - Gestión de permisos
 * - Activity feed
 * - Auto-guardado inteligente
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Save, Users, MessageSquare, Clock, Eye, Edit3, ChevronDown,
  User, Check, X, MoreVertical, GitBranch, Activity, Share2,
  Download, FileText, AlertCircle, Loader2, Send, Reply, Trash2
} from 'lucide-react';
import { MarkdownViewer } from '../MarkdownViewer';
import { useCollaboration } from '../../hooks/useCollaboration';
import { collaborationHelpers } from '../../services/collaborationService';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import type { CollaboratorRole, PresenceStatus } from '../../services/collaborationService';

// =====================================================
// TYPES
// =====================================================

type EditorView = 'split' | 'edit' | 'preview';
type SidebarTab = 'comments' | 'versions' | 'activity' | 'collaborators';

interface CollaborativeEditorProps {
  documentId: string;
  onClose?: () => void;
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function CollaborativeEditor({ documentId, onClose }: CollaborativeEditorProps) {
  // Collaboration hook
  const {
    document,
    comments,
    presence,
    activities,
    versions,
    collaborators,
    loading,
    error,
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
  } = useCollaboration({ documentId, enableRealtime: true, enablePresence: true });

  // Editor state
  const [content, setContent] = useState('');
  const [view, setView] = useState<EditorView>('split');
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('comments');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Comment state
  const [newComment, setNewComment] = useState('');
  const [selectedText, setSelectedText] = useState<{
    start: number;
    end: number;
    text: string;
  } | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  // Collaborator state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<CollaboratorRole>('viewer');
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Initialize content when document loads
   */
  useEffect(() => {
    if (document) {
      setContent(document.content);
      setLastSaved(new Date(document.updated_at));
    }
  }, [document]);

  /**
   * Handle content change
   */
  const handleContentChange = useCallback((value: string) => {
    setContent(value);
    setHasUnsavedChanges(true);

    // Update presence to editing
    updatePresence('editing');

    // Auto-save after 3 seconds of inactivity
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      handleSave(value);
    }, 3000);
  }, [updatePresence]);

  /**
   * Handle cursor/selection change
   */
  const handleCursorChange = useCallback((e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const lines = content.substring(0, textarea.selectionStart).split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length;

    updateCursor(line, column, {
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
    });
  }, [content, updateCursor]);

  /**
   * Save document
   */
  const handleSave = useCallback(async (contentToSave?: string) => {
    try {
      setIsSaving(true);
      await updateDocument({
        content: contentToSave || content,
      });
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      toast.success('Document saved');
    } catch (err) {
      console.error('Error saving document:', err);
      toast.error('Failed to save document');
    } finally {
      setIsSaving(false);
    }
  }, [content, updateDocument]);

  /**
   * Add comment
   */
  const handleAddComment = useCallback(async () => {
    if (!newComment.trim()) return;

    try {
      await addComment({
        content: newComment,
        anchor_start: selectedText?.start,
        anchor_end: selectedText?.end,
        anchor_text: selectedText?.text,
        parent_id: replyingTo || undefined,
      });

      setNewComment('');
      setSelectedText(null);
      setReplyingTo(null);
      toast.success('Comment added');
    } catch (err) {
      console.error('Error adding comment:', err);
      toast.error('Failed to add comment');
    }
  }, [newComment, selectedText, replyingTo, addComment]);

  /**
   * Invite collaborator
   */
  const handleInviteCollaborator = useCallback(async () => {
    if (!inviteEmail.trim()) return;

    try {
      await inviteCollaborator(inviteEmail, inviteRole);
      setInviteEmail('');
      setShowInviteDialog(false);
      toast.success('Collaborator invited');
    } catch (err: any) {
      console.error('Error inviting collaborator:', err);
      toast.error(err.message || 'Failed to invite collaborator');
    }
  }, [inviteEmail, inviteRole, inviteCollaborator]);

  /**
   * Handle text selection for commenting
   */
  const handleTextSelection = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      const text = content.substring(start, end);
      setSelectedText({ start, end, text });
      setSidebarTab('comments');
    }
  }, [content]);

  /**
   * Keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  /**
   * Cleanup auto-save timer
   */
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-900 dark:text-gray-100 mb-2">Failed to load document</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            {error?.message || 'Document not found'}
          </p>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h1 className="text-xl text-gray-900 dark:text-gray-100">
                  {document.title}
                </h1>
              </div>

              {/* Status badges */}
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded">
                  v{document.version}
                </span>
                {hasUnsavedChanges && (
                  <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs rounded">
                    Unsaved
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Last saved */}
              {lastSaved && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}

              {/* Active users */}
              <div className="flex items-center -space-x-2">
                {presence.map((p) => (
                  <div
                    key={p.id}
                    className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs text-white"
                    style={{
                      backgroundColor: collaborationHelpers.getUserColor(p.user_id),
                    }}
                    title={p.user?.full_name || p.user?.email}
                  >
                    {(p.user?.full_name || p.user?.email || '?')[0].toUpperCase()}
                  </div>
                ))}
              </div>

              {/* View mode */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setView('edit')}
                  className={`px-3 py-1 rounded text-sm ${
                    view === 'edit'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView('split')}
                  className={`px-3 py-1 rounded text-sm ${
                    view === 'split'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Split
                </button>
                <button
                  onClick={() => setView('preview')}
                  className={`px-3 py-1 rounded text-sm ${
                    view === 'preview'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              {/* Save button */}
              <button
                onClick={() => handleSave()}
                disabled={isSaving || !hasUnsavedChanges}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save</span>
              </button>

              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Edit view */}
          {(view === 'edit' || view === 'split') && (
            <div className={view === 'split' ? 'w-1/2 border-r border-gray-200 dark:border-gray-700' : 'w-full'}>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                onSelect={handleCursorChange}
                onMouseUp={handleTextSelection}
                className="w-full h-full p-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none focus:outline-none font-mono"
                placeholder="Start writing..."
              />
            </div>
          )}

          {/* Preview view */}
          {(view === 'preview' || view === 'split') && (
            <div className={view === 'split' ? 'w-1/2 overflow-auto' : 'w-full overflow-auto'}>
              <div className="p-6">
                <MarkdownViewer
                  content={content}
                  enableSearch={false}
                  enableTOC={false}
                  enableExport={false}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Sidebar tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setSidebarTab('comments')}
            className={`flex-1 px-4 py-3 text-sm ${
              sidebarTab === 'comments'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <MessageSquare className="w-4 h-4 mx-auto mb-1" />
            <span>Comments ({comments.length})</span>
          </button>
          <button
            onClick={() => setSidebarTab('versions')}
            className={`flex-1 px-4 py-3 text-sm ${
              sidebarTab === 'versions'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <GitBranch className="w-4 h-4 mx-auto mb-1" />
            <span>Versions ({versions.length})</span>
          </button>
          <button
            onClick={() => setSidebarTab('activity')}
            className={`flex-1 px-4 py-3 text-sm ${
              sidebarTab === 'activity'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <Activity className="w-4 h-4 mx-auto mb-1" />
            <span>Activity</span>
          </button>
          <button
            onClick={() => setSidebarTab('collaborators')}
            className={`flex-1 px-4 py-3 text-sm ${
              sidebarTab === 'collaborators'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <Users className="w-4 h-4 mx-auto mb-1" />
            <span>People ({collaborators.length})</span>
          </button>
        </div>

        {/* Sidebar content */}
        <div className="flex-1 overflow-auto p-4">
          {/* Comments tab */}
          {sidebarTab === 'comments' && (
            <div className="space-y-4">
              {/* Add comment */}
              <div className="space-y-2">
                {selectedText && (
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded text-sm">
                    <p className="text-blue-700 dark:text-blue-300 mb-1">
                      Selected text:
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 italic">
                      "{selectedText.text}"
                    </p>
                  </div>
                )}
                {replyingTo && (
                  <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Replying to comment
                    </span>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                  rows={3}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  <span>Comment</span>
                </button>
              </div>

              {/* Comments list */}
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white">
                          {(comment.author?.full_name || comment.author?.email || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            {comment.author?.full_name || comment.author?.email}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(comment.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {comment.anchor_text && (
                      <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded text-xs italic text-gray-600 dark:text-gray-400">
                        "{comment.anchor_text}"
                      </div>
                    )}

                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {comment.content}
                    </p>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setReplyingTo(comment.id)}
                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                      >
                        <Reply className="w-3 h-3" />
                        <span>Reply</span>
                      </button>
                      {!comment.thread_resolved && (
                        <button
                          onClick={() => toggleCommentResolution(comment.id, true)}
                          className="text-xs text-green-600 hover:text-green-700 flex items-center space-x-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Resolve</span>
                        </button>
                      )}
                    </div>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-2 ml-4 space-y-2">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="p-2 bg-white dark:bg-gray-700 rounded">
                            <div className="flex items-start justify-between mb-1">
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {reply.author?.full_name || reply.author?.email}
                              </p>
                              <button
                                onClick={() => deleteComment(reply.id)}
                                className="text-gray-400 hover:text-red-600"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {reply.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {comments.length === 0 && (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No comments yet
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Versions tab */}
          {sidebarTab === 'versions' && (
            <div className="space-y-2">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded">
                        v{version.version_number}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(version.created_at).toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={() => restoreVersion(version.version_number)}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Restore
                    </button>
                  </div>
                  {version.commit_message && (
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {version.commit_message}
                    </p>
                  )}
                  {version.changes_summary && (
                    <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="text-green-600">
                        +{version.changes_summary.lines_added}
                      </span>
                      <span className="text-red-600">
                        -{version.changes_summary.lines_removed}
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {versions.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No versions yet
                </p>
              )}
            </div>
          )}

          {/* Activity tab */}
          {sidebarTab === 'activity' && (
            <div className="space-y-2">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="p-3 border-l-2 border-blue-600 bg-gray-50 dark:bg-gray-700/50 rounded"
                >
                  <p className="text-sm text-gray-900 dark:text-gray-100 mb-1">
                    {collaborationHelpers.formatActivity(activity)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(activity.created_at).toLocaleString()}
                  </p>
                </div>
              ))}

              {activities.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No activity yet
                </p>
              )}
            </div>
          )}

          {/* Collaborators tab */}
          {sidebarTab === 'collaborators' && (
            <div className="space-y-4">
              <button
                onClick={() => setShowInviteDialog(true)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Share2 className="w-4 h-4 inline-block mr-2" />
                Invite Collaborator
              </button>

              {showInviteDialog && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as CollaboratorRole)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="commenter">Commenter</option>
                    <option value="editor">Editor</option>
                  </select>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleInviteCollaborator}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Invite
                    </button>
                    <button
                      onClick={() => setShowInviteDialog(false)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {collaborators.map((collab) => (
                  <div
                    key={collab.id}
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white">
                        {(collab.user?.full_name || collab.user?.email || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {collab.user?.full_name || collab.user?.email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {collab.role}
                        </p>
                      </div>
                    </div>
                    {collab.role !== 'owner' && (
                      <button
                        onClick={() => removeCollaborator(collab.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

                {collaborators.length === 0 && (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No collaborators yet
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
