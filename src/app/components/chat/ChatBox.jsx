import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { User, X, Minimize2, Maximize2, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { closeChatWindow, toggleMinimizeChat, fetchMessages } from "../../modules/services/chatService";
import { sendChatMessage } from "../../modules/services/chatSocket";

export default function ChatBox({ chatData }) {
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [inputValue, setInputValue] = useState("");
  const { user: currentUser } = useSelector((state) => state.auth);
  const { onlineUsers } = useSelector((state) => state.chat);

  const { conversationId, participantInfo, isMinimized, messages } = chatData;

  // Fetch history when mounting
  useEffect(() => {
    if (conversationId) {
      dispatch(fetchMessages(conversationId));
    }
  }, [conversationId, dispatch]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isMinimized]);

  // Focus input when chat window is active
  useEffect(() => {
    if (!isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isMinimized]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Derived receiverId: use participantInfo.user_id if available,
    // otherwise fallback to the ID of the participant who is NOT the current user
    const currentUserId = currentUser?.user_id || currentUser?.id;
    const receiverId = participantInfo?.user_id || 
                      (currentUserId === chatData.employerId ? chatData.studentId : chatData.employerId);

    console.log("ChatBox handleSendMessage:", { conversationId, receiverId, currentUserId });
    
    if (!receiverId) {
        console.error("Critical: Could not determine receiver ID", { participantInfo, chatData });
        return;
    }

    sendChatMessage(conversationId, receiverId, inputValue);
    setInputValue("");
  };

  const handleClose = () => {
    dispatch(closeChatWindow(conversationId));
  };

  const handleMinimize = () => {
    dispatch(toggleMinimizeChat(conversationId));
  };

  return (
    <motion.div
      className="flex flex-col bg-white rounded-t-xl shadow-[0_-5px_15px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-200"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      style={{
        width: "320px",
        height: isMinimized ? "48px" : "450px", // 48px header only
      }}
    >
      {/* Header */}
      <div 
        className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 flex items-center justify-between shrink-0 cursor-pointer"
        onClick={handleMinimize}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center overflow-hidden">
            {participantInfo.avatar ? (
              <img src={participantInfo.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">
              {participantInfo.first_name} {participantInfo.last_name}
            </h3>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${onlineUsers.includes(participantInfo.user_id) ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" : "bg-gray-400"}`}></div>
              <span className="text-[10px] text-blue-100 font-medium">
                {onlineUsers.includes(participantInfo.user_id) ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); handleClose(); }}
            className="p-1 hover:bg-white/20 rounded transition-colors text-white"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 bg-gray-50 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-xs text-gray-400 mt-4">
                No messages yet. Send a message to start the conversation!
              </div>
            ) : (
              messages.map((msg, index) => {
                const isMine = msg.sender_id === (currentUser?.user_id || currentUser?.id);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-2 ${isMine ? "flex-row-reverse" : ""}`}
                  >
                    {!isMine && (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-blue-100 overflow-hidden mt-1">
                         {participantInfo.avatar ? (
                          <img src={participantInfo.avatar} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-3 h-3 text-blue-600" />
                        )}
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl p-2.5 shadow-sm text-sm ${
                        isMine
                          ? "bg-blue-600 text-white rounded-tr-sm"
                          : "bg-white text-gray-800 border border-gray-100 rounded-tl-sm"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </motion.div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100 shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Aa"
                className="flex-1 px-3 py-1.5 bg-gray-100 border-none rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors disabled:text-gray-300 disabled:bg-transparent"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
