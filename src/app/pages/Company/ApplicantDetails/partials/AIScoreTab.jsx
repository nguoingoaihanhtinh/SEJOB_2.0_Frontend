import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { scoreApplication, clearScoreResult } from "../../../../modules/services/applicationsService";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

function BulletItem({ label, score, max, reason }) {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  return (
    <div className="py-1.5">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-700 min-w-[130px]">{label}</span>
        <div className="flex-1 h-1.5 bg-gray-200 rounded overflow-hidden">
          <div className="h-full bg-blue-600 rounded transition-all" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs text-gray-500 w-14 text-right">{score}/{max}</span>
      </div>
      {reason && (
        <p className="text-xs text-gray-500 mt-0.5 ml-[130px] leading-relaxed">
          {reason}
        </p>
      )}
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
  if (breakdown.custom_sections) {
    for (const [key, val] of Object.entries(breakdown.custom_sections)) {
      const label = key.startsWith("CUSTOM_") ? key.slice(7).replace(/_/g, " ") : key;
      items.push({ key, label, score: val.score || 0, max: val.max || 0, reason: val.reason });
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-1">
      {items.map((item) => (
        <BulletItem key={item.key}
          label={item.label}
          score={item.score || 0}
          max={item.max || 10}
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
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row items-center gap-5 p-5 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-center w-20 h-20 rounded-full border-4 border-blue-600 bg-white">
          <span className="text-2xl font-bold text-blue-700">{displayResult.score}%</span>
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-1">
            <h3 className="text-lg font-semibold text-gray-800">AI Match Analysis</h3>
            <button
              onClick={() => {
                dispatch(clearScoreResult());
                dispatch(scoreApplication({ id: application.id, forceRefresh: true }));
              }}
              disabled={isScoring}
              className="text-xs px-2 py-0.5 border border-gray-300 text-gray-600 rounded hover:bg-gray-100 disabled:opacity-50"
            >
              {isScoring ? <LoadingOutlined /> : "Re-analyze"}
            </button>
          </div>
          <p className="text-sm text-gray-600">{displayResult.analysis}</p>
        </div>
      </div>

      {displayResult.confidence !== undefined && displayResult.confidence !== null && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${displayResult.confidence < 10 ? "bg-red-50 border-red-200" : displayResult.confidence < 50 ? "bg-yellow-50 border-yellow-200" : "bg-green-50 border-green-200"}`}>
          <span className={`text-lg font-bold ${displayResult.confidence < 10 ? "text-red-600" : displayResult.confidence < 50 ? "text-yellow-600" : "text-green-600"}`}>
            {displayResult.confidence}%
          </span>
          <div className="flex-1">
            <p className={`text-xs font-medium ${displayResult.confidence < 10 ? "text-red-700" : displayResult.confidence < 50 ? "text-yellow-700" : "text-green-700"}`}>
              {displayResult.confidence < 10
                ? "Độ tin cậy thấp — Công ty nên tự đánh giá thêm"
                : displayResult.confidence < 50
                  ? "Độ tin cậy trung bình"
                  : "Độ tin cậy cao"}
            </p>
            {displayResult.confidence < 10 && (
              <p className="text-xs text-red-500 mt-0.5">
                Trường học/ngành học của ứng viên không có trong cơ sở dữ liệu, hoặc kỹ năng không được trích xuất đầy đủ.
              </p>
            )}
          </div>
        </div>
      )}

      <ScoreBreakdownBullets breakdown={displayResult.score_breakdown} />

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex items-center gap-4 px-4 py-2 border-b border-gray-200 bg-gray-50">
          <span className="text-xs font-semibold text-gray-600">Matched ({displayResult.matched_skills?.length || 0})</span>
          <span className="text-xs font-semibold text-gray-600">Missing Req ({displayResult.missing_requirements?.length || 0})</span>
          {displayResult.missing_nice_to_haves?.length > 0 && (
            <span className="text-xs font-semibold text-gray-600">Missing Nice ({displayResult.missing_nice_to_haves.length})</span>
          )}
        </div>
        <div className="p-4 max-h-60 overflow-y-auto space-y-3">
          {displayResult.matched_skills?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">Matched Skills</p>
              <div className="flex flex-wrap gap-1">
                {displayResult.matched_skills.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs border border-blue-200 rounded">{s}</span>
                ))}
              </div>
            </div>
          )}
          {(!displayResult.matched_skills || displayResult.matched_skills.length === 0) && (
            <p className="text-gray-400 text-xs">No matched skills.</p>
          )}
          {displayResult.missing_requirements?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">Missing Requirements</p>
              <div className="flex flex-wrap gap-1">
                {displayResult.missing_requirements.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs border border-gray-200 rounded">{s}</span>
                ))}
              </div>
            </div>
          )}
          {(!displayResult.missing_requirements || displayResult.missing_requirements.length === 0) && (
            <p className="text-gray-400 text-xs">Candidate fulfills all requirements.</p>
          )}
          {displayResult.missing_nice_to_haves?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">Missing Nice-to-haves</p>
              <div className="flex flex-wrap gap-1">
                {displayResult.missing_nice_to_haves.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs border border-gray-200 rounded">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
