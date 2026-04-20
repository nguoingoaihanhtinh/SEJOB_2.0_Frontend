import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import ChatBox from "./ChatBox";
import ChatList from "./ChatList";
import { initChatSocket, disconnectChatSocket } from "../../modules/services/chatSocket";
import { fetchConversations } from "../../modules/services/chatService";

export default function ChatManager() {
  const dispatch = useDispatch();
  const [isListOpen, setIsListOpen] = useState(false);
  
  const { activeChats } = useSelector((state) => state.chat);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      initChatSocket();
      dispatch(fetchConversations());
    } else {
      disconnectChatSocket();
    }
  }, [isAuthenticated, dispatch]);

  if (!isAuthenticated) return null;
  
  return (
    <div className="fixed bottom-0 right-6 z-[100] flex items-end gap-4 pointer-events-none">
      {/* Active Chat Windows */}
      <div className="flex items-end gap-4">
        <AnimatePresence>
          {activeChats.map((chat) => (
            <div key={chat.conversationId} className="pointer-events-auto">
              <ChatBox chatData={chat} />
            </div>
          ))}
        </AnimatePresence>
      </div>

      {/* Conversation List and Toggle */}
      <div className="flex flex-col items-end gap-4 mb-4 mr-4">
        <AnimatePresence>
          {isListOpen && (
            <div className="pointer-events-auto">
              <ChatList onClose={() => setIsListOpen(false)} />
            </div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsListOpen(!isListOpen)}
          className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all pointer-events-auto ${
            isListOpen 
              ? "bg-white text-blue-600 border-2 border-blue-600 rotate-90" 
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
          title="Messages"
        >
          {isListOpen ? <X className="w-7 h-7" /> : <MessageCircle className="w-7 h-7" />}
          
          {/* Notification Badge (Placeholder) */}
          {!isListOpen && (
             <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full"></div>
          )}
        </motion.button>
      </div>
    </div>
  );
}
