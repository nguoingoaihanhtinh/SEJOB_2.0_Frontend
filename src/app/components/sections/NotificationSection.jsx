import React, { useState, useEffect, useCallback } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "../ui";
import { Bell, Briefcase, UserCheck, AlertCircle, CheckCheck, ChevronRight, FileText, ClipboardList, Send } from "lucide-react";
import { useSelector } from "react-redux";
import { notificationApi } from "../../../api";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import _ from "lodash";
import { getSocket, initChatSocket } from "../../modules/services/chatSocket";

// ─── Const ──────────────────────────────────────────────────────────────────
const NOTIFICATION_TYPE = {
  NEW_APPLICATION: "new_application",
  JOB_STATUS_UPDATED: "job_status_updated",
  USER_CREATED: "user_created",
  APPLICATION_STATUS_UPDATED: "application_status_updated",
  NEW_CHAT_MESSAGE: "new_chat_message",
}

// ─── Colors ──────────────────────────────────────────────────────────────────

const C = {
  bgPrimary: "#ffffff",
  bgSecondary: "#f5f5f4",
  textPrimary: "#1a1a18",
  textSecondary: "#6b6b67",
  textTertiary: "#a8a8a4",
  borderTertiary: "#e5e5e2",
  borderSecondary: "#d4d4d0",
  unreadBg: "rgba(55, 138, 221, 0.05)",
  unreadDot: "#378ADD",
  redBadge: "#E24B4A",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return date.toLocaleDateString("vi-VN", { day: "numeric", month: "short", year: "numeric" });
}

function getNotifMeta(type) {
  switch (type) {
    case NOTIFICATION_TYPE.USER_CREATED:
      return {
        icon: <UserCheck size={15} />,
        label: "Chào mừng",
        iconBg: "#E1F5EE",
        iconColor: "#0F6E56",
        tagBg: "#E1F5EE",
        tagColor: "#0F6E56",
      };
    case NOTIFICATION_TYPE.JOB_STATUS_UPDATED:
      return {
        icon: <Briefcase size={15} />,
        label: "Công việc",
        iconBg: "#EAF3DE",
        iconColor: "#3B6D11",
        tagBg: "#EAF3DE",
        tagColor: "#3B6D11",
      };
    case NOTIFICATION_TYPE.NEW_APPLICATION:
      return {
        icon: <FileText size={15} />,
        label: "Ứng tuyển mới",
        iconBg: "#EEF2FF",
        iconColor: "#4F46E5",
        tagBg: "#EEF2FF",
        tagColor: "#4F46E5",
      };
    case NOTIFICATION_TYPE.APPLICATION_STATUS_UPDATED:
      return {
        icon: <ClipboardList size={15} />,
        label: "Cập nhật ứng tuyển",
        iconBg: "#FEF3C7",
        iconColor: "#D97706",
        tagBg: "#FEF3C7",
        tagColor: "#D97706",
      };
    case NOTIFICATION_TYPE.NEW_CHAT_MESSAGE:
      return {
        icon: <Send size={15} />,
        label: "Tin nhắn",
        iconBg: "#F0F9FF",
        iconColor: "#0369A1",
        tagBg: "#F0F9FF",
        tagColor: "#0369A1",
      };
    default:
      return {
        icon: <AlertCircle size={15} />,
        label: "Thông báo",
        iconBg: "#FAEEDA",
        iconColor: "#854F0B",
        tagBg: "#FAEEDA",
        tagColor: "#854F0B",
      };
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function NotifItem({ notif, onMarkRead, onClick }) {
  const meta = getNotifMeta(notif.type);

  return (
    <div
      onClick={() => {
        if (!notif.is_read) onMarkRead(notif.id);
        onClick(notif);
      }}
      style={{
        display: "flex",
        gap: "12px",
        padding: "13px 16px",
        borderBottom: `0.5px solid ${C.borderTertiary}`,
        cursor: "pointer",
        transition: "background 0.12s",
        position: "relative",
        backgroundColor: notif.is_read ? "transparent" : C.unreadBg,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.bgSecondary)}
      onMouseLeave={(e) =>
        (e.currentTarget.style.backgroundColor = notif.is_read ? "transparent" : C.unreadBg)
      }
    >
      {/* Icon */}
      <div
        style={{
          flexShrink: 0,
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: meta.iconBg,
          color: meta.iconColor,
        }}
      >
        {meta.icon}
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 500,
            padding: "1px 7px",
            borderRadius: "100px",
            display: "inline-block",
            marginBottom: "4px",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            backgroundColor: meta.tagBg,
            color: meta.tagColor,
          }}
        >
          {meta.label}
        </span>
        <p
          style={{
            fontSize: "13px",
            fontWeight: 500,
            color: C.textPrimary,
            marginBottom: "3px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {notif.title}
        </p>
        <p
          style={{
            fontSize: "12px",
            color: C.textSecondary,
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {notif.content}
        </p>
        <span
          style={{
            fontSize: "11px",
            color: C.textTertiary,
            display: "block",
            marginTop: "5px",
          }}
        >
          {formatRelativeTime(notif.created_at)}
        </span>
      </div>

      {/* Unread dot */}
      {!notif.is_read && (
        <span
          style={{
            position: "absolute",
            right: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            backgroundColor: C.unreadDot,
            flexShrink: 0,
          }}
        />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        padding: "40px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        color: C.textTertiary,
      }}
    >
      <Bell size={28} strokeWidth={1.5} />
      <p style={{ fontSize: "13px", color: C.textSecondary, textAlign: "center" }}>
        Chưa có thông báo nào.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ padding: "16px" }}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: "12px",
            padding: "12px 0",
            borderBottom: i < 3 ? `0.5px solid ${C.borderTertiary}` : "none",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: C.bgSecondary,
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ height: "10px", width: "40%", borderRadius: "100px", backgroundColor: C.bgSecondary }} />
            <div style={{ height: "12px", width: "70%", borderRadius: "4px", backgroundColor: C.bgSecondary }} />
            <div style={{ height: "11px", width: "90%", borderRadius: "4px", backgroundColor: C.bgSecondary }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NotificationSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    if (currentUser?.user_id) {
      fetchNotifications();
      
      const socket = getSocket() || initChatSocket();
      
      const handleNewNotification = (notif) => {
        console.log("🔔 Real-time notification received:", notif);
        setNotifications(prev => {
          if (prev.find(n => n.id === notif.id)) return prev;
          return [notif, ...prev];
        });
      };

      socket.on("new_notification", handleNewNotification);

      return () => {
        socket.off("new_notification", handleNewNotification);
      };
    }
  }, [currentUser?.user_id]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationApi.getNotifications({ receiver_id: currentUser.user_id });
      if (res && res.success) {
        setNotifications(res.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    notificationApi.markAsRead({ id });
  }, []);

  const handleNavigate = (notif) => {
    if (notif.type === NOTIFICATION_TYPE.NEW_APPLICATION && _.get(notif, 'data.application_id')) {
      navigate(`/applicants/${notif.data.application_id}`);
    } else if (notif.type === NOTIFICATION_TYPE.NEW_CHAT_MESSAGE) {
      navigate("/chat");
    }
  }

  const handleMarkAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    notificationApi.markAllAsRead({ receiver_id: currentUser.user_id });
  }, [currentUser?.user_id]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* ── Trigger ── */}
      <PopoverTrigger asChild>
        <button
          style={{
            position: "relative",
            background: "transparent",
            border: "0.5px solid transparent",
            borderRadius: "8px",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "background 0.15s, border-color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = C.bgSecondary;
            e.currentTarget.style.borderColor = C.borderTertiary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "transparent";
          }}
          aria-label="Thông báo"
        >
          <Bell size={18} color={C.textSecondary} strokeWidth={1.75} />
          {unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "6px",
                right: "6px",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: C.redBadge,
                border: `1.5px solid ${C.bgPrimary}`,
              }}
            />
          )}
        </button>
      </PopoverTrigger>

      {/* ── Panel ── */}
      <PopoverContent
        style={{
          width: "340px",
          padding: 0,
          border: `0.5px solid ${C.borderSecondary}`,
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          backgroundColor: C.bgPrimary,
        }}
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "13px 16px 11px",
            borderBottom: `0.5px solid ${C.borderTertiary}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: 500, color: C.textPrimary }}>
              Thông báo
            </span>
            {unreadCount > 0 && (
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  backgroundColor: C.redBadge,
                  color: "#ffffff",
                  borderRadius: "100px",
                  padding: "1px 7px",
                  lineHeight: "18px",
                }}
              >
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "12px",
                color: C.textSecondary,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "3px 6px",
                borderRadius: "6px",
                transition: "color 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = C.textPrimary;
                e.currentTarget.style.background = C.bgSecondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = C.textSecondary;
                e.currentTarget.style.background = "none";
              }}
            >
              <CheckCheck size={13} />
              Đánh dấu đã đọc
            </button>
          )}
        </div>

        {/* List */}
        <div style={{ maxHeight: "380px", overflowY: "auto" }}>
          {loading ? (
            <LoadingState />
          ) : notifications.length > 0 ? (
            notifications.map((notif) => (
              <NotifItem key={notif.id} notif={notif} onMarkRead={handleMarkRead} onClick={() => handleNavigate(notif)}/>
            ))
          ) : (
            <EmptyState />
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}