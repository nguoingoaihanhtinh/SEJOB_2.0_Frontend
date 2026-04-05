import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getCompanyApplicationDetail, getUserById, updateCompanyApplication } from "../../../modules";
import { useLocation, useParams } from "react-router-dom";
import { ApplicationStatus } from "../../../lib/enums";
import { Spin } from "antd";
import { LoadingOutlined } from '@ant-design/icons';
import Sidebar from "./partials/Sidebar";
import { HiringTab, InterviewScheduleTab, ProfileTab, ResumeTab } from "../../../components/manage/studentInfo";
import AIScoreTab from "./partials/AIScoreTab";

export default function ApplicantDetails() {
  const { t } = useTranslation();
  const location = useLocation();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("profile");
  const id = useParams().id;
  const { application, status: applicationStatus } = useSelector((state) => state.applications);
  const { user, status: userStatus } = useSelector((state) => state.user);
  const studentInfo = application?.student ?? user?.student_info?.[0] ?? {};
  const [refreshFlag, setRefreshFlag] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    const status = location.state?.status;
    if (status === ApplicationStatus.APPLIED) {
      await dispatch(updateCompanyApplication({ id, data: { status: ApplicationStatus.VIEWED } }));
    }
    const result = await dispatch(getCompanyApplicationDetail(id)).unwrap();
    const application = result.data;
    if (application && application.user_id) {
      await dispatch(getUserById(application.user_id));
    }
    setRefreshFlag(false);
  };

  if (refreshFlag || applicationStatus === "loading" || userStatus === "loading")
    return (
      <div className="flex items-center justify-center h-full">
        <Spin indicator={<LoadingOutlined spin />} size="large" />
      </div>
    );

  if (applicationStatus === "failed" && !application)
    return (
      <div className="flex h-full items-center justify-center gap-6 text-center px-4">
        <h3 className="text-2xl font-semibold text-gray-900">{t("applicantDetails.failedToLoad")}</h3>
      </div>
    );

  if (userStatus === "failed" && !user)
    return (
      <div className="flex h-full items-center justify-center gap-6 text-center px-4">
        <h3 className="text-2xl font-semibold text-gray-900">{t("applicantDetails.failedToLoadUser")}</h3>
      </div>
    );

  return (
    <div className="bg-gray-50 px-6 py-4 flex-1 mx-auto min-h-screen space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          className="p-2 hover:bg-gray-100 rounded-lg"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="w-6 h-6 cursor-pointer" />
        </button>
        <div className="text-2xl font-bold text-gray-900">{t("applicantDetails.title")}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Sidebar application={application} studentInfo={studentInfo} />

        {/* Right Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm">
            {/* Tabs */}
            <div className="border-b">
              <div className="flex gap-8 px-6">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`py-4 cursor-pointer font-medium transition-all ${activeTab === "profile" ? "text-blue-600" : "text-gray-600 hover:text-gray-900"}`}
                >
                  {t("applicantDetails.tabs.profile")}
                </button>
                <button
                  onClick={() => setActiveTab("resume")}
                  className={`py-4 cursor-pointer font-medium transition-all ${activeTab === "resume" ? "text-blue-600" : "text-gray-600 hover:text-gray-900"}`}
                >
                  {t("applicantDetails.tabs.resume")}
                </button>
                <button
                  onClick={() => setActiveTab("hiring")}
                  className={`py-4 cursor-pointer font-medium transition-all ${activeTab === "hiring" ? "text-blue-600" : "text-gray-600 hover:text-gray-900"}`}
                >
                  {t("applicantDetails.tabs.hiring")}
                </button>
                <button
                  onClick={() => setActiveTab("interview")}
                  className={`py-4 cursor-pointer font-medium transition-all ${activeTab === "interview" ? "text-blue-600" : "text-gray-600 hover:text-gray-900"}`}
                >
                  {t("applicantDetails.tabs.interview")}
                </button>
                <button
                  onClick={() => setActiveTab("ai_score")}
                  className={`py-4 cursor-pointer font-bold transition-all ${activeTab === "ai_score" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-80"}`}
                >
                  ✨ AI Analysis
                </button>
              </div>
            </div>

            <div className="p-6">
              {activeTab === "profile" && (
                <ProfileTab application={application} studentInfo={studentInfo} />
              )}

              {activeTab === "resume" && (
                <ResumeTab application={application} studentInfo={studentInfo} />
              )}
              {activeTab === "hiring" && (
                <HiringTab status={application.status} />
              )}

              {activeTab === "interview" && (
                <InterviewScheduleTab />
              )}

              {activeTab === "ai_score" && (
                <AIScoreTab application={application} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
