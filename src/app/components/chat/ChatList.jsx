import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { User, MessageCircle, X, Search } from "lucide-react";
import { motion } from "framer-motion";
import { openChatWindow } from "../../modules/services/chatService";

export default function ChatList({ onClose }) {
  const dispatch = useDispatch();
  const { conversationsList, onlineUsers } = useSelector((state) => state.chat);
  const { user: currentUser } = useSelector((state) => state.auth);
  
  const currentUserId = currentUser?.user_id || currentUser?.id;

  const handleOpenChat = (conv) => {
    // Determine the participant info (the one who is NOT me)
    const isStudent = currentUserId === conv.student_id;
    const participantInfo = isStudent ? conv.employer : conv.student;

    dispatch(openChatWindow({
      conversation: conv,
      participantInfo: participantInfo
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className="bg-white rounded-t-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden pointer-events-auto"
      style={{ width: "300px", height: "580px" }}
    >
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-between text-white shrink-0">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <h2 className="font-bold text-lg">Messages</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search Bar (Static for now) */}
      <div className="p-3 border-b border-gray-100 bg-gray-50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search conversations..." 
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {conversationsList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 opacity-20" />
            </div>
            <p className="text-sm font-medium">No conversations yet</p>
            <p className="text-xs mt-1">When you message an applicant or employer, they will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {conversationsList.map((conv) => {
              const isStudent = currentUserId === conv.student_id;
              const participant = isStudent ? conv.employer : conv.student;
              
              return (
                <button
                  key={conv.id}
                  onClick={() => handleOpenChat(conv)}
                  className="w-full p-4 flex items-center gap-4 hover:bg-blue-50/50 active:bg-blue-100 transition-all text-left group"
                >
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100">
                      {participant?.avatar ? (
                        <img src={participant.avatar} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <User className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    {/* Active Status Indicator */}
                    {onlineUsers.includes(participant?.user_id) && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm animate-pulse-subtle"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {participant?.first_name} {participant?.last_name}
                      </h4>
                      <span className="text-[10px] text-gray-400">
                        {new Date(conv.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 truncate font-medium mb-0.5">
                      {conv.job?.title || "Direct Message"}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate italic">
                      Click to resume conversation...
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-center">
        <p className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">
          SECURE P2P MESSAGING
        </p>
      </div>
    </motion.div>
  );
}
