import { FileText } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ResumeTab({ application, studentInfo }) {
    const { t } = useTranslation();

    // Priority: CV submitted with this application > student's profile CV
    const resumeUrl = application?.resume_url || studentInfo?.cv?.[0]?.filepath || null;

    return (
        <div className={`w-full ${resumeUrl ? 'h-[800px]' : 'h-64'} border rounded-lg overflow-hidden`}>
            {resumeUrl ? (
                <embed
                    src={resumeUrl}
                    type="application/pdf"
                    width="100%"
                    height="100%"
                    style={{ border: "none" }}
                />
            ) : (
                <div className="py-12 text-center">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("applicantDetails.resume.title")}</h3>
                    <p className="text-gray-600">{t("applicantDetails.resume.noResumeDesc")}</p>
                </div>
            )}
        </div>
    );
}