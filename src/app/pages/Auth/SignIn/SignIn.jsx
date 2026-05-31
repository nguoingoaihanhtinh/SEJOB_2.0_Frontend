import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CustomAlert, LangButtonGroup } from "@/components";
import { srcAsset } from "../../../lib";
import { validateEmail, validatePassword } from "../../../modules";
import { loginWithEmail, getMe } from "../../../modules";
import { useCustomAlert } from "../../../hooks/useCustomAlert";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Button, Input } from "@/components/ui";

export default function SignIn() {
  const dispatch = useDispatch();
  const nav = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const from = location.state?.from || "/";

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const { alertConfig, hideAlert, showSuccess, showError } = useCustomAlert();

  const validateEmailField = (emailValue) => {
    if (!emailValue) {
      setEmailError(t('validation.required'));
      return false;
    } else if (!validateEmail(emailValue)) {
      setEmailError(t('validation.invalidEmail'));
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

  const handleEmailBlur = () => {
    validateEmailField(email);
  };

  const handlePasswordBlur = () => {
    validatePasswordField(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEmailValid = validateEmailField(email);
    const isPasswordValid = validatePasswordField(password);

    if (isEmailValid && isPasswordValid) {
      setLoading(true);
      try {
        const result = await dispatch(loginWithEmail({ email, password }));
        if (loginWithEmail.fulfilled.match(result)) {
          showSuccess("Login successful!");
          await new Promise(resolve => setTimeout(resolve, 1000));
          nav("/", { replace: true });
        } else {
          console.error("Login failed: ", result);
          showError("Login failed: " + (result.payload || "Unknown error"));
        }
      } catch (error) {
        console.error("Error during login:", error);
        showError("An error occurred during login. Please try again.");
      }
      finally {
        setLoading(false);
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
        <img
          src={srcAsset.SELargeLogo}
          alt="KHOA CÔNG NGHỆ PHẦN MỀM"
          className="h-12 w-auto cursor-pointer"
          onClick={() => {
            nav("/");
          }}
        />

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
            <p className="text-[20px] text-gray-600 mb-1">{t("welcome")}</p>
            <h3 className="text-3xl font-medium text-gray-900">{t("auth.sign_in")}</h3>
          </div>
          <div className="text-right">
            <p className="text-base text-gray-500">{t("auth.no_account")}</p>
            <Link to="/signup" className="text-base text-blue-600 hover:underline font-medium">
              {t("auth.sign_up")}
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 flex flex-col items-center">
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
            {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
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
                className="absolute cursor-pointer right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="flex items-center justify-end">
              {passwordError && <span className="text-xs text-red-500 mr-auto whitespace-pre-line">{passwordError}</span>}
              <Link to="/identify" replace={true} className="text-sm text-blue-600 hover:underline">
                {t("auth.forgot_password")}
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 text-base font-semibold cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                {t("auth.sign_in")}
              </>
            ) : (
              t("auth.sign_in")
            )}
          </Button>
        </form>
      </motion.div>

      <CustomAlert {...alertConfig} onClose={hideAlert} />
    </div>
  );
}
