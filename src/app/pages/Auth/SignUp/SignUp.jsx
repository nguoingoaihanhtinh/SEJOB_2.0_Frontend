import { useState } from "react";
import { delay, motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { CustomAlert, LangButtonGroup } from "@/components";
import { srcAsset } from "../../../lib";
import { register, validateEmail, validatePassword } from "../../../modules";
import { useCustomAlert } from "../../../hooks/useCustomAlert";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Button, Input } from "@/components/ui";

export default function SignUp() {
  const nav = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [firstnameError, setFirstnameError] = useState("");
  const [lastnameError, setLastnameError] = useState("");
  const { alertConfig, hideAlert, showSuccess, showError, showWarning } = useCustomAlert();
  const [isLoading, setIsLoading] = useState(false);

  const validateFirstnameField = (firstnameValue) => {
    if (!firstnameValue) {
      setFirstnameError(t("validation.required"));
      return false;
    } else {
      setFirstnameError("");
      return true;
    }
  };

  const validateLastnameField = (lastnameValue) => {
    if (!lastnameValue) {
      setLastnameError(t("validation.required"));
      return false;
    } else {
      setLastnameError("");
      return true;
    }
  };

  const validateEmailField = (emailValue) => {
    if (!emailValue) {
      setEmailError(t("validation.required"));
      return false;
    } else if (!validateEmail(emailValue)) {
      setEmailError(t("validation.invalidEmail"));
      return false;
    } else {
      setEmailError("");
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
    if (password !== confirmPasswordValue) {
      setConfirmPasswordError(t("validation.passwordMismatch"));
      return false;
    } else {
      setConfirmPasswordError("");
      return true;
    }
  };

  const handleFirstnameBlur = () => {
    validateFirstnameField(firstname);
  };

  const handleLastnameBlur = () => {
    validateLastnameField(lastname);
  };

  const handleEmailBlur = () => {
    validateEmailField(email);
  };

  const handlePasswordBlur = () => {
    validatePasswordField(password);
    if (confirmPassword) {
      validateConfirmPasswordField(confirmPassword);
    }
  };

  const handleConfirmPasswordBlur = () => {
    validateConfirmPasswordField(confirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isFirstnameValid = validateFirstnameField(firstname);
    const isLastnameValid = validateLastnameField(lastname);
    const isEmailValid = validateEmailField(email);
    const isPasswordValid = validatePasswordField(password);
    const isConfirmPasswordValid = validateConfirmPasswordField(confirmPassword);

    if (isFirstnameValid && isLastnameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid) {
      try {
        setIsLoading(true);
        const result = await dispatch(register({ email, password, confirm_password: confirmPassword, first_name: firstname, last_name: lastname }));
        if (register.fulfilled.match(result)) {
          showSuccess("Registration successful! Please sign in.");
          delay(() => { nav("/signin"); }, 1000);
        } else {
          console.error("Registration failed: ", result);
          showError("Registration failed: " + (result.payload || "Unknown error"));
        }
      } catch (error) {
        showError(error.message || "Registration failed");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-r from-anti-flash-white from-30% to-secondary flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-9 px-12 justify-between flex flex-row min-w-screen"
      >
        <img src={srcAsset.SELargeLogo} alt="KHOA CÔNG NGHỆ PHẦN MỀM" className="h-12 w-auto cursor-pointer" onClick={() => { nav("/"); }} />

        <LangButtonGroup />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-3xl shadow-2xl p-12 w-full lg:max-w-2/5 md:max-w-lg"
      >
        <div className="flex justify-between items-center mb-5">
          <div className="flex flex-col gap-2">
            <p className="text-[20px] text-gray-600">{t("welcome")}</p>
            <h3 className="text-3xl font-medium text-gray-900">{t("auth.sign_up")}</h3>
          </div>
          <div className="text-right">
            <p className="text-base text-gray-500">{t("auth.already_have_account")}</p>
            <Link to="/signin" className="text-base text-blue-600 hover:underline font-medium">
              {t("auth.sign_in")}
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 flex flex-col items-center">
          <div className="w-full grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="firstname" className="block text-base font-medium text-gray-900">
                {t("first_name")}
              </label>
              <Input
                id="firstname"
                type="text"
                placeholder={t("auth.enter_first_name")}
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                onBlur={handleFirstnameBlur}
                className="w-full h-11 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              {firstnameError && (
                <p className="text-xs text-red-500 mt-1">{firstnameError}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="lastname" className="block text-base font-medium text-gray-900">
                {t("last_name")}
              </label>
              <Input
                id="lastname"
                type="text"
                placeholder={t("auth.enter_last_name")}
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                onBlur={handleLastnameBlur}
                className="w-full h-11 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              {lastnameError && (
                <p className="text-xs text-red-500 mt-1">{lastnameError}</p>
              )}
            </div>
          </div>
          <div className="w-full space-y-2">
            <label htmlFor="email" className="block text-base font-medium text-gray-900">
              {t("email")}
            </label>
            <Input
              id="email"
              type="text"
              placeholder={t("auth.enter_email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={handleEmailBlur}
              className="w-full h-11 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            {emailError && (
              <p className="text-xs text-red-500 mt-1">{emailError}</p>
            )}
          </div>

          <div className="w-full space-y-2">
            <label htmlFor="password" className="block text-base font-medium text-gray-900">
              {t("password")}
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("auth.enter_password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={handlePasswordBlur}
                className="w-full h-11 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {passwordError ? (
              passwordError.split('\n').map((err, idx) => (
                <p key={idx} className="text-xs text-red-500 mt-1">{err}</p>
              ))
            ) : (
              <p className="text-xs text-gray-500 mt-1">{t("validation.passwordRequired")}</p>
            )}
          </div>

          <div className="w-full space-y-2">
            <label htmlFor="confirmPassword" className="block text-base font-medium text-gray-900">
              {t("confirm_password")}
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t("auth.confirm_password")}
                value={confirmPassword}
                errorText=""
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={handleConfirmPasswordBlur}
                className="w-full h-11 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {confirmPasswordError && (
              <p className="text-xs text-red-500 mt-1">{confirmPasswordError}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="cursor-pointer w-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 text-base font-semibold cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" />
                {t("auth.sign_up")}
              </>
            ) : (
              t("auth.sign_up")
            )}
          </Button>
        </form>
      </motion.div>
      <CustomAlert
        {...alertConfig}
        onClose={hideAlert}
      />
    </div>
  );
};