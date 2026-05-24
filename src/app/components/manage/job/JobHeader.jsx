import { motion } from "framer-motion";
import { Button } from "@/components/ui";
import { ArrowLeft } from "lucide-react";
import { srcAsset } from "@/lib";

export default function JobHeader({ job = {}, textButton, onClickButton }) {
  const jobTitle = job.title || "Job Title";
  const jobCompany = job.company?.name || job.company || "Company Name";

  const getJobType = () => {
    if (Array.isArray(job.workingTime) && job.workingTime.length > 0) {
      return job.workingTime.map(wt => typeof wt === 'string' ? wt : (wt.name || wt)).join(', ');
    }
    if (job.working_time) return job.working_time;
    if (job.type) return job.type;
    if (Array.isArray(job.employment_types) && job.employment_types.length > 0) {
      return job.employment_types.map(et => et.name || et).join(', ');
    }
    return "Job Type";
  };

  const jobType = getJobType();

  return (
    <motion.div
      className="flex space-x-5"
    >
      <motion.div 
        className="flex-1 flex justify-center items-center relative z-10"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <button
          className="p-3 bg-white shadow-sm border border-gray-200 rounded-full cursor-pointer hover:p-4 hover:shadow-lg active:p-3 active:shadow-sm transition-all"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white px-8 py-5 shadow-sm border border-gray-200 rounded-xl flex-16 z-10"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-6">
            <img
              src={job.company?.logo || srcAsset.nomadIcon}
              alt={job.company?.name}
              className="w-14 h-14 object-contain"
            />
            <div>
              <h4 className="text-3xl font-bold text-foreground mb-2">
                {jobTitle}
              </h4>
              <p className="text-muted-foreground">
                {jobCompany} • {jobType}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 rounded-lg cursor-pointer"
              onClick={() => {
                if (onClickButton) {
                  onClickButton();
                } else {
                  return;
                }
              }}
            >
              {textButton}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
