import React, { useRef, useState } from 'react';
import { Box, Typography, IconButton, Button, TextField, Menu, MenuItem } from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DriveFileRenameOutline as RenameIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  MoreVert as MoreVertIcon,
  AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export default function CVUpload({ cvs = [], onFileChange, onDelete, onView, onUpdateTitle, onAutofill }) {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [editingCvId, setEditingCvId] = useState(null);
  const [editingTitleId, setEditingTitleId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedCv, setSelectedCv] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file?.type === 'application/pdf') {
      onFileChange(file, editingCvId);
      setEditingCvId(null);
    } else {
      alert(t("profile.please_upload_pdf_only"));
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file?.type === 'application/pdf') {
      onFileChange(file, editingCvId);
      setEditingCvId(null);
    } else {
      alert(t("profile.please_upload_pdf_only"));
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = (cvId = null) => {
    setEditingCvId(cvId);
    fileInputRef.current?.click();
  };

  const handleEditTitle = (cv) => {
    const cvId = cv?.cvid || cv?.id || cv?.cv_id;
    const currentTitle = cv?.title || getFileNameFromPath(cv?.filepath);
    setEditingTitleId(cvId);
    setEditingTitle(currentTitle);
  };

  const handleSaveTitle = async (cvId) => {
    if (!editingTitle.trim()) return;

    try {
      if (onUpdateTitle) {
        await onUpdateTitle(cvId, editingTitle);
      }
      setEditingTitleId(null);
      setEditingTitle('');
    } catch (error) {
      console.error('Error saving title:', error);
    }
  };

  const handleCancelEditTitle = () => {
    setEditingTitleId(null);
    setEditingTitle('');
  };

  const handleMenuOpen = (event, cv) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedCv(cv);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedCv(null);
  };

  const handleDownload = (cv) => {
    if (cv?.filepath) {
      const link = document.createElement('a');
      link.href = cv.filepath;
      link.download = cv?.title || getFileNameFromPath(cv?.filepath) + '.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    handleMenuClose();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  const getFileNameFromPath = (filepath) => {
    if (!filepath) return 'CV';
    const parts = filepath.split('/');
    const fileName = parts[parts.length - 1];
    return fileName.replace('.pdf', '').replace('media_', '') || 'CV';
  };

  return (
    <Box sx={{ bgcolor: 'background.paper', p: { xs: 2, sm: 3 }, borderRadius: 2, border: 1, borderColor: 'divider', mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {t("profile.cv_attachment")}
        </Typography>
        {cvs.length > 0 && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<CloudUploadIcon />}
            onClick={() => handleUploadClick(null)}
            sx={{ fontWeight: 600 }}
          >
            {t("profile.upload_cv")}
          </Button>
        )}
      </Box>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {cvs && cvs.length > 0 && (
        <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {cvs.filter(cv => cv != null).map((cv) => {
            const cvId = cv?.cvid || cv?.id || cv?.cv_id;
            if (!cvId) return null;

            const cvTitle = cv?.title || getFileNameFromPath(cv?.filepath);
            const uploadDate = formatDate(cv?.createdat || cv?.created_at || cv?.createdAt);

            return (
              <Box
                key={cvId}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  borderRadius: 1,
                  border: 1,
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                  transition: 'background-color 0.2s'
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: 'error.main',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <DescriptionIcon sx={{ fontSize: 28, color: 'common.white' }} />
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  {editingTitleId === cvId ? (
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <TextField
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveTitle(cvId);
                          } else if (e.key === 'Escape') {
                            handleCancelEditTitle();
                          }
                        }}
                        autoFocus
                        size="small"
                        sx={{ flex: 1 }}
                      />
                      <IconButton
                        onClick={() => handleSaveTitle(cvId)}
                        size="small"
                        color="primary"
                      >
                        <CheckIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        onClick={handleCancelEditTitle}
                        size="small"
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ) : (
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 500,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        mb: 0.5,
                        '&:hover': { color: 'primary.main' }
                      }}
                      onClick={() => handleEditTitle(cv)}
                    >
                      {cvTitle}
                    </Typography>
                  )}
                  {uploadDate && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                      {t("profile.last_uploaded")}: {uploadDate}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                  <IconButton
                    onClick={() => onView(cv)}
                    size="small"
                    title={t("profile.view")}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDownload(cv)}
                    size="small"
                    title={t("profile.download")}
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                  {onAutofill && (
                    <IconButton
                      onClick={async () => {
                        setIsExtracting(true);
                        try {
                          await onAutofill(cv);
                        } finally {
                          setIsExtracting(false);
                        }
                      }}
                      size="small"
                      color="primary"
                      title="Tự động điền từ CV"
                      disabled={isExtracting}
                    >
                      <AutoAwesomeIcon fontSize="small" />
                    </IconButton>
                  )}
                  <IconButton
                    onClick={(e) => handleMenuOpen(e, cv)}
                    size="small"
                    title={t("profile.more_options")}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            );
          }).filter(Boolean)}
        </Box>
      )}

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            onView(selectedCv);
            handleMenuClose();
          }}
        >
          <VisibilityIcon sx={{ mr: 1, fontSize: 18 }} />
          {t("profile.view")}
        </MenuItem>
        <MenuItem onClick={() => handleDownload(selectedCv)}>
          <DownloadIcon sx={{ mr: 1, fontSize: 18 }} />
          {t("profile.download")}
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleEditTitle(selectedCv);
            handleMenuClose();
          }}
        >
          <RenameIcon sx={{ mr: 1, fontSize: 18 }} />
          {t("profile.rename")}
        </MenuItem>
        <MenuItem
          onClick={() => {
            const cvId = selectedCv?.cvid || selectedCv?.id || selectedCv?.cv_id;
            handleUploadClick(cvId);
            handleMenuClose();
          }}
        >
          <EditIcon sx={{ mr: 1, fontSize: 18 }} />
          {t("profile.replace_file")}
        </MenuItem>
        <MenuItem
          onClick={async () => {
            if (onAutofill) {
              setIsExtracting(true);
              try {
                await onAutofill(selectedCv);
              } finally {
                setIsExtracting(false);
              }
            }
            handleMenuClose();
          }}
          disabled={isExtracting}
          sx={{ color: 'primary.main' }}
        >
          <AutoAwesomeIcon sx={{ mr: 1, fontSize: 18 }} />
          {isExtracting ? 'Đang trích xuất...' : 'Tự động điền từ CV'}
        </MenuItem>
        <MenuItem
          onClick={() => {
            const cvId = selectedCv?.cvid || selectedCv?.id || selectedCv?.cv_id;
            onDelete(cvId);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1, fontSize: 18 }} />
          {t("profile.delete")}
        </MenuItem>
      </Menu>

      {cvs.length === 0 && (
        <Box
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => handleUploadClick(null)}
          sx={{
            border: 2,
            borderStyle: 'dashed',
            borderColor: isDragging ? 'primary.main' : 'divider',
            borderRadius: 2,
            p: { xs: 3, sm: 4 },
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: isDragging ? 'action.hover' : 'grey.50',
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'action.hover',
            }
          }}
        >
          <CloudUploadIcon sx={{ fontSize: { xs: 36, sm: 40 }, mb: { xs: 1, sm: 1.5 }, color: isDragging ? 'primary.main' : 'text.disabled' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: { xs: 0.5, sm: 0.5 }, fontSize: { xs: '0.95rem', sm: '1rem' } }}>{t("profile.drag_drop_cv")}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: { xs: 0.75, sm: 1 } }}>{t("profile.or")}</Typography>
          <Button
            onClick={(e) => { e.stopPropagation(); handleUploadClick(null); }}
            variant="contained"
            color="primary"
            startIcon={<CloudUploadIcon />}
            sx={{ fontWeight: 600, py: { xs: 0.4, sm: 0.5 }, px: { xs: 1.5, sm: 2 }, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}
          >
            {t("profile.select_file")}
          </Button>
          <Typography variant="caption" sx={{ display: 'block', color: 'text.disabled', mt: 1 }}>
            {t("profile.pdf_max_5mb")}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
