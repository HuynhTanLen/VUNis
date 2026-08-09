import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Trash2, FolderPlus, Info, CheckCircle2, X, Loader2 } from 'lucide-react';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../../services/notificationService';

export default function NotificationPopover({ onProjectApproved }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      // Ignore if unauthenticated
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => (n.id === id || n._id === id) ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveInvitation = async (notif) => {
    const id = notif.id || notif._id;
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => (n.id === id || n._id === id) ? { ...n, isRead: true, isApproved: true } : n));
      if (onProjectApproved) {
        onProjectApproved(notif);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeclineInvitation = async (notif) => {
    const id = notif.id || notif._id;
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => (n.id !== id && n._id !== id)));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative inline-block text-left" ref={popoverRef}>
      
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-surface border border-border text-ink hover:bg-accent-soft transition-colors focus:outline-none focus:ring-2 focus:ring-accent/30 shrink-0"
        title="System Notifications"
      >
        <Bell className="w-4 h-4 text-accent" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white font-mono shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-surface border border-border shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header */}
          <div className="p-3.5 border-b border-border flex items-center justify-between bg-bg">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-accent" />
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">System Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-accent-soft text-accent border border-accent/20">
                  {unreadCount} unread
                </span>
              )}
            </div>
            
            {notifications.length > 0 && unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[10px] font-semibold text-accent hover:underline flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3 h-3" /> Mark all as read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-sub space-y-1">
                <CheckCircle2 className="w-6 h-6 text-sub/50 mx-auto" />
                <p className="text-xs font-semibold text-ink">No new notifications</p>
                <p className="text-[11px]">You're all caught up with project updates.</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isInvite = notif.title?.toLowerCase().includes('invitation') || notif.title?.toLowerCase().includes('project') || notif.message?.toLowerCase().includes('project');
                const id = notif.id || notif._id;

                return (
                  <div
                    key={id}
                    className={`p-3.5 space-y-2 transition-colors ${
                      notif.isRead ? 'bg-surface opacity-80' : 'bg-accent-soft/30 font-semibold'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className={`p-1.5 rounded-lg shrink-0 ${
                          isInvite ? 'bg-accent-soft text-accent' : 'bg-bg text-sub'
                        }`}>
                          {isInvite ? <FolderPlus className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-ink leading-snug truncate">{notif.title}</p>
                          <p className="text-xs text-sub leading-relaxed mt-0.5">{notif.message}</p>
                          <span className="text-[9px] text-sub/70 font-mono mt-1 block">
                            {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString('en-US') : ''}
                          </span>
                        </div>
                      </div>

                      {!notif.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(id)}
                          className="text-sub hover:text-ink p-1 rounded transition-colors shrink-0"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Invitation Action Buttons (Approve / Decline) */}
                    {isInvite && (
                      <div className="flex items-center gap-2 pt-1 border-t border-border/60 justify-end">
                        {notif.isApproved ? (
                          <span className="text-[10px] font-bold text-success flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Accepted Invitation
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => handleDeclineInvitation(notif)}
                              className="px-2.5 py-1 text-[10px] font-semibold text-sub border border-border rounded-md hover:bg-bg transition-colors"
                            >
                              Decline
                            </button>
                            <button
                              onClick={() => handleApproveInvitation(notif)}
                              className="px-2.5 py-1 text-[10px] font-bold text-white bg-accent rounded-md hover:bg-accent/90 transition-colors shadow-sm"
                            >
                              Approve
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

    </div>
  );
}
