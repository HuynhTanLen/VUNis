import { useState, useEffect } from 'react';
import { X, FileText, CheckSquare, MessageSquare, Paperclip, DollarSign, Loader2, Plus, Trash2, Send, CornerDownRight, Reply } from 'lucide-react';
import { getCommentsByTask, createComment, deleteComment } from '../../services/commentService';
import { getSocket, joinTaskRoom, leaveTaskRoom } from '../../services/socketClient';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export default function TaskDetailModal({ isOpen, task, onClose, userList = [], onTaskUpdated }) {
  const [activeTab, setActiveTab] = useState('description');
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Subtasks local state (can be extended to sync with API)
  const [subtasks, setSubtasks] = useState(task?.subtasks || [
    { id: 1, title: 'Phân tích yêu cầu và mockup UI', done: true },
    { id: 2, title: 'Xây dựng API backend & database schema', done: false },
    { id: 3, title: 'Tích hợp giao diện với API', done: false }
  ]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  useEffect(() => {
    if (isOpen && task) {
      if (activeTab === 'comments') {
        loadComments();
      }
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
            if (prev.some(c => (c.id === comment.id || c._id === comment._id))) return prev;
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
      console.error('Lỗi tải bình luận:', err);
      setComments([]);
    } finally {
      setLoadingComments(false);
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
      console.error('Lỗi thêm bình luận:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      loadComments();
    } catch (err) {
      console.error('Lỗi xóa bình luận:', err);
    }
  };

  const getCommentAuthorName = (c) => {
    return (typeof c.author === 'object' ? c.author?.name : c.author) || c.user?.name || 'Thành viên';
  };

  const handleToggleSubtask = (subtaskId) => {
    setSubtasks(prev => prev.map(s => s.id === subtaskId ? { ...s, done: !s.done } : s));
  };

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    setSubtasks(prev => [...prev, { id: Date.now(), title: newSubtaskTitle.trim(), done: false }]);
    setNewSubtaskTitle('');
  };

  if (!isOpen || !task) return null;

  const issueKey = task.key || `KS-${(task.id || '').toString().slice(-4).toUpperCase() || '101'}`;
  const priorityVariant = task.priority === 'High' || task.priority === 'Urgent' ? 'danger' : task.priority === 'Low' ? 'neutral' : 'warning';
  const statusVariant = task.status === 'Done' ? 'success' : task.status === 'InProgress' ? 'warning' : 'accent';

  const tabs = [
    { id: 'description', label: 'Mô tả', icon: FileText },
    { id: 'subtasks', label: `Subtask (${subtasks.filter(s => s.done).length}/${subtasks.length})`, icon: CheckSquare },
    { id: 'comments', label: 'Bình luận', icon: MessageSquare },
    { id: 'attachments', label: 'Đính kèm', icon: Paperclip },
    { id: 'cost', label: 'Chi phí', icon: DollarSign },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl border border-border shadow-xl max-w-2xl w-full flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* HEADER */}
        <div className="p-5 border-b border-border flex items-start justify-between gap-4 bg-surface shrink-0">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-accent px-2 py-0.5 rounded bg-accent-soft border border-accent/20">
                {issueKey}
              </span>
              <Badge variant={statusVariant}>{task.status || 'Todo'}</Badge>
              <Badge variant={priorityVariant}>Mức {task.priority || 'Medium'}</Badge>
            </div>
            <h2 className="text-base font-bold text-ink leading-snug truncate mt-1">{task.title}</h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-sub hover:text-ink rounded-lg hover:bg-accent-soft transition-colors focus:outline-none focus:ring-2 focus:ring-accent/20 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex bg-bg px-5 pt-2 border-b border-border gap-1 overflow-x-auto shrink-0">
          {tabs.map(t => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap focus:outline-none ${
                  isActive
                    ? 'border-accent text-accent bg-surface font-bold'
                    : 'border-transparent text-sub hover:text-ink hover:bg-accent-soft/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB CONTENT BODY */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: DESCRIPTION */}
          {activeTab === 'description' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="label-field">Mô tả công việc</label>
                <div className="p-3.5 bg-bg border border-border rounded-lg text-xs text-ink leading-relaxed whitespace-pre-wrap min-h-[100px]">
                  {task.description || 'Chưa có mô tả chi tiết cho nhiệm vụ này.'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 bg-bg border border-border rounded-lg space-y-1">
                  <span className="text-[10px] font-bold text-sub uppercase tracking-wider">Vai trò / Chức năng</span>
                  <p className="text-xs font-semibold text-ink font-mono">{task.role || 'Developer'}</p>
                </div>
                <div className="p-3 bg-bg border border-border rounded-lg space-y-1">
                  <span className="text-[10px] font-bold text-sub uppercase tracking-wider">Hạn hoàn thành</span>
                  <p className="text-xs font-semibold text-ink font-mono">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : 'Chưa đặt hạn'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SUBTASKS */}
          {activeTab === 'subtasks' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Danh sách Subtask</h4>
                <span className="text-xs text-sub font-mono">
                  {subtasks.filter(s => s.done).length} / {subtasks.length} hoàn thành
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-bg rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${subtasks.length > 0 ? (subtasks.filter(s => s.done).length / subtasks.length) * 100 : 0}%` }}
                />
              </div>

              {/* Checklist */}
              <div className="space-y-2">
                {subtasks.map(st => (
                  <label key={st.id} className="flex items-center gap-3 p-2.5 bg-bg border border-border rounded-lg hover:bg-accent-soft/30 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={st.done}
                      onChange={() => handleToggleSubtask(st.id)}
                      className="rounded border-border text-accent focus:ring-accent/40 w-4 h-4"
                    />
                    <span className={`text-xs text-ink ${st.done ? 'line-through text-sub' : 'font-medium'}`}>
                      {st.title}
                    </span>
                  </label>
                ))}
              </div>

              {/* Add subtask form */}
              <form onSubmit={handleAddSubtask} className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Thêm subtask mới..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  className="input-field flex-1"
                />
                <Button type="submit" variant="secondary" icon={Plus}>Thêm</Button>
              </form>
            </div>
          )}

          {/* TAB 3: COMMENTS */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Trao đổi & Bình luận</h4>

              {/* Comment list */}
              {loadingComments ? (
                <div className="py-8 text-center"><Loader2 className="w-5 h-5 animate-spin text-accent mx-auto" /></div>
              ) : comments.length === 0 ? (
                <div className="p-6 text-center text-xs text-sub bg-bg border border-dashed border-border rounded-lg">
                  Chưa có bình luận nào. Hãy gửi phản hồi đầu tiên!
                </div>
              ) : (
                <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                  {(() => {
                    const map = {};
                    const rootComments = [];
                    comments.forEach(c => {
                      const cId = c.id || c._id;
                      map[cId] = { ...c, replies: Array.isArray(c.replies) ? [...c.replies] : [] };
                    });
                    comments.forEach(c => {
                      const cId = c.id || c._id;
                      if (c.parentId && map[c.parentId]) {
                        // Push to parent replies if not already present
                        if (!map[c.parentId].replies.some(r => (r.id || r._id) === cId)) {
                          map[c.parentId].replies.push(map[cId]);
                        }
                      } else if (!c.parentId) {
                        if (!rootComments.some(r => (r.id || r._id) === cId)) {
                          rootComments.push(map[cId]);
                        }
                      }
                    });

                    return rootComments.map(c => {
                      const authorName = getCommentAuthorName(c);
                      const cId = c.id || c._id;
                      const replies = Array.isArray(c.replies) ? c.replies : [];

                      return (
                        <div key={cId} className="p-3 bg-bg border border-border rounded-lg space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                              {authorName}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-sub font-mono">
                                {c.createdAt ? new Date(c.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                              <button
                                type="button"
                                onClick={() => setReplyTo({ id: cId, authorName })}
                                className="text-xs text-accent hover:underline flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-accent-soft font-semibold transition-colors"
                              >
                                <Reply className="w-3 h-3" /> Trả lời
                              </button>
                              <button onClick={() => handleDeleteComment(cId)} className="text-sub hover:text-danger p-0.5" title="Xóa">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <p className="text-xs text-ink leading-relaxed">{c.content}</p>

                          {/* Nested Replies */}
                          {replies.length > 0 && (
                            <div className="pl-3 border-l-2 border-accent/20 ml-1 space-y-2 mt-2 pt-1">
                              {replies.map(r => {
                                const rAuthorName = getCommentAuthorName(r);
                                const rId = r.id || r._id;
                                return (
                                  <div key={rId} className="p-2 bg-surface border border-border/80 rounded-md space-y-1">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1 text-[11px]">
                                        <CornerDownRight className="w-3 h-3 text-accent shrink-0" />
                                        <span className="font-bold text-ink">{rAuthorName}</span>
                                        <span className="text-[10px] font-medium text-sub">trả lời <strong className="text-accent">{authorName}</strong></span>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[9px] text-sub font-mono">
                                          {r.createdAt ? new Date(r.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                        <button onClick={() => handleDeleteComment(rId)} className="text-sub hover:text-danger p-0.5" title="Xóa">
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

              {/* Add comment form */}
              <div className="space-y-1.5 pt-2 border-t border-border">
                {replyTo && (
                  <div className="flex items-center justify-between px-2.5 py-1 bg-accent-soft border border-accent/20 rounded-md text-xs text-accent font-semibold">
                    <span className="flex items-center gap-1.5">
                      <CornerDownRight className="w-3.5 h-3.5 shrink-0" />
                      Đang trả lời <strong className="font-bold">{replyTo.authorName}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setReplyTo(null)}
                      className="text-sub hover:text-ink p-0.5 rounded"
                      title="Hủy trả lời"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    placeholder={replyTo ? `Nhập câu trả lời cho ${replyTo.authorName}...` : "Viết bình luận..."}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={submittingComment}
                    className="input-field flex-1"
                  />
                  <Button type="submit" variant="primary" disabled={submittingComment} icon={Send}>
                    {replyTo ? 'Trả lời' : 'Gửi'}
                  </Button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: ATTACHMENTS */}
          {activeTab === 'attachments' && (
            <div className="p-8 text-center space-y-2 bg-bg border border-dashed border-border rounded-xl">
              <Paperclip className="w-8 h-8 text-sub mx-auto" />
              <p className="text-xs font-bold text-ink uppercase tracking-wider">Đính kèm tài liệu</p>
              <p className="text-xs text-sub">Chức năng đính kèm tệp tin và ảnh sẽ được hỗ trợ ở phiên bản tiếp theo.</p>
            </div>
          )}

          {/* TAB 5: COST */}
          {activeTab === 'cost' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Chi phí & Dự toán công việc</h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-bg border border-border rounded-lg space-y-1">
                  <span className="text-[10px] font-bold text-sub uppercase tracking-wider">Chi phí dự toán</span>
                  <p className="text-lg font-bold text-ink font-mono">
                    {task.estimatedCost ? `${Number(task.estimatedCost).toLocaleString()} đ` : '5,000,000 đ'}
                  </p>
                </div>
                <div className="p-4 bg-bg border border-border rounded-lg space-y-1">
                  <span className="text-[10px] font-bold text-sub uppercase tracking-wider">Thời gian thực tế</span>
                  <p className="text-lg font-bold text-accent font-mono">16 giờ</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-border flex justify-end bg-surface shrink-0">
          <Button variant="secondary" onClick={onClose}>Đóng</Button>
        </div>

      </div>
    </div>
  );
}
