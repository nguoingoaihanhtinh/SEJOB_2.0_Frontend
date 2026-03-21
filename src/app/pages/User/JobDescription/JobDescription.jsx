import JobHeader from "./partials/JobHeader";
import JobDetails from "./partials/JobDetails";
import JobSidebar from "./partials/JobSidebar";
import { ApplicationModal, PerksSection } from "../../../components";
import CompanySection from "./partials/CompanySection";
import SimilarJobs from "./partials/SimilarJobs";
import { layoutType } from "../../../lib";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getJobById } from "../../../modules/services/jobsService";
import { useEffect, useState, useMemo } from "react";
import { CircularProgress, Box, Skeleton, Container } from "@mui/material";
import { Modal } from "antd";
import { AUTHENTICATED } from "../../../../settings/localVar";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function JobDescription({
  job,
  showBreadcrumb = true,
  showJobHeader = true,
  showJobDetails = true,
  showJobSidebar = true,
  showPerksSection = true,
  showCompanySection = true,
  showSimilarJobs = true,
  layout = layoutType.full, // "full" | "compact" | "minimal" | "preview"
}) {
  // Layout configurations
  const layoutConfig = {
    [layoutType.full]: {
      showBreadcrumb: true,
      showJobSidebar: true,
      showPerksSection: true,
      showCompanySection: true,
      showSimilarJobs: true,
    },
    [layoutType.compact]: {
      showBreadcrumb: false,
      showJobSidebar: true,
      showPerksSection: false,
      showCompanySection: false,
      showSimilarJobs: false,
    },
    [layoutType.preview]: {
      showBreadcrumb: false,
      showJobSidebar: true,
      showPerksSection: false,
      showCompanySection: false,
      showSimilarJobs: false,
    },
    [layoutType.minimal]: {
      showBreadcrumb: false,
      showJobSidebar: false,
      showPerksSection: false,
      showCompanySection: false,
      showSimilarJobs: false,
    },
  };

  // Use layout config if layout prop is provided
  const config = layoutConfig[layout] || {};
  const finalConfig = {
    showBreadcrumb: showBreadcrumb && config.showBreadcrumb,
    showJobHeader: showJobHeader,
    showJobDetails: showJobDetails,
    showJobSidebar: showJobSidebar && config.showJobSidebar,
    showPerksSection: showPerksSection && config.showPerksSection,
    showCompanySection: showCompanySection && config.showCompanySection,
    showSimilarJobs: showSimilarJobs && config.showSimilarJobs,
  };

  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("id");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const jobFromStore = useSelector(state => state.jobs.job);
  const jobStatus = useSelector(state => state.jobs.status);
  const jobError = useSelector(state => state.jobs.error);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const isLoggedIn = localStorage.getItem(AUTHENTICATED) === 'true';

  // Calculate job status display
  const jobStatusInfo = useMemo(() => {
    const status = job?.status || jobFromStore?.status;

    if (!status) return null;

    switch (status.toLowerCase()) {
      case 'pending':
        return {
          type: 'warning',
          icon: AlertCircle,
          message: t('job.status.pending'),
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600',
          showApplyButton: true,
        };
      case 'approved':
        return {
          type: 'success',
          icon: CheckCircle,
          message: null,
          showApplyButton: true,
        };
      case 'rejected':
      case 'closed':
        return {
          type: 'error',
          icon: XCircle,
          message: t('job.status.closed'),
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
          showApplyButton: false,
        };
      default:
        return {
          type: 'success',
          showApplyButton: true,
        };
    }
  }, [job?.status, jobFromStore?.status, t]);

  useEffect(() => {
    if (!jobId && job) return;

    if (!jobFromStore && jobFromStore?.id.toString() === jobId.toString()) {
      return;
    }

    dispatch(getJobById(jobId));
  }, [jobId, dispatch]);

  // Use job prop if provided, otherwise use job from Redux store
  if (!job && jobFromStore) {
    job = jobFromStore;
  }

  // Show loading state
  if (jobStatus === "loading") {
    return (
      <div className="min-h-screen w-full bg-white mx-auto space-y-12 pb-12">
        <div className={`pt-10 pb-5 ${layout !== layoutType.preview ? "px-10 lg:px-25" : ""} bg-background-lightBlue`}>
          {/* Header Skeleton */}
          <Container maxWidth="lg">
            <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2 }} />
          </Container>
        </div>

        <div className={`grid grid-cols-1 gap-8 ${layout !== layoutType.preview ? "px-10 lg:px-25 lg:grid-cols-3 md:grid-cols-2" : "px-15 lg:grid-cols-1"}`}>
          {/* Main Content Skeleton */}
          <div className="lg:col-span-2 space-y-4">
            <Skeleton variant="text" width="60%" height={40} />
            <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2 }} />
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-4">
            <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 2 }} />
          </div>
        </div>

        {/* Center loading indicator */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            py: 4
          }}
        >
          <CircularProgress size={40} />
        </Box>
      </div>
    );
  }

  // Show error state
  if (jobStatus === "failed" && jobError) {
    return (
      <div className="h-full w-full bg-white mx-auto flex items-center justify-center">
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 4
          }}
        >
          <Box
            sx={{
              fontSize: '4rem',
              mb: 2
            }}
          >
            ⚠️
          </Box>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Failed to Load Job
          </h2>
          <p className="text-gray-600 mb-4">
            {jobError || "Something went wrong while loading the job details."}
          </p>
          <button
            onClick={() => dispatch(getJobById(jobId))}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </Box>
      </div>
    );
  }

  // Show not found state
  if (!job) {
    return (
      <div className="min-h-screen w-full bg-white mx-auto flex items-center justify-center">
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 4
          }}
        >
          <Box
            sx={{
              fontSize: '4rem',
              mb: 2
            }}
          >
            🔍
          </Box>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Job Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The job you're looking for doesn't exist or has been removed.
          </p>
          <a
            href="/"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
          >
            Back to Home
          </a>
        </Box>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full bg-white mx-auto ${layout !== layoutType.preview ? "space-y-12 pb-12" : "space-y-6 pb-6"}`}>
      <div className={`${layout !== layoutType.preview ? "px-10 xl:px-50 py-8" : "sticky top-0 z-10"} bg-background-lightBlue`}>
        {
          finalConfig.showJobHeader &&
          <JobHeader
            job={job}
            layout={layout}
            onClickButton={() => setIsModalOpen(true)}
            disabled={jobStatusInfo && !jobStatusInfo.showApplyButton}
            statusInfo={jobStatusInfo}
          />
        }
      </div>

      {/* Job Status Banner */}
      {jobStatusInfo && jobStatusInfo.message && (
        <div className={`mx-10 lg:mx-25 ${layout === layoutType.preview ? 'mt-4' : ''}`}>
          <div className={`flex items-center gap-3 p-4 rounded-lg border ${jobStatusInfo.bgColor} ${jobStatusInfo.borderColor}`}>
            {jobStatusInfo.icon && <jobStatusInfo.icon className={`w-6 h-6 ${jobStatusInfo.iconColor}`} />}
            <p className={`font-medium ${jobStatusInfo.textColor}`}>
              {jobStatusInfo.message}
            </p>
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 ${layout !== layoutType.preview ? "px-10 lg:px-25 lg:grid-cols-3 md:grid-cols-2 gap-8" : "px-10 lg:grid-cols-1 gap-y-8"}`}>
        <div className="lg:col-span-2">
          {finalConfig.showJobDetails && <JobDetails job={job} />}
        </div>
        <div className={`${layout !== layoutType.preview ? "sticky top-15 z-10 self-start" : ""}`}>
          {finalConfig.showJobSidebar && <JobSidebar job={job} />}
        </div>
      </div>

      {finalConfig.showPerksSection &&
        <div className="px-10 lg:px-25">
          <PerksSection job={job} />
        </div>
      }
      {finalConfig.showSimilarJobs &&
        <div className="px-10 lg:px-25">
          <SimilarJobs job={job} />
        </div>
      }

      {!isLoggedIn ? (
        <Modal
          title={t('job.apply.title')}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          centered
          width={{
            xs: '70%',
            sm: '60%',
            md: '50%',
            lg: '40%',
            xl: '30%',
          }}
          footer={
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1 bg-white rounded-lg border hover:scale-105 transition-all cursor-pointer"
              >
                {t('job.apply.close')} 
              </button>
              <button
                onClick={() => {
                  navigate('/signin');
                }}
                className="px-4 py-1 bg-blue-600 text-white rounded-lg hover:scale-105 transition-all cursor-pointer"
              >
                {t('auth.sign_in')}
              </button>
            </div>
          }
        >
          <p>{t('job.apply.loginRequired')}</p>
        </Modal>
      ) : (
        <ApplicationModal open={isModalOpen} setOpen={setIsModalOpen} jobId={job?.id} />
      )}
    </div>
  );
}
