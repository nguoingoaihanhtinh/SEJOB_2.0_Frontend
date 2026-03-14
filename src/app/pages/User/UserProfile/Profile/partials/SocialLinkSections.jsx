import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Collapse,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  CircularProgress,
  Tooltip,
  Divider,
  alpha,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import FacebookIcon from '@mui/icons-material/Facebook';
import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LanguageIcon from '@mui/icons-material/Language';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const PLATFORMS = [
  { value: 'linkedin', label: 'LinkedIn', icon: <LinkedInIcon fontSize="small" />, color: '#0A66C2' },
  { value: 'facebook', label: 'Facebook', icon: <FacebookIcon fontSize="small" />, color: '#1877F2' },
  { value: 'github', label: 'GitHub', icon: <GitHubIcon fontSize="small" />, color: '#24292F' },
  { value: 'twitter', label: 'Twitter / X', icon: <TwitterIcon fontSize="small" />, color: '#1D9BF0' },
  { value: 'instagram', label: 'Instagram', icon: <InstagramIcon fontSize="small" />, color: '#E1306C' },
  { value: 'other', label: 'Khác', icon: <LanguageIcon fontSize="small" />, color: '#6B7280' },
];

function getPlatformMeta(platform) {
  return PLATFORMS.find((p) => p.value === platform) ?? PLATFORMS[PLATFORMS.length - 1];
}

function EditRow({ initialPlatform, initialUrl = '', onSave, onCancel, loading, disabledPlatforms = [], isEdit }) {
  const [platform, setPlatform] = useState(initialPlatform ?? 'linkedin');
  const [url, setUrl] = useState(initialUrl);
  const [urlError, setUrlError] = useState('');

  const validate = () => {
    if (!url.trim()) { setUrlError('URL không được để trống'); return false; }
    try { new URL(url); } catch { setUrlError('URL không hợp lệ'); return false; }
    setUrlError('');
    return true;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.5,
        alignItems: 'flex-start',
        p: '12px 16px',
        borderRadius: '10px',
        background: 'linear-gradient(135deg, #f5f7ff 0%, #eef0fb 100%)',
        border: '1.5px dashed #c7cef5',
        mt: 1,
      }}
    >
      <FormControl size="small" sx={{ minWidth: 150 }} disabled={isEdit}>
        <InputLabel>Nền tảng</InputLabel>
        <Select
          value={platform}
          label="Nền tảng"
          onChange={(e) => setPlatform(e.target.value)}
          sx={{ borderRadius: '8px', fontSize: 13 }}
        >
          {PLATFORMS.map((p) => (
            <MenuItem
              key={p.value}
              value={p.value}
              disabled={!isEdit && disabledPlatforms.includes(p.value)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: p.color }}>
                {p.icon}
                <span style={{ color: '#1e1e2e', fontWeight: 500 }}>{p.label}</span>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        size="small"
        label="URL"
        placeholder="https://..."
        value={url}
        onChange={(e) => { setUrl(e.target.value); setUrlError(''); }}
        error={!!urlError}
        helperText={urlError}
        sx={{
          flex: 1,
          '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: 13 },
        }}
      />

      <Box sx={{ display: 'flex', gap: 0.5, pt: 0.5 }}>
        <Tooltip title="Lưu">
          <span>
            <IconButton
              size="small"
              onClick={() => { if (validate()) onSave(platform, url); }}
              disabled={loading}
              sx={{
                bgcolor: '#4f46e5',
                color: '#fff',
                borderRadius: '8px',
                width: 32,
                height: 32,
                '&:hover': { bgcolor: '#4338ca' },
                '&:disabled': { bgcolor: '#c7cef5', color: '#fff' },
              }}
            >
              {loading ? <CircularProgress size={14} color="inherit" /> : <CheckIcon sx={{ fontSize: 16 }} />}
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Huỷ">
          <IconButton
            size="small"
            onClick={onCancel}
            sx={{
              bgcolor: '#f3f4f6',
              color: '#6b7280',
              borderRadius: '8px',
              width: 32,
              height: 32,
              '&:hover': { bgcolor: '#e5e7eb' },
            }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

export default function SocialLinkSections({ currentUser, handlers }) {
  const [links, setLinks] = useState([]);
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState(null);
  const [loadingPlatform, setLoadingPlatform] = useState(null);
  const [savingAdd, setSavingAdd] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  useEffect(() => {
    if (!currentUser?.user_id) return;
    fetchLinks();
  }, [currentUser]);

  const fetchLinks = async () => {
    if (!handlers?.handleGetSocialLinks) return;
    setFetchLoading(true);
    try {
      const data = await handlers.handleGetSocialLinks(currentUser.user_id);
      setLinks(Array.isArray(data?.data) ? data?.data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleAdd = async (platform, url) => {
    if (!handlers?.handleCreateSocialLink) return;
    setSavingAdd(true);
    try {
      const data = await handlers.handleCreateSocialLink(currentUser.user_id, { platform, url });
      const created = data?.data;
      setLinks((prev) => [...prev, created]);
      setAdding(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingAdd(false);
    }
  };

  const handleEdit = async (platform, url) => {
    if (!handlers?.handleUpdateSocialLink) return;
    setLoadingPlatform(platform);
    try {
      const data = await handlers.handleUpdateSocialLink(currentUser.user_id, { platform, url });
      const updated = data?.data;
      setLinks((prev) => prev.map((l) => (l.platform === platform ? updated : l)));
      setEditingPlatform(null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPlatform(null);
    }
  };

  const handleDelete = async (platform) => {
    if (!handlers?.handleDeleteSocialLink) return;
    setLoadingPlatform(platform);
    try {
      await handlers.handleDeleteSocialLink(currentUser.user_id, { platform });
      setLinks((prev) => prev.filter((l) => l.platform !== platform));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPlatform(null);
    }
  };

  const existingPlatforms = links.map((l) => l.platform);

  return (
    <Box
      sx={{
        borderRadius: '14px',
        border: '1.5px solid #e8eaf6',
        background: '#fff',
        boxShadow: '0 2px 12px 0 rgba(79,70,229,0.06)',
        overflow: 'hidden',
        mb: 2,
        fontFamily: "'DM Sans', 'Be Vietnam Pro', sans-serif",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2.5,
          cursor: 'pointer',
          userSelect: 'none',
          '&:hover': { bgcolor: alpha('#4f46e5', 0.025) },
          transition: 'background 0.15s',
        }}
        onClick={() => setOpen((v) => !v)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <LinkIcon sx={{ color: '#4f46e5', fontSize: 22 }} />
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#1e1e2e', letterSpacing: '-0.2px' }}>
              Mạng xã hội
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: '#9ca3af', mt: 0.2 }}>
              Thể hiện các liên kết mạng xã hội của bạn
            </Typography>
          </Box>
          {links.length > 0 && (
            <Chip
              label={links.length}
              size="small"
              sx={{
                bgcolor: '#ede9fe',
                color: '#4f46e5',
                fontWeight: 700,
                fontSize: 11,
                height: 20,
                ml: 0.5,
              }}
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="Thêm liên kết" placement="top">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(true);
                setAdding(true);
              }}
              sx={{
                color: '#4f46e5',
                borderRadius: '8px',
                '&:hover': { bgcolor: '#ede9fe' },
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <KeyboardArrowDownIcon
            sx={{
              color: '#9ca3af',
              fontSize: 20,
              transition: 'transform 0.25s',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </Box>
      </Box>

      {/* Body */}
      <Collapse in={open} timeout={220}>
        <Divider sx={{ borderColor: '#f0f0f7' }} />
        <Box sx={{ px: 3, py: 2 }}>
          {fetchLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={24} sx={{ color: '#4f46e5' }} />
            </Box>
          ) : links.length === 0 && !adding ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 4,
                color: '#c4c9e2',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <LinkIcon sx={{ fontSize: 36, opacity: 0.4 }} />
              <Typography sx={{ fontSize: 13.5, color: '#b0b7d4' }}>
                Chưa có liên kết nào. Nhấn{' '}
                <span
                  style={{ color: '#4f46e5', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => setAdding(true)}
                >
                  + Thêm
                </span>{' '}
                để bắt đầu.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {links.map((link, idx) => {
                const meta = getPlatformMeta(link.platform);
                const isEditing = editingPlatform === link.platform;
                const isLoading = loadingPlatform === link.platform;

                return (
                  <Box key={link.platform}>
                    {idx > 0 && <Divider sx={{ borderColor: '#f5f5fb', my: 0.5 }} />}
                    {isEditing ? (
                      <EditRow
                        isEdit
                        initialPlatform={link.platform}
                        initialUrl={link.url}
                        onSave={(p, u) => handleEdit(p, u)}
                        onCancel={() => setEditingPlatform(null)}
                        loading={isLoading}
                      />
                    ) : (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          py: 1.2,
                          px: 1,
                          borderRadius: '8px',
                          '&:hover': { bgcolor: '#f8f8fc' },
                          transition: 'background 0.12s',
                          '&:hover .actions': { opacity: 1 },
                        }}
                      >
                        <Box
                          sx={{
                            width: 34,
                            height: 34,
                            borderRadius: '9px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: alpha(meta.color, 0.1),
                            color: meta.color,
                            flexShrink: 0,
                          }}
                        >
                          {meta.icon}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1e1e2e', lineHeight: 1.3 }}>
                            {meta.label}
                          </Typography>
                          <Typography
                            component="a"
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              fontSize: 12,
                              color: '#4f46e5',
                              textDecoration: 'none',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              display: 'block',
                              '&:hover': { textDecoration: 'underline' },
                            }}
                          >
                            {link.url}
                          </Typography>
                        </Box>
                        <Box
                          className="actions"
                          sx={{
                            display: 'flex',
                            gap: 0.5,
                            opacity: 0,
                            transition: 'opacity 0.15s',
                            flexShrink: 0,
                          }}
                        >
                          <Tooltip title="Chỉnh sửa">
                            <IconButton
                              size="small"
                              onClick={() => setEditingPlatform(link.platform)}
                              disabled={isLoading}
                              sx={{
                                color: '#6b7280',
                                borderRadius: '7px',
                                width: 28,
                                height: 28,
                                '&:hover': { bgcolor: '#ede9fe', color: '#4f46e5' },
                              }}
                            >
                              <EditOutlinedIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xoá">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(link.platform)}
                                disabled={isLoading}
                                sx={{
                                  color: '#6b7280',
                                  borderRadius: '7px',
                                  width: 28,
                                  height: 28,
                                  '&:hover': { bgcolor: '#fee2e2', color: '#ef4444' },
                                }}
                              >
                                {isLoading ? (
                                  <CircularProgress size={13} />
                                ) : (
                                  <DeleteOutlineIcon sx={{ fontSize: 15 }} />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          )}

          {/* Add form */}
          {adding && (
            <EditRow
              disabledPlatforms={existingPlatforms}
              onSave={handleAdd}
              onCancel={() => setAdding(false)}
              loading={savingAdd}
            />
          )}

          {/* Add button at bottom */}
          {!adding && open && existingPlatforms.length < PLATFORMS.length && (
            <Button
              startIcon={<AddIcon />}
              onClick={() => setAdding(true)}
              size="small"
              sx={{
                mt: links.length > 0 ? 1.5 : 0,
                color: '#4f46e5',
                fontWeight: 600,
                fontSize: 13,
                borderRadius: '8px',
                px: 1.5,
                textTransform: 'none',
                '&:hover': { bgcolor: '#ede9fe' },
              }}
            >
              Thêm liên kết
            </Button>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}