import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search, Filter, MoreHorizontal, MoreVertical, Eye, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Spin, Table } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { getCompanyApplications } from "../../../modules/services/applicationsService";
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui";
import { Avatar } from "@mui/material";
import { ApplicationStatus } from "../../../lib/enums";

const stages = ["Interview", "Shortlisted", "Rejected", "Hired", "Interviewed"];

const STATUS_CONFIG = {
  Applied: { bgColor: "bg-blue-600", textColor: "text-white", borderColor: "border-blue-200" },
  Viewed: { bgColor: "bg-yellow-50", textColor: "text-yellow-700", borderColor: "border-yellow-200" },
  Shortlisted: { bgColor: "bg-indigo-50", textColor: "text-indigo-700", borderColor: "border-indigo-200" },
  Interview_Scheduled: { bgColor: "bg-cyan-50", textColor: "text-cyan-700", borderColor: "border-cyan-200" },
  Offered: { bgColor: "bg-yellow-50", textColor: "text-yellow-700", borderColor: "border-yellow-200" },
  Hired: { bgColor: "bg-emerald-50", textColor: "text-emerald-700", borderColor: "border-emerald-200" },
  Rejected: { bgColor: "bg-red-50", textColor: "text-red-700", borderColor: "border-red-200" },
  Cancelled: { bgColor: "bg-gray-50", textColor: "text-gray-700", borderColor: "border-gray-200" },

  Interview: { bgColor: "bg-orange-100", textColor: "text-orange-600", borderColor: "border-orange-200" },
  Interviewed: { bgColor: "bg-purple-100", textColor: "text-purple-600", borderColor: "border-purple-200" },
};

export default function ApplicantsTable() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [view, setView] = useState("table");
  const [search, setSearch] = useState("");
  const { applications, pagination, status } = useSelector((state) => state.applications);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    dispatch(getCompanyApplications());
  }, [dispatch]);

  const filteredApplicants = useMemo(() => {
    if (!applications || applications.length === 0) return [];
    return applications.filter((a) => {
      const fullName = a.full_name || a.student?.full_name || "";
      return fullName.toLowerCase().includes(search.toLowerCase());
    });
  }, [search, applications]);

  const grouped = useMemo(() => {
    return stages.map((stage) => ({
      stage,
      list: filteredApplicants.filter((a) => a.status === stage || a.stage === stage),
    }));
  }, [filteredApplicants]);

  const handleSeeApplication = (applicant) => {
    navigate(`/applicants/${applicant.id}`, { state: { status: applicant.status } });
  };

  const getColumns = () => [
    {
      title: t("applicantList.table.fullName"),
      dataIndex: "full_name",
      key: "full_name",
      onHeaderCell: () => ({
        style: { textAlign: "center" },
      }),
      render: (_, applicant) => {
        const altName = applicant.full_name
          .split(" ")
          .map((n) => n[0])
          .join("");
        return (
          <div className={`flex items-center gap-2 ${applicant.status === ApplicationStatus.APPLIED ? "pl-2" : ""}`}>
            {applicant.status === ApplicationStatus.APPLIED && (
              <span className="absolute left-0 h-2/3 w-1 rounded-r transition-colors bg-primary" />
            )}
            <Avatar src={applicant.avatar} sx={{ width: 40, height: 40, bgcolor: "primary.main", fontSize: "1rem" }}>
              {altName}
            </Avatar>
            <span className="font-medium text-gray-900">{applicant.full_name}</span>
          </div>
        );
      },
    },
    {
      title: t("applicantList.table.email"),
      dataIndex: "email",
      key: "email",
      onHeaderCell: () => ({
        style: { textAlign: "center" },
      }),
    },
    {
      title: t("applicantList.table.jobRole"),
      dataIndex: "job",
      key: "job",
      align: "center",
      render: (job) => job?.title || "N/A",
    },
    {
      title: t("applicantList.table.hiringStage"),
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => {
        const config = STATUS_CONFIG[status] || STATUS_CONFIG.Applied;
        return (
          <Badge
            className={`${config.bgColor} ${config.textColor} border ${config.borderColor} hover:${config.bgColor}
                            w-25 items-center justify-center py-1 font-medium text-sm`}
          >
            {t(`applicantList.table.stages.${status}`)}
          </Badge>
        );
      },
    },
    {
      title: t("applicantList.table.appliedDate"),
      dataIndex: "created_at",
      key: "created_at",
      align: "center",
      render: (createdAt) => {
        const date = new Date(createdAt);
        return date.toLocaleDateString("en-GB");
      },
    },
    {
      title: t("actions"),
      key: "action",
      align: "center",
      render: (_, applicant) => (
        <div className="flex items-center justify-center gap-2">
          <button
            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 cursor-pointer"
            onClick={() => handleSeeApplication(applicant)}
          >
            {t("applicantList.table.seeApplication")}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white" align="center" side="left">
              <DropdownMenuItem onClick={() => handleSeeApplication(applicant)}>
                <Eye className="w-4 h-4 mr-2" />
                {t("applicantList.table.seeApplication")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>
                <Edit className="w-4 h-4 mr-2" />
                {t("applicantList.table.editStage")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 bg-gray-50 p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 shrink-0">
        <div className="flex items-center justify-between">
          <h4 className="text-2xl font-semibold text-gray-900">
            {t("applicantList.title")}: <span className="font-bold">{pagination?.total ?? 0}</span>
          </h4>
        </div>

        {/* Search Bar */}
        <div className="flex-1 flex items-center justify-end gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t("applicantList.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            {t("applicantList.filter")}
          </button>

          <button
            onClick={() => setView("pipeline")}
            className={`px-4 py-2 rounded-lg ${
              view === "pipeline" ? "bg-blue-50 text-blue-600" : "bg-white text-gray-700"
            }`}
          >
            {t("applicantList.pipelineView")}
          </button>

          <button
            onClick={() => setView("table")}
            className={`px-4 py-2 rounded-lg ${view === "table" ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`}
          >
            {t("applicantList.tableView")}
          </button>
        </div>
      </div>

      {view === "table" &&
        (status === "loading" ? (
          <div className="flex-1 flex items-center justify-center">
            <Spin indicator={<LoadingOutlined spin />} size="large" />
          </div>
        ) : (
          <div className="relative flex flex-col">
            <Table
              rowClassName={(record) => {
                return record.status === "Applied" ? "bg-blue-50 font-semibold" : "";
              }}
              columns={getColumns()}
              dataSource={applications || []}
              rowKey="id"
              bordered
              size="middle"
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: pagination?.total ?? 0,
                onChange: (newPage, newPageSize) => {
                  setCurrentPage(newPage);
                  setPageSize(newPageSize);
                },
              }}
              scroll={{ y: "70vh", x: "max-content" }}
              className="custom-ant-table-2 flex-1"
              locale={{ emptyText: t("applicantList.table.noApplicants") }}
            />
          </div>
        ))}

      {/* Pipeline View */}
      {view === "pipeline" && (
        <div className="grid grid-cols-5 gap-4">
          {grouped.map((g) => (
            <div key={g.stage} className="bg-white rounded-lg shadow p-4">
              <h4 className="font-semibold text-gray-800 mb-3">{t(`applicantList.table.stages.${g.stage}`)}</h4>

              <div className="space-y-3">
                {g.list.map((applicant) => {
                  const fullName = applicant.full_name || applicant.student?.full_name || "N/A";
                  const student = applicant.student || {};
                  const avatar = student.avatar || student.users?.avatar || "";
                  const firstLetter =
                    fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2) || "NA";
                  const jobTitle = applicant.job?.title || applicant.job_role || "N/A";

                  return (
                    <div
                      key={applicant.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleSeeApplication(applicant)}
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <Avatar
                          src={avatar}
                          sx={{ width: 32, height: 32, bgcolor: "primary.main", fontSize: "0.75rem" }}
                        >
                          {firstLetter}
                        </Avatar>
                        <span className="font-medium text-gray-900 text-sm">{fullName}</span>
                      </div>
                      <span className="text-xs text-gray-500">{jobTitle}</span>
                    </div>
                  );
                })}

                {g.list.length === 0 && (
                  <p className="text-sm text-gray-500">{t("applicantList.table.noApplicants")}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
