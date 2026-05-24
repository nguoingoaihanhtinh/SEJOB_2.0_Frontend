import { useState } from "react";
import { Modal, Select, notification } from "antd";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { JobStatus } from "../../../../lib/enums";
import { updateJob } from "../../../../modules";

export default function UpdateJobStatusModal({ job, open, onUpdate, onOpenChange }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [selectedStatus, setSelectedStatus] = useState(job?.status || JobStatus.ACTIVE);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const statusOptions = [
    { value: JobStatus.PENDING, label: t("jobStatus.pending") || "Pending" },
    { value: JobStatus.APPROVED, label: t("jobStatus.approved") || "Approved" },
    { value: JobStatus.REJECTED, label: t("jobStatus.rejected") || "Rejected" },
    { value: JobStatus.CLOSED, label: t("jobStatus.closed") || "Closed" },
  ];

  const handleCancel = () => {
    onOpenChange?.(false);
    setSelectedStatus(job?.status || JobStatus.ACTIVE);
  };

  const handleUpdate = () => {
    onOpenChange?.(false);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmUpdate = async () => {
    setLoading(true);
    try {
      await dispatch(updateJob({
        jobId: job.id,
        jobData: {
          status: selectedStatus,
        },
      })).unwrap();
      if (onUpdate) await onUpdate();
      notification.success({
        message: t("jobStatus.updateSuccess") || "Success",
        description: t("jobStatus.updateSuccessDesc") || "Job status has been updated successfully.",
        placement: "topRight",
      });
      
      setIsConfirmModalOpen(false);
    } catch (error) {
      notification.error({
        message: t("jobStatus.updateFailed") || "Update Failed",
        description: error.message || t("jobStatus.updateFailedMessage") || "Failed to update job status. Please try again.",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelConfirm = () => {
    setIsConfirmModalOpen(false);
    setSelectedStatus(job?.status || JobStatus.ACTIVE);
  };

  return (
    <>
      {/* Status Selection Modal */}
      <Modal
        title={
          <div className="text-lg font-semibold">
            {t("jobStatus.updateTitle") || "Update Job Status"}
          </div>
        }
        open={open}
        onOk={handleUpdate}
        onCancel={handleCancel}
        okText={t("modals.common.update") || "Update"}
        cancelText={t("modals.common.cancel") || "Cancel"}
        okButtonProps={{
          disabled: selectedStatus === job?.status,
        }}
        centered
      >
        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("jobStatus.currentStatus") || "Current Status"}
            </label>
            <div className="px-4 py-2 bg-gray-100 rounded-lg">
              <span className="font-semibold">
                {statusOptions.find(opt => opt.value === job?.status)?.label || job?.status}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("jobStatus.newStatus") || "New Status"}
            </label>
            <Select
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={statusOptions}
              className="w-full"
              size="large"
            />
          </div>

          {selectedStatus !== job?.status && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                {t("jobStatus.updateWarning") || "Changing the job status will affect its visibility to applicants."}
              </p>
            </div>
          )}
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        title={
          <div className="text-lg font-semibold">
            {t("jobStatus.confirmTitle") || "Confirm Status Update"}
          </div>
        }
        open={isConfirmModalOpen}
        onOk={handleConfirmUpdate}
        onCancel={handleCancelConfirm}
        okText={t("modals.common.confirm") || "Confirm"}
        cancelText={t("modals.common.cancel") || "Cancel"}
        okButtonProps={{
          loading: loading,
        }}
        centered
      >
        <div className="space-y-4 py-4">
          <p className="text-gray-700">
            {t("jobStatus.confirmMessage") || "Are you sure you want to update the job status?"}
          </p>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">{t("jobStatus.from") || "From"}:</span>
              <span className="font-semibold">
                {statusOptions.find(opt => opt.value === job?.status)?.label || job?.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t("jobStatus.to") || "To"}:</span>
              <span className="font-semibold text-blue-600">
                {statusOptions.find(opt => opt.value === selectedStatus)?.label || selectedStatus}
              </span>
            </div>
          </div>

          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ {t("jobStatus.confirmWarning") || "This action will immediately change the job status. Make sure this is what you want."}
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
