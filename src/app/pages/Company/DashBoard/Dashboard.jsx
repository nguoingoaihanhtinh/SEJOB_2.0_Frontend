import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, ChevronRight, TrendingUp, TrendingDown, Eye, FileCheck, X, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getCompanyStats, getJobsByCompanyId } from "@/modules";
import { Spin } from "antd";

const Dashboard = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [timePeriod, setTimePeriod] = useState("Year");
  const [activeTab, setActiveTab] = useState("Overview");
  const [showInfoBanner, setShowInfoBanner] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [jobsPage, setJobsPage] = useState(1);
  const [jobsLimit, setJobsLimit] = useState(4);

  const currentUser = useSelector((state) => state.auth.user) || {};
  const { stats, statsStatus, statsError } = useSelector((state) => state.company);
  const { jobs, pagination: jobsPagination } = useSelector((state) => state.jobs);

  // Fetch company stats on mount
  useEffect(() => {
    const companyId = currentUser.company.id;
    if (companyId) {
      dispatch(
        getCompanyStats({
          companyId: companyId,
          year: selectedYear,
        }),
      );
      // Fetch company jobs
      dispatch(getJobsByCompanyId({ companyId, page: jobsPage, limit: jobsLimit }));
    } else {
      console.warn("No company ID found in currentUser");
    }
  }, [dispatch, currentUser, selectedYear, jobsPage, jobsLimit]);

  // Tính toán tuần hiện tại (từ thứ 2 đến chủ nhật)
  const currentWeekRange = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7

    // Tính thứ 2 của tuần hiện tại
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Nếu là CN thì lùi 6 ngày, nếu là T2 thì lùi 0 ngày
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    // Tính chủ nhật của tuần hiện tại
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    // Format ngày tháng theo định dạng DD/MM
    const formatDateDDMM = (date) => {
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      return `${day}/${month}`;
    };

    return {
      fromLong: formatDateDDMM(monday),
      toLong: formatDateDDMM(sunday),
      fromShort: formatDateDDMM(monday),
      toShort: formatDateDDMM(sunday),
      monday,
      sunday,
    };
  }, []);

  const chartData = useMemo(() => {
    if (!stats?.timeline) return [];

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return monthNames.map((month, index) => {
      const monthKey = `${selectedYear}-${String(index + 1).padStart(2, "0")}`;
      return {
        day: month,
        jobPosted: stats.timeline.jobsByMonth?.[monthKey] || 0,
        jobApplied: stats.timeline.applicationsByMonth?.[monthKey] || 0,
      };
    });
  }, [stats, selectedYear]);

  const jobsData = useMemo(() => {
    if (!jobs || jobs.length === 0) return [];

    return jobs.map((job) => ({
      id: job.id,
      title: job.title,
      company: job.company?.name || currentUser.company?.name || "Company",
      location: job.location || "Remote",
      type: job.employment_type?.name || "Full-time",
      tags: job.categories?.slice(0, 2).map((c) => c.name) || [],
      applied: job.applied_count || 0,
      capacity: job.capacity || 10,
      color:
        job.color || ["bg-emerald-500", "bg-blue-500", "bg-cyan-500", "bg-purple-600"][Math.floor(Math.random() * 4)],
      icon: job.icon || ["🏢", "📦", "🔷", "⭕"][Math.floor(Math.random() * 4)],
    }));
  }, [jobs, currentUser]);

  // Loading state
  if (statsStatus === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  // Error state
  if (statsStatus === "failed") {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{statsError || "Failed to load statistics"}</p>
          <button
            onClick={() => dispatch(getCompanyStats({ companyId: currentUser.company_id, year: selectedYear }))}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const overview = stats?.overview || {};
  const employmentTypes = stats?.categories?.employmentTypes || {};

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Info Banner */}
        {showInfoBanner && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <div className="py-1">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900 mb-1">
                Lưu ý: Tính năng này đang trong quá trình hoàn thiện.
              </h4>
              <p className="text-sm text-blue-800">
                Dữ liệu hiển thị hiện tại là dữ liệu mẫu và chưa phản ánh số liệu thực tế.
              </p>
            </div>
            <button
              onClick={() => setShowInfoBanner(false)}
              className="shrink-0 text-blue-600 hover:text-blue-800 transition-colors"
              aria-label="Đóng thông báo"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {t("company.dashboard.greeting", { name: currentUser.first_name })}
            </h3>
            {/* <p className="text-gray-500 text-sm">
              {t("company.dashboard.statisticReport", { from: currentWeekRange.fromLong, to: currentWeekRange.toLong })}
            </p> */}
          </div>
          {/* <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50">
            <span className="text-sm">{t("company.dashboard.dateRange", { from: currentWeekRange.fromShort, to: currentWeekRange.toShort })}</span>
            <Calendar className="w-4 h-4" />
          </button> */}
        </div>

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => navigate("/applicants")}
            className="bg-purple-600 text-white py-4 px-6 rounded-xl flex justify-between items-center cursor-pointer hover:bg-purple-700 transition"
          >
            <div>
              <div className="text-4xl font-bold mb-1">{overview.totalApplications || 0}</div>
              <div className="text-sm opacity-90">
                {t("company.dashboard.totalApplications") || "Total Applications"}
              </div>
            </div>
            <ChevronRight className="w-6 h-6" />
          </div>
          <div
            onClick={() => navigate("job-listing")}
            className="bg-cyan-400 text-white py-4 px-6 rounded-xl flex justify-between items-center cursor-pointer hover:bg-cyan-500 transition"
          >
            <div>
              <div className="text-4xl font-bold mb-1">{overview.activeJobs || 0}</div>
              <div className="text-sm opacity-90">{t("company.dashboard.activeJobs") || "Active Jobs"}</div>
            </div>
            <ChevronRight className="w-6 h-6" />
          </div>
          <div
            // onClick={() => navigate('/company/all-applicants')}
            className="bg-blue-500 text-white py-4 px-6 rounded-xl flex justify-between items-center cursor-pointer hover:bg-blue-600 transition"
          >
            <div>
              <div className="text-4xl font-bold mb-1">{overview.successRate || 0}%</div>
              <div className="text-sm opacity-90">{t("company.dashboard.successRate") || "Success Rate"}</div>
            </div>
            <ChevronRight className="w-6 h-6" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{t("company.dashboard.jobStatistics")}</h3>
                <p className="text-sm text-gray-500">
                  {t("company.dashboard.yearlyStatistics", { year: selectedYear }) ||
                    `Showing statistics for year ${selectedYear}`}
                </p>
              </div>
              <div className="flex gap-2">
                {stats?.availableYears?.map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                      selectedYear === year ? "text-purple-600 bg-purple-50" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {year}
                  </button>
                ))}
                {!stats?.availableYears?.includes(new Date().getFullYear()) && (
                  <button
                    onClick={() => setSelectedYear(new Date().getFullYear())}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                      selectedYear === new Date().getFullYear()
                        ? "text-purple-600 bg-purple-50"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {new Date().getFullYear()}
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-4 border-b">
              {[
                { key: "Overview", label: t("company.dashboard.overview") },
                { key: "Jobs Posted", label: t("company.dashboard.jobsposted") || "Jobs Posted" },
                { key: "Applications", label: t("company.dashboard.applications") || "Applications" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`pb-3 text-sm font-medium transition ${
                    activeTab === tab.key
                      ? "text-purple-600 border-b-2 border-purple-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fill: "#6b7280", fontSize: 12 }} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                <Tooltip />
                {(activeTab === "Overview" || activeTab === "Jobs Posted") && (
                  <Bar dataKey="jobPosted" fill="#60a5fa" radius={[4, 4, 0, 0]} name="Jobs Posted" />
                )}
                {(activeTab === "Overview" || activeTab === "Applications") && (
                  <Bar dataKey="jobApplied" fill="#10b981" radius={[4, 4, 0, 0]} name="Applications" />
                )}
              </BarChart>
            </ResponsiveContainer>

            <div className="flex gap-6 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-400 rounded"></div>
                <span className="text-sm text-gray-600">{t("company.dashboard.jobsposted") || "Jobs Posted"}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                <span className="text-sm text-gray-600">{t("company.dashboard.applications") || "Applications"}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Eye className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="text-sm text-gray-600">{t("company.dashboard.jobOpen") || "Total Jobs"}</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">{overview.totalJobs || 0}</div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-sm text-gray-600">
                    {t("company.dashboard.activeJobs")}: {overview.activeJobs || 0}
                  </span>
                </div>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <FileCheck className="w-5 h-5 text-emerald-500" />
                  </div>
                  <span className="text-sm text-gray-600">{t("company.dashboard.applications") || "Applications"}</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">{overview.totalApplications || 0}</div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-sm text-gray-600">
                    {t("company.dashboard.successRate")}: {overview.successfulApplications || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Stats */}
          <div>
            <div className="sticky top-4 space-y-6">
              <div className="bg-white rounded-xl py-4 px-6 shadow-sm space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">{t("company.dashboard.jobOpen")}</h3>
                <div className="text-4xl font-bold text-gray-900">{overview.activeJobs || 0}</div>
                <div className="text-sm text-gray-500">{t("company.dashboard.jobsOpened")}</div>
              </div>

              <div className="bg-white rounded-xl py-4 px-6 shadow-sm space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">{t("company.dashboard.applicantsSummary")}</h3>
                <div className="text-4xl font-bold text-gray-900">{overview.totalApplications || 0}</div>
                <div className="text-sm text-gray-500">{t("company.dashboard.applicants")}</div>

                {Object.keys(employmentTypes).length > 0 ? (
                  <>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full flex">
                        {Object.entries(employmentTypes).map(([_, count], index) => {
                          const colors = [
                            "bg-purple-600",
                            "bg-emerald-400",
                            "bg-cyan-400",
                            "bg-blue-400",
                            "bg-red-500",
                          ];
                          const total = Object.values(employmentTypes).reduce((a, b) => a + b, 0);
                          const percentage = total > 0 ? (count / total) * 100 : 0;
                          return (
                            <div
                              key={index}
                              className={colors[index % colors.length]}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {Object.entries(employmentTypes).map(([type, count], index) => {
                        const colors = [
                          { bg: "bg-purple-600", text: "text-purple-600" },
                          { bg: "bg-emerald-400", text: "text-emerald-400" },
                          { bg: "bg-cyan-400", text: "text-cyan-400" },
                          { bg: "bg-blue-400", text: "text-blue-400" },
                          { bg: "bg-red-500", text: "text-red-500" },
                        ];
                        const color = colors[index % colors.length];

                        return (
                          <div key={type} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 ${color.bg} rounded`}></div>
                              <span className="text-gray-600">{type || "Unknown"}</span>
                            </div>
                            <span className="font-medium">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500 italic">No employment type data available</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Job Updates Section */}
        <div className="bg-white rounded-xl py-4 px-6 shadow-sm space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <div className="py-1">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900 mb-1">
                Lưu ý: Tính năng này đang trong quá trình hoàn thiện.
              </h4>
              <p className="text-sm text-blue-800">
                Dữ liệu hiển thị hiện tại là dữ liệu mẫu và chưa phản ánh số liệu thực tế.
              </p>
            </div>
            <button
              onClick={() => setShowInfoBanner(false)}
              className="shrink-0 text-blue-600 hover:text-blue-800 transition-colors"
              aria-label="Đóng thông báo"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">{t("company.dashboard.jobUpdates")}</h3>
            <button
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium text-sm"
              onClick={() => navigate("/job-listing")}
            >
              {t("company.dashboard.viewAll")}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {jobsData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {jobsData.map((job) => (
                <div key={job.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 ${job.color} rounded-lg flex items-center justify-center text-2xl`}>
                      {job.icon}
                    </div>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-medium rounded-full">
                      {job.type}
                    </span>
                  </div>

                  <h4 className="font-semibold text-gray-900 mb-1">{job.title}</h4>
                  <p className="text-sm text-gray-500 mb-4">
                    {job.company} • {job.location}
                  </p>

                  <div className="flex gap-2 mb-4">
                    {job.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          tag === "Marketing" || tag === "Business"
                            ? "bg-orange-50 text-orange-600 border border-orange-200"
                            : "bg-purple-50 text-purple-600 border border-purple-200"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mb-2">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${(job.applied / job.capacity) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500">
                    <span className="font-medium text-gray-900">
                      {t("company.dashboard.applied", { count: job.applied })}
                    </span>{" "}
                    {t("company.dashboard.of", { count: job.capacity })} {t("company.dashboard.capacity")}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>{t("company.dashboard.noJobs") || "No jobs posted yet"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
