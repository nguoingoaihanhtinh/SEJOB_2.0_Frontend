import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { scoreApplication, clearScoreResult } from "../../../../modules/services/applicationsService";
import { Spin } from "antd";
import { LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

function BulletItem({ label, score, max, color, reason }) {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${color || "bg-gray-400"}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-700 min-w-[130px] font-medium">{label}</span>
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${color || "bg-gray-400"}`} style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs text-gray-500 font-mono w-14 text-right">{score}/{max}</span>
        </div>
        {reason && (
          <p className="text-xs text-gray-500 italic mt-1 ml-[130px] truncate hover:whitespace-normal hover:overflow-visible" title={reason}>
            {reason}
          </p>
        )}
      </div>
    </div>
  );
}

function ScoreBreakdownBullets({ breakdown }) {
  if (!breakdown) return null;
  const items = [];

  if (breakdown.technical_skills) {
    const ts = breakdown.technical_skills;
    if (ts.required) items.push({ key: "req", label: "Required Skills", ...ts.required });
    if (ts.nice_to_have) items.push({ key: "nice", label: "Nice-to-have", ...ts.nice_to_have });
    if (ts.skill_depth) items.push({ key: "depth", label: "Skill Depth", ...ts.skill_depth });
  }
  if (breakdown.academic) {
    const ac = breakdown.academic;
    if (ac.major) items.push({ key: "major", label: "Major Match", ...ac.major });
    if (ac.total) items.push({ key: "acTotal", label: "Academic Total", ...ac.total });
  }
  if (breakdown.projects) {
    const pr = breakdown.projects;
    if (pr.count) items.push({ key: "pCount", label: "Project Count", ...pr.count });
    if (pr.relevance) items.push({ key: "pRel", label: "Project Relevance", ...pr.relevance });
    if (pr.complexity) items.push({ key: "pComp", label: "Project Complexity", ...pr.complexity });
  }
  if (breakdown.certifications) {
    items.push({ key: "cert", label: "Certifications", ...breakdown.certifications });
  }
  if (breakdown.experience) {
    items.push({ key: "exp", label: "Experience", ...breakdown.experience });
  }

  const colors = [
    "bg-blue-500", "bg-teal-500", "bg-indigo-500",
    "bg-purple-500", "bg-violet-500",
    "bg-amber-500", "bg-orange-500", "bg-red-500",
    "bg-cyan-500", "bg-green-500",
  ];

  return (
    <div className="bg-gray-50 rounded-2xl p-4 shadow-sm space-y-2.5">
      {items.map((item, i) => (
        <BulletItem key={item.key}
          label={item.label}
          score={item.score || 0}
          max={item.max || 10}
          color={colors[i % colors.length]}
          reason={item.reason}
        />
      ))}
    </div>
  );
}

export default function AIScoreTab({ application }) {
  useTranslation();
  const dispatch = useDispatch();
  const { scoreResult: reduxScoreResult, isScoring, error } = useSelector((state) => state.applications);

  useEffect(() => {
    dispatch(clearScoreResult());
  }, [application?.id, dispatch]);

  const hasPersistedData = application?.cv_score !== null && application?.cv_score !== undefined;
  const displayResult = reduxScoreResult || (hasPersistedData
    ? {
        score: application.cv_score,
        matched_skills: application.cv_matched_skills,
        missing_requirements: application.cv_missing_requirements,
        missing_nice_to_haves: application.cv_missing_nice_to_haves,
        analysis: application.cv_analysis,
        score_breakdown: application.cv_score_breakdown,
      }
    : null);

  useEffect(() => {
    if (!displayResult && application?.id && !isScoring) {
      dispatch(scoreApplication(application.id));
    }
  }, [application?.id, dispatch, displayResult, isScoring]);

  if (isScoring && !displayResult) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />} />
        <p className="mt-4 text-gray-500 font-medium tracking-wide">AI is analyzing profile vs job requirements...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 bg-red-50 text-red-600 rounded-lg">{error}</div>;
  }

  if (!displayResult) return null;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
      <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-linear-to-br from-indigo-50 to-blue-100 rounded-2xl shadow-md">
        <div className="relative flex items-center justify-center w-28 h-28 rounded-full border-[6px] border-blue-600 bg-white shadow-md">
          <span className="text-3xl font-black text-blue-700">{displayResult.score}%</span>
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-2">
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-700 to-indigo-700">
              AI Match Analysis
            </h3>
            <button
              onClick={() => {
                dispatch(clearScoreResult());
                dispatch(scoreApplication({ id: application.id, forceRefresh: true }));
              }}
              disabled={isScoring}
              className="text-sm px-3 py-1 bg-gray-200 text-blue-600 rounded-md hover:bg-gray-300 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1"
            >
              {isScoring ? <LoadingOutlined /> : "Re-analyze"}
            </button>
          </div>
          <p className="text-gray-700 leading-relaxed font-medium">{displayResult.analysis}</p>
        </div>
      </div>

      <ScoreBreakdownBullets breakdown={displayResult.score_breakdown} />

      <div className="bg-gray-50 rounded-2xl shadow-sm max-h-[calc(100vh-280px)] flex flex-col">
        <div className="flex items-center gap-6 px-4 pt-3 pb-2 border-b border-gray-200 sticky top-0 bg-gray-50 z-10">
          <h4 className="flex items-center gap-1.5 text-sm font-bold text-emerald-700">
            <CheckCircleOutlined /> Matched ({displayResult.matched_skills?.length || 0})
          </h4>
          <h4 className="flex items-center gap-1.5 text-sm font-bold text-rose-700">
            <CloseCircleOutlined /> Missing Req ({displayResult.missing_requirements?.length || 0})
          </h4>
          {displayResult.missing_nice_to_haves?.length > 0 && (
            <h4 className="flex items-center gap-1.5 text-sm font-bold text-amber-700">
              <CloseCircleOutlined /> Missing Nice ({displayResult.missing_nice_to_haves.length})
            </h4>
          )}
        </div>
        <div className="overflow-y-auto flex-1 p-4">
          {displayResult.matched_skills?.length > 0 && (
            <div className="mb-4">
              <h5 className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">Matched Skills</h5>
              <div className="flex flex-wrap gap-1.5">
                {displayResult.matched_skills.map((s, i) => (
                  <span key={i} className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">{s}</span>
                ))}
              </div>
            </div>
          )}
          {(!displayResult.matched_skills || displayResult.matched_skills.length === 0) && (
            <p className="text-gray-400 italic text-sm mb-4">No matched skills.</p>
          )}
          {displayResult.missing_requirements?.length > 0 && (
            <div className="mb-4">
              <h5 className="text-xs font-semibold text-rose-600 uppercase tracking-wide mb-2">Missing Requirements</h5>
              <div className="flex flex-wrap gap-1.5">
                {displayResult.missing_requirements.map((s, i) => (
                  <span key={i} className="px-2.5 py-1 bg-rose-100 text-rose-700 text-xs font-medium rounded-full">{s}</span>
                ))}
              </div>
            </div>
          )}
          {(!displayResult.missing_requirements || displayResult.missing_requirements.length === 0) && (
            <p className="text-gray-400 italic text-sm mb-4">Candidate fulfills all requirements!</p>
          )}
          {displayResult.missing_nice_to_haves?.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">Missing Nice-to-haves</h5>
              <div className="flex flex-wrap gap-1.5">
                {displayResult.missing_nice_to_haves.map((s, i) => (
                  <span key={i} className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
