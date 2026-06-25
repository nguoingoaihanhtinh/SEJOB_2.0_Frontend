import { Link, Award } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function CertificatesSection({ certifications }) {
  const { t } = useTranslation();

  const formatDate = (cert) => {
    // Handle backend date format (issue_date: "2021-09-01")
    if (cert.issue_date) {
      const issueDate = new Date(cert.issue_date);
      const issueMonth = issueDate.getMonth() + 1;
      const issueYear = issueDate.getFullYear();
      return `${String(issueMonth).padStart(2, '0')}/${issueYear}`;
    }

    // Fallback to old format (issueMonth, issueYear)
    const issueMonth = cert.issueMonth;
    const issueYear = cert.issueYear;
    return issueMonth ? `${String(issueMonth).padStart(2, '0')}/${issueYear}` : issueYear;
  };

  return (
    <div className='space-y-2'>
      <div className="flex items-center justify-between">
        <h5 className="font-semibold flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-600" />
          {t("profile.certificates")}
        </h5>
      </div>

      {certifications?.length === 0 ? (
        <p className="text-sm text-gray-400">
          {t("profile.certificates_empty_company") || "Not provided"}
        </p>
      ) : (
        certifications?.map((cert, index) => (
          <div key={cert.id} className="space-y-1">
            <div className='flex flex-col md:flex-row md:justify-between'>
              <div>
                <p className="font-semibold italic">{cert.name}</p>
                <p className="text-sm text-gray-500">{cert.organization}</p>
              </div>
              <p className="text-sm text-gray-500">
                {t("profile.issued")}: {formatDate(cert)}
              </p>
            </div>
            {cert.description && (
              <p
                className="text-sm leading-relaxed whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: cert.description }}
              />
            )}
            {(cert.url || cert.certificate_url || cert.certification_url || cert.certificateUrl) && (
              <div className="flex items-center gap-1 mt-1">
                <Link size={16} />
                <a
                  href={cert.url || cert.certificate_url || cert.certification_url || cert.certificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  {cert.url || cert.certificate_url || cert.certification_url || cert.certificateUrl}
                </a>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
