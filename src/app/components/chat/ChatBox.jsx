import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { User, X, Minimize2, Maximize2, Send, Image, Paperclip, Smile, Minus, Reply, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EmojiPicker from "emoji-picker-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { closeChatWindow, toggleMinimizeChat, fetchMessages } from "../../modules/services/chatService";
import { sendChatMessage } from "../../modules/services/chatSocket";

export default function ChatBox({ chatData }) {
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [inputValue, setInputValue] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  
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

    const currentUserId = currentUser?.user_id || currentUser?.id;
    const receiverId = participantInfo?.user_id || 
                      (currentUserId === chatData.employerId ? chatData.studentId : chatData.employerId);

    if (!receiverId) return;

    let finalMessage = inputValue;
    if (replyingTo) {
      finalMessage = `---REPLY---${replyingTo.content}---END_REPLY---${inputValue}`;
    }

    sendChatMessage(conversationId, receiverId, finalMessage);
    setInputValue("");
    setReplyingTo(null);
  };

  const handleFileSelect = (type) => {
    if (type === "image") {
      imageInputRef.current?.click();
    } else {
      fileInputRef.current?.click();
    }
  };

  const onFileChange = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    alert(`Selecting ${type}: ${file.name}. (Feature coming soon!)`);
    e.target.value = "";
  };

  const onEmojiClick = (emojiData) => {
    setInputValue((prev) => prev + emojiData.emoji);
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
            onClick={(e) => { e.stopPropagation(); handleMinimize(); }}
            className="p-1 hover:bg-white/20 rounded transition-colors text-white"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
          </button>
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
                const msgDate = new Date(msg.created_at || Date.now());
                const dateString = msgDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
                
                let showDate = false;
                if (index === 0) {
                  showDate = true;
                } else {
                  const prevMsgDate = new Date(messages[index - 1].created_at || Date.now());
                  if (msgDate.toDateString() !== prevMsgDate.toDateString()) {
                    showDate = true;
                  }
                }

                let displayContent = msg.content;
                let replyContent = null;
                if (msg.content && msg.content.includes("---REPLY---")) {
                  const match = msg.content.match(/---REPLY---(.*?)---END_REPLY---(.*)/s);
                  if (match) {
                    replyContent = match[1];
                    displayContent = match[2];
                  }
                }

                return (
                  <React.Fragment key={index}>
                    {showDate && (
                      <div className="flex justify-center my-3">
                        <span className="text-[10px] bg-gray-200/60 text-gray-500 px-2.5 py-1 rounded-full font-medium">
                          {dateString}
                        </span>
                      </div>
                    )}
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-start gap-2 group ${isMine ? "flex-row-reverse" : ""}`}
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
                      <div className={`relative flex items-center gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
                        <div className="relative">
                          <div
                            className={`max-w-[200px] rounded-2xl p-2.5 shadow-sm text-sm ${
                              isMine
                                ? "bg-blue-600 text-white rounded-tr-sm"
                                : "bg-white text-gray-800 border border-gray-100 rounded-tl-sm"
                            }`}
                          >
                            {replyContent && (
                              <div className={`mb-1.5 p-1.5 rounded text-xs border-l-2 ${isMine ? "bg-blue-700/50 border-blue-300 text-blue-100" : "bg-gray-100 border-gray-300 text-gray-500"}`}>
                                <span className="block font-semibold mb-0.5">{isMine ? "You" : participantInfo.first_name}</span>
                                <p className="truncate">{replyContent}</p>
                              </div>
                            )}
                            <p className="whitespace-pre-wrap break-words">{displayContent}</p>
                          </div>
                        </div>

                        {/* Hover Actions */}
                        <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ${isMine ? "flex-row-reverse" : ""}`}>
                          <button onClick={() => setReplyingTo({ id: msg.id, content: displayContent })} className="p-1 text-gray-400 hover:text-blue-500 hover:bg-gray-100 rounded-full transition-colors" title="Reply">
                            <Reply className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </React.Fragment>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100 shrink-0">
            {replyingTo && (
              <div className="flex items-center justify-between bg-blue-50/50 p-2 rounded-t-lg border-l-2 border-blue-500 mb-2">
                <div className="flex flex-col overflow-hidden mr-2">
                  <span className="text-xs font-semibold text-blue-600">Replying to message</span>
                  <span className="text-xs text-gray-500 truncate">{replyingTo.content}</span>
                </div>
                <button onClick={() => setReplyingTo(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1 border-b border-gray-50 pb-2 mb-1">
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={(e) => onFileChange(e, "image")}
                  accept="image/*"
                  className="hidden"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => onFileChange(e, "file")}
                  className="hidden"
                />
                <button 
                  onClick={() => handleFileSelect("image")}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" 
                  title="Send image"
                >
                  <Image className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleFileSelect("file")}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" 
                  title="Send file"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <Popover>
                  <PopoverTrigger asChild>
                    <button 
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" 
                      title="Emoji"
                    >
                      <Smile className="w-4 h-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent side="top" align="start" className="p-0 border-none w-auto z-[110]">
                    <EmojiPicker 
                      onEmojiClick={onEmojiClick} 
                      width={300} 
                      height={400}
                      skinTonesDisabled
                      searchDisabled
                      previewConfig={{ showPreview: false }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
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
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-1.5 bg-gray-100 border-none rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors disabled:text-gray-300 disabled:bg-transparent"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
