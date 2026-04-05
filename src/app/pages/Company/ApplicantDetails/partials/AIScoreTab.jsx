import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { scoreApplication, clearScoreResult } from "../../../../modules/services/applicationsService";
import { Spin } from "antd";
import { LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

export default function AIScoreTab({ application }) {
  useTranslation();
  const dispatch = useDispatch();
  const { scoreResult: reduxScoreResult, isScoring, error } = useSelector((state) => state.applications);

  useEffect(() => {
    // Clear previous redux results when switching applicants
    dispatch(clearScoreResult());
  }, [application?.id, dispatch]);

  // Prioritize fresh Redux state (which holds forced-refresh data), fallback to persisted application data
  const hasPersistedData = application?.cv_score !== null && application?.cv_score !== undefined;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const displayResult = reduxScoreResult || (hasPersistedData
    ? {
        score: application.cv_score,
        matched_skills: application.cv_matched_skills,
        missing_requirements: application.cv_missing_requirements,
        analysis: application.cv_analysis,
        score_breakdown: application.cv_score_breakdown,
      }
    : null);

  useEffect(() => {
    // Only fetch if we have no data at all
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
      <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-linear-to-br from-indigo-50 to-blue-100 rounded-2xl shadow-sm border border-blue-200">
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
              className="text-sm px-3 py-1 bg-white border border-blue-200 text-blue-600 rounded-md hover:bg-blue-50 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1"
            >
              {isScoring ? <LoadingOutlined /> : "Re-analyze"}
            </button>
          </div>
          <p className="text-gray-700 leading-relaxed font-medium">{displayResult.analysis}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h4 className="flex items-center gap-2 text-lg font-bold text-emerald-700 mb-4 border-b pb-2">
            <CheckCircleOutlined /> Matched Skills
          </h4>
          <ul className="space-y-3">
            {displayResult.matched_skills?.map((skill, i) => (
              <li key={i} className="flex items-center gap-3 text-gray-800 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
                {skill}
              </li>
            ))}
            {(!displayResult.matched_skills || displayResult.matched_skills.length === 0) && (
              <li className="text-gray-500 italic">No exact matches found.</li>
            )}
          </ul>
        </div>

        <div className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h4 className="flex items-center gap-2 text-lg font-bold text-rose-700 mb-4 border-b pb-2">
            <CloseCircleOutlined /> Missing Requirements
          </h4>
          <ul className="space-y-3">
            {displayResult.missing_requirements?.map((req, i) => (
              <li key={i} className="flex items-center gap-3 text-gray-800 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm" />
                {req}
              </li>
            ))}
            {(!displayResult.missing_requirements || displayResult.missing_requirements.length === 0) && (
              <li className="text-gray-500 italic rounded-md bg-gray-50 py-2 px-3">
                Candidate fulfills all requirements!
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
