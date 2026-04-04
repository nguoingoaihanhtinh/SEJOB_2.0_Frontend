import { Bell, Plus, ChevronDown } from "lucide-react";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { logout } from "../../modules";
import LangButtonGroup from "../common/LangButtonGroup";
import NotificationSection from "../sections/NotificationSection";
export default function TopBar() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const nav = useNavigate();
  const company = useSelector((state) => state.auth.user?.company);
  return (
    <header className="h-16 border-b border-l border-gray-300 bg-white z-10 flex items-center justify-between px-6">
      <div className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-default">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center">
          {company?.logo ? (
            <img
              src={company.logo}
              alt={company.name || 'Company'}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <span className="text-white font-bold text-lg">
              {company?.name ? company.name.charAt(0).toUpperCase() : 'C'}
            </span>
          )}
        </div>
        <div className="text-left">
          <p className="text-xs text-muted-foreground">{t('companyTopBar.company')}</p>
          <p className="text-sm font-semibold text-foreground">{company?.name || t('companyTopBar.company')}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <NotificationSection />
        <Button
          className="
            bg-primary/90 text-white rounded-lg 
            hover:bg-primary hover:scale-105 hover:shadow-lg
            transition-all cursor-pointer
          "
          onClick={() => { nav('/post-job') }}
        >
          <Plus className="w-4 h-4" />
          <div>{t('company.post_job')}</div>
        </Button>
        <LangButtonGroup />
      </div>
    </header>
  );
};
