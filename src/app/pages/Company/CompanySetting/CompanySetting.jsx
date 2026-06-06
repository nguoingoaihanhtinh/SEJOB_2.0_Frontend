import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Share2 } from 'lucide-react';
import { OverviewTab } from './partials/OverviewTab';
import { SocialLinksTab } from './partials/SocialLinksTab';
import { getCompany } from '../../../modules/services/companyService';

export default function CompanySetting() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const companyId = currentUser?.company?.id;
  const companyData = useSelector((state) => state.company.company);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (companyId) {
      dispatch(getCompany(companyId));
    }
  }, [dispatch, companyId]);

  const tabs = [
    { id: 'overview', label: t("companySetting.tabs.overview"), icon: Building2 },
    { id: 'social-links', label: t("companySetting.tabs.socialLinks"), icon: Share2 },
  ];

  return (
    <div className="bg-background p-4 lg:p-6 2xl:p-8 space-y-8">
      {/* Title with animation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h4 className="font-bold text-foreground">{t("companySetting.title")}</h4>
      </motion.div>

      {/* Tabs with stagger animation */}
      <motion.div
        className="flex gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + index * 0.1, ease: "easeOut" }}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 flex items-center gap-3 p-4 rounded-lg transition-colors cursor-pointer ${isActive
                ? "bg-primary/10 border-2 border-primary"
                : "bg-input border-2 border-border hover:bg-muted/50"
                }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.1, type: "spring", stiffness: 200 }}
                className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${isActive
                  ? "bg-primary text-white"
                  : "bg-input text-muted-foreground border border-border"
                  }`}
              >
                <Icon className="h-6 w-6" />
              </motion.div>
              <div className="flex-1">
                <p className={`font-semibold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                  {tab.label}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Tab content with fade animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-card rounded-lg px-6"
        >
          {activeTab === 'overview' && (
            <OverviewTab company={companyData} companyId={companyId} />
          )}
          {activeTab === 'social-links' && (
            <SocialLinksTab companyId={companyId} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}