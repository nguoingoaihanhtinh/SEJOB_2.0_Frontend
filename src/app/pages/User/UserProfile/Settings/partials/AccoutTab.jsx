import { motion } from "framer-motion";
import { Check, Eye, EyeOff, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { getToken } from "@/modules/utils/encryption";
import { TOKEN } from "src/settings/localVar";
import { changePassword, validatePassword } from "../../../../../modules";
import { notification } from "antd";
import RecommendationConfigSection from "./RecommendationConfigSection";

export default function AccountTab() {
  const { t } = useTranslation();
  const currentUser = useSelector((state) => state.auth.user);
  const userEmail = currentUser?.email || "";
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const dispatch = useDispatch();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [api, contextHolder] = notification.useNotification({
    stack: { threshold: 3, },
  });

  function openNotification(title, description, type = 'info') {
    api[type]({
      title: title,
      description: description,
      showProgress: true,
      pauseOnHover: true,
    });
  };

  // Get token from localStorage
  const [token, setToken] = useState(null);

  useEffect(() => {
    try {
      const decryptedToken = getToken();
      if (decryptedToken) {
        setToken(decryptedToken);
      } else {
        const rawToken = localStorage.getItem(TOKEN);
        setToken(rawToken || null);
      }
    } catch (error) {
      console.warn("Error getting token:", error);
      const rawToken = localStorage.getItem(TOKEN);
      setToken(rawToken || null);
    }
  }, []);

  const handleChangePassword = async () => {
    let valid = true;
    const newPasswordErrors = validatePassword(newPassword);
    if (newPasswordErrors.length > 0) {
      openNotification(t("setting.new_password_invalid"), t("setting.password_requirements"), "error");
      valid = false;
    }
    
    const currentPasswordErrors = validatePassword(currentPassword);
    if (currentPasswordErrors.length > 0) {
      openNotification(t("setting.current_password_invalid"), t("setting.password_requirements"), "error");
      valid = false;
    }

    if (!valid) return;
    const result = await dispatch(changePassword({ old_password: currentPassword, new_password: newPassword }));
    if (changePassword.fulfilled.match(result)) {
      console.log("Password changed successfully: ", result.payload);
      openNotification(t("setting.password_change_success"), "", "success");
      setCurrentPassword("");
      setNewPassword("");
    } else {
      console.error("Password change failed: ", result);
      openNotification(t("setting.password_change_failed"), result.payload || "Unknown error", "error");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-4 py-8"
    >
      {contextHolder}
      <div>
        <p className="body-large font-semibold text-gray-900 mb-2">{t("setting.basic_information")}</p>
        <p className="text-gray-500">
          {t("setting.description_account_tab")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-t border-gray-200 pt-4">
        <div className="lg:col-span-4">
          <p className="body-normal font-semibold text-gray-900 mb-2">{t("setting.email")}</p>
          <p className="text-gray-500">
            {t("setting.description_email")}
          </p>
        </div>
        <div className="lg:col-span-8">
          <div className="mb-4">
            <label className="block body-normal font-semibold text-gray-700 mb-2">
              {t("setting.email")}
            </label>
            <motion.input
              type="email"
              value={userEmail}
              disabled
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
            />
          </div>
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
              className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"
            >
              <Check className="w-3 h-3 text-white" />
            </motion.div>
            <p className="text-gray-500 text-sm">
              {t("setting.email_verified")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-t border-gray-200 pt-4">
        <div className="lg:col-span-4">
          <p className="body-normal font-semibold text-gray-900 mb-2">{t("setting.new_password")}</p>
          <p className="text-gray-500">
            {t("setting.description_new_password")}
          </p>
        </div>
        <div className="lg:col-span-8">
          <div className="mb-4 space-y-2">
            <label className="block body-normal font-semibold text-gray-700">
              {t("setting.old_password")}
            </label>
            <div className="relative">
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type={showCurrentPassword ? "text" : "password"}
                placeholder={t("setting.enter_old_password")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className="text-gray-400 mt-1">{t("setting.password_requirements")}</p>
          </div>
          <div className="mb-4 space-y-2">
            <label className="block body-normal font-semibold text-gray-700 ">
              {t("setting.new_password")}
            </label>
            <div className="relative">
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type={showNewPassword ? "text" : "password"}
                placeholder={t("setting.enter_new_password")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className="text-gray-400 mt-1">{t("setting.password_requirements")}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onTap={handleChangePassword}
          >
            {t("setting.change_password")}
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-t border-gray-200 pt-4">
        <div className="lg:col-span-4">
          <p className="body-normal font-semibold text-gray-900 mb-2">{t("setting.account_type")}</p>
          <p className="text-gray-500">
            {t("setting.description_account_type")}
          </p>
        </div>
        <div className="lg:col-span-8">
          <div className="flex items-center gap-3">
            <div className="pt-0.5">
              <div className="w-5 h-5 rounded-full border-2 border-blue-600 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-3 h-3 rounded-full bg-blue-600"
                />
              </div>
            </div>
            <div>
              <div className="body-normal font-medium text-gray-900 mb-1">{t("setting.job_seeker")}</div>
              <div className="text-gray-500">{t("setting.job_seeker_description")}</div>
            </div>
          </div>
        </div>
      </div>

      <RecommendationConfigSection />

      <div className="border-t border-gray-200 pt-4 flex justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }}
          className="flex items-center justify-center gap-2 text-red-500 hover:text-red-600 transition-colors"
        >
          {t("setting.close_account")}
          <Info className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}