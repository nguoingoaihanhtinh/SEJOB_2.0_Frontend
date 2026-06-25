import React from 'react';
import { Box, Typography, Chip, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';

const CRITERIA = [
  { key: 'A1', name: 'Required Skills', weight: 35, field: 'skills', desc: 'matched skills ÷ total requirements × weight' },
  { key: 'A2', name: 'Nice-to-have Skills', weight: 10, field: 'skills', desc: 'matched skills ÷ total nice-to-haves × weight' },
  { key: 'A3', name: 'Skill Depth', weight: 5, field: 'projects+experiences', desc: 'full weight if ≥50% of skills appear in projects or experience descriptions' },
  { key: 'B1', name: 'Major / Education', weight: 10, field: 'education', desc: 'IT/CS majors get full score; partially related fields get half; unrelated get 0' },
  { key: 'C1', name: 'Project Count', weight: 5, field: 'projects', desc: '2+ projects = full, 1 project = half, 0 = zero' },
  { key: 'C2', name: 'Project Relevance', weight: 10, field: 'projects', desc: 'project technologies matched against job requirements to measure alignment' },
  { key: 'C3', name: 'Project Complexity', weight: 5, field: 'projects', desc: 'projects scored on complexity keywords (microservices, cloud, ML, etc.)' },
  { key: 'D', name: 'Certifications', weight: 10, field: 'certificates', desc: '2+ certs = full, 1 cert = half, 0 = zero' },
  { key: 'E', name: 'Experience', weight: 10, field: 'experiences', desc: 'IT experience = full, partially IT = half, non-IT = 0' },
];

export default function ScoringGuide({ skills, projects, certificates, experiences, educations }) {
  const { t } = useTranslation();

  const completeness = {
    skills: Array.isArray(skills) && skills.length > 0,
    projects: Array.isArray(projects) && projects.length > 0,
    certificates: Array.isArray(certificates) && certificates.length > 0,
    experiences: Array.isArray(experiences) && experiences.length > 0,
    education: Array.isArray(educations) && educations.length > 0,
    'projects+experiences': (Array.isArray(projects) && projects.length > 0) || (Array.isArray(experiences) && experiences.length > 0),
  };

  const missingCount = CRITERIA.filter(c => !completeness[c.field]).length;
  const totalWeightMissing = CRITERIA
    .filter(c => !completeness[c.field])
    .reduce((sum, c) => sum + c.weight, 0);

  return (
    <Box sx={{
      bgcolor: 'background.paper',
      borderRadius: 2,
      border: 1,
      borderColor: 'divider',
      p: { xs: 2, sm: 3 },
      mb: 3,
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
          {t('profile.scoringGuide') || 'CV Scoring Guide'}
        </Typography>
        {missingCount > 0 && (
          <Chip
            label={`${t('profile.missingWeight') || 'Missing'}: ${totalWeightMissing}/${100} pts`}
            color="warning"
            size="small"
            sx={{ fontWeight: 600, fontSize: '0.75rem' }}
          />
        )}
        {missingCount === 0 && (
          <Chip
            label={t('profile.complete') || 'Complete'}
            color="success"
            size="small"
            sx={{ fontWeight: 600, fontSize: '0.75rem' }}
          />
        )}
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.85rem' }}>
        {t('profile.scoringGuideDesc') || 'Fill in these sections to get the best CV score. Profile data overrides CV data.'}
      </Typography>

      <Typography variant="body2" color="text.primary" sx={{ mb: 2, fontWeight: 500, fontSize: '0.85rem', fontStyle: 'italic' }}>
        This is the standard check for your profile.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {CRITERIA.map((c) => {
          const isComplete = completeness[c.field];
          return (
            <Tooltip key={c.key} title={c.name} placement="left" arrow>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1,
                borderRadius: 1,
                bgcolor: isComplete ? 'success.lighter' : 'grey.50',
                opacity: isComplete ? 1 : 0.7,
                transition: 'all 0.2s',
                '&:hover': { opacity: 1, bgcolor: isComplete ? 'success.lighter' : 'warning.lighter' },
              }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                    {c.key} — {c.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block' }}>
                    {c.desc}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>
                  {c.weight}pts
                </Typography>
                <Box sx={{
                  width: 10, height: 10, borderRadius: '50%',
                  bgcolor: isComplete ? 'success.main' : 'warning.main',
                  flexShrink: 0,
                }} />
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
}
