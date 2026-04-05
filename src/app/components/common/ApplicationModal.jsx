import _ from 'lodash';
import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { applicationApi, mediaApi } from '../../../api';

export default function ApplicationModal({ open, setOpen, jobId }) {
  const currentUser = useSelector(state => state.auth.user);

  const [existingCv, setExistingCv] = useState(null);
  const [isApplied, setIsApplied] = useState(false);
  const [cvMode, setCvMode] = useState('existing'); // 'existing' | 'upload'
  const [uploadedFile, setUploadedFile] = useState(null); // File object - chỉ lưu FE
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    previous_job: '',
    linkedin_url: '',
    portfolio_url: '',
    additional_information: '',
  });

  useEffect(() => {
    if (currentUser) {
      getApplication();
      const studentInfo = _.get(currentUser, 'student_info[0]', {});
      const cv = _.get(studentInfo, 'cv[0]', null);
      setForm({
        full_name: _.join(_.compact([_.get(currentUser, 'last_name'), _.get(currentUser, 'first_name')]), ' '),
        email: _.get(currentUser, 'email', ''),
        phone: _.get(currentUser, 'phone', '') || _.get(studentInfo, 'phone', ''),
        previous_job: _.get(studentInfo, 'previous_job', ''),
        linkedin_url: _.get(studentInfo, 'linkedin_url', ''),
        portfolio_url: _.get(studentInfo, 'portfolio_url', ''),
        additional_information: '',
      });

      if (cv) {
        setExistingCv(cv);
        setCvMode('existing');
      } else {
        setCvMode('upload');
      }
    }
  }, [currentUser]);

  const getApplication = async () => {
    if (!jobId) return;

    const application = await applicationApi.getOneByJobId(jobId);
    if (application?.success) {
      setIsApplied(true);
    }
  }

  const validate = () => {
    const newErrors = {};
    if (!form.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email';
    if (!form.phone.trim()) newErrors.phone = 'Phone is required';
    if (form.linkedin_url && !/^https?:\/\/.+/.test(form.linkedin_url))
      newErrors.linkedin_url = 'Must be a valid URL';
    if (form.portfolio_url && !/^https?:\/\/.+/.test(form.portfolio_url))
      newErrors.portfolio_url = 'Must be a valid URL';
    // Chỉ cần kiểm tra file đã được chọn chưa - chưa cần upload
    if (cvMode === 'upload' && !uploadedFile)
      newErrors.resume = 'Please select your CV';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Sync - chỉ validate + lưu File object vào state, KHÔNG gọi API upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowed.includes(file.type)) {
      setErrors(prev => ({ ...prev, resume: 'Only PDF or Word documents are accepted' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, resume: 'File must be under 5 MB' }));
      return;
    }

    setUploadedFile(file);
    setErrors(prev => ({ ...prev, resume: '' }));
  };

  const _uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await mediaApi.upload(formData);
    return res.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      // Bước 1: Upload file nếu cần - API chỉ được gọi tại đây
      let resume_url = cvMode === 'existing'
        ? (existingCv?.filepath || existingCv)
        : undefined;

      if (cvMode === 'upload' && uploadedFile) {
        setUploading(true);
        try {
          resume_url = await _uploadFile(uploadedFile);
        } catch {
          setErrors(prev => ({ ...prev, resume: 'Upload failed. Please try again.' }));
          return; // Dừng submit nếu upload thất bại
        } finally {
          setUploading(false);
        }
      }

      // Bước 2: Submit application với resume_url vừa lấy được
      const payload = {
        job_id: jobId,
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        previous_job: form.previous_job || undefined,
        linkedin_url: form.linkedin_url || '',
        portfolio_url: form.portfolio_url || '',
        additional_information: form.additional_information || undefined,
        resume_url: resume_url || undefined,
      };

      await applicationApi.create(payload);

      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setOpen(false);
        setIsApplied(true);
      }, 2000);
    } catch (err) {
      console.log(err)
      setSubmitError(_.get(err, 'response.data.message') || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setErrors({});
    setSubmitError('');
    setSubmitSuccess(false);
  };

  if (!open) return null;

  const isLoading = submitting || uploading;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      {isApplied && <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">You have already applied for this position</h3>
            <p className="text-sm text-gray-500 mt-0.5">You can view your application in the applications section</p>
          </div>
          <button
            onClick={handleClose}
            className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>}
      {!isApplied && <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Apply for Position</h3>
            <p className="text-sm text-gray-500 mt-0.5">Fill in your details below</p>
          </div>
          <button
            onClick={handleClose}
            className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Personal Info */}
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Personal Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" required error={errors.full_name}>
                <input name="full_name" value={form.full_name} onChange={handleChange}
                  placeholder="John Doe" className={inputClass(errors.full_name)} />
              </Field>
              <Field label="Email" required error={errors.email}>
                <input name="email" type="email" value={form.email} onChange={handleChange}
                  placeholder="john@example.com" className={inputClass(errors.email)} />
              </Field>
              <Field label="Phone" required error={errors.phone}>
                <input name="phone" value={form.phone} onChange={handleChange}
                  placeholder="+84 901 234 567" className={inputClass(errors.phone)} />
              </Field>
              <Field label="Previous Job Title" error={errors.previous_job}>
                <input name="previous_job" value={form.previous_job} onChange={handleChange}
                  placeholder="Frontend Developer" className={inputClass(errors.previous_job)} />
              </Field>
            </div>
          </section>

          {/* Links */}
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Online Presence</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="LinkedIn URL" error={errors.linkedin_url}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><LinkedInIcon /></span>
                  <input name="linkedin_url" value={form.linkedin_url} onChange={handleChange}
                    placeholder="https://linkedin.com/in/..."
                    className={`${inputClass(errors.linkedin_url)} pl-9`} />
                </div>
              </Field>
              <Field label="Portfolio URL" error={errors.portfolio_url}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><GlobeIcon /></span>
                  <input name="portfolio_url" value={form.portfolio_url} onChange={handleChange}
                    placeholder="https://yoursite.com"
                    className={`${inputClass(errors.portfolio_url)} pl-9`} />
                </div>
              </Field>
            </div>
          </section>

          {/* Resume */}
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Resume / CV</h4>
            <div className="space-y-3">
              {existingCv && (
                <label className={radioCardClass(cvMode === 'existing')} onClick={() => setCvMode('existing')}>
                  <input type="radio" name="cvMode" className="sr-only" checked={cvMode === 'existing'} readOnly />
                  <RadioDot active={cvMode === 'existing'} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">Use existing CV</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {typeof existingCv === 'string' ? existingCv : existingCv?.name || existingCv?.url || 'Your uploaded CV'}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full flex-shrink-0">Saved</span>
                </label>
              )}

              <label className={radioCardClass(cvMode === 'upload')} onClick={() => setCvMode('upload')}>
                <input type="radio" name="cvMode" className="sr-only" checked={cvMode === 'upload'} readOnly />
                <RadioDot active={cvMode === 'upload'} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Upload a new CV</p>
                  <p className="text-xs text-gray-500 mt-0.5">PDF or Word · Max 5 MB</p>
                </div>
              </label>

              {cvMode === 'upload' && (
                <div className="mt-2">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors
                      ${errors.resume ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/30'}`}
                  >
                    {uploadedFile ? (
                      <div className="flex flex-col items-center gap-1 text-gray-700">
                        <FileIcon />
                        <p className="text-sm font-medium">{uploadedFile.name}</p>
                        <p className="text-xs text-gray-400">
                          {(uploadedFile.size / 1024).toFixed(0)} KB ·{' '}
                          <span
                            className="underline cursor-pointer text-red-400"
                            onClick={e => {
                              e.stopPropagation();
                              setUploadedFile(null);
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                          >
                            Remove
                          </span>
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-gray-400">
                        <UploadIcon />
                        <p className="text-sm font-medium text-gray-600">Click to browse files</p>
                        <p className="text-xs">PDF, DOC, DOCX</p>
                      </div>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx"
                    onChange={handleFileChange} className="hidden" />
                  {errors.resume && <p className="text-xs text-red-500 mt-1">{errors.resume}</p>}
                </div>
              )}
            </div>
          </section>

          {/* Additional Info */}
          <section>
            <Field label="Additional Information" error={errors.additional_information}>
              <textarea name="additional_information" value={form.additional_information}
                onChange={handleChange} rows={3}
                placeholder="Tell us why you're a great fit for this role..."
                className={`${inputClass(errors.additional_information)} resize-none`} />
            </Field>
          </section>

          {submitError && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {submitError}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50">
          <button type="button" onClick={handleClose}
            className="px-4 py-2 cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={isLoading || submitSuccess}
            className={`px-6 py-2 cursor-pointer text-sm font-semibold rounded-lg transition-all flex items-center gap-2
              ${submitSuccess
                ? 'bg-green-500 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60 disabled:cursor-not-allowed'}`}
          >
            {uploading ? (
              <><Spinner /><span>Uploading CV...</span></>
            ) : submitting ? (
              <><Spinner /><span>Submitting...</span></>
            ) : submitSuccess ? (
              <><CheckIcon /><span>Submitted!</span></>
            ) : (
              'Submit Application'
            )}
          </button>
        </div>
      </div>}
    </div>
  );
}

/* ─── Sub-components ──────────────────────────────────────────────── */

function Field({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function RadioDot({ active }) {
  return (
    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center
      ${active ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'}`}>
      {active && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
    </div>
  );
}

/* ─── Helpers ─────────────────────────────────────────────────────── */

const inputClass = (error) =>
  `w-full px-3 py-2 text-sm rounded-lg border outline-none transition-colors
   focus:ring-2 focus:ring-indigo-500 focus:border-transparent
   ${error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}`;

const radioCardClass = (active) =>
  `flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all
   ${active ? 'border-indigo-500 bg-indigo-50/40' : 'border-gray-200 hover:border-gray-300'}`;

/* ─── Icons ───────────────────────────────────────────────────────── */

const Spinner = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const UploadIcon = () => (
  <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const FileIcon = () => (
  <svg className="w-8 h-8 mb-1 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
  </svg>
);