import { Link, Mail, MessageSquare, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ApplicationStatus, SOCIAL_ICONS } from "../../../../lib/enums";
import { Avatar } from "@mui/material";
import StageProgressBar from "./sidebarPartials/stageProgressBar";
import ChangeStageButton from "./sidebarPartials/ChangeStageButton";

const formatDaysAgo = (dateString) => {
  if (!dateString) return "";

  const createdDate = new Date(dateString);
  const today = new Date();

  // Calculate difference in milliseconds
  const diffTime = Math.abs(today - createdDate);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
};

export default function Sidebar({ application, studentInfo }) {
  const { t } = useTranslation();

  const contacts = () => {
    if (!studentInfo.social_links || studentInfo.social_links === undefined || studentInfo.social_links.length === 0)
      return [];

    return studentInfo.social_links.map((link) => {
      const socialIcon = SOCIAL_ICONS[link.platform.toLowerCase()];
      return {
        type: link.platform.charAt(0).toUpperCase() + link.platform.slice(1),
        url: link.url,
        icon: socialIcon ? socialIcon.icon : Link,
        color: socialIcon ? socialIcon.color : "text-gray-500",
      };
    });
  };

  const altName = application.full_name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-xl shadow-sm px-6 py-4 space-y-4 sticky top-4">
        {/* Profile Section */}
        <div className="flex flex-col items-center space-y-1">
          <Avatar
            src={application.avatar}
            sx={{ width: 80, height: 80, fontSize: "2rem" }}
            className="bg-linear-to-bl from-primary-900 via-primary-600 to-primary-900"
          >
            {altName}
          </Avatar>
          <div className="text-xl font-bold text-gray-900">{application.full_name ?? "N/A"}</div>
          <p className="text-gray-600">Product Designer</p>
          {/* <div className="flex items-center gap-1">
                        <span className="text-yellow-400">⭐</span>
                        <span className="font-semibold">4.0</span>
                    </div> */}
        </div>

        {/* Applied Jobs */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{t("applicantDetails.appliedJobs")}</span>
            <span className="text-sm text-gray-600">{formatDaysAgo(application.created_at)}</span>
          </div>
          <div>
            <div className="font-semibold text-gray-900">{application.job.title ?? "N/A"}</div>
            <p className="text-sm text-gray-600">
              {application.job.categories[0].name ?? "N/A"} • {application.job.working_time ?? "N/A"}
            </p>
          </div>
        </div>

        {/* Stage Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{t("applicantDetails.stage")}</span>
            <span
              className={`
                                text-sm font-medium
                                ${
                                  application.status === ApplicationStatus.HIRED
                                    ? "text-green-600"
                                    : application.status === ApplicationStatus.REJECTED
                                      ? "text-red-600"
                                      : "text-blue-600"
                                }
                            `}
            >
              {t(`applicantDetails.stages.${application.status}`)}
            </span>
          </div>
          <StageProgressBar currentStage={application.status} />
        </div>

        <ChangeStageButton currentStage={application.status} id={application.id} />

        {/* Contact Section */}
        <div className="border-t pt-4">
          <h4 className="font-bold text-gray-900 mb-4">{t("applicantDetails.contact")}</h4>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600 mb-1">{t("applicantDetails.email")}</p>
                <p className="text-sm text-gray-900">{application.email}</p>
              </div>
            </div>
            {application.phone && (
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t("applicantDetails.phone")}</p>
                  <p className="text-sm text-gray-900">{application.phone}</p>
                </div>
              </div>
            )}
            {contacts().map((contact) => (
              <div key={contact.type} className="flex items-start gap-3">
                <contact.icon className={`w-5 h-5 ${contact.color} mt-0.5`} />
                <div>
                  <p className="text-sm text-gray-600 mb-1">{contact.type}</p>
                  <a
                    href={contact.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {contact.url}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
