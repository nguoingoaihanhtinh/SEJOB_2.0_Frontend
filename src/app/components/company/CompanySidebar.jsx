import {
  Home,
  MessageSquare,
  Building2,
  Users,
  FileText,
  Calendar,
  User,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage, Badge, Button } from "../ui";
import { Box } from "@mui/material";
import logo from "@/assets/logo.svg";
import NavLink from "./NavLink";
import { logout } from "../../modules";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function CompanySidebar() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const nav = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const company = useSelector((state) => state.auth.user?.company);

  const navigation = [
    { name: t("company.sidebar.dashboard"), icon: Home, badge: null, path: "/" },
    { name: t("company.sidebar.profile"), icon: Building2, badge: null, path: "/company" },
    { name: t("company.sidebar.branches"), icon: Building2, badge: null, path: "/branches" },
    { name: t("company.sidebar.all_applicants"), icon: Users, badge: null, path: "/applicants" },
    { name: t("company.sidebar.job_listing"), icon: FileText, badge: null, path: "/job-listing" },
    // { name: t("company.sidebar.mySchedule"), icon: Calendar, badge: null },
  ];

  return (
    <aside className="h-screen w-1/6 min-w-[220px] border-r border-border bg-white flex flex-col overflow-y-auto border-gray-300">
      {/* Logo */}
      <div className="flex items-center px-3 py-4 justify-center">
        <Box
          sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
        >
          <img src={logo} alt="SE Jobs Logo" width={"60"} style={{ marginRight: "8px", marginLeft: "10px" }} />
        </Box>
      </div>
      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navigation.map((item) => {
          return (
            <NavLink
              key={item.name}
              to={item.path ? item.path : "#"}
              className={({ isActive }) =>
                `group w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-md transition-colors relative hover:bg-primary-50 ${isActive
                  ? "bg-primary-50 text-primary font-medium"
                  : "text-muted-foreground"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`absolute left-0 top-0 h-full w-1 rounded-r transition-colors ${isActive ? "bg-primary" : "bg-transparent group-hover:bg-primary"
                      }`}
                  ></span>
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                  {item.badge && (
                    <Badge className="ml-auto h-5 w-5 flex items-center justify-center p-0 bg-primary text-primary-foreground">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
      {/* Settings Section */}
      <div className="px-3 py-4 border-t border-border space-y-1 border-gray-300">
        <div className="px-3 py-2 text-xs font-medium text-muted-foreground">{t("company.sidebar.settings").toUpperCase()}</div>
        {/* <NavLink
          to="/settings"
          className={({ isActive }) =>
            `group w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-md transition-colors relative hover:bg-primary-50 ${isActive
              ? "bg-primary-50 text-primary font-medium"
              : "text-muted-foreground"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={`absolute left-0 top-0 h-full w-1 rounded-r transition-colors ${isActive ? "bg-primary" : "bg-transparent group-hover:bg-primary"
                  }`}
              ></span>
              <Settings className="w-5 h-5" />
              <span>{t("company.sidebar.settings")}</span>
            </>
          )}
        </NavLink> */}
        <button
          className="
            group w-full flex items-center gap-3 px-3 py-2.5
            text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-primary-50 transition-colors
            cursor-pointer relative
          "
          onClick={() => nav("/help-center")}
        >
          <span className="absolute left-0 top-0 h-full w-1 rounded-r bg-transparent group-hover:bg-primary group-active:bg-primary transition-colors"></span>
          <HelpCircle className="w-5 h-5" />
          <span>{t("company.sidebar.help_center")}</span>
        </button>
      </div>
      {/* User Profile */}
      <div className="p-4 border-t border-border border-gray-300">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={company.logo ? company.logo : "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria"} />
            <AvatarFallback>MK</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{user?.last_name} {user?.first_name} </p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="
            w-full justify-start text-destructive cursor-pointer
            hover:bg-red-500 hover:text-white hover:scale-105
            active:bg-red-500 active:text-white active:scale-100
            transition-all
          "
          onClick={() => {
            // Dispatch logout action
            dispatch(logout());
            nav("/", { replace: true });
          }}
        >
          <LogOut className="w-4 h-4 mr-2" />
          {t("company.sidebar.logout")}
        </Button>
      </div>
    </aside>
  );
}
