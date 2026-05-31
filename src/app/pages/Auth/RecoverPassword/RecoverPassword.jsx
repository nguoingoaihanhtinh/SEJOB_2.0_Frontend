import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { CustomAlert, LangButtonGroup } from "@/components";
import { srcAsset } from "../../../lib";
import { useCustomAlert } from "../../../hooks/useCustomAlert";
import { useTranslation } from "react-i18next";
import { Button, Input } from "@/components/ui";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { requestPasswordReset, resetPassword, validatePassword } from "../../../modules";
import { useDispatch } from "react-redux";

export default function RecoverPassword() {
    const nav = useNavigate();
    const { t } = useTranslation();
    const location = useLocation();
    const email = location.state?.email || "";
    const dispatch = useDispatch();

    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [countdown, setCountdown] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { alertConfig, hideAlert, showSuccess, showError } = useCustomAlert();

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);
    //validate
    const validateCode = (codeValue) => {
        if (!codeValue) {
            setError(t('validation.required'));
            return false;
        }
        if (codeValue.length !== 6 || !/^\d+$/.test(codeValue)) {
            setError(t('validation.invalidCode'));
            return false;
        }
        setError("");
        return true;
    };

    const handleBlur = () => {
        validateCode(code);
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
            setConfirmPasswordError("Passwords do not match.");
            return false;
        } else {
            setConfirmPasswordError("");
            return true;
        }
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
    //handle functions
    const handleSubmit = async (e) => {
        e.preventDefault();
        const isValid = validateCode(code);
        const isPasswordValid = validatePasswordField(password);
        const isConfirmPasswordValid = validateConfirmPasswordField(confirmPassword);

        if (isValid && isPasswordValid && isConfirmPasswordValid) {
            try {
                setIsLoading(true);
                await dispatch(resetPassword({ email, otp: code, new_password: password })).unwrap();
                showSuccess("Change password successfully!");
                await new Promise(resolve => setTimeout(resolve, 1000));
                nav("/signin");
            } catch (error) {
                showError(error || "Failed to change password. Please try again.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleResendCode = async () => {
        if (countdown > 0) return;

        try {
            await dispatch(requestPasswordReset({ email })).unwrap();
            showSuccess("Verification code resent!");
            setCountdown(60);
        } catch (error) {
            showError(error || "Failed to resend code. Please try again.");
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
                className="bg-white rounded-3xl shadow-2xl p-12 w-full lg:max-w-2/5 md:max-w-lg space-y-4"
            >
                <div>
                    <h3 className="text-3xl font-medium text-gray-900">{t("auth.reset_password")}</h3>
                    <p className="text-base text-gray-600">
                        {t("auth.reset_password_des")}
                    </p>
                    {email && (
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">{t("auth.we_sent_code")}</p>
                            <p className="text-base font-medium text-gray-900">{email}</p>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 flex flex-col items-center">
                    <div className="w-full space-y-1">
                        <label htmlFor="password" className="block text-base font-medium text-gray-900">
                            {t("auth.recover_code")}
                        </label>
                        <div className="flex flex-row gap-3 items-start">
                            <div className="flex-1">
                                <Input
                                    id="code"
                                    type="text"
                                    placeholder={t("auth.enter_recover_code")}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    onBlur={handleBlur}
                                    maxLength={6}
                                    className="w-full h-11 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <Button
                                type="button"
                                onClick={handleResendCode}
                                disabled={countdown > 0}
                                className={`h-11 px-6 rounded-xl text-base font-semibold whitespace-nowrap ${countdown > 0
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed hover:bg-gray-200"
                                    : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                                    }`}
                            >
                                {countdown > 0 ? `${t("auth.resend")} (${countdown}s)` : t("auth.resend_code")}
                            </Button>
                        </div>
                        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                    </div>

                    <div className="w-full space-y-1">
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

                    <div className="w-full space-y-1">
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
                        disabled={isLoading || error || passwordError || confirmPasswordError || !code || !password || !confirmPassword}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 px-8 text-base font-semibold cursor-pointer"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" />
                                {t("auth.change_password")}
                            </>
                        ) : (
                            t("auth.change_password")
                        )}
                    </Button>
                </form>
            </motion.div>

            <CustomAlert {...alertConfig} onClose={hideAlert} />
        </div>
    );
}
