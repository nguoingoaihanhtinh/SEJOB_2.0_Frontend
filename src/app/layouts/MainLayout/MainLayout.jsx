import React from "react";
import { Box, Container } from "@mui/material";
import Header from "../Header";
import Footer from "../Footer";
import { ChatbotWidget } from "../../components/chatbot";

import ChatManager from "../../components/chat/ChatManager";

export default function MainLayout({ children, maxWidth = false, disableGutters = false }) {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-100">
      <Header />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          marginTop: { xs: "40px", md: "50px" },
        }}
      >
        {children}
      </Box>
      <Footer />
      <ChatbotWidget />
      <ChatManager />
    </div>
  );
}
