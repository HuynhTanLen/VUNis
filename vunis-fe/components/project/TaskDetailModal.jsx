import { useState, useEffect } from 'react';
import { X, FileText, CheckSquare, MessageSquare, Paperclip, DollarSign, Loader2, Plus, Trash2, Send, CornerDownRight, Reply, UserCheck, History, BarChart3, ChevronDown, Link2 } from 'lucide-react';
import { getCommentsByTask, createComment, deleteComment } from '../../services/commentService';
import { getSocket, joinTaskRoom, leaveTaskRoom } from '../../services/socketClient';
import { getTaskAssignmentsHistory, updateTask, addSubtask, toggleSubtask, removeSubtask } from '../../services/taskService';
import { getTaskAttachments, addAttachment, deleteAttachment } from '../../services/attachmentService';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Toast from '../ui/Toast';
import GanttChart from './GanttChart';

export default function TaskDetailModal({ isOpen, task, onClose, userList = [], onTaskUpdated, isPM = false, projectId }) {
  const [activeTab, setActiveTab] = useState('description');
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  // Subtasks
  const [subtasks, setSubtasks] = useState(task?.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [subtaskBusy, setSubtaskBusy] = useState(false);

  // Attachments
  const [attachments, setAttachments] = useState([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [submittingAttachment, setSubmittingAttachment] = useState(false);

  // TaskAssignment History
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  // Handover state
  const [handoverModal, setHandoverModal] = useState({ open: false, newAssigneeId: '' });
  const [handoverLoading, setHandoverLoading] = useState(false);

  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (isOpen && task) {
      setSubtasks(task?.subtasks || []);
      if (activeTab === 'comments') loadComments();
      if (activeTab === 'history') loadAssignments();
      if (activeTab === 'attachments') loadAttachments();
    }
  }, [isOpen, task, activeTab]);

  // Real-time Socket.io join room & listen for new_comment
  useEffect(() => {
    if (isOpen && task?.id) {
      joinTaskRoom(task.id);
      const socket = getSocket();
      if (socket) {
        const handleNewComment = (comment) => {
          setComments(prev => {
            if (prev.some(c => c.id === comment.id)) return prev;
            return [...prev, comment];
          });
        };
        socket.on('new_comment', handleNewComment);
        return () => {
          socket.off('new_comment', handleNewComment);
          leaveTaskRoom(task.id);
        };
      }
    }
  }, [isOpen, task?.id]);

  const loadComments = async () => {
    if (!task?.id) return;
    try {
      setLoadingComments(true);
      const data = await getCommentsByTask(task.id);
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading comments:', err);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const loadAssignments = async () => {
    if (!task?.id) return;
    try {
      setLoadingAssignments(true);
      const data = await getTaskAssignmentsHistory(task.id);
      setAssignments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading history:', err);
      setAssignments([]);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !task?.id) return;
    try {
      setSubmittingComment(true);
      await createComment(task.id, newComment.trim(), replyTo?.id || null);
      setNewComment('');
      setReplyTo(null);
      loadComments();
    } catch (err) {
      console.error('Error adding comment:', err);
      showToast(err.response?.data?.message || 'Failed to add comment.', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      loadComments();
    } catch (err) {
      console.error('Error deleting comment:', err);
      showToast(err.response?.data?.message || 'Failed to delete comment.', 'error');
    }
  };

  const getCommentAuthorName = (c) => {
    return (typeof c.author === 'object' ? c.author?.name : c.author) || c.user?.name || 'Member';
  };

  const loadAttachments = async () => {
    if (!task?.id) return;
    try {
      setLoadingAttachments(true);
      const data = await getTaskAttachments(task.id);
      setAttachments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading attachments:', err);
      setAttachments([]);
    } finally {
      setLoadingAttachments(false);
    }
  };

  const handleAddAttachment = async (e) => {
    e.preventDefault();
    if (!attachmentUrl.trim() || !task?.id) return;
    const originalName = attachmentName.trim() || attachmentUrl.trim().split('/').pop() || 'file';
    try {
      setSubmittingAttachment(true);
      await addAttachment({
        taskId: task.id,
        filename: originalName,
        originalName,
        url: attachmentUrl.trim(),
      });
      setAttachmentUrl('');
      setAttachmentName('');
      loadAttachments();
      showToast('Attachment added.');
    } catch (err) {
      console.error('Error adding attachment:', err);
      showToast(err.response?.data?.message || 'Failed to add attachment.', 'error');
    } finally {
      setSubmittingAttachment(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    try {
      await deleteAttachment(attachmentId);
      setAttachments(prev => prev.filter(a => a.id !== attachmentId));
    } catch (err) {
      console.error('Error deleting attachment:', err);
      showToast(err.response?.data?.message || 'Failed to delete attachment.', 'error');
    }
  };

  const handleToggleSubtask = async (subtaskId) => {
    if (!task?.id) return;
    const prevSubtasks = subtasks;
    setSubtasks(prev => prev.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s));
    try {
      setSubtaskBusy(true);
      const updatedTask = await toggleSubtask(task.id, subtaskId);
      setSubtasks(updatedTask?.subtasks || []);
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      console.error('Error toggling subtask:', err);
      setSubtasks(prevSubtasks);
      showToast(err.response?.data?.message || 'Failed to update subtask.', 'error');
    } finally {
      setSubtaskBusy(false);
    }
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || !task?.id) return;
    try {
      setSubtaskBusy(true);
      const updatedTask = await addSubtask(task.id, newSubtaskTitle.trim());
      setSubtasks(updatedTask?.subtasks || []);
      setNewSubtaskTitle('');
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      console.error('Error adding subtask:', err);
      showToast(err.response?.data?.message || 'Failed to add subtask.', 'error');
    } finally {
      setSubtaskBusy(false);
    }
  };

  const handleRemoveSubtask = async (subtaskId) => {
    if (!task?.id) return;
    try {
      setSubtaskBusy(true);
      const updatedTask = await removeSubtask(task.id, subtaskId);
      setSubtasks(updatedTask?.subtasks || []);
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      console.error('Error removing subtask:', err);
      showToast(err.response?.data?.message || 'Failed to remove subtask.', 'error');
    } finally {
      setSubtaskBusy(false);
    }
  };

  // Handover: Select new Assignee -> open confirmation modal
  const handleAssigneeChange = async (newAssigneeId) => {
    try {
      if (newAssigneeId === task.assigneeId) return;
      if (task.assigneeId) {
        setHandoverModal({ open: true, newAssigneeId });
      } else {
        await updateTask(task.id, { assigneeId: newAssigneeId, projectId });
        if (onTaskUpdated) onTaskUpdated();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to update assignee.', 'error');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setStatusLoading(true);
      await updateTask(task.id, { status: newStatus, projectId });
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to update status.', 'error');
    } finally {
      setStatusLoading(false);
    }
  };

  // Confirm handover: call PUT /tasks/:id to update assigneeId
  const handleConfirmHandover = async () => {
    try {
      setHandoverLoading(true);
      await updateTask(task.id, { assigneeId: handoverModal.newAssigneeId });
      setHandoverModal({ open: false, newAssigneeId: '' });
      // Reload assignment history
      await loadAssignments();
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      console.error('Error handing over task:', err);
      showToast(err.response?.data?.message || 'Failed to hand over task.', 'error');
    } finally {
      setHandoverLoading(false);
    }
  };

  if (!isOpen || !task) return null;

  const issueKey = task.key || `VU-${(task.id || '').toString().slice(-4).toUpperCase() || '101'}`;
  const priorityVariant = task.priority === 'HIGH' || task.priority === 'URGENT' ? 'danger' : task.priority === 'LOW' ? 'neutral' : 'warning';
  const statusVariant = task.status === 'DONE' ? 'success' : task.status === 'IN_PROGRESS' ? 'warning' : 'accent';

  const currentAssigneeId = task.assignee?.id || task.assignee || '';

  const tabs = [
    { id: 'description', label: 'Description', icon: FileText },
    { id: 'subtasks', label: `Subtask (${(subtasks || []).filter(s => s.done || s.completed).length}/${(subtasks || []).length})`, icon: CheckSquare },
    { id: 'comments', label: 'Comments', icon: MessageSquare },
    { id: 'attachments', label: 'Attachments', icon: Paperclip },
    { id: 'history', label: 'History', icon: History },
    { id: 'gantt', label: 'Gantt', icon: BarChart3 },
    // Cost tab - only for PM
    ...(isPM ? [{ id: 'cost', label: 'Cost', icon: DollarSign }] : []),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm">
      <div className="bg-surface rounded-lg border border-border shadow-xl max-w-5xl w-full flex flex-col h-[90vh] overflow-hidden">

        {/* HEADER */}
        <header className="px-6 py-4 border-b border-border flex items-start justify-between gap-4 bg-surface shrink-0">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[11px] font-bold text-sub hover:underline cursor-pointer">
                {issueKey}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-ink leading-snug">{task.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-sub hover:text-ink rounded-lg hover:bg-accent-soft transition-colors focus:outline-none focus:ring-2 focus:ring-accent/20 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* MAIN LEFT PANE */}
          <div className="flex-1 flex flex-col min-w-0 border-r border-border">
            {/* TAB NAVIGATION */}
            <nav className="flex px-6 pt-2 border-b border-border gap-4 overflow-x-auto shrink-0" aria-label="Task Detail Tabs">
              {tabs.map(t => {
                const Icon = t.icon;
                const isActive = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`flex items-center gap-1.5 py-2 text-xs font-semibold transition-colors border-b-2 whitespace-nowrap focus:outline-none ${
                      isActive
                        ? 'border-accent text-accent'
                        : 'border-transparent text-sub hover:text-ink'
                    }`}
                  >
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* TAB CONTENT BODY */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: DESCRIPTION + Handover */}
          {activeTab === 'description' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="label-field">Description</label>
                <div className="p-3.5 bg-bg border border-border rounded-lg text-xs text-ink leading-relaxed whitespace-pre-wrap min-h-[100px]">
                  {task.description || 'No description provided for this task.'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 bg-bg border border-border rounded-lg space-y-1">
                  <span className="text-[10px] font-bold text-sub uppercase tracking-wider">Role / Function</span>
                  <p className="text-xs font-semibold text-ink font-mono">{task.role || 'Developer'}</p>
                </div>
                <div className="p-3 bg-bg border border-border rounded-lg space-y-1">
                  <span className="text-[10px] font-bold text-sub uppercase tracking-wider">Due Date</span>
                  <p className="text-xs font-semibold text-ink font-mono">
                    {(task.dueDate || task.endDate) ? new Date(task.dueDate || task.endDate).toLocaleDateString('en-US') : 'Not set'}
                  </p>
                </div>
              </div>


            </div>
          )}

          {/* TAB: GANTT CHART */}
          {activeTab === 'gantt' && (
            <div className="space-y-4">
              {projectId ? (
                <div className="border border-border rounded-xl overflow-hidden bg-bg">
                  <GanttChart projectId={projectId} isPM={isPM} />
                </div>
              ) : (
                <p className="text-sm text-sub text-center py-10">Project info not found to display chart.</p>
              )}
            </div>
          )}

          {/* TAB 2: SUBTASKS */}
          {activeTab === 'subtasks' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Subtasks List</h4>
                <span className="text-xs text-sub font-mono">
                  {(subtasks || []).filter(s => s.done || s.completed).length} / {(subtasks || []).length} completed
                </span>
              </div>
              <div className="h-1.5 bg-bg rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${(subtasks || []).length > 0 ? ((subtasks || []).filter(s => s.done || s.completed).length / (subtasks || []).length) * 100 : 0}%` }}
                />
              </div>
              <div className="space-y-2">
                {(subtasks || []).map(st => (
                  <div key={st.id} className="flex items-center gap-3 p-2.5 bg-bg border border-border rounded-lg hover:bg-accent-soft/30 transition-colors">
                    <label className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={st.done || st.completed || false}
                        disabled={subtaskBusy}
                        onChange={() => handleToggleSubtask(st.id)}
                        className="rounded border-border text-accent focus:ring-accent/40 w-4 h-4 disabled:opacity-50"
                      />
                      <span className={`text-xs text-ink truncate ${(st.done || st.completed) ? 'line-through text-sub' : 'font-medium'}`}>
                        {st.title}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      disabled={subtaskBusy}
                      className="p-1 text-sub hover:text-danger rounded transition-colors disabled:opacity-50 shrink-0"
                      title="Remove subtask"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddSubtask} className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add new subtask..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  disabled={subtaskBusy}
                  className="input-field flex-1"
                />
                <Button type="submit" variant="secondary" icon={Plus} disabled={subtaskBusy}>Add</Button>
              </form>
            </div>
          )}

          {/* TAB 3: COMMENTS */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Discussions & Comments</h4>
              {loadingComments ? (
                <div className="py-8 text-center"><Loader2 className="w-5 h-5 animate-spin text-accent mx-auto" /></div>
              ) : comments.length === 0 ? (
                <div className="p-6 text-center text-xs text-sub bg-bg border border-dashed border-border rounded-lg">
                  No comments yet. Be the first to share your thoughts!
                </div>
              ) : (
                <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                  {(() => {
                    const map = {};
                    const rootComments = [];
                    comments.forEach(c => {
                      const cId = c.id;
                      map[cId] = { ...c, replies: Array.isArray(c.replies) ? [...c.replies] : [] };
                    });
                    comments.forEach(c => {
                      const cId = c.id;
                      if (c.parentId && map[c.parentId]) {
                        if (!map[c.parentId].replies.some(r => r.id === cId)) {
                          map[c.parentId].replies.push(map[cId]);
                        }
                      } else if (!c.parentId) {
                        if (!rootComments.some(r => r.id === cId)) {
                          rootComments.push(map[cId]);
                        }
                      }
                    });
                    return rootComments.map(c => {
                      const authorName = getCommentAuthorName(c);
                      const cId = c.id;
                      const replies = Array.isArray(c.replies) ? c.replies : [];
                      return (
                        <div key={cId} className="p-3 bg-bg border border-border rounded-lg space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-ink">{authorName}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-sub font-mono">
                                {c.createdAt ? new Date(c.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                              <button type="button" onClick={() => setReplyTo({ id: cId, authorName })}
                                className="text-xs text-accent hover:underline flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-accent-soft font-semibold transition-colors">
                                <Reply className="w-3 h-3" /> Reply
                              </button>
                              <button onClick={() => handleDeleteComment(cId)} className="text-sub hover:text-danger p-0.5">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-ink leading-relaxed">{c.content}</p>
                          {replies.length > 0 && (
                            <div className="pl-3 border-l-2 border-accent/20 ml-1 space-y-2 mt-2 pt-1">
                              {replies.map(r => {
                                const rAuthorName = getCommentAuthorName(r);
                                const rId = r.id;
                                return (
                                  <div key={rId} className="p-2 bg-surface border border-border/80 rounded-md space-y-1">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1 text-[11px]">
                                        <CornerDownRight className="w-3 h-3 text-accent shrink-0" />
                                        <span className="font-bold text-ink">{rAuthorName}</span>
                                        <span className="text-[10px] font-medium text-sub">replied to <strong className="text-accent">{authorName}</strong></span>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[9px] text-sub font-mono">
                                          {r.createdAt ? new Date(r.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                        <button onClick={() => handleDeleteComment(rId)} className="text-sub hover:text-danger p-0.5">
                                          <Trash2 className="w-2.5 h-2.5" />
                                        </button>
                                      </div>
                                    </div>
                                    <p className="text-[11px] text-ink leading-relaxed pl-4">{r.content}</p>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
              <div className="space-y-1.5 pt-2 border-t border-border">
                {replyTo && (
                  <div className="flex items-center justify-between px-2.5 py-1 bg-accent-soft border border-accent/20 rounded-md text-xs text-accent font-semibold">
                    <span className="flex items-center gap-1.5">
                      <CornerDownRight className="w-3.5 h-3.5 shrink-0" />
                      Replying to <strong className="font-bold">{replyTo.authorName}</strong>
                    </span>
                    <button type="button" onClick={() => setReplyTo(null)} className="text-sub hover:text-ink p-0.5 rounded">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    placeholder={replyTo ? `Write a reply to ${replyTo.authorName}...` : 'Write a comment...'}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={submittingComment}
                    className="input-field flex-1"
                  />
                  <Button type="submit" variant="primary" disabled={submittingComment} icon={Send}>
                    {replyTo ? 'Reply' : 'Send'}
                  </Button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: ATTACHMENTS */}
          {activeTab === 'attachments' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Linked Files</h4>

              {loadingAttachments ? (
                <div className="py-8 text-center"><Loader2 className="w-5 h-5 animate-spin text-accent mx-auto" /></div>
              ) : attachments.length === 0 ? (
                <div className="p-6 text-center text-xs text-sub bg-bg border border-dashed border-border rounded-lg">
                  No attachments linked yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {attachments.map(att => (
                    <div key={att.id} className="flex items-center justify-between gap-3 p-3 bg-bg border border-border rounded-lg">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Paperclip className="w-4 h-4 text-sub shrink-0" />
                        <div className="min-w-0">
                          <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-accent hover:underline truncate block">
                            {att.originalName || att.filename}
                          </a>
                          <p className="text-[10px] text-sub truncate">{att.uploader?.name ? `Added by ${att.uploader.name}` : att.url}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteAttachment(att.id)}
                        className="p-1 text-sub hover:text-danger rounded transition-colors shrink-0"
                        title="Remove attachment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleAddAttachment} className="space-y-2 pt-2 border-t border-border">
                <label className="label-field">Attach a link (file URL)</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link2 className="w-4 h-4 text-sub absolute left-3 top-2.5" />
                    <input
                      type="url"
                      placeholder="https://..."
                      value={attachmentUrl}
                      onChange={(e) => setAttachmentUrl(e.target.value)}
                      disabled={submittingAttachment}
                      className="input-field pl-9"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Display name (optional)"
                    value={attachmentName}
                    onChange={(e) => setAttachmentName(e.target.value)}
                    disabled={submittingAttachment}
                    className="input-field w-48"
                  />
                  <Button type="submit" variant="secondary" icon={Plus} disabled={submittingAttachment || !attachmentUrl.trim()}>
                    Add
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 5: HISTORY */}
          {activeTab === 'history' && (
            <section className="space-y-4" aria-labelledby="history-title">
              <h4 id="history-title" className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-accent" />
                Execution History
              </h4>
              {loadingAssignments ? (
                <div className="py-8 text-center"><Loader2 className="w-5 h-5 animate-spin text-accent mx-auto" /></div>
              ) : assignments.length === 0 ? (
                <div className="p-6 text-center text-xs text-sub bg-bg border border-dashed border-border rounded-lg">
                  No assignment history for this task yet.
                </div>
              ) : (
                <ol className="space-y-3 relative border-l-2 border-accent/20 ml-2 pl-4">
                  {assignments.map((a, idx) => {
                    const startDate = a.startDate ? new Date(a.startDate) : null;
                    const endDate = a.endDate ? new Date(a.endDate) : null;
                    const isActive = !a.endDate;
                    return (
                      <li key={a.id} className="relative">
                        <span className={`absolute -left-6 top-2 w-2.5 h-2.5 rounded-full border-2 border-surface ${isActive ? 'bg-accent' : 'bg-success'}`} />
                        <article className={`p-3.5 rounded-xl border ${isActive ? 'border-accent/30 bg-accent-soft/20' : 'border-border bg-bg'} space-y-1.5`}>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-xs font-bold text-ink">{a.user?.name || 'Member'}</p>
                              <p className="text-[11px] text-sub font-mono">{a.user?.email || ''}</p>
                            </div>
                            {isActive ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-accent-soft text-accent border border-accent/20">In Progress</span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-success-soft text-success border border-success/20">Completed</span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-3 text-[11px] text-sub font-mono pt-1">
                            <time dateTime={startDate?.toISOString()}>
                              Start: <strong className="text-ink">{startDate ? startDate.toLocaleDateString('en-US') : '—'}</strong>
                            </time>
                            {endDate && (
                              <time dateTime={endDate.toISOString()}>
                                End: <strong className="text-ink">{endDate.toLocaleDateString('en-US')}</strong>
                              </time>
                            )}
                            {a.hoursWorked > 0 && (
                              <span>Hours: <strong className="text-ink">{Number(a.hoursWorked).toFixed(1)}h</strong></span>
                            )}
                            {isPM && a.cost > 0 && (
                              <span className="text-success font-bold">Cost: {Number(a.cost).toLocaleString('en-US')} VND</span>
                            )}
                          </div>
                        </article>
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>
          )}

          {/* TAB 6: COST — PM ONLY */}
          {activeTab === 'cost' && isPM && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Cost & Estimate</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-bg border border-border rounded-lg space-y-1">
                  <span className="text-[10px] font-bold text-sub uppercase tracking-wider">Estimated Cost</span>
                  <p className="text-lg font-bold text-ink font-mono">
                    {task.estimatedCost ? `${Number(task.estimatedCost).toLocaleString()} VND` : '—'}
                  </p>
                </div>
                <div className="p-4 bg-bg border border-border rounded-lg space-y-1">
                  <span className="text-[10px] font-bold text-sub uppercase tracking-wider">Actual Cost</span>
                  <p className="text-lg font-bold text-accent font-mono">
                    {task.actualCost ? `${Number(task.actualCost).toLocaleString()} VND` : '—'}
                  </p>
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
          
        {/* RIGHT SIDEBAR: DETAILS */}
          <div className="w-80 bg-bg p-6 overflow-y-auto shrink-0 flex flex-col gap-6 border-l border-border">
            <div className="space-y-4">
              <div className="space-y-1 relative">
                <span className="text-[10px] font-bold text-sub uppercase">Status</span>
                <div className="mt-1 relative">
                  <select 
                    value={task.status || 'TODO'}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={statusLoading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    title="Change Status"
                  >
                    <option value="TODO">To Do (TODO)</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="REVIEW">In Review</option>
                    <option value="DONE">Done (DONE)</option>
                  </select>
                  <div className="pointer-events-none w-max">
                    <Badge variant={statusVariant} className="flex items-center gap-1">
                      {statusLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                      {task.status || 'Todo'}
                      <ChevronDown className="w-3 h-3 opacity-50 ml-1" />
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-sub uppercase">Priority</span>
                <div className="mt-1">
                  <Badge variant={priorityVariant}>{task.priority || 'MEDIUM'}</Badge>
                </div>
              </div>
              <div className="space-y-1 relative">
                <span className="text-[10px] font-bold text-sub uppercase">Assignee</span>
                <div className="mt-1 relative">
                  <select
                    value={task.assigneeId || ''}
                    onChange={(e) => handleAssigneeChange(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    title="Change Assignee"
                  >
                    <option value="">(Unassigned)</option>
                    {userList.map(u => (
                      <option key={u.id || u.userId} value={u.userId || u.user?.id || u.id}>
                        {u.name || u.user?.name || u.email}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2 pointer-events-none hover:bg-surface p-1 -ml-1 rounded transition-colors">
                    <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      {(task.assignee?.name || task.assignee || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-ink line-clamp-1">{task.assignee?.name || task.assignee || 'Unassigned'}</span>
                    <ChevronDown className="w-3 h-3 opacity-50 ml-auto shrink-0" />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-4 text-[10px] text-sub space-y-2">
              <div className="flex justify-between">
                <span>Created:</span>
                <span className="font-mono">{task.createdAt ? new Date(task.createdAt).toLocaleDateString('en-US') : '—'}</span>
              </div>
              <div className="flex justify-between">
                <span>Updated:</span>
                <span className="font-mono">{task.updatedAt ? new Date(task.updatedAt).toLocaleDateString('en-US') : '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="p-4 border-t border-border flex justify-end bg-surface shrink-0">
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </footer>
      </div>

      {/* HANDOVER CONFIRMATION MODAL */}
      {handoverModal.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm">
          <div className="bg-surface rounded-2xl border border-border shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-warning-soft text-warning border border-warning/20 shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-ink">Confirm Task Handover</h3>
                <p className="text-xs text-sub mt-1 leading-relaxed">
                  The system will automatically <strong className="text-ink">finalize working hours</strong> and <strong className="text-ink">calculate salary</strong> for the current assignee based on their hours and hourly rate. Do you agree to proceed with the handover?
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                onClick={() => setHandoverModal({ open: false, newAssigneeId: '' })}
                className="btn-secondary text-xs px-4 py-2"
                disabled={handoverLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmHandover}
                disabled={handoverLoading}
                className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
              >
                {handoverLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                Confirm Handover
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
