import React from "react";
import { useTranslation } from "react-i18next";
import ExperienceSection from "./ExperienceSection";
import EducationSection from "./EducationSection";
import ProjectsSection from "./ProjectsSection";
import CertificatesSection from "./CertificatesSection";
import { Mail, Phone, MapPin, Globe, Linkedin } from "lucide-react";

const PrintableResume = React.forwardRef(({ application, studentInfo }, ref) => {
  const { t } = useTranslation();

  if (!studentInfo) return null;

  const formatDateOfBirth = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div ref={ref} className="bg-white p-8 max-w-[210mm] mx-auto text-gray-900 font-sans print:p-0 print:m-0 print:max-w-none">
      {/* Header */}
      <div className="border-b-2 border-blue-600 pb-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-wide mb-2">
          {studentInfo.full_name || application?.full_name || "Applicant Name"}
        </h1>
        <p className="text-xl text-blue-600 font-medium mb-4">
          {studentInfo.about ? studentInfo.about.substring(0, 100) + (studentInfo.about.length > 100 ? "..." : "") : "Professional Profile"}
        </p>

        <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span>{application?.email || "N/A"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>{application?.phone || studentInfo.phone || "N/A"}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{studentInfo.location || "N/A"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span>English, Việt Nam</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Left Column - Side Info */}
        <div className="col-span-1 space-y-6 border-r pr-6">
          {/* Skills */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-1 uppercase tracking-wider underline decoration-blue-600 decoration-2 underline-offset-4">
              {t("applicantDetails.professionalInfo.skillSet")}
            </h2>
            <div className="flex flex-wrap gap-2">
              {studentInfo.skills && studentInfo.skills.length > 0 ? (
                studentInfo.skills.map((skill, index) => (
                  <span key={index} className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-700">
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">N/A</span>
              )}
            </div>
          </div>

          {/* Social Links */}
          {studentInfo.social_links && studentInfo.social_links.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 border-b pb-1 uppercase tracking-wider underline decoration-blue-600 decoration-2 underline-offset-4">
                Links
              </h2>
              <div className="space-y-2">
                {studentInfo.social_links.map((link, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-600 truncate">
                    <span className="font-medium text-gray-800">{link.platform}:</span>
                    <a href={link.url} className="hover:text-blue-600">{link.url}</a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Personal */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-1 uppercase tracking-wider underline decoration-blue-600 decoration-2 underline-offset-4">
              Personal
            </h2>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Gender:</span> {studentInfo.gender || "N/A"}</p>
              <p><span className="font-medium">DOB:</span> {formatDateOfBirth(studentInfo.date_of_birth)}</p>
            </div>
          </div>
        </div>

        {/* Right Column - Main Content */}
        <div className="col-span-2 space-y-8">
          {/* Summary */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-1 uppercase tracking-wider flex items-center gap-2">
              Summary
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              {studentInfo.about || "No summary provided."}
            </p>
          </div>

          {/* Experience */}
          <ExperienceSection experiences={studentInfo.experiences || []} />

          {/* Education */}
          <EducationSection educations={studentInfo.educations || []} />

          {/* Projects */}
          <ProjectsSection projects={studentInfo.projects || []} />

          {/* Certificates */}
          <CertificatesSection certifications={studentInfo.certifications || []} />
        </div>
      </div>

      {/* Footer / Page Numbering could go here for multi-page */}
      <footer className="mt-12 pt-4 border-t text-center text-xs text-gray-400">
        Generated by SEJobs Recruitment Platform
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4;
            margin: 20mm;
          }
          /* Ensure colors are printed */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Remove header/footer added by browser */
          @page { margin: 1cm; }
        }
      `}} />
    </div>
  );
});

PrintableResume.displayName = "PrintableResume";

export default PrintableResume;
