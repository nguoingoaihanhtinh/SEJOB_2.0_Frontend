import { useTranslation } from 'react-i18next';
import { GraduationCap } from 'lucide-react';

export default function EducationSection({ educations }) {
  const { t } = useTranslation();
  
  const formatDate = (edu) => {
    // Handle backend date format (start_date: "2021-09-01", end_date: null for present)
    if (edu.start_date) {
      const startDate = new Date(edu.start_date);
      const startMonth = startDate.getMonth() + 1;
      const startYear = startDate.getFullYear();

      let endDateStr = t("profile.currently_studying");
      if (edu.end_date && edu.end_date !== null) {
        const endDate = new Date(edu.end_date);
        const endMonth = endDate.getMonth() + 1;
        const endYear = endDate.getFullYear();
        endDateStr = `${String(endMonth).padStart(2, '0')}/${endYear}`;
      }

      const startDateStr = `${String(startMonth).padStart(2, '0')}/${startYear}`;
      return `${startDateStr} - ${endDateStr}`;
    }

    // Fallback to old format (startMonth, startYear, etc.)
    const startMonth = edu.startMonth;
    const startYear = edu.startYear;
    const endMonth = edu.endMonth;
    const endYear = edu.endYear;
    const isCurrentlyStudying = edu.isCurrentlyStudying;

    const startDate = startMonth ? `${String(startMonth).padStart(2, '0')}/${startYear}` : startYear;
    const endDate = (endYear === 'Present' || isCurrentlyStudying)
      ? t("profile.currently_studying")
      : (endMonth ? `${String(endMonth).padStart(2, '0')}/${endYear}` : endYear);
    return `${startDate} - ${endDate}`;
  };

  return (
    <div className='space-y-2'>
      <div className="flex items-center justify-between">
        <h5 className="font-semibold flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-blue-600" />
          {t("profile.education")}
          {educations.length > 0 && (
            <span className="ml-2 text-sm text-gray-500 font-normal">
              ({educations.length})
            </span>
          )}
        </h5>
      </div>

      {educations.length === 0 ? (
        <p className="text-sm text-gray-400">
          {t("profile.education_empty_company") || "Not provided"}
        </p>
      ) : (
        educations.map((edu, index) => (
          <div key={edu.id} className="space-y-1">
            <div className='flex flex-col md:flex-row md:justify-between'>
              <div>
                <p className="font-semibold italic">{edu.school}</p>
                <p className="text-sm text-gray-500">
                  {edu.degree} {edu.major && `- ${edu.major}`}
                </p>
              </div>
              <p className="text-sm text-gray-500">
                {formatDate(edu)}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
