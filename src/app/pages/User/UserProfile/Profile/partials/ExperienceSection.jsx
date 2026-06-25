import React from 'react';
import { Box, Typography, IconButton, Button, Alert } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, InfoOutlined } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export default function ExperienceSection({ experiences, showAll, onToggleShowAll, onEdit, onDelete, onAdd }) {
  const { t } = useTranslation();
  
  const formatDate = (startMonth, startYear, endMonth, endYear, isCurrentlyWorking) => {
    const fmt = (m, y) => (m ? `${String(m).padStart(2, '0')}/${y}` : y || '');
    const start = fmt(startMonth, startYear);
    const end = isCurrentlyWorking || endYear === 'Present' ? t("profile.currently") : fmt(endMonth, endYear);
    if (!start && !end) return '';
    return `${start}${start && end ? ' - ' : ''}${end}`;
  };

  const displayedExperiences = showAll ? experiences : experiences.slice(0, 2);
  const remainingCount = experiences.length - 2;

  return (
    <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 2, border: 1, borderColor: 'divider', mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {t("profile.work_experience")}
          {experiences.length > 0 && (
            <Typography component="span" variant="body2" sx={{ ml: 1, color: 'text.secondary', fontWeight: 400 }}>
              ({experiences.length})
            </Typography>
          )}
        </Typography>
        <IconButton onClick={onAdd} size="small" sx={{ color: 'primary.main', '&:hover': { bgcolor: 'primary.lighter' } }}>
          <AddIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      <Alert severity="info" icon={<InfoOutlined fontSize="small" />} sx={{ mb: 2, py: 0.5, '& .MuiAlert-message': { fontSize: 13 } }}>
        Skills mentioned in your experience description help evaluate your overall score. List your strongest skills confidently.
      </Alert>

      {experiences.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t("profile.work_experience_empty")}
        </Typography>
      ) : (
        <>
          {displayedExperiences.map((exp, index) => (
            <Box
              key={exp.id}
              sx={{
                pb: displayedExperiences.length > 1 && index < displayedExperiences.length - 1 ? 3 : 0,
                mb: displayedExperiences.length > 1 && index < displayedExperiences.length - 1 ? 3 : 0,
                borderBottom: displayedExperiences.length > 1 && index < displayedExperiences.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
                '&:last-child': { mb: 0, pb: 0 }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{exp.role}</Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton
                    onClick={() => onEdit(exp)}
                    size="small"
                    sx={{ p: 0.5, color: 'primary.main', '&:hover': { bgcolor: 'primary.lighter' } }}
                  >
                    <EditIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  <IconButton
                    onClick={() => onDelete(exp.id)}
                    size="small"
                    sx={{ p: 0.5, color: 'text.secondary', '&:hover': { bgcolor: 'grey.100' } }}
                  >
                    <DeleteIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>{exp.company}</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                {formatDate(exp.startMonth, exp.startYear, exp.endMonth, exp.endYear, exp.isCurrentlyWorking)}
              </Typography>
              {/* {exp.location && (
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>{exp.location}</Typography>
              )} */}
              {exp.description && (
                <Typography
                  variant="body2"
                  sx={{ color: 'text.primary', lineHeight: 1.6, whiteSpace: 'pre-line' }}
                  dangerouslySetInnerHTML={{ __html: exp.description }}
                />
              )}
            </Box>
          ))}

          {!showAll && experiences.length > 2 && (
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button
                onClick={onToggleShowAll}
                variant="text"
                sx={{ color: 'primary.main', fontWeight: 500, '&:hover': { bgcolor: 'primary.lighter' } }}
              >
                {t("profile.show_more_experiences", { count: remainingCount })}
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
