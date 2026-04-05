import { useEffect, useState, useRef } from "react";
import { Input, Label } from "@/components/ui";
import { Modal, Radio, Spin } from "antd";
import { AlertCircle, CheckCircle, Check } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { infoApplyStatus } from "../../lib/enums";
import { useTranslation } from "react-i18next";
import { getCvsByStudentId } from "../../modules/services/cvService";
import { createApplication } from "../../modules/services/applicationsService";
import { uploadMedia, deleteMedia } from "../../modules/services/mediaService";
import { useCustomAlert } from "../../hooks/useCustomAlert";
import CustomAlert from "./CustomAlert";

export default function ApplicationModal({ open, onVisibleChange, jobId }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Custom Alert Hook
  const { alertConfig, hideAlert, showSuccess, showError, showWarning } = useCustomAlert();

  // Selectors
  const currentUser = useSelector(state => state.auth.user);
  const cvsFromStore = useSelector(state => state.cvs?.cvs || []);

  // State
  const [infoStatus, setInfoStatus] = useState(infoApplyStatus.EMPTY);
  const [selectedCvId, setSelectedCvId] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isLoadingCvs, setIsLoadingCvs] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: ''
  });

  // Refs
  const fileInputRef = useRef(null);

  // Pre-fill form data from user
  useEffect(() => {
    if (currentUser) {
      const studentInfo = Array.isArray(currentUser?.student_info)
        ? currentUser.student_info[0]
        : currentUser?.student_info;

      setFormData({
        fullName: `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || currentUser.first_name || '',
        email: currentUser.email || '',
        phoneNumber: studentInfo?.phone_number || ''
      });
    }
  }, [currentUser]);

  // Fetch CVs when modal opens and user is available
  useEffect(() => {
    if (open && currentUser) {
      const studentInfo = Array.isArray(currentUser?.student_info)
        ? currentUser.student_info[0]
        : currentUser?.student_info;
      const studentId = studentInfo?.id || studentInfo?.student_id;

      if (studentId) {
        setIsLoadingCvs(true);
        dispatch(getCvsByStudentId({ studentId }))
          .finally(() => setIsLoadingCvs(false));
      }
    }
  }, [open, currentUser, dispatch]);

  // Determine user info status
  useEffect(() => {
    if (!currentUser) {
      setInfoStatus(infoApplyStatus.EMPTY);
      return;
    }

    const { first_name: firstname, email, student_info: info } = currentUser;

    if (!firstname || !email || !info || !Array.isArray(info) || !info[0]) {
      setInfoStatus(infoApplyStatus.EMPTY);
      return;
    }

    const studentInfo = info[0];

    // Check if has CV
    if (studentInfo.cv?.[0]) {
      setInfoStatus(infoApplyStatus.COMPLETE);
      if (!selectedCvId && studentInfo.cv[0]?.id) {
        setSelectedCvId(studentInfo.cv[0].id);
      }
      return;
    }

    // Check required fields
    const { about, date_of_birth: dob, gender, phone_number: phoneNumber, location } = studentInfo;

    if (about && dob && gender && phoneNumber && location) {
      setInfoStatus(infoApplyStatus.COMPLETE);
    } else {
      setInfoStatus(infoApplyStatus.LACK);
    }
  }, [currentUser, selectedCvId]);

  const handleClose = () => {
    setSelectedCvId(null);
    setUploadedFile(null);

    // Reset form data to user's original data
    if (currentUser) {
      const studentInfo = Array.isArray(currentUser?.student_info)
        ? currentUser.student_info[0]
        : currentUser?.student_info;
      setFormData({
        fullName: `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || currentUser.first_name || '',
        email: currentUser.email || '',
        phoneNumber: studentInfo?.phone_number || ''
      });
    }
    onVisibleChange(false);
  };

  const handleNavigateToProfile = () => {
    navigate('/profile/user-profile');
    handleClose();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!validTypes.includes(file.type)) {
      showWarning(t("application.invalidFileType"));
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showWarning(t("application.fileTooLarge"));
      return;
    }

    setUploadedFile(file);
    setSelectedCvId('upload');
  };

  // Get CVs list from store or currentUser — must be above handleSubmitApplication
  const cvs = cvsFromStore.length > 0
    ? cvsFromStore
    : (Array.isArray(currentUser?.student_info)
      ? currentUser.student_info[0]?.cv
      : currentUser?.student_info?.cv) || [];

  const latestCv = cvs[0] || null;

  // Get user info for display
  const studentInfo = Array.isArray(currentUser?.student_info)
    ? currentUser.student_info[0]
    : currentUser?.student_info;

  const userInfo = currentUser ? {
    fullName: `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || currentUser.first_name || '',
    email: currentUser.email || '',
    phone: studentInfo?.phone_number || ''
  } : null;

  const handleSubmitApplication = async () => {
    let uploadedFileName = null;

    try {
      // Validate jobId
      if (!jobId) {
        throw new Error('Job ID is required');
      }

      let resumeUrl = '';

      // Case 1: Upload new CV
      if (selectedCvId === 'upload' && uploadedFile) {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('file', uploadedFile);

        // Upload file and get URL
        const uploadResult = await dispatch(uploadMedia(formData)).unwrap();
        resumeUrl = uploadResult.url || uploadResult.filepath;
        uploadedFileName = uploadResult.fileName;

        if (!resumeUrl) {
          throw new Error('Failed to upload CV file');
        }
      }
      // Case 2: Use existing CV
      else {
        // Find selected CV and get its filepath
        const selectedCv = cvs.find(cv => {
          const cvId = cv.id || cv.cvid || cv.cv_id;
          return cvId?.toString() === selectedCvId?.toString();
        });

        if (!selectedCv?.filepath) {
          throw new Error('CV file path not found');
        }

        resumeUrl = selectedCv.filepath;
      }

      // Prepare payload
      const payload = {
        job_id: parseInt(jobId),
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phoneNumber,
        resume_url: resumeUrl
      };

      // console.log('Submitting application with jobId:', jobId, 'payload:', payload);

      // Submit application
      await dispatch(createApplication(payload)).unwrap();

      // Show success message
      showSuccess(t("application.submitSuccess"));

      handleClose();
    } catch (error) {
      console.error('Error submitting application:', error);

      if (uploadedFileName) {
        try {
          await dispatch(deleteMedia(uploadedFileName)).unwrap();
        } catch (deleteError) {
          console.error('Failed to delete uploaded CV file during rollback:', deleteError);
        }
      }

      const errorMessage =
        error?.message ||
        (typeof error === 'string' ? error : null) ||
        t("application.submitError")
      showError(errorMessage);
    }
  };



  if (infoStatus === infoApplyStatus.LACK) {
    return (
      <>
        <Modal
          title={
            <div className="flex items-center gap-2">
              <AlertCircle className="w-8 h-8 text-orange-500" />
              <span className="text-xl font-semibold">{t("application.inCompleteInfo")}</span>
            </div>
          }
          open={open}
          onCancel={handleClose}
          centered
          footer={
            <div className="flex justify-end gap-2">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-white rounded-lg border hover:bg-gray-50 transition-all cursor-pointer"
              >
                {t("application.close")}
              </button>
              <button
                onClick={handleNavigateToProfile}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all cursor-pointer"
              >
                {t("application.editInfo")}
              </button>
            </div>
          }
        >
          <p className="text-lg">{t("application.yourInfoIncomplete")}</p>
          <p className="italic">{t("application.pleaseUpdateInfo")}</p>
        </Modal>
        <CustomAlert
          {...alertConfig}
          onClose={hideAlert}
        />
      </>
    );
  }

  // Application Modal with CV Selection (shown when COMPLETE)
  if (infoStatus === infoApplyStatus.COMPLETE) {
    return (
      <>
        <Modal
          title={
            <div className="flex items-center gap-2">
              <Check className="w-8 h-8 text-green-500" />
              <span className="text-xl font-semibold">{t("application.confirmApply")}</span>
            </div>
          }
          open={open}
          onCancel={handleClose}
          footer={null}
          width={700}
          centered
        >
          <div className="space-y-6">
            {/* Confirmation Message */}
            <div className="pb-4 border-b">
              <p className="text-base text-foreground mb-2">
                {t("application.areYouSureApply")}
              </p>
              <p className="text-sm text-muted-foreground italic mb-1">
                {t("application.pleaseCheckInfo")}
              </p>
              {/* <p className="text-sm text-muted-foreground italic">
              {t("application.pleaseSelectCv")"}
            </p> */}
            </div>

            <Spin spinning={isLoadingCvs}>
              <Radio.Group
                value={selectedCvId}
                onChange={(e) => setSelectedCvId(e.target.value)}
                className="w-full"
              >
                <div className="space-y-4">
                  {/* Latest CV Option */}
                  {latestCv && (
                    <div className="border rounded-lg p-4 hover:border-primary transition-colors">
                      <Radio
                        value={latestCv.id || latestCv.cvid || latestCv.cv_id}
                        className="w-full"
                        onChange={(e) => {
                          setSelectedCvId(e.target.value);
                          setUploadedFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                      >
                        <div className="ml-2 w-full">
                          <div className="font-semibold text-sm text-muted-foreground mb-2">
                            {t("application.latestCv")}
                          </div>
                          <div className="font-medium text-base mb-3">
                            {latestCv.title || latestCv.filepath?.split('/').pop() || 'CV.pdf'}
                          </div>
                          {userInfo && (
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <div>
                                <span className="font-medium">{t("application.fullName")}:</span> {userInfo.fullName}
                              </div>
                              <div>
                                <span className="font-medium">{t("application.email")}:</span> {userInfo.email}
                              </div>
                              {userInfo.phone && (
                                <div>
                                  <span className="font-medium">{t("application.phoneNumber")}:</span> {userInfo.phone}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </Radio>
                    </div>
                  )}

                  {/* Other CVs from library */}
                  {cvs.length > 1 && (
                    <div className="border rounded-lg p-4 hover:border-primary transition-colors">
                      <div className="ml-2 w-full">
                        <div className="font-semibold text-sm text-muted-foreground mb-3">
                          {t("application.selectOtherCv")}
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {cvs.slice(1).map((cv) => {
                            const cvId = cv.id || cv.cvid || cv.cv_id;
                            return (
                              <div
                                key={cvId}
                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedCvId === cvId
                                  ? 'border-primary bg-primary/5'
                                  : 'hover:bg-gray-50'
                                  }`}
                                onClick={() => {
                                  setSelectedCvId(cvId);
                                  setUploadedFile(null);
                                  if (fileInputRef.current) {
                                    fileInputRef.current.value = '';
                                  }
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedCvId === cvId
                                    ? 'border-primary bg-primary'
                                    : 'border-gray-300'
                                    }`}>
                                    {selectedCvId === cvId && (
                                      <div className="w-2 h-2 rounded-full bg-white" />
                                    )}
                                  </div>
                                  <span className="font-medium">
                                    {cv.title || cv.filepath?.split('/').pop() || 'CV.pdf'}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Upload new CV */}
                  <div className="border rounded-lg p-4 hover:border-primary transition-colors">
                    <Radio
                      value="upload"
                      className="w-full"
                      onChange={(e) => {
                        setSelectedCvId('upload');
                        setUploadedFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                    >
                      <div className="ml-2 w-full">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <div className="font-semibold text-sm text-muted-foreground">
                            {t("application.uploadCvFromComputer")}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mb-3">
                          {t("application.supportedFormatsFull")}
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            fileInputRef.current?.click();
                            setSelectedCvId('upload');
                          }}
                          className="w-full px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors mb-4"
                        >
                          {uploadedFile ? uploadedFile.name : t("application.selectCv")}
                        </button>

                        {/* Form fields when upload option is selected */}
                        {selectedCvId === 'upload' && (
                          <div className="mt-4 pt-4 border-t space-y-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-primary">
                                {t("application.pleaseEnterFullInfo")}
                              </span>
                              <span className="text-xs text-red-500">
                                {t("application.requiredFields")}
                              </span>
                            </div>

                            {/* Full Name */}
                            <div className="space-y-1">
                              <Label htmlFor="upload-fullname" className="text-sm font-medium text-foreground">
                                {t("application.fullName")} <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="upload-fullname"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                placeholder={t("application.enterFullName")}
                                className="h-10"
                              />
                            </div>

                            {/* Email */}
                            <div className="space-y-1">
                              <Label htmlFor="upload-email" className="text-sm font-medium text-foreground">
                                {t("application.email")} <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="upload-email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder={t("application.enterEmail")}
                                className="h-10"
                              />
                            </div>

                            {/* Phone Number */}
                            <div className="space-y-1">
                              <Label htmlFor="upload-phone" className="text-sm font-medium text-foreground">
                                {t("application.phoneNumber")} <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="upload-phone"
                                type="tel"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                placeholder={t("application.enterPhoneNumber")}
                                className="h-10"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </Radio>
                  </div>
                </div>
              </Radio.Group>
            </Spin>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={handleClose}
                className="px-5 py-2.5 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 transition-all cursor-pointer font-medium"
              >
                {t("application.close")}
              </button>
              <button
                onClick={handleNavigateToProfile}
                className="px-5 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all cursor-pointer font-medium"
              >
                {t("application.viewInformation")}
              </button>
              <button
                onClick={handleSubmitApplication}
                disabled={
                  !selectedCvId ||
                  selectedCvId === 'library' ||
                  (selectedCvId === 'upload' && (!uploadedFile || !formData.fullName || !formData.email || !formData.phoneNumber))
                }
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("application.apply")}
              </button>
            </div>
          </div>
        </Modal>
        <CustomAlert
          {...alertConfig}
          onClose={hideAlert}
        />
      </>
    );
  }

  // Modal for EMPTY status - User needs to add information
  return (
    <>
      <Modal
        title={
          <div className="flex items-center gap-2">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <span className="text-xl font-semibold">{t("application.noInfo")}</span>
          </div>
        }
        open={open}
        onCancel={handleClose}
        centered
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-white rounded-lg border hover:bg-gray-50 transition-all cursor-pointer"
            >
              {t("application.close")}
            </button>
            <button
              onClick={handleNavigateToProfile}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all cursor-pointer"
            >
              {t("application.updateInfo")}
            </button>
          </div>
        }
      >
        <p className="text-lg">{t("application.noInfoMessage")}</p>
        <p className="italic">{t("application.pleaseAddInfo")}</p>
      </Modal>
      <CustomAlert
        {...alertConfig}
        onClose={hideAlert}
      />
    </>
  );
}
