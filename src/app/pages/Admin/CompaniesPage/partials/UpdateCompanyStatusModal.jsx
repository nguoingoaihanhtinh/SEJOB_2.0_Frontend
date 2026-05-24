import { useEffect, useState } from "react";
import { Modal, notification, Switch } from "antd";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { CheckCircle, XCircle } from "lucide-react";
import { companyApi } from "../../../../../api";

export default function UpdateCompanyStatusModal({ company, onUpdate, open, onOpenChange }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isVerified, setIsVerified] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsVerified(company?.is_verified || false);
    setIsActive(company?.is_active || false);
  }, [company]);

  const handleCancel = () => {
    onOpenChange?.(false);
    setIsVerified(company?.is_verified || false);
    setIsActive(company?.is_active || false);
  };

  const handleUpdate = () => {
    onOpenChange?.(false);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmUpdate = async () => {
    setLoading(true);
    try {
      // Call the update function passed from parent
      await companyApi.adminUpdate(company.id, {
        is_verified: isVerified,
        is_active: isActive,
      });

      onUpdate?.();
      
      notification.success({
        title: t("companyStatus.updateSuccess") || "Success",
        description: t("companyStatus.updateSuccessMessage") || "Company status has been updated successfully.",
        placement: "topRight",
      });
      
      setIsConfirmModalOpen(false);
    } catch (error) {
      notification.error({
        message: t("companyStatus.updateFailed") || "Update Failed",
        description: error.message || t("companyStatus.updateFailedMessage") || "Failed to update company status. Please try again.",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelConfirm = () => {
    setIsConfirmModalOpen(false);
    setIsVerified(company?.is_verified || false);
    setIsActive(company?.is_active || false);
  };

  const hasChanges = isVerified !== company?.is_verified || isActive !== company?.is_active;

  return (
    <>
      {/* Status Selection Modal */}
      <Modal
        title={
          <div className="text-lg font-semibold">
            {t("companyStatus.updateTitle") || "Update Company Status"}
          </div>
        }
        open={open}
        onOk={handleUpdate}
        onCancel={handleCancel}
        okText={t("modals.common.update") || "Update"}
        cancelText={t("modals.common.cancel") || "Cancel"}
        okButtonProps={{
          disabled: !hasChanges,
        }}
        centered
      >
        <div className="space-y-6 py-4">
          {/* Company Info */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">{t("company.text")}</p>
            <p className="font-semibold text-gray-900">{company?.name || "N/A"}</p>
          </div>

          {/* Verification Status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <div className="flex items-center gap-3">
                {isVerified ? (
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {t("companyStatus.verified") || "Verified Status"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {isVerified 
                      ? t("companyStatus.verifiedDesc") || "Company is verified"
                      : t("companyStatus.unverifiedDesc") || "Company is not verified"}
                  </p>
                </div>
              </div>
              <Switch
                checked={isVerified}
                onChange={setIsVerified}
                checkedChildren="Verified"
                unCheckedChildren="Unverified"
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
              <div className="flex items-center gap-3">
                {isActive ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {t("companyStatus.active") || "Active Status"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {isActive 
                      ? t("companyStatus.activeDesc") || "Company account is active"
                      : t("companyStatus.inactiveDesc") || "Company account is inactive"}
                  </p>
                </div>
              </div>
              <Switch
                checked={isActive}
                onChange={setIsActive}
                checkedChildren="Active"
                unCheckedChildren="Inactive"
              />
            </div>
          </div>

          {hasChanges && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                {t("companyStatus.updateWarning") || "Changing the company status will affect its visibility and permissions."}
              </p>
            </div>
          )}
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        title={
          <div className="text-lg font-semibold">
            {t("companyStatus.confirmTitle") || "Confirm Status Update"}
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
      >
        <div className="space-y-4 py-4">
          <p className="text-gray-700">
            {t("companyStatus.confirmMessage") || "Are you sure you want to update the company status?"}
          </p>
          
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Company</p>
              <p className="font-semibold text-gray-900">{company?.name || "N/A"}</p>
            </div>

            {isVerified !== company?.is_verified && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t("companyStatus.verified") || "Verified"}:</span>
                <div className="flex items-center gap-2">
                  <span className={company?.is_verified ? "text-blue-600" : "text-gray-500"}>
                    {company?.is_verified ? "Verified" : "Unverified"}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className={isVerified ? "font-semibold text-blue-600" : "font-semibold text-gray-500"}>
                    {isVerified ? "Verified" : "Unverified"}
                  </span>
                </div>
              </div>
            )}

            {isActive !== company?.is_active && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t("companyStatus.active") || "Active"}:</span>
                <div className="flex items-center gap-2">
                  <span className={company?.is_active ? "text-green-600" : "text-gray-500"}>
                    {company?.is_active ? "Active" : "Inactive"}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className={isActive ? "font-semibold text-green-600" : "font-semibold text-gray-500"}>
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ {t("companyStatus.confirmWarning") || "This action will immediately change the company status. Make sure this is what you want."}
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
