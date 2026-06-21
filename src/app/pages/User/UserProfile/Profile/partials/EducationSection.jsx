import React from "react";
import { Box, Typography, IconButton, Button } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

export default function EducationSection({
  educations,
  showAll,
  onToggleShowAll,
  onEdit,
  onDelete,
  onAdd,
}) {
  const { t } = useTranslation();

  const formatDate = (edu) => {
    if (edu.start_date) {
      const startDate = new Date(edu.start_date);
      const startMonth = startDate.getMonth() + 1;
      const startYear = startDate.getFullYear();

      let endDateStr = t("profile.currently_studying");
      if (edu.end_date && edu.end_date !== null) {
        const endDate = new Date(edu.end_date);
        const endMonth = endDate.getMonth() + 1;
        const endYear = endDate.getFullYear();
        endDateStr = `${String(endMonth).padStart(2, "0")}/${endYear}`;
      }

      const startDateStr = `${String(startMonth).padStart(2, "0")}/${startYear}`;
      return `${startDateStr} - ${endDateStr}`;
    }

    const startMonth = edu.startMonth;
    const startYear = edu.startYear;
    const endMonth = edu.endMonth;
    const endYear = edu.endYear;
    const isCurrentlyStudying = edu.isCurrentlyStudying;

    const startDate = startMonth ? `${String(startMonth).padStart(2, "0")}/${startYear}` : startYear;
    const endDate =
      endYear === "Present" || isCurrentlyStudying
        ? t("profile.currently_studying")
        : endMonth
          ? `${String(endMonth).padStart(2, "0")}/${endYear}`
          : endYear;
    return `${startDate} - ${endDate}`;
  };

  const displayedEducations = showAll ? educations : educations.slice(0, 2);
  const remainingCount = educations.length - 2;

  return (
    <Box sx={{ bgcolor: "background.paper", p: 4, borderRadius: 2, border: 1, borderColor: "divider", mb: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {t("profile.education")}
          {educations.length > 0 && (
            <Typography component="span" variant="body2" sx={{ ml: 1, color: "text.secondary", fontWeight: 400 }}>
              ({educations.length})
            </Typography>
          )}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            onClick={onAdd}
            size="small"
            sx={{ color: "primary.main", "&:hover": { bgcolor: "primary.lighter" } }}
          >
            <AddIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      {educations.length === 0 ? (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {t("profile.education_empty")}
        </Typography>
      ) : (
        <>
          {displayedEducations.map((edu, index) => (
            <Box
              key={edu.id}
              sx={{
                pb: displayedEducations.length > 1 && index < displayedEducations.length - 1 ? 3 : 0,
                mb: displayedEducations.length > 1 && index < displayedEducations.length - 1 ? 3 : 0,
                borderBottom:
                  displayedEducations.length > 1 && index < displayedEducations.length - 1 ? "1px solid" : "none",
                borderColor: "divider",
                "&:last-child": { mb: 0, pb: 0 },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {edu.school}
                </Typography>
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <IconButton
                    onClick={() => onEdit(edu)}
                    size="small"
                    sx={{ p: 0.5, color: "primary.main", "&:hover": { bgcolor: "primary.lighter" } }}
                  >
                    <EditIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  <IconButton
                    onClick={() => onDelete(edu.id)}
                    size="small"
                    sx={{ p: 0.5, color: "text.secondary", "&:hover": { bgcolor: "grey.100" } }}
                  >
                    <DeleteIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.5 }}>
                {edu.degree} {edu.major && `- ${edu.major}`}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
                {formatDate(edu)}
              </Typography>
              {edu.description && (
                <Typography variant="body2" sx={{ color: "text.primary", lineHeight: 1.6 }}>
                  {edu.description}
                </Typography>
              )}
            </Box>
          ))}

          {!showAll && educations.length > 2 && (
            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Button
                onClick={onToggleShowAll}
                variant="text"
                sx={{ color: "primary.main", fontWeight: 500, "&:hover": { bgcolor: "primary.lighter" } }}
              >
                {t("profile.show_more_educations", { count: remainingCount })}
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
