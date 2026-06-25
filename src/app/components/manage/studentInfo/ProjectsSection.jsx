
import { Link, Rocket } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ProjectsSection({ projects }) {
  const { t } = useTranslation();

  const formatDate = (project) => {
    // Handle backend date format (start_date: "2021-09-01", end_date: null for present)
    if (project.start_date) {
      const startDate = new Date(project.start_date);
      const startMonth = startDate.getMonth() + 1;
      const startYear = startDate.getFullYear();

      let endDateStr = t("profile.currently_studying");
      if (project.end_date && project.end_date !== null) {
        const endDate = new Date(project.end_date);
        const endMonth = endDate.getMonth() + 1;
        const endYear = endDate.getFullYear();
        endDateStr = `${String(endMonth).padStart(2, '0')}/${endYear}`;
      }

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
    <div className='space-y-2'>
      <div className="flex items-center justify-between">
        <h5 className="font-semibold flex items-center gap-2">
          <Rocket className="w-5 h-5 text-blue-600" />
          {t("profile.featured_projects")}
        </h5>
      </div>

      {projects.length === 0 ? (
        <p className="text-sm text-gray-400">
          {t("profile.featured_projects_empty_company") || "Not provided"}
        </p>
      ) : (
        projects.map((project, index) => {
          const website = project.websiteLink || project.website || project.website_link;

          return (
            <div key={project.id} className="space-y-1">
              <div className='flex flex-col md:flex-row md:justify-between'>
                <p className="font-semibold italic">{project.name}</p>
                <p className="text-sm text-gray-500">
                  {formatDate(project)}
                </p>
              </div>
              {project.description && (
                <p
                  className="text-sm leading-relaxed whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: project.description }}
                />
              )}
              {website && (
                <div className="flex items-center gap-1 mt-1">
                  <Link size={16} />
                  <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {website}
                  </a>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
