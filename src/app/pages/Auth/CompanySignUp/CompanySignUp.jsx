import { useState, useEffect } from "react";
import { delay, motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FormControlLabel, Checkbox } from "@mui/material";
import {
  Mail as MailIcon,
  Lock as LockIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Error as ErrorIcon
} from "@mui/icons-material";
import { CustomAlert, LangButtonGroup } from "@/components";
import { Button, Input } from "@/components/ui";
import { srcAsset } from "../../../lib";
import { register, validateEmail, validatePassword, getCompanyTypes, getProvinces, getWards } from "../../../modules";
import { useCustomAlert } from "../../../hooks/useCustomAlert";

export default function CompanySignUp() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getCompanyTypes());
    dispatch(getProvinces(1)); // Fetch provinces for Vietnam by default
  }, [dispatch]);

  const [companyBranches, setCompanyBranches] = useState([
    { name: '', address: '', country_id: 1, province_id: '', ward_id: '' }
  ]);

  const [branchesError, setBranchesError] = useState([]);
  const [provinceSearchTerms, setProvinceSearchTerms] = useState(['']);
  const [wardSearchTerms, setWardSearchTerms] = useState(['']);
  const [showProvinceDropdowns, setShowProvinceDropdowns] = useState([false]);
  const [showWardDropdowns, setShowWardDropdowns] = useState([false]);

  const companyTypes = useSelector(state => state.companyTypes.companyTypes || []);
  const provincesRaw = useSelector(state => state.address?.provinces?.data);
  const wardsRaw = useSelector(state => state.address?.wards?.data);
  const provinces = Array.isArray(provincesRaw) ? provincesRaw : [];
  const wards = Array.isArray(wardsRaw) ? wardsRaw : [];
  const countries = [{ id: 1, name: 'Việt Nam' }];
  const [companyType, setCompanyType] = useState([]);
  const [showCompanyTypeDropdown, setShowCompanyTypeDropdown] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.getElementById('company-type-dropdown');
      if (dropdown && !dropdown.contains(event.target)) {
        setShowCompanyTypeDropdown(false);
      }
    };

    if (showCompanyTypeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCompanyTypeDropdown]);

  const toggleCompanyType = (id) => {
    setCompanyType((prevTypes) => {
      const index = prevTypes.indexOf(id);
      return index > -1
        ? prevTypes.filter(item => item !== id)
        : [...prevTypes, id];
    });
  };
  const nav = useNavigate();
  const { alertConfig, hideAlert, showSuccess, showError, showWarning } = useCustomAlert();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [loginEmailError, setLoginEmailError] = useState("");
  const [companyEmailError, setCompanyEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [companyNameError, setCompanyNameError] = useState("");
  const [websiteUrlError, setWebsiteUrlError] = useState("");

  // Validation functions
  const validateFirstNameField = (firstNameValue) => {
    if (!firstNameValue.trim()) {
      setFirstNameError("Tên không được để trống");
      return false;
    } else {
      setFirstNameError("");
      return true;
    }
  };

  const validateLastNameField = (lastNameValue) => {
    if (!lastNameValue.trim()) {
      setLastNameError("Họ không được để trống");
      return false;
    } else {
      setLastNameError("");
      return true;
    }
  };

  const validateLoginEmailField = (emailValue) => {
    if (!emailValue) {
      setLoginEmailError("Email đăng nhập không được để trống");
      return false;
    } else if (!validateEmail(emailValue)) {
      setLoginEmailError("Vui lòng nhập địa chỉ email hợp lệ");
      return false;
    } else {
      setLoginEmailError("");
      return true;
    }
  };

  const validateCompanyEmailField = (emailValue) => {
    if (!emailValue) {
      setCompanyEmailError("Email doanh nghiệp không được để trống");
      return false;
    } else if (!validateEmail(emailValue)) {
      setCompanyEmailError("Vui lòng nhập địa chỉ email doanh nghiệp hợp lệ");
      return false;
    } else {
      setCompanyEmailError("");
      return true;
    }
  };

  const validatePasswordField = (passwordValue) => {
    const valid = validatePassword(passwordValue);
    const error = valid.map((err) => {
      if (err === 'validation.passwordMinLength') {
        return t('validation.passwordMinLength', { min: 8 });
      } else {
        return t(err);
      }
    }).join("\n");
    if (!passwordValue || valid.length > 0) {
      setPasswordError(error);
      return false;
    } else {
      setPasswordError("");
      return true;
    }
  };

  const validateConfirmPasswordField = (confirmPasswordValue) => {
    if (!confirmPasswordValue) {
      setConfirmPasswordError("Nhập lại mật khẩu không được để trống");
      return false;
    } else if (password !== confirmPasswordValue) {
      setConfirmPasswordError("Mật khẩu không khớp");
      return false;
    } else {
      setConfirmPasswordError("");
      return true;
    }
  };

  const validatePhoneField = (phoneValue) => {
    if (!phoneValue) {
      setPhoneError("Số điện thoại không được để trống");
      return false;
    } else if (!/^[0-9]{10,11}$/.test(phoneValue)) {
      setPhoneError("Số điện thoại không hợp lệ (10-11 chữ số)");
      return false;
    } else {
      setPhoneError("");
      return true;
    }
  };

  const validateCompanyNameField = (companyNameValue) => {
    if (!companyNameValue.trim()) {
      setCompanyNameError("Tên công ty không được để trống");
      return false;
    } else {
      setCompanyNameError("");
      return true;
    }
  };

  const validateBranchField = (branchIndex, fieldName, value) => {
    const newBranchesError = [...branchesError];
    if (!newBranchesError[branchIndex]) {
      newBranchesError[branchIndex] = {};
    }

    if (!value) {
      const errorMessages = {
        name: 'Tên chi nhánh không được để trống',
        address: 'Địa chỉ không được để trống',
        country_id: 'Chọn quốc gia',
        province_id: 'Chọn tỉnh/thành',
        ward_id: 'Chọn phường/xã'
      };
      newBranchesError[branchIndex][fieldName] = errorMessages[fieldName];
    } else {
      delete newBranchesError[branchIndex][fieldName];
    }

    setBranchesError(newBranchesError);
  };

  // Blur handlers
  const handleFirstNameBlur = () => {
    validateFirstNameField(firstName);
  };

  const handleLastNameBlur = () => {
    validateLastNameField(lastName);
  };

  const handleLoginEmailBlur = () => {
    validateLoginEmailField(loginEmail);
  };

  const handleCompanyEmailBlur = () => {
    validateCompanyEmailField(companyEmail);
  };

  const handlePasswordBlur = () => {
    validatePasswordField(password);
    // Re-validate confirm password if it has been filled
    if (confirmPassword) {
      validateConfirmPasswordField(confirmPassword);
    }
  };

  const handleConfirmPasswordBlur = () => {
    validateConfirmPasswordField(confirmPassword);
  };

  const handlePhoneBlur = () => {
    validatePhoneField(phone);
  };

  const handleCompanyNameBlur = () => {
    validateCompanyNameField(companyName);
  };

  const handleBranchNameBlur = (idx) => {
    validateBranchField(idx, 'name', companyBranches[idx]?.name);
  };

  const handleBranchAddressBlur = (idx) => {
    validateBranchField(idx, 'address', companyBranches[idx]?.address);
  };

  const handleBranchCountryBlur = (idx) => {
    validateBranchField(idx, 'country_id', companyBranches[idx]?.country_id);
  };

  const handleBranchProvinceBlur = (idx) => {
    validateBranchField(idx, 'province_id', companyBranches[idx]?.province_id);
  };

  const handleBranchWardBlur = (idx) => {
    validateBranchField(idx, 'ward_id', companyBranches[idx]?.ward_id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isFirstNameValid = validateFirstNameField(firstName);
    const isLastNameValid = validateLastNameField(lastName);
    const isLoginEmailValid = validateLoginEmailField(loginEmail);
    const isCompanyEmailValid = validateCompanyEmailField(companyEmail);
    const isPasswordValid = validatePasswordField(password);
    const isConfirmPasswordValid = validateConfirmPasswordField(confirmPassword);
    const isPhoneValid = validatePhoneField(phone);
    const isCompanyNameValid = validateCompanyNameField(companyName);

    // Validate branches
    let branchesValid = true;
    const newBranchesError = companyBranches.map((b) => {
      const err = {};
      if (!b.name) err.name = 'Tên chi nhánh không được để trống';
      if (!b.address) err.address = 'Địa chỉ không được để trống';
      if (!b.country_id) err.country_id = 'Chọn quốc gia';
      if (!b.province_id) err.province_id = 'Chọn tỉnh/thành';
      if (!b.ward_id) err.ward_id = 'Chọn phường/xã';
      if (Object.keys(err).length > 0) branchesValid = false;
      return err;
    });
    setBranchesError(newBranchesError);

    // Validate terms agreement
    if (!agreeTerms) {
      showWarning("Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách bảo mật");
    }

    const valid = isFirstNameValid && isLastNameValid && isLoginEmailValid &&
      isCompanyEmailValid && isPasswordValid && isConfirmPasswordValid &&
      isPhoneValid && isCompanyNameValid && branchesValid && agreeTerms;

    if (valid) {
      try {
        const payload = {
          email: loginEmail,
          first_name: firstName,
          last_name: lastName,
          password,
          confirm_password: confirmPassword,
          role: 'Employer',
          company: {
            name: companyName,
            company_types: companyType,
            phone,
            email: companyEmail,
            website_url: websiteUrl,
            company_branches: companyBranches.map(b => ({
              ...b,
              country_id: b.country_id || null,
              province_id: b.province_id || null,
              ward_id: b.ward_id || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }))
          }
        };

        const result = await dispatch(register(payload));
        if (register.fulfilled.match(result)) {
          showSuccess("Đăng ký thành công! Vui lòng đăng nhập.");
          delay(() => { nav("/signin"); }, 1000);
        }
      } catch (error) {
        showError(error.message || "Đăng ký thất bại");
      }
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-r from-anti-flash-white from-30% to-secondary flex items-center justify-center p-4 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-9 left-0 right-0 px-12 flex justify-between z-50"
      >
        <img src={srcAsset.SELargeLogo} alt="KHOA CÔNG NGHỆ PHẦN MỀM" className="h-12 w-auto cursor-pointer" onClick={() => { nav("/"); }} />

        <LangButtonGroup />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 w-full lg:max-w-6xl xl:max-w-7xl max-w-full my-8 z-100"
      >
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-center gap-4">
              <h3 className="text-2xl md:text-3xl font-medium text-gray-900">Đăng ký tài khoản</h3>
              <button
                type="button"
                onClick={() => nav('/signin')}
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                Bạn đã có tài khoản? Đăng nhập
              </button>
            </div>

            {/* Grid Layout: 2 columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Left Column: Đăng ký tài khoản */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Thông tin tài khoản</h4>

                {/* Name Fields */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <label className="block text-sm font-medium text-gray-900 h-5">
                      Họ <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <PersonIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" style={{ fontSize: '20px' }} />
                      <input
                        type="text"
                        placeholder="Họ"
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        onBlur={handleLastNameBlur}
                        className={`w-full h-12 rounded-lg border px-3 pl-10 focus:border-blue-500 focus:ring-blue-500 ${lastNameError ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    </div>
                    {lastNameError && (
                      <p className="text-xs text-red-500 mt-1">{lastNameError}</p>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="block text-sm font-medium text-gray-900 h-5">
                      Tên <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <PersonIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" style={{ fontSize: '20px' }} />
                      <input
                        type="text"
                        placeholder="Tên"
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        onBlur={handleFirstNameBlur}
                        className={`w-full h-12 rounded-lg border px-3 pl-10 focus:border-blue-500 focus:ring-blue-500 ${firstNameError ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    </div>
                    {firstNameError && (
                      <p className="text-xs text-red-500 mt-1">{firstNameError}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-900 h-5">
                    Email đăng nhập <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" style={{ fontSize: '20px' }} />
                    <input
                      id="email"
                      type="email"
                      placeholder="Email đăng nhập"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      onBlur={handleLoginEmailBlur}
                      className={`w-full h-12 rounded-lg border px-3 pl-10 focus:border-blue-500 focus:ring-blue-500 ${loginEmailError ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {loginEmailError && (
                      <ErrorIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 z-10" style={{ fontSize: '16px' }} />
                    )}
                  </div>
                  {loginEmailError && (
                    <p className="text-xs text-red-500 mt-1">{loginEmailError}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                    Mật khẩu<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" style={{ fontSize: '20px' }} />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mật khẩu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={handlePasswordBlur}
                      className={`w-full h-12 rounded-lg border px-3 pl-10 pr-12 focus:border-blue-500 focus:ring-blue-500 ${passwordError ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {passwordError && (
                      <ErrorIcon className="absolute right-12 top-1/2 -translate-y-1/2 text-red-500 z-10" style={{ fontSize: '16px' }} />
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Mật khẩu nên có ký tự viết hoa, viết thường, số và ký tự đặc biệt</p>
                  {passwordError && (
                    <p className="text-xs text-red-500 mt-1">{passwordError}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 h-5">
                    Nhập lại mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" style={{ fontSize: '20px' }} />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Nhập lại mật khẩu"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onBlur={handleConfirmPasswordBlur}
                      className={`w-full h-12 rounded-lg border px-3 pl-10 pr-12 focus:border-blue-500 focus:ring-blue-500 ${confirmPasswordError ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {confirmPasswordError && (
                      <ErrorIcon className="absolute right-12 top-1/2 -translate-y-1/2 text-red-500 z-10" style={{ fontSize: '16px' }} />
                    )}
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {confirmPasswordError && (
                    <p className="text-xs text-red-500 mt-1">{confirmPasswordError}</p>
                  )}
                </div>

                {/* Terms and Privacy */}
                <div className="pt-4">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        sx={{
                          color: '#0041D9',
                          '&.Mui-checked': {
                            color: '#0041D9',
                          },
                        }}
                      />
                    }
                    label={
                      <span className="text-sm text-gray-700">
                        Tôi đã đọc và đồng ý với{' '}
                        <Link to="/terms" className="text-blue-600 hover:underline">
                          Điều khoản dịch vụ
                        </Link>
                        {' '}và{' '}
                        <Link to="/privacy" className="text-blue-600 hover:underline">
                          Chính sách bảo mật
                        </Link>
                        {' '}của SE JOBS.
                      </span>
                    }
                  />
                </div>
              </div>

              {/* Right Column: Thông tin nhà tuyển dụng */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Thông tin nhà tuyển dụng</h4>

                {/* Company Name */}
                <div className="space-y-2">
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-900 h-5">
                    Tên công ty <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <BusinessIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" style={{ fontSize: '20px' }} />
                    <input
                      id="companyName"
                      type="text"
                      placeholder="Tên công ty"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      onBlur={handleCompanyNameBlur}
                      className={`w-full h-12 rounded-lg border px-3 pl-10 focus:border-blue-500 focus:ring-blue-500 ${companyNameError ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {companyNameError && (
                      <ErrorIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 z-10" style={{ fontSize: '16px' }} />
                    )}
                  </div>
                  {companyNameError && (
                    <p className="text-xs text-red-500 mt-1">{companyNameError}</p>
                  )}
                </div>

                {/* Company Type and Website URL - 2 columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Company Type */}
                  <div className="space-y-2">
                    <label htmlFor="companyType" className="block text-sm font-medium text-gray-900 h-5">
                      Loại hình công ty <span className="text-red-500">*</span>
                    </label>
                    <div className="relative" id="company-type-dropdown">
                      <div
                        className="w-full h-12 rounded-lg border border-gray-300 hover:border-blue-500 bg-white cursor-pointer flex items-center"
                        onClick={() => setShowCompanyTypeDropdown(!showCompanyTypeDropdown)}
                      >
                        <div className="flex flex-wrap gap-2 p-2 w-full items-center h-full overflow-y-auto">
                          {companyType.length === 0 ? (
                            <span className="text-gray-400 py-1.5 px-1">Chọn loại hình công ty</span>
                          ) : (
                            companyType.map(id => {
                              const found = companyTypes.find(type => type.id === id);
                              return (
                                <span
                                  key={id}
                                  className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                                >
                                  {found ? found.name : id}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCompanyType(prev => prev.filter(k => k !== id));
                                    }}
                                    className="hover:bg-blue-200 rounded-full p-0.5"
                                  >
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                </span>
                              );
                            })
                          )}
                        </div>
                      </div>
                      {showCompanyTypeDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                          {companyTypes.map((type) => {
                            const isChecked = companyType.includes(type.id);

                            return (
                              <div
                                key={type.id}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  toggleCompanyType(type.id);
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  readOnly
                                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 pointer-events-none"
                                />
                                <span className="text-sm text-gray-900">{type.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Company URL */}
                  <div className="space-y-2">
                    <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-900 h-5">
                      Đường dẫn website
                    </label>
                    <div className="relative">
                      <BusinessIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" style={{ fontSize: '20px' }} />
                      <input
                        id="websiteUrl"
                        type="text"
                        placeholder="https://example.com"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        className={`w-full h-12 rounded-lg border px-3 pl-10 focus:border-blue-500 focus:ring-blue-500 ${websiteUrlError ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {websiteUrlError && (
                        <ErrorIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 z-10" style={{ fontSize: '16px' }} />
                      )}
                    </div>
                    {websiteUrlError && (
                      <p className="text-xs text-red-500 mt-1">{websiteUrlError}</p>
                    )}
                  </div>
                </div>

                {/* Phone and Company Email - 2 columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div className="space-y-2">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-900 h-5">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" style={{ fontSize: '20px' }} />
                      <input
                        id="phone"
                        type="text"
                        placeholder="Số điện thoại"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onBlur={handlePhoneBlur}
                        className={`w-full h-12 rounded-lg border px-3 pl-10 focus:border-blue-500 focus:ring-blue-500 ${phoneError ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {phoneError && (
                        <ErrorIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 z-10" style={{ fontSize: '16px' }} />
                      )}
                    </div>
                    {phoneError && (
                      <p className="text-xs text-red-500 mt-1">{phoneError}</p>
                    )}
                  </div>

                  {/* Company Email */}
                  <div className="space-y-2">
                    <label htmlFor="companyEmail" className="block text-sm font-medium text-gray-900 h-5">
                      Email doanh nghiệp <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" style={{ fontSize: '20px' }} />
                      <input
                        id="companyEmail"
                        type="email"
                        placeholder="Email doanh nghiệp"
                        value={companyEmail}
                        onChange={(e) => setCompanyEmail(e.target.value)}
                        onBlur={handleCompanyEmailBlur}
                        className={`w-full h-12 rounded-lg border px-3 pl-10 focus:border-blue-500 focus:ring-blue-500 ${companyEmailError ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {companyEmailError && (
                        <ErrorIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 z-10" style={{ fontSize: '16px' }} />
                      )}
                    </div>
                    {companyEmailError && (
                      <p className="text-xs text-red-500 mt-1">{companyEmailError}</p>
                    )}
                  </div>
                </div>

                {/* Company Branches */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <h5 className="text-base font-semibold text-gray-900 mb-2">Chi nhánh công ty</h5>
                  {companyBranches.map((branch, idx) => (
                    <div key={idx} className="border rounded-lg p-4 mb-2 relative">
                      <div className="flex flex-col md:flex-row gap-4 mb-2">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-900">Tên chi nhánh <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            placeholder={companyName || 'Tên chi nhánh'}
                            value={branch.name}
                            onChange={e => {
                              const arr = [...companyBranches]; arr[idx].name = e.target.value; setCompanyBranches(arr);
                            }}
                            onBlur={() => handleBranchNameBlur(idx)}
                            className={`w-full h-12 rounded-lg border px-3 focus:border-blue-500 focus:ring-blue-500 ${branchesError[idx]?.name ? 'border-red-500' : 'border-gray-300'}`}
                          />
                          {branchesError[idx]?.name && (
                            <p className="text-xs text-red-500 mt-1">{branchesError[idx]?.name}</p>
                          )}
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-900">Địa chỉ <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            placeholder="Địa chỉ chi nhánh"
                            value={branch.address}
                            onChange={e => {
                              const arr = [...companyBranches]; arr[idx].address = e.target.value; setCompanyBranches(arr);
                            }}
                            onBlur={() => handleBranchAddressBlur(idx)}
                            className={`w-full h-12 rounded-lg border px-3 focus:border-blue-500 focus:ring-blue-500 ${branchesError[idx]?.address ? 'border-red-500' : 'border-gray-300'}`}
                          />
                          {branchesError[idx]?.address && (
                            <p className="text-xs text-red-500 mt-1">{branchesError[idx]?.address}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-900">Quốc gia <span className="text-red-500">*</span></label>
                          <select
                            className={`w-full h-12 rounded-lg border px-3 focus:border-blue-500 focus:ring-blue-500 ${branchesError[idx]?.country_id ? 'border-red-500' : 'border-gray-300'}`}
                            value={branch.country_id}
                            onChange={e => {
                              const arr = [...companyBranches];
                              arr[idx].country_id = Number(e.target.value);
                              arr[idx].province_id = '';
                              arr[idx].ward_id = '';
                              setCompanyBranches(arr);

                              // Fetch provinces for selected country
                              if (e.target.value) {
                                dispatch(getProvinces(e.target.value));
                              }
                            }}
                            onBlur={() => handleBranchCountryBlur(idx)}
                          >
                            <option value="">Chọn quốc gia</option>
                            {countries.map((country) => (
                              <option key={country.id} value={country.id}>{country.name}</option>
                            ))}
                          </select>
                          {branchesError[idx]?.country_id && (
                            <p className="text-xs text-red-500 mt-1">{branchesError[idx]?.country_id}</p>
                          )}
                        </div>
                        <div className="flex-1 relative">
                          <label className="block text-sm font-medium text-gray-900">Tỉnh/Thành <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            placeholder="Nhập để tìm tỉnh/thành"
                            value={provinceSearchTerms[idx] || ''}
                            onChange={e => {
                              const newTerms = [...provinceSearchTerms];
                              newTerms[idx] = e.target.value;
                              setProvinceSearchTerms(newTerms);

                              const newShowDropdowns = [...showProvinceDropdowns];
                              newShowDropdowns[idx] = true;
                              setShowProvinceDropdowns(newShowDropdowns);
                            }}
                            onFocus={() => {
                              const newShowDropdowns = [...showProvinceDropdowns];
                              newShowDropdowns[idx] = true;
                              setShowProvinceDropdowns(newShowDropdowns);
                            }}
                            onBlur={() => {
                              // Delay to allow dropdown click to register
                              setTimeout(() => {
                                const newShowDropdowns = [...showProvinceDropdowns];
                                newShowDropdowns[idx] = false;
                                setShowProvinceDropdowns(newShowDropdowns);
                                handleBranchProvinceBlur(idx);
                              }, 200);
                            }}
                            className={`w-full h-12 rounded-lg border px-3 focus:border-blue-500 focus:ring-blue-500 ${branchesError[idx]?.province_id ? 'border-red-500' : 'border-gray-300'}`}
                          />
                          {showProvinceDropdowns[idx] && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                              {provinces
                                .filter(prov =>
                                  String(prov.country_id) === String(branch.country_id) &&
                                  prov.name.toLowerCase().includes((provinceSearchTerms[idx] || '').toLowerCase())
                                )
                                .map((prov) => (
                                  <div
                                    key={prov.id}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => {
                                      const arr = [...companyBranches];
                                      arr[idx].province_id = Number(prov.id);
                                      arr[idx].ward_id = '';
                                      setCompanyBranches(arr);

                                      const newTerms = [...provinceSearchTerms];
                                      newTerms[idx] = prov.name;
                                      setProvinceSearchTerms(newTerms);

                                      const newShowDropdowns = [...showProvinceDropdowns];
                                      newShowDropdowns[idx] = false;
                                      setShowProvinceDropdowns(newShowDropdowns);

                                      const newWardTerms = [...wardSearchTerms];
                                      newWardTerms[idx] = '';
                                      setWardSearchTerms(newWardTerms);

                                      dispatch(getWards(prov.id));
                                    }}
                                  >
                                    {prov.name}
                                  </div>
                                ))
                              }
                              {provinces.filter(prov =>
                                String(prov.country_id) === String(branch.country_id) &&
                                prov.name.toLowerCase().includes((provinceSearchTerms[idx] || '').toLowerCase())
                              ).length === 0 && (
                                  <div className="px-4 py-2 text-gray-500">Không tìm thấy tỉnh/thành</div>
                                )}
                            </div>
                          )}
                          {branchesError[idx]?.province_id && (
                            <p className="text-xs text-red-500 mt-1">{branchesError[idx]?.province_id}</p>
                          )}
                        </div>
                        <div className="flex-1 relative">
                          <label className="block text-sm font-medium text-gray-900">Phường/Xã <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            placeholder={!branch.province_id ? "Chọn tỉnh/thành trước" : "Nhập để tìm phường/xã"}
                            value={wardSearchTerms[idx] || ''}
                            onChange={e => {
                              const newTerms = [...wardSearchTerms];
                              newTerms[idx] = e.target.value;
                              setWardSearchTerms(newTerms);

                              const newShowDropdowns = [...showWardDropdowns];
                              newShowDropdowns[idx] = true;
                              setShowWardDropdowns(newShowDropdowns);
                            }}
                            onFocus={() => {
                              if (branch.province_id) {
                                const newShowDropdowns = [...showWardDropdowns];
                                newShowDropdowns[idx] = true;
                                setShowWardDropdowns(newShowDropdowns);
                              }
                            }}
                            onBlur={() => {
                              // Delay to allow dropdown click to register
                              setTimeout(() => {
                                const newShowDropdowns = [...showWardDropdowns];
                                newShowDropdowns[idx] = false;
                                setShowWardDropdowns(newShowDropdowns);
                                handleBranchWardBlur(idx);
                              }, 200);
                            }}
                            disabled={!branch.province_id}
                            className={`w-full h-12 rounded-lg border px-3 focus:border-blue-500 focus:ring-blue-500 ${branchesError[idx]?.ward_id ? 'border-red-500' : 'border-gray-300'} ${!branch.province_id ? 'bg-gray-100' : ''}`}
                          />
                          {showWardDropdowns[idx] && branch.province_id && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                              {wards
                                .filter(ward =>
                                  String(ward.province_id) === String(branch.province_id) &&
                                  ward.name.toLowerCase().includes((wardSearchTerms[idx] || '').toLowerCase())
                                )
                                .map((ward) => (
                                  <div
                                    key={ward.id}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => {
                                      const arr = [...companyBranches];
                                      arr[idx].ward_id = Number(ward.id);
                                      setCompanyBranches(arr);

                                      const newTerms = [...wardSearchTerms];
                                      newTerms[idx] = ward.name;
                                      setWardSearchTerms(newTerms);

                                      const newShowDropdowns = [...showWardDropdowns];
                                      newShowDropdowns[idx] = false;
                                      setShowWardDropdowns(newShowDropdowns);
                                    }}
                                  >
                                    {ward.name}
                                  </div>
                                ))
                              }
                              {wards.filter(ward =>
                                String(ward.province_id) === String(branch.province_id) &&
                                ward.name.toLowerCase().includes((wardSearchTerms[idx] || '').toLowerCase())
                              ).length === 0 && (
                                  <div className="px-4 py-2 text-gray-500">Không tìm thấy phường/xã</div>
                                )}
                            </div>
                          )}
                          {branchesError[idx]?.ward_id && (
                            <p className="text-xs text-red-500 mt-1">{branchesError[idx]?.ward_id}</p>
                          )}
                        </div>
                      </div>
                      {companyBranches.length > 1 && (
                        <button type="button" className="absolute top-2 right-2 text-red-500 hover:text-red-700" onClick={() => {
                          setCompanyBranches(companyBranches.filter((_, i) => i !== idx));
                          setProvinceSearchTerms(provinceSearchTerms.filter((_, i) => i !== idx));
                          setWardSearchTerms(wardSearchTerms.filter((_, i) => i !== idx));
                          setShowProvinceDropdowns(showProvinceDropdowns.filter((_, i) => i !== idx));
                          setShowWardDropdowns(showWardDropdowns.filter((_, i) => i !== idx));
                        }}>Xóa</button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200" onClick={() => {
                    setCompanyBranches([...companyBranches, { name: '', address: '', country_id: 1, province_id: '', ward_id: '' }]);
                    setProvinceSearchTerms([...provinceSearchTerms, '']);
                    setWardSearchTerms([...wardSearchTerms, '']);
                    setShowProvinceDropdowns([...showProvinceDropdowns, false]);
                    setShowWardDropdowns([...showWardDropdowns, false]);
                  }}>
                    Thêm chi nhánh
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!agreeTerms}
              className={`w-full rounded-lg h-12 text-base font-semibold ${agreeTerms
                ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              Hoàn tất
            </Button>
          </div>
        </form>
      </motion.div>
      <CustomAlert
        {...alertConfig}
        onClose={hideAlert}
      />
    </div>
  );
};