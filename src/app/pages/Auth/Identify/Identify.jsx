import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CustomAlert, LangButtonGroup } from "@/components";
import { srcAsset } from "../../../lib";
import { requestPasswordReset, validateEmail } from "../../../modules";
import { useCustomAlert } from "../../../hooks/useCustomAlert";
import { useTranslation } from "react-i18next";
import { Button, Input } from "@/components/ui";
import { useDispatch } from "react-redux";

export default function Identify() {
  const nav = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { alertConfig, hideAlert, showSuccess, showError } = useCustomAlert();

  const validateField = (value) => {
    if (!value) {
      setError(t('validation.required'));
      return false;
    }
    
    if (!validateEmail(value)) {
      setError(t('validation.invalidEmail'));
      return false;
    }
    
    setError("");
    return true;
  };

  const handleBlur = () => {
    validateField(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateField(email);

    if (isValid) {
      try {
        setIsLoading(true);
        await dispatch(requestPasswordReset({ email })).unwrap();
        showSuccess("Verification code sent!");
        await new Promise(resolve => setTimeout(resolve, 1000));
        nav("/recovery", { state: { email } });
      } catch (error) {
        console.error("Error sending code:", error);
        showError(error || "Failed to send verification code. Please try again.");
      }
      finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancel = () => {
    nav("/signin");
  };

  return (
    <div 
      className="min-h-screen bg-linear-to-r from-anti-flash-white from-30% to-secondary flex 
      items-center justify-center p-4"
    >
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
          <h3 className="text-3xl font-medium text-gray-900">{t("auth.find_account")}</h3>
          <p className="text-base text-gray-600">
            {t("auth.find_account_des")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col items-center">
          <div className="w-full space-y-1">
            <Input
              id="email"
              type="email"
              placeholder={t("email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={handleBlur}
              className="w-full h-11 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          <div className="w-full flex justify-end gap-3">
            <Button
              type="button"
              onClick={handleCancel}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl h-11 px-8 text-base font-semibold cursor-pointer"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 px-8 text-base font-semibold cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" />
                  {t("search")}
                </>
              ) : (
                t("search")
              )}
            </Button>
          </div>
        </form>
      </motion.div>

      <CustomAlert {...alertConfig} onClose={hideAlert} />
    </div>
  );
}
