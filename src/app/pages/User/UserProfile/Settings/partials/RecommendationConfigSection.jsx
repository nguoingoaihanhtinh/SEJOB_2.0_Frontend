import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, Save, RotateCcw, Info, ChevronDown, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { notification, Tooltip } from "antd";
import { studentApi, categoryApi, levelApi, addressApi } from "../../../../../../api";
import _ from "lodash";

// List of configurable keys for recommendation
// selectable: true => show multi-select so users can pick specific values
const RECOMMENDATION_KEYS = [
  {
    key: "skills",
    query_key: "skills.name",
    label: "Skills",
    description: "Prioritize jobs that match your skills",
    defaultScore: 7,
    selectable: false,
  },
  {
    key: "company_branches",
    query_key: "company_branches.province.id",
    label: "Work Location",
    description: "Prioritize jobs near your preferred province/city",
    defaultScore: 5,
    selectable: true,
  },
  {
    key: "categories",
    query_key: "categories.id",
    label: "Industry (Category)",
    description: "Prioritize jobs in fields you are interested in",
    defaultScore: 4,
    selectable: true,
  },
  {
    key: "levels",
    query_key: "levels.name",
    label: "Job Level",
    description: "Prioritize jobs that match your seniority level",
    defaultScore: 3,
    selectable: true,
  },
];

// ------- Multi-select dropdown component -------
function MultiSelectDropdown({ options = [], selected = [], onChange, disabled, placeholder = "Select..." }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (val) => {
    if (selected.includes(val)) onChange(selected.filter((v) => v !== val));
    else onChange([...selected, val]);
  };

  const selectedLabels = options.filter((o) => selected.includes(o.value));

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 border rounded-lg text-sm transition-all
          ${disabled ? "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400" : "bg-white border-gray-300 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"}`}
      >
        <span className="flex-1 text-left truncate">
          {selectedLabels.length === 0
            ? <span className="text-gray-400">{placeholder}</span>
            : <span className="text-gray-700">{selectedLabels.length} selected</span>
          }
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Selected tags */}
      {selectedLabels.length > 0 && !disabled && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {selectedLabels.map((o) => (
            <span key={o.value} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              {o.label}
              <button type="button" onClick={() => toggle(o.value)} className="hover:text-blue-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown list */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
          >
            {options.length === 0
              ? <p className="text-sm text-gray-400 px-3 py-2">No data available</p>
              : options.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => toggle(o.value)}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-blue-50 transition-colors
                    ${selected.includes(o.value) ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"}`}
                >
                  <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0
                    ${selected.includes(o.value) ? "bg-blue-600 border-blue-600" : "border-gray-300"}`}>
                    {selected.includes(o.value) && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  {o.label}
                </button>
              ))
            }
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// -----------------------------------------------

export default function RecommendationConfigSection() {
  const currentUser = useSelector((state) => state.auth.user);
  const studentId = _.get(currentUser, "student_info[0].id") || _.get(currentUser, "id");

  const [configs, setConfigs] = useState(
    RECOMMENDATION_KEYS.map((item) => ({
      key: item.key,
      query_key: item.query_key,
      score: item.defaultScore,
      enabled: true,
      values: [],   // only used for selectable keys
    }))
  );
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Options loaded from API
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [levelOptions, setLevelOptions] = useState([]);
  const [provinceOptions, setProvinceOptions] = useState([]);

  const [api, contextHolder] = notification.useNotification({ stack: { threshold: 3 } });

  function openNotification(title, description, type = "info") {
    api[type]({ title, description, showProgress: true, pauseOnHover: true });
  }

  // Load categories, levels, provinces and student config
  useEffect(() => {
    const loadAll = async () => {
      try {
        // Load options from API
        const [catRes, lvlRes, provRes] = await Promise.all([
          categoryApi.getCategories({}, { pageSize: 100 }),
          levelApi.getLevels({}, { pageSize: 100 }),
          addressApi.getProvinces(),
        ]);
        const cats = (catRes?.data || catRes || []).map((c) => ({ value: c.id, label: c.name }));
        const lvls = (lvlRes?.data || lvlRes || []).map((l) => ({ value: l.name, label: l.name }));
        // Backend: { success, data: [{ id, country_id, name }] }
        const provList = Array.isArray(provRes?.data) ? provRes.data : Array.isArray(provRes) ? provRes : [];
        const provs = provList.map((p) => ({ value: p.id, label: p.name }));
        setCategoryOptions(cats);
        setLevelOptions(lvls);
        setProvinceOptions(provs);

        // Load saved student config
        if (currentUser) {
          const res = await studentApi.getStudent(studentId);
          const savedConfig = res?.data?.recommendation_config;
          if (Array.isArray(savedConfig) && savedConfig.length > 0) {
            const merged = RECOMMENDATION_KEYS.map((item) => {
              const saved = savedConfig.find((c) => c.key === item.key);
              return {
                key: item.key,
                query_key: item.query_key,
                score: saved ? saved.score : item.defaultScore,
                enabled: saved !== undefined,
                values: saved?.values ?? [],
              };
            });
            setConfigs(merged);
          }
        }
      } catch { // keep defaults on error

      } finally {
        setInitialLoading(false);
      }
    };
    loadAll();
  }, [currentUser, studentId]);

  const getOptions = (key) => {
    if (key === "categories") return categoryOptions;
    if (key === "levels") return levelOptions;
    if (key === "company_branches") return provinceOptions;
    return [];
  };

  const handleScoreChange = (key, value) => {
    const num = Math.max(0, Math.min(20, Number(value)));
    setConfigs((prev) =>
      prev.map((c) => (c.key === key ? { ...c, score: isNaN(num) ? 0 : num } : c))
    );
  };

  const handleToggle = (key) => {
    setConfigs((prev) =>
      prev.map((c) => (c.key === key ? { ...c, enabled: !c.enabled } : c))
    );
  };

  const handleValuesChange = (key, values) => {
    setConfigs((prev) =>
      prev.map((c) => (c.key === key ? { ...c, values } : c))
    );
  };

  const handleReset = () => {
    setConfigs(
      RECOMMENDATION_KEYS.map((item) => ({
        key: item.key,
        query_key: item.query_key,
        score: item.defaultScore,
        enabled: true,
        values: [],
      }))
    );
  };

  const handleSave = async () => {
    if (!studentId) {
      openNotification("Error", "Student information not found", "error");
      return;
    }
    setLoading(true);
    try {
      const recommendation_config = configs
        .filter((c) => c.enabled)
        .map(({ key, query_key, score, values }) => ({
          key,
          query_key,
          score,
          ...(values && values.length > 0 ? { values } : {}),
        }));

      await studentApi.updateStudent(studentId, {
        studentData: { recommendation_config },
      });
      openNotification("Saved successfully", "Job recommendation settings have been updated", "success");
    } catch (err) {
      openNotification("Save failed", err?.message || "An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-t border-gray-200 pt-4">
        {/* Left column — description */}
        <div className="lg:col-span-4">
          <div className="flex items-center gap-2 mb-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <p className="body-normal font-semibold text-gray-900">Job Recommendation Settings</p>
          </div>
          <p className="text-gray-500 text-sm">
            Adjust the priority score for each criterion. A higher score means greater importance (max 20).
            For industry and job level, you can also select specific values.
          </p>
        </div>

        {/* Right column — config cards */}
        <div className="lg:col-span-8">
          {initialLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {RECOMMENDATION_KEYS.map((item, idx) => {
                  const config = configs.find((c) => c.key === item.key);
                  const isEnabled = config?.enabled ?? true;

                  return (
                    <motion.div
                      key={item.key}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`rounded-lg border transition-all ${
                        isEnabled ? "border-blue-200 bg-blue-50/40" : "border-gray-200 bg-gray-50 opacity-60"
                      }`}
                    >
                      {/* Header row: toggle + label + score */}
                      <div className="flex items-center gap-4 p-3">
                        {/* Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggle(item.key)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                            isEnabled ? "bg-blue-600" : "bg-gray-300"
                          }`}
                          aria-label={`Toggle ${item.label}`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition duration-200 ${
                              isEnabled ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>

                        {/* Label */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="body-normal font-medium text-gray-800 text-sm">{item.label}</p>
                            <Tooltip title={item.description} placement="top">
                              <Info className="w-3.5 h-3.5 text-gray-400 cursor-help shrink-0" />
                            </Tooltip>
                          </div>
                          <p className="text-xs text-gray-400 font-mono truncate">{item.query_key}</p>
                        </div>

                        {/* Score */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-gray-500">Score</span>
                          <input
                            type="number"
                            min={0}
                            max={20}
                            disabled={!isEnabled}
                            value={config?.score ?? item.defaultScore}
                            onChange={(e) => handleScoreChange(item.key, e.target.value)}
                            className="w-16 text-center px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                          />
                        </div>
                      </div>

                      {/* Multi-select row (selectable keys only) */}
                      {item.selectable && (
                        <div className="px-3 pb-3 pt-0">
                          <MultiSelectDropdown
                            options={getOptions(item.key)}
                            selected={config?.values ?? []}
                            onChange={(vals) => handleValuesChange(item.key, vals)}
                            disabled={!isEnabled}
                            placeholder={`Select ${item.label.toLowerCase()}...`}
                          />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset to default
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  Save settings
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
