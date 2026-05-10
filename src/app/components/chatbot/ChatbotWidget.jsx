import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Send,
  X,
  MessageCircle,
  Bot,
  User,
  Sparkles,
  BookOpen,
  ChevronRight,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sendChatMessage, toggleChatbot, closeChatbot, addMessage, getChatSuggestions } from "@/modules";
import { Role } from "@/lib/enums";

export default function ChatbotWidget() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [inputValue, setInputValue] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const { isOpen, messages, suggestions, isTyping, status } = useSelector((state) => state.chatbot);
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // Determine user role for chatbot context
  const getUserRole = () => {
    if (!isAuthenticated) return "Guest";
    const role = user?.role?.toLowerCase();
    if (role === Role.ADMIN.toLowerCase()) return "Admin";
    if (role === Role.EMPLOYER.toLowerCase()) return "Employer";
    if (role === Role.STUDENT.toLowerCase()) return "Student";
    return "Guest";
  };

  const userRole = getUserRole();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // Load initial suggestions when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      dispatch(getChatSuggestions({ input: "", userRole }));
    }
  }, [isOpen, dispatch, userRole]);

  // Debounced suggestions as user types
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isOpen && !isMinimized) {
        dispatch(getChatSuggestions({ input: inputValue, userRole }));
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, isOpen, isMinimized, dispatch, userRole]);

  const handleSendMessage = async (message = inputValue) => {
    if (!message.trim()) return;

    // Add user message to chat
    dispatch(
      addMessage({
        role: "user",
        content: message,
      }),
    );

    setInputValue("");

    // Send to chatbot API
    const history = messages.slice(-10); // Last 10 messages
    const response = await dispatch(
      sendChatMessage({
        message,
        history,
        userRole,
      }),
    );

    // Add bot response
    if (response.payload?.data) {
      dispatch(
        addMessage({
          role: "assistant",
          content: response.payload.data.answer,
        }),
      );
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const toggleChat = () => {
    if (isMinimized) {
      setIsMinimized(false);
    }
    dispatch(toggleChatbot());
  };

  const handleClose = () => {
    dispatch(closeChatbot());
    setIsMinimized(false);
  };

  // Welcome message when chat first opens
  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = "Good day";
    if (hour < 12) greeting = "Good morning";
    else if (hour < 18) greeting = "Good afternoon";
    else greeting = "Good evening";

    return `${greeting}! I'm SEBot, your virtual assistant. How can I help you today?`;
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.div
        className="fixed bottom-4 left-6 z-50 flex items-end"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {!isOpen ? (
          <motion.button
            onClick={toggleChat}
            className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:shadow-xl border-4 border-white"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bot className="w-8 h-8" />
            {/* Unread indicator (optional) */}
            {messages.length === 0 && (
              <span className="absolute top-0 right-0 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500 border-2 border-white"></span>
              </span>
            )}
          </motion.button>
        ) : null}

        {/* Tooltip */}
        <AnimatePresence>
          {isHovered && !isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute bottom-full left-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap shadow-lg"
            >
              Chat with SEBot
              <div className="absolute bottom-0 left-3 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            drag
            dragMomentum={false}
            className="fixed bottom-24 left-6 z-50 flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={{
              width: isMinimized ? "280px" : "320px",
              height: isMinimized ? "auto" : "500px",
              maxHeight: "calc(100vh - 100px)",
              cursor: "auto"
            }}
          >
            {/* Header / Drag Handle */}
            <div 
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-3 flex items-center justify-between shrink-0 cursor-move"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base">SEBot</h3>
                  <p className="text-xs text-blue-100">Your Virtual Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                  title={isMinimized ? "Expand" : "Minimize"}
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                  {messages.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      {/* Welcome Message */}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm border border-gray-200">
                          <p className="text-sm text-gray-800">{getWelcomeMessage()}</p>
                        </div>
                      </div>

                      {/* Suggestions Chips */}
                      {suggestions.length > 0 && (
                        <div className="pl-11 space-y-2">
                          <p className="text-xs text-gray-500 font-medium">Suggested topics:</p>
                          <div className="flex flex-wrap gap-2">
                            {suggestions.slice(0, 4).map((suggestion, index) => (
                              <motion.button
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion.question)}
                                className="px-3 py-1.5 bg-white border border-blue-200 text-blue-700 text-xs rounded-full hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {suggestion.question}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <>
                      {messages.map((msg, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                              msg.role === "user" ? "bg-green-600" : "bg-blue-600"
                            }`}
                          >
                            {msg.role === "user" ? (
                              <User className="w-5 h-5 text-white" />
                            ) : (
                              <Bot className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div
                            className={`max-w-[75%] rounded-2xl p-3 shadow-sm border ${
                              msg.role === "user"
                                ? "bg-green-600 text-white border-green-700 rounded-tr-sm"
                                : "bg-white text-gray-800 border-gray-200 rounded-tl-sm"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </motion.div>
                      ))}

                      {/* Typing Indicator */}
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-start gap-3"
                        >
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                            <Bot className="w-5 h-5 text-white" />
                          </div>
                          <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm border border-gray-200">
                            <div className="flex gap-1">
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                              <span
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              />
                              <span
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-200 shrink-0">
                  {/* Quick Suggestions */}
                  {suggestions.length > 0 && inputValue.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {suggestions.slice(0, 3).map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion.question)}
                          className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full hover:bg-blue-100 transition-colors flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          {suggestion.question}
                        </button>
                      ))}
                    </div>
                  )}

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
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={status === "loading"}
                    />
                    <motion.button
                      onClick={() => handleSendMessage()}
                      disabled={!inputValue.trim() || status === "loading"}
                      className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Send className="w-5 h-5" />
                    </motion.button>
                  </div>
                  <p className="text-xs text-gray-400 text-center mt-2">Powered by AI • Responses may vary</p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
