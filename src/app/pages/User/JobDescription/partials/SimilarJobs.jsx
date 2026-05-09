import { ArrowRight } from "lucide-react";
import { JobCard } from "@/components";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState, useRef } from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import api from '../../../../modules/AxiosInstance';
import { useDispatch } from 'react-redux';
import { addSavedJob, removeSavedJob } from '../../../../modules/services/savedJobsService';

export default function SimilarJobs({ job }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [similarJobs, setSimilarJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const lastCategoryIdsRef = useRef('');

  // Extract category IDs from job and convert to string for comparison
  const categoryIdsString = useMemo(() => {
    if (!job?.categories || !Array.isArray(job.categories)) {
      return '';
    }
    const ids = job.categories
      .map(cat => typeof cat === 'string' ? cat : (cat.id || cat))
      .filter(id => id != null && id !== '')
      .sort()
      .join(',');
    return ids;
  }, [job?.categories]);

  // Extract category IDs array for rendering
  const categoryIds = useMemo(() => {
    if (!categoryIdsString) return [];
    return categoryIdsString.split(',').filter(Boolean);
  }, [categoryIdsString]);

  // Fetch similar jobs when category IDs change
  useEffect(() => {
    // Skip if no category IDs or same as last call
    if (!categoryIdsString || categoryIdsString === lastCategoryIdsRef.current) {
      return;
    }

    // Update ref to track last call
    lastCategoryIdsRef.current = categoryIdsString;

    const fetchSimilarJobs = async () => {
      setIsLoading(true);
      try {
        if (!job.id) {
          throw new Error("Invalid Job ID");
        }
        const queryParams = {
          category_ids: categoryIdsString,
          page: 1,
          limit: 8
        };

        const response = await api.get(`/api/jobs/recommendation/${job.id}/similar`, { params: queryParams });
        const responseData = response.data.data || {};
        // Merge jobs and topcv into a single array
        const allJobs = [
          ...(responseData || []),
          ...(responseData.topcv || [])
        ];
        setSimilarJobs(allJobs);
      } catch (error) {
        console.error('Error fetching similar jobs:', error);
        setSimilarJobs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSimilarJobs();
  }, [categoryIdsString]);

  // Filter and prepare jobs for JobCard component (JobCard handles normalization internally)
  const filteredJobs = useMemo(() => {
    if (!similarJobs || !Array.isArray(similarJobs)) {
      return [];
    }

    // Filter out current job
    const currentJobId = job?.id || job?.job_id || job?.external_id;
    const filtered = similarJobs.filter(j => {
      const jobId = j.id || j.job_id || j.external_id;
      return jobId && jobId.toString() !== currentJobId?.toString();
    });

    // Return raw jobs, limited to 8, JobCard will normalize them
    return filtered.slice(0, 8);
  }, [similarJobs, job]);

  // Handle bookmark action
  const handleBookmark = (job, meta) => {
    const { action, jobId } = meta;
    if (action === 'unsave') {
      dispatch(removeSavedJob(jobId));
    } else {
      dispatch(addSavedJob(jobId));
    }
  };

  // Don't render if no category IDs
  if (categoryIds.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-2xl font-bold text-foreground">{t("job.similar_jobs")}</h4>
        <a
          href="/jobs"
          className="text-primary flex items-center gap-2 hover:underline font-medium"
        >
          {t("job.show_all_jobs")}
          <ArrowRight className="w-5 h-5" />
        </a>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spin indicator={<LoadingOutlined spin />} size="large" />
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredJobs.map((jobItem, index) => (
            <JobCard
              key={jobItem.id || jobItem.job_id || jobItem.external_id || index}
              job={jobItem}
              onBookmark={handleBookmark}
              showPopup={false}
              variant="grid"
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>{t("job.no_similar_jobs")}</p>
        </div>
      )}
    </section>
  );
}
