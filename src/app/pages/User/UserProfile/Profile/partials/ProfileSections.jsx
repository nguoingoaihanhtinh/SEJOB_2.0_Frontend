import React from 'react';
import { Box, Typography, IconButton, Chip, Link, Alert } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Link as LinkIcon, InfoOutlined } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// Skills Section
export function SkillsSection({ skills, onEdit, onDelete, onAdd }) {
  const { t } = useTranslation();

  // Ensure skills is always an array to prevent undefined errors
  const skillsArray = Array.isArray(skills) ? skills : [];

  // Check if skills are simple strings (from API) or objects (grouped format)
  const isSimpleArray = skillsArray.length > 0 && typeof skillsArray[0] === 'string';

  return (
    <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 2, border: 1, borderColor: 'divider', mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>{t("profile.skills")}</Typography>
        <IconButton onClick={onAdd} size="small" sx={{ color: 'primary.main', '&:hover': { bgcolor: 'primary.lighter' } }}>
          <AddIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {skillsArray.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t("profile.skills_empty")}
        </Typography>
      ) : isSimpleArray ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {skillsArray.map((skill, index) => (
            <Chip
              key={index}
              label={skill}
              onDelete={onDelete ? () => onDelete(skill) : undefined}
              sx={{
                bgcolor: '#E8E0FF',
                color: '#5E35B1',
                fontWeight: 500,
                borderRadius: 2
              }}
            />
          ))}
        </Box>
      ) : (
        skillsArray.map((skillGroup, index) => (
          <Box
            key={skillGroup.id}
            sx={{
              pb: skillsArray.length > 1 && index < skillsArray.length - 1 ? 3 : 0,
              mb: skillsArray.length > 1 && index < skillsArray.length - 1 ? 3 : 0,
              borderBottom: skillsArray.length > 1 && index < skillsArray.length - 1 ? '1px solid' : 'none',
              borderColor: 'divider',
              '&:last-child': { mb: 0, pb: 0 }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{skillGroup.groupName || skillGroup.name}</Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton
                  onClick={() => onEdit(skillGroup)}
                  size="small"
                  sx={{ p: 0.5, color: 'primary.main', '&:hover': { bgcolor: 'primary.lighter' } }}
                >
                  <EditIcon sx={{ fontSize: 18 }} />
                </IconButton>
                <IconButton
                  onClick={() => onDelete(skillGroup.id)}
                  size="small"
                  sx={{ p: 0.5, color: 'text.secondary', '&:hover': { bgcolor: 'grey.100' } }}
                >
                  <DeleteIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {skillGroup.skills?.map((skill, index) => (
                <Chip
                  key={index}
                  label={`${skill.name} (${skill.experience})`}
                  sx={{ bgcolor: '#E8E0FF', color: '#5E35B1', fontWeight: 500, borderRadius: 2 }}
                />
              ))}
            </Box>
          </Box>
        ))
      )}
    </Box>
  );
}

// Languages Section
export function LanguagesSection({ languages, onEdit }) {
  const { t } = useTranslation();

  return (
    <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 2, border: 1, borderColor: 'divider', mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>{t("profile.languages")}</Typography>
        <IconButton onClick={onEdit} size="small" sx={{ color: 'primary.main', '&:hover': { bgcolor: 'primary.lighter' } }}>
          <AddIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {languages.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t("profile.languages_empty")}
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {languages.map((lang, index) => (
            <Chip
              key={index}
              label={`${lang.language} (${lang.level})`}
              sx={{ bgcolor: '#E8E0FF', color: '#5E35B1', fontWeight: 500, borderRadius: 2 }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

// Projects Section
export function ProjectsSection({ projects, onEdit, onDelete, onAdd }) {
  const { t } = useTranslation();

  const formatDate = (project) => {
    // Handle backend date format (start_date: "2021-09-01", end_date: null for present)
    if (project.start_date) {
      const startDate = new Date(project.start_date);
      const startMonth = startDate.getMonth() + 1; // getMonth() returns 0-11
      const startYear = startDate.getFullYear();

      let endDateStr = t("profile.currently_studying");
      // If end_date exists and is not null, format it
      if (project.end_date && project.end_date !== null) {
        const endDate = new Date(project.end_date);
        const endMonth = endDate.getMonth() + 1;
        const endYear = endDate.getFullYear();
        endDateStr = `${String(endMonth).padStart(2, '0')}/${endYear}`;
      }
      // If end_date is null or undefined, it means "HIỆN TẠI" (currently working)

      const startDateStr = `${String(startMonth).padStart(2, '0')}/${startYear}`;
      return `${startDateStr} - ${endDateStr}`;
    }

    // Fallback to old format (startMonth, startYear, etc.)
    const startMonth = project.startMonth;
    const startYear = project.startYear;
    const endMonth = project.endMonth;
    const endYear = project.endYear;
    const isCurrentlyWorking = project.isCurrentlyWorking;

    const startDate = startMonth ? `${String(startMonth).padStart(2, '0')}/${startYear}` : startYear;
    const endDate = isCurrentlyWorking ? t("profile.currently_studying") : (endMonth ? `${String(endMonth).padStart(2, '0')}/${endYear}` : endYear);
    return `${startDate} - ${endDate}`;
  };

  return (
    <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 2, border: 1, borderColor: 'divider', mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>{t("profile.featured_projects")}</Typography>
        <IconButton onClick={onAdd} size="small" sx={{ color: 'primary.main', '&:hover': { bgcolor: 'primary.lighter' } }}>
          <AddIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      <Alert severity="info" icon={<InfoOutlined fontSize="small" />} sx={{ mb: 2, py: 0.5, '& .MuiAlert-message': { fontSize: 13 } }}>
        The tech stack you list in your projects is used to evaluate your skill depth and project complexity. Highlight your best skills here.
      </Alert>

      {projects.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t("profile.featured_projects_empty")}
        </Typography>
      ) : (
        projects.map((project, index) => {
          const website = project.websiteLink || project.website || project.website_link;

          return (
            <Box
              key={project.id}
              sx={{
                pb: projects.length > 1 && index < projects.length - 1 ? 3 : 0,
                mb: projects.length > 1 && index < projects.length - 1 ? 3 : 0,
                borderBottom: projects.length > 1 && index < projects.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
                '&:last-child': { mb: 0, pb: 0 }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{project.name}</Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton
                    onClick={() => onEdit(project)}
                    size="small"
                    sx={{ p: 0.5, color: 'primary.main', '&:hover': { bgcolor: 'primary.lighter' } }}
                  >
                    <EditIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  <IconButton
                    onClick={() => onDelete(project.id)}
                    size="small"
                    sx={{ p: 0.5, color: 'text.secondary', '&:hover': { bgcolor: 'grey.100' } }}
                  >
                    <DeleteIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                {formatDate(project)}
              </Typography>
              {project.description && (
                <Typography
                  variant="body2"
                  sx={{ color: 'text.primary', lineHeight: 1.6, mb: 1 }}
                  dangerouslySetInnerHTML={{ __html: project.description }}
                />
              )}
              {website && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                  <LinkIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                  <Link
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="body2"
                    sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    {website}
                  </Link>
                </Box>
              )}
            </Box>
          );
        })
      )}
    </Box>
  );
}

// Certificates Section
export function CertificatesSection({ certificates, onEdit, onDelete, onAdd }) {
  const { t } = useTranslation();

  const formatDate = (cert) => {
    // Handle backend date format (issue_date: "2021-09-01")
    if (cert.issue_date) {
      const issueDate = new Date(cert.issue_date);
      const issueMonth = issueDate.getMonth() + 1; // getMonth() returns 0-11
      const issueYear = issueDate.getFullYear();
      return `${String(issueMonth).padStart(2, '0')}/${issueYear}`;
    }

    // Fallback to old format (issueMonth, issueYear)
    const issueMonth = cert.issueMonth;
    const issueYear = cert.issueYear;
    return issueMonth ? `${String(issueMonth).padStart(2, '0')}/${issueYear}` : issueYear;
  };

  return (
    <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 2, border: 1, borderColor: 'divider', mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>{t("profile.certificates")}</Typography>
        <IconButton onClick={onAdd} size="small" sx={{ color: 'primary.main', '&:hover': { bgcolor: 'primary.lighter' } }}>
          <AddIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {certificates.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t("profile.certificates_empty")}
        </Typography>
      ) : (
        certificates.map((cert, index) => (
          <Box
            key={cert.id}
            sx={{
              pb: certificates.length > 1 && index < certificates.length - 1 ? 3 : 0,
              mb: certificates.length > 1 && index < certificates.length - 1 ? 3 : 0,
              borderBottom: certificates.length > 1 && index < certificates.length - 1 ? '1px solid' : 'none',
              borderColor: 'divider',
              '&:last-child': { mb: 0, pb: 0 }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{cert.name}</Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton
                  onClick={() => onEdit(cert)}
                  size="small"
                  sx={{ p: 0.5, color: 'primary.main', '&:hover': { bgcolor: 'primary.lighter' } }}
                >
                  <EditIcon sx={{ fontSize: 18 }} />
                </IconButton>
                <IconButton
                  onClick={() => onDelete(cert.id)}
                  size="small"
                  sx={{ p: 0.5, color: 'text.secondary', '&:hover': { bgcolor: 'grey.100' } }}
                >
                  <DeleteIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>{cert.organization}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>{t("profile.issued")}: {formatDate(cert)}</Typography>
            {cert.description && (
              <Typography
                variant="body2"
                sx={{ color: 'text.primary', lineHeight: 1.6, mb: 1 }}
                dangerouslySetInnerHTML={{ __html: cert.description }}
              />
            )}
            {(cert.url || cert.certificate_url || cert.certification_url || cert.certificateUrl) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                <LinkIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                <Link
                  href={cert.url || cert.certificate_url || cert.certification_url || cert.certificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="body2"
                  sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  {cert.url || cert.certificate_url || cert.certification_url || cert.certificateUrl}
                </Link>
              </Box>
            )}
          </Box>
        ))
      )}
    </Box>
  );
}

// Awards Section
export function AwardsSection({ awards, onEdit, onDelete, onAdd }) {
  const { t } = useTranslation();

  const formatDate = (issueMonth, issueYear) => {
    return issueMonth ? `${String(issueMonth).padStart(2, '0')}/${issueYear}` : issueYear;
  };

  return (
    <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 2, border: 1, borderColor: 'divider', mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>{t("profile.awards")}</Typography>
        <IconButton onClick={onAdd} size="small" sx={{ color: 'primary.main', '&:hover': { bgcolor: 'primary.lighter' } }}>
          <AddIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {awards.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t("profile.awards_empty")}
        </Typography>
      ) : (
        awards.map((award, index) => (
          <Box
            key={award.id}
            sx={{
              pb: awards.length > 1 && index < awards.length - 1 ? 3 : 0,
              mb: awards.length > 1 && index < awards.length - 1 ? 3 : 0,
              borderBottom: awards.length > 1 && index < awards.length - 1 ? '1px solid' : 'none',
              borderColor: 'divider',
              '&:last-child': { mb: 0, pb: 0 }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{award.awardName || award.name}</Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton
                  onClick={() => onEdit(award)}
                  size="small"
                  sx={{ p: 0.5, color: 'primary.main', '&:hover': { bgcolor: 'primary.lighter' } }}
                >
                  <EditIcon sx={{ fontSize: 18 }} />
                </IconButton>
                <IconButton
                  onClick={() => onDelete(award.id)}
                  size="small"
                  sx={{ p: 0.5, color: 'text.secondary', '&:hover': { bgcolor: 'grey.100' } }}
                >
                  <DeleteIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
              {award.awardOrganization || award.organization}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              {t("profile.issued")}: {formatDate(award.issueMonth, award.issueYear)}
            </Typography>
            {award.description && (
              <Typography
                variant="body2"
                sx={{ color: 'text.primary', lineHeight: 1.6 }}
                dangerouslySetInnerHTML={{ __html: award.description }}
              />
            )}
          </Box>
        ))
      )}
    </Box>
  );
}
