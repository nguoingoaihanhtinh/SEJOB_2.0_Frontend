import React from 'react';
import { Box, Container } from '@mui/material';
import { motion } from 'framer-motion';
import SideBar from '../../../components/common/SideBar';

export default function UserProfileLayout({ children, sidebarProps = {} }) {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
          {/* Sidebar - có animation riêng bên trong component */}
          <SideBar {...sidebarProps} />

          {/* Main content area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            style={{ flex: 1 }}
          >
            {children}
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
}
