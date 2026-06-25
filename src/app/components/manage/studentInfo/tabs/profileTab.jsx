import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";
import CertificatesSection from "../CertificatesSection";
import EducationSection from "../EducationSection";
import ExperienceSection from "../ExperienceSection";
import ProjectsSection from "../ProjectsSection";

const MISSING = "\u2014";

function countMissing(studentInfo) {
    let n = 0;
    if (!studentInfo.gender) n++;
    if (!studentInfo.date_of_birth) n++;
    if (!studentInfo.location) n++;
    if (!studentInfo.about) n++;
    if (!studentInfo.skills || studentInfo.skills.length === 0) n++;
    if (!studentInfo.experiences || studentInfo.experiences.length === 0) n++;
    if (!studentInfo.educations || studentInfo.educations.length === 0) n++;
    if (!studentInfo.projects || studentInfo.projects.length === 0) n++;
    if (!studentInfo.certifications || studentInfo.certifications.length === 0) n++;
    return n;
}

export default function ProfileTab({ studentInfo }) {
    const { t } = useTranslation();
    const missingCount = countMissing(studentInfo);

    const formatDateOfBirth = (dateString) => {
        if (!dateString) return null;

        const date = new Date(dateString);
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const month = months[date.getMonth()];
        const day = date.getDate();
        const year = date.getFullYear();

        const today = new Date();
        let age = today.getFullYear() - year;
        if (today.getMonth() < date.getMonth() || (today.getMonth() === date.getMonth() && today.getDate() < day)) {
            age--;
        }

        return `${month} ${day}, ${year} (${age} y.o)`;
    };

    const dob = formatDateOfBirth(studentInfo.date_of_birth);

    return (
        <div className="space-y-4">
            {missingCount >= 4 && (
                <div className="flex items-start gap-2 p-3 border border-amber-200 bg-amber-50 rounded text-sm text-amber-800">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{t("applicantDetails.profileIncomplete") || "This candidate's profile is incomplete — {count} fields are missing."}</span>
                </div>
            )}

            {/* Personal Info */}
            <div className="space-y-2">
                <h5 className="font-bold text-gray-900">{t("applicantDetails.personalInfo.title")}</h5>
                <div className="grid grid-cols-3 gap-2">
                    <div>
                        <p className="text-sm text-gray-600">{t("applicantDetails.personalInfo.fullName")}</p>
                        <p className="text-gray-900">{studentInfo.full_name || MISSING}</p>
                    </div>
                    {studentInfo.gender && (
                        <div>
                            <p className="text-sm text-gray-600">{t("applicantDetails.personalInfo.gender")}</p>
                            <p className="text-gray-900">{studentInfo.gender}</p>
                        </div>
                    )}
                    {dob && (
                        <div>
                            <p className="text-sm text-gray-600">{t("applicantDetails.personalInfo.dateOfBirth")}</p>
                            <p className="text-gray-900">{dob}</p>
                        </div>
                    )}
                    {studentInfo.location && (
                        <div>
                            <p className="text-sm text-gray-600">{t("applicantDetails.personalInfo.address")}</p>
                            <p className="text-gray-900">{studentInfo.location}</p>
                        </div>
                    )}
                    <div>
                        <p className="text-sm text-gray-600">{t("applicantDetails.personalInfo.language")}</p>
                        <p className="text-gray-900">English, Việt Nam</p>
                    </div>
                </div>
            </div>

            {/* Professional Info */}
            <div className="space-y-4">
                <h5 className="font-bold text-gray-900">{t("applicantDetails.professionalInfo.title")}</h5>

                {studentInfo.about && (
                    <div className="space-y-1">
                        <p className="text-sm text-gray-600">{t("applicantDetails.professionalInfo.aboutMe")}</p>
                        <p className="text-gray-900">{studentInfo.about}</p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                    {studentInfo.previous_job && (
                        <div className="space-y-1">
                            <p className="text-sm text-gray-600">{t("applicantDetails.professionalInfo.currentJob")}</p>
                            <p className="text-gray-900">{studentInfo.previous_job}</p>
                        </div>
                    )}
                    <div className="space-y-1">
                        <p className="text-sm text-gray-600">{t("applicantDetails.professionalInfo.skillSet")}</p>
                        <div className="flex gap-2 flex-wrap">
                            {studentInfo.skills && studentInfo.skills.length > 0 ? (
                                studentInfo.skills.map((skill, index) => (
                                    <span key={index} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">{skill}</span>
                                ))
                            ) : (
                                <span className="text-sm text-gray-400">{MISSING}</span>
                            )}
                        </div>
                    </div>
                </div>

                <ExperienceSection experiences={studentInfo.experiences || []} />
                <EducationSection educations={studentInfo.educations || []} />
                <ProjectsSection projects={studentInfo.projects || []} />
                <CertificatesSection certifications={studentInfo.certifications || []} />
            </div>
        </div>
    );
}