import { BorderLinearProgress } from "@/components";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const isValidValue = (value) => {
  if (!value) return false;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed !== '' && trimmed !== 'string' && trimmed !== 'null' && trimmed !== 'undefined';
  }
  return true;
};

const tryParseSalaryText = (text) => {
  if (!text || typeof text !== 'string') return null;
  const numberGroups = text.match(/[\d.,]+/g);
  if (!numberGroups || numberGroups.length === 0) return null;

  const [fromRaw, toRaw] = numberGroups;
  const clean = (val) => {
    if (val === null || val === undefined) return null;
    const cleaned = String(val).replace(/[^\d]/g, '');
    if (!cleaned) return null;
    return parseInt(cleaned, 10);
  };

  const from = clean(fromRaw);
  const to = clean(toRaw);

  if ((from === null || Number.isNaN(from)) && (to === null || Number.isNaN(to))) return null;

  const currencyHint = /vnd|₫/i.test(text) ? 'VND' : null;
  return { from, to, currencyHint };
};

const formatNumber = (num) => num.toLocaleString('en-US');

const formatVND = (amount) => {
  const num = Number(amount);
  if (Number.isNaN(num) || num === 0) return null;

  if (num >= 1_000_000) {
    const millions = num / 1_000_000;
    return `${formatNumber(millions)} Triệu`;
  }
  return formatNumber(num);
};

const formatSalaryValue = (value, isVND) => {
  if (!isValidValue(value)) return null;
  const num = Number(value);
  if (Number.isNaN(num) || num === 0) return null;
  return isVND ? formatVND(num) : formatNumber(num);
};

const getDisplaySalary = (job) => {
  const salaryText = job?.salary_text || job?.salary?.text || job?.salary || null;
  const salaryFrom = job?.salary_from ?? job?.salary?.from;
  const salaryTo = job?.salary_to ?? job?.salary?.to;
  const salaryCurrency = job?.salary_currency ?? job?.salary?.currency;
  const jobUrl = job?.url;

  const isTopCV = typeof jobUrl === 'string' && jobUrl.includes('topcv.vn');

  // TopCV data - return as is
  if (isTopCV && isValidValue(salaryText)) {
    return salaryText;
  }

  const currency = (salaryCurrency || '').trim();
  const isVND = /vnd|₫/i.test(currency) || /vnd|₫/i.test(salaryText || '');
  const currencySuffix = isVND ? '' : ` ${currency || 'VND'}`;

  // Try parsing salaryText first
  if (isValidValue(salaryText)) {
    const parsed = tryParseSalaryText(salaryText);
    if (parsed) {
      const from = formatSalaryValue(parsed.from, isVND || parsed.currencyHint === 'VND');
      const to = formatSalaryValue(parsed.to, isVND || parsed.currencyHint === 'VND');

      if (!from && !to) return "Thỏa thuận";
      if (from && to) return `${from} - ${to}${currencySuffix}`;
      if (from) return `Từ ${from}${currencySuffix}`;
      if (to) return `Lên đến ${to}${currencySuffix}`;
    }
    return salaryText;
  }

  // Use salary_from and salary_to
  const from = formatSalaryValue(salaryFrom, isVND);
  const to = formatSalaryValue(salaryTo, isVND);

  if (!from && !to) return "Thỏa thuận";
  if (from && to) return `${from} - ${to}${currencySuffix}`;
  if (from) return `Từ ${from}${currencySuffix}`;
  if (to) return `Lên đến ${to}${currencySuffix}`;

  return "Thỏa thuận";
};

export default function JobSidebar({ job }) {
  const { t } = useTranslation();
  const nav = useNavigate();
  const jobStatus = useSelector(state => state.jobs.status);
  const jobError = useSelector(state => state.jobs.error);
  const companyLogo = job?.company?.logo || job.logo;
  const companyName = typeof job?.company === 'string'
    ? job.company
    : job?.company?.name || "Company Name";
  const displaySalary = getDisplaySalary(job);

  if (jobStatus === "loading" && !job) {
    return (
      <div className="space-y-8">
        <p className="text-muted-foreground">{t("job.loading")}</p>
      </div>
    );
  }
  if (jobStatus === "failed" && jobError) {
    return (
      <div className="space-y-8">
        <p className="text-destructive">{jobError || t("job.error")}</p>
      </div>
    );
  }
  if (!job) {
    return (
      <div className="space-y-8">
        <p className="text-muted-foreground">{t("job.not_found")}</p>
      </div>
    );
  }

  // Format job type - handle workingTime array, working_time, type, or employment_types
  const getDisplayType = () => {
    if (Array.isArray(job.workingTime) && job.workingTime.length > 0) {
      return job.workingTime.map(wt => typeof wt === 'string' ? wt : (wt.name || wt)).join(', ');
    }
    if (job.working_time) return job.working_time;
    if (job.type) return job.type;
    if (Array.isArray(job.employment_types) && job.employment_types.length > 0) {
      return job.employment_types.map(et => et.name || et).join(', ');
    }
    return "N/A";
  };

  const displayType = getDisplayType();

  // Normalize categories - handle both array of strings and array of objects
  const normalizedCategories = Array.isArray(job.categories)
    ? job.categories.map(cat => typeof cat === 'string' ? cat : (cat.name || cat))
    : [];

  // Normalize skills - handle both array of strings and array of objects
  const normalizedSkills = Array.isArray(job.skills)
    ? job.skills.map(skill => typeof skill === 'string' ? skill : (skill.name || skill))
    : (Array.isArray(job.requiredSkills)
      ? job.requiredSkills.map(skill => typeof skill === 'string' ? skill : (skill.name || skill))
      : []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-4"
    >
      <h4 className="text-lg font-bold text-foreground mb-2">
        {t("company.info.title")}
      </h4>

      <div className="flex items-center mb-2 gap-4">
        <img
          src={companyLogo}
          alt={`${companyName} Logo`}
          className="w-14 h-14 object-contain"
        />
        <div>
          <h4 className="text-2xl font-bold text-foreground">{companyName}</h4>
          <div
            className="text-primary flex items-center gap-1 hover:underline mt-1 cursor-pointer"
            onClick={() => nav(`/company?id=${job.companyId}`)}
          >
            {t("company.read_more_about", { companyName })}
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      <h4 className="text-lg font-bold text-foreground mb-2">
        {t("job.about_this_role")}
      </h4>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("job.apply_before")}</span>
            <span className="font-medium text-foreground">
              {job.deadline || job.dueDate
                ? new Date(job.deadline || job.dueDate).toLocaleDateString(t("languageDate"), { year: "numeric", month: "long", day: "numeric" })
                : "N/A"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("job.posted_on")}</span>
            <span className="font-medium text-foreground">
              {job.createdAt || job.created_at
                ? new Date(job.createdAt || job.created_at).toLocaleDateString(t("languageDate"), { year: "numeric", month: "long", day: "numeric" })
                : "N/A"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("job.job_type")}</span>
            <span className="font-medium text-foreground">{displayType}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("job.salary")}</span>
            <span className="font-medium text-foreground">{displaySalary}</span>
          </div>
          {job.quantity && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("job.quantity")}</span>
              <span className="font-medium text-foreground">{job.quantity}</span>
            </div>
          )}
          {job.experience && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("job.experience")}</span>
              <span className="font-medium text-foreground">{job.experience}</span>
            </div>
          )}
          {job.position && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("job.position")}</span>
              <span className="font-medium text-foreground">{job.position}</span>
            </div>
          )}
        </div>
      </div>

      <hr className="border-t border-neutrals-20" />

      <h4 className="text-lg font-bold text-foreground mb-2">{t("job.categories")}</h4>
      <div className="flex flex-wrap gap-2">
        {normalizedCategories.length > 0 ? (
          normalizedCategories.map((category, index) => (
            <Badge
              key={`category-${category}-${index}`}
              variant="secondary"
              className={`bg-accent-green/10 text-accent-green hover:bg-accent-green/20 px-2.5 py-1.5 rounded-lg`}
            >
              {category}
            </Badge>
          ))
        ) : (
          <span className="text-muted-foreground">{t("job.no_categories_listed")}</span>
        )}
      </div>

      <hr className="border-t border-neutrals-20" />

      <h4 className="text-lg font-bold text-foreground mb-2">{t("job.required_skills")}</h4>
      <div className="flex flex-wrap gap-2">
        {normalizedSkills.length > 0 ? (
          normalizedSkills.map((skill, index) => (
            <Badge
              key={`skill-${skill}-${index}`}
              className="rounded-lg bg-background-lightBlue text-primary hover:bg-primary/10 px-2.5 py-1.5"
            >
              {skill}
            </Badge>
          ))
        ) : (
          <span className="text-muted-foreground">{t("job.no_skills_listed")}</span>
        )}
      </div>
    </motion.div>
  );
}
