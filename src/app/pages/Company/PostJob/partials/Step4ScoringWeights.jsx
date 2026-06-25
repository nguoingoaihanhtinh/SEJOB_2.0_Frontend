import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Scale, RotateCcw, Plus, X, AlertTriangle } from "lucide-react";

const COMPONENTS = [
  { key: "A1_REQUIRED", label: "Required Skills Match", default: 35, desc: "Percentage of required skills the candidate lists" },
  { key: "A2_NICE", label: "Nice-to-have Skills", default: 10, desc: "Percentage of nice-to-have skills the candidate lists" },
  { key: "A3_SKILL_DEPTH", label: "Skill Depth", default: 5, desc: "Whether skills are actually used in projects or experience" },
  { key: "B1_MAJOR", label: "Major / Field of Study", default: 10, desc: "How relevant the candidate's major is to the job" },
  { key: "B2_COURSES", label: "Course Mapping (disabled)", default: 0, desc: "Academically completed courses (currently disabled)" },
  { key: "C1_PROJECT_COUNT", label: "Project Count", default: 5, desc: "Number of projects the candidate has done" },
  { key: "C2_PROJECT_RELEVANCE", label: "Project Relevance to Job", default: 10, desc: "How well project technologies match job requirements" },
  { key: "C3_PROJECT_COMPLEXITY", label: "Project Complexity", default: 5, desc: "Projects with advanced traits earn higher score" },
  { key: "D_CERTIFICATIONS", label: "Certifications", default: 10, desc: "Number of relevant certifications obtained" },
  { key: "E_EXPERIENCE", label: "Work Experience", default: 10, desc: "How relevant the candidate's work history is to IT" },
];

const DEFAULT_WEIGHTS = Object.fromEntries(COMPONENTS.map((c) => [c.key, c.default]));

function parseCustomSections(weights) {
  const sections = [];
  for (const key of Object.keys(weights)) {
    if (key.startsWith("CUSTOM_")) {
      sections.push({ keyword: key.slice(7), weight: weights[key] });
    }
  }
  return sections;
}

function sanitizeKeyword(raw) {
  return raw.trim().toUpperCase().replace(/\s+/g, "_").replace(/[^A-Z0-9_]/g, "");
}

export default function Step4ScoringWeights({ scoringWeights, setScoringWeights, useCustomWeights, setUseCustomWeights }) {
  const { t } = useTranslation();
  const [values, setValues] = useState(scoringWeights || { ...DEFAULT_WEIGHTS });
  const [customSections, setCustomSections] = useState(() => parseCustomSections(scoringWeights || {}));
  const [total, setTotal] = useState(100);

  useEffect(() => {
    const sum = Object.values(values).reduce((a, b) => a + (b || 0), 0);
    setTotal(sum);
  }, [values]);

  const emit = useCallback((nextValues, nextCustom) => {
    const merged = { ...nextValues };
    for (const sec of nextCustom) {
      const key = `CUSTOM_${sec.keyword}`;
      merged[key] = sec.weight;
    }
    for (const key of Object.keys(merged)) {
      if (key.startsWith("CUSTOM_") && !nextCustom.some((s) => `CUSTOM_${s.keyword}` === key)) {
        delete merged[key];
      }
    }
    setValues(merged);
    setScoringWeights(merged);
  }, [setScoringWeights]);

  const handleChange = (key, raw) => {
    const val = Math.min(100, Math.max(0, parseInt(raw) || 0));
    const next = { ...values, [key]: val };
    setValues(next);
    setScoringWeights(next);
  };

  const resetDefaults = () => {
    setCustomSections([]);
    setValues({ ...DEFAULT_WEIGHTS });
    setScoringWeights({ ...DEFAULT_WEIGHTS });
  };

  const addCustom = () => {
    const next = [...customSections, { keyword: "", weight: 0 }];
    setCustomSections(next);
    emit(values, next);
  };

  const updateCustomKeyword = (idx, raw) => {
    const next = [...customSections];
    next[idx] = { ...next[idx], keyword: sanitizeKeyword(raw) };
    setCustomSections(next);
    emit(values, next);
  };

  const updateCustomWeight = (idx, raw) => {
    const val = Math.min(100, Math.max(0, parseInt(raw) || 0));
    const next = [...customSections];
    next[idx] = { ...next[idx], weight: val };
    setCustomSections(next);
    emit(values, next);
  };

  const removeCustom = (idx) => {
    const next = customSections.filter((_, i) => i !== idx);
    setCustomSections(next);
    emit(values, next);
  };

  if (!useCustomWeights) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Scale className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">{t("postJob.scoringWeights") || "Scoring Weights Configuration"}</h3>
        </div>
        <p className="text-muted-foreground text-sm">
          {t("postJob.scoringWeightsDesc") || "Configure how this job's candidates are scored. You can customize weights for each criteria or use defaults."}
        </p>
        <Button
          variant="outline"
          onClick={() => setUseCustomWeights(true)}
          className="mt-2"
        >
          <Scale className="h-4 w-4 mr-2" />
          {t("postJob.customizeWeights") || "Customize Scoring Weights"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">{t("postJob.scoringWeights") || "Scoring Weights Configuration"}</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={resetDefaults}>
          <RotateCcw className="h-4 w-4 mr-1" />
          {t("postJob.resetDefaults") || "Reset Defaults"}
        </Button>
      </div>

      <div className={`px-4 py-2 rounded-md text-sm font-medium ${total === 100 ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
        {t("postJob.totalWeight") || "Total"}: {total} / 100
        {total !== 100 && (
          <span className="ml-2">({t("postJob.totalMustBe100") || "Must equal 100"})</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {COMPONENTS.map((comp) => (
          <div key={comp.key} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
            <div className="flex-1">
              <Label htmlFor={`weight-${comp.key}`} className="text-sm font-medium">
                {comp.key}
              </Label>
              <p className="text-xs text-muted-foreground">{comp.label}</p>
              <p className="text-xs text-muted-foreground mt-1 italic">{comp.desc}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {t("postJob.default") || "Default"}: {comp.default}
              </p>
            </div>
            <Input
              id={`weight-${comp.key}`}
              type="number"
              min={0}
              max={100}
              value={values[comp.key] ?? comp.default}
              onChange={(e) => handleChange(comp.key, e.target.value)}
              className="w-20 text-center ml-3"
            />
          </div>
        ))}
      </div>

      {customSections.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground">
            {t("postJob.customSections") || "Custom Sections"}
          </h4>
          {customSections.map((sec, idx) => (
            <div key={idx} className="p-3 rounded-lg border border-dashed border-amber-300 bg-amber-50/40">
              <div className="flex items-center gap-3 mb-2">
                <Input
                  placeholder={t("postJob.customKeywordPlaceholder") || "e.g. LEADERSHIP_EXPERIENCE"}
                  value={sec.keyword}
                  onChange={(e) => updateCustomKeyword(idx, e.target.value)}
                  className="flex-1 text-sm"
                />
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={sec.weight}
                  onChange={(e) => updateCustomWeight(idx, e.target.value)}
                  className="w-20 text-center"
                />
                <Button variant="ghost" size="icon" onClick={() => removeCustom(idx)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-start gap-2 text-xs text-amber-700">
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>
                  {t("postJob.customWarning") || "The AI will search the CV for this keyword. This is experimental and may lead to false positives or missed matches."}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button variant="outline" size="sm" onClick={addCustom} className="gap-1">
        <Plus className="h-4 w-4" />
        {t("postJob.addCustomSection") || "Add Custom Section"}
      </Button>
    </div>
  );
}
