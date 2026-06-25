import { useTranslation } from 'react-i18next';
import { Briefcase } from 'lucide-react';

export default function ExperienceSection({ experiences }) {
  const { t } = useTranslation();
  
  const formatDate = (startDate, endDate, isCurrentlyWorking) => {
    const formatDateString = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${year}`;
    };
    
    const start = formatDateString(startDate);
    const end = isCurrentlyWorking ? t("profile.currently") : formatDateString(endDate);
    if (!start && !end) return '';
    return `${start}${start && end ? ' - ' : ''}${end}`;
  };

  return (
    <div className='space-y-2'>
      <div className="flex items-center justify-between">
        <h5 className="font-semibold flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-blue-600" />
          {t("profile.work_experience")}
          {experiences.length > 0 && (
            <span className="ml-2 text-sm text-gray-500 font-normal">
              ({experiences.length})
            </span>
          )}
        </h5>
      </div>

      {experiences.length === 0 ? (
        <p className="text-sm text-gray-400">
          {t("profile.work_experience_empty_company") || "Not provided"}
        </p>
      ) : (
        experiences.map((exp, index) => (
          <div key={exp.id} className={``}>
            <div className='flex flex-col md:flex-row md:justify-between lg:items-center lg:gap-2'>
              <div className='flex flex-1 flex-col lg:flex-row lg:justify-between lg:items-center'>
                <p className="font-semibold italic">{exp.position}</p>
                <p className="text-sm font-semibold">{exp.company}</p>
              </div>
              <span className="hidden lg:inline text-sm font-semibold">|</span>
              <p className="text-sm text-gray-500">
                {formatDate(exp.start_date, exp.end_date, exp.is_current)}
              </p>
            </div>
            {exp.description && (
              <p
                className="text-sm leading-relaxed whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: exp.description }}
              />
            )}
          </div>
        ))
      )}
    </div>
  );
}
