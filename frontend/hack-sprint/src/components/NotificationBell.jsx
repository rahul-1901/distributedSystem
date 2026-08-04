import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, BellOff } from "lucide-react";
import { NotificationAPI } from "../api/notification.api.js";

const timeAgo = (dateStr) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

const NotificationBell = ({ asAdmin = false }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  const loadUnreadCount = () => {
    NotificationAPI.getUnreadCount(asAdmin)
      .then((res) => setUnreadCount(res.data.count || 0))
      .catch(() => {});
  };

  useEffect(() => {
    loadUnreadCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      setLoading(true);
      NotificationAPI.getNotifications({ limit: 20 }, asAdmin)
        .then((res) => setNotifications(res.data.notifications || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  };

  const handleNotificationClick = async (n) => {
    if (!n.isRead) {
      try {
        await NotificationAPI.markAsRead(n._id, asAdmin);
        setNotifications((prev) =>
          prev.map((x) => (x._id === n._id ? { ...x, isRead: true } : x))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        // best-effort
      }
    }
    if (n.actionUrl) {
      setOpen(false);
      navigate(n.actionUrl);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await NotificationAPI.markAllAsRead(asAdmin);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // best-effort
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggleOpen}
        className="relative w-8 h-8 flex items-center justify-center text-[rgba(95,255,96,0.55)] hover:text-[#5fff60] rounded-[3px] transition-all duration-200 cursor-pointer"
        title="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-[3px] rounded-full bg-[#ff6060] text-white text-[0.55rem] font-bold flex items-center justify-center leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-[rgba(8,10,8,0.98)] border border-[rgba(95,255,96,0.15)] rounded-[4px] shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden z-50">
          <span className="absolute top-[-1px] left-[-1px] w-[8px] h-[8px] border-t-2 border-l-2 border-[rgba(95,255,96,0.45)]" />
          <span className="absolute bottom-[-1px] right-[-1px] w-[8px] h-[8px] border-b-2 border-r-2 border-[rgba(95,255,96,0.45)]" />

          <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(95,255,96,0.08)] bg-[rgba(95,255,96,0.04)]">
            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-white">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-[0.58rem] uppercase tracking-[0.06em] text-[rgba(95,255,96,0.6)] hover:text-[#5fff60] cursor-pointer"
              >
                <CheckCheck size={11} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="py-8 text-center text-[0.65rem] text-[rgba(180,220,180,0.4)]">
                Loading…
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 flex flex-col items-center gap-2 text-[0.65rem] text-[rgba(180,220,180,0.4)]">
                <BellOff size={22} className="opacity-40" />
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`px-4 py-3 border-b border-[rgba(95,255,96,0.06)] cursor-pointer transition-colors hover:bg-[rgba(95,255,96,0.05)] ${
                    n.isRead ? "" : "bg-[rgba(95,255,96,0.03)]"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.isRead && (
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#5fff60] flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-[0.68rem] font-semibold text-white truncate">{n.title}</p>
                      <p className="text-[0.62rem] text-[rgba(180,220,180,0.55)] mt-0.5 leading-snug">
                        {n.message}
                      </p>
                      <p className="text-[0.55rem] text-[rgba(180,220,180,0.3)] mt-1 uppercase tracking-[0.05em]">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
