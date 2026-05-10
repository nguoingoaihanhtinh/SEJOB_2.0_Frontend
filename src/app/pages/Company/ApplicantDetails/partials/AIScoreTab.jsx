import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { scoreApplication, clearScoreResult } from "../../../../modules/services/applicationsService";
import { Spin, Progress, Tooltip } from "antd";
import { LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined, BookOutlined, ProjectOutlined, SafetyCertificateOutlined, SolutionOutlined, StarOutlined } from "@ant-design/icons";
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

      {/* Detailed Score Breakdown */}
      {displayResult.score_breakdown && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-xl font-bold text-gray-800 mb-4 px-1">Detailed Score Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Technical Skills */}
            <div className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="flex items-center gap-2 font-semibold text-gray-700 mb-3 border-b pb-2">
                <StarOutlined className="text-yellow-500" /> Technical Skills
              </h4>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Score</span>
                <span className="text-sm font-bold text-gray-800">
                  {displayResult.score_breakdown.technical_skills?.total?.score} / {displayResult.score_breakdown.technical_skills?.total?.max}
                </span>
              </div>
              <Progress percent={(displayResult.score_breakdown.technical_skills?.total?.score / displayResult.score_breakdown.technical_skills?.total?.max) * 100} showInfo={false} strokeColor="#eab308" trailColor="#fef08a" />
              <div className="mt-3 text-xs text-gray-500 space-y-1.5">
                <div className="flex justify-between">
                  <span>Required Match:</span>
                  <span className="font-medium text-gray-700">{displayResult.score_breakdown.technical_skills?.required?.score}/{displayResult.score_breakdown.technical_skills?.required?.max}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nice-to-Have:</span>
                  <span className="font-medium text-gray-700">{displayResult.score_breakdown.technical_skills?.nice_to_have?.score}/{displayResult.score_breakdown.technical_skills?.nice_to_have?.max}</span>
                </div>
                <div className="flex justify-between">
                  <span>Skill Depth:</span>
                  <span className="font-medium text-gray-700">{displayResult.score_breakdown.technical_skills?.skill_depth?.score}/{displayResult.score_breakdown.technical_skills?.skill_depth?.max}</span>
                </div>
              </div>
            </div>

            {/* Academic */}
            <div className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="flex items-center gap-2 font-semibold text-gray-700 mb-3 border-b pb-2">
                <BookOutlined className="text-blue-500" /> Education
              </h4>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Score</span>
                <span className="text-sm font-bold text-gray-800">
                  {displayResult.score_breakdown.academic?.total?.score} / {displayResult.score_breakdown.academic?.total?.max}
                </span>
              </div>
              <Progress percent={(displayResult.score_breakdown.academic?.total?.score / displayResult.score_breakdown.academic?.total?.max) * 100} showInfo={false} strokeColor="#3b82f6" trailColor="#bfdbfe" />
              <div className="mt-3 text-xs text-gray-500 space-y-1.5">
                <div className="flex justify-between">
                  <span>Major Match:</span>
                  <span className="font-medium text-gray-700">{displayResult.score_breakdown.academic?.major?.score}/{displayResult.score_breakdown.academic?.major?.max}</span>
                </div>
                {displayResult.score_breakdown.academic?.major?.reason && (
                  <p className="text-[10px] italic mt-1 text-gray-400 line-clamp-2" title={displayResult.score_breakdown.academic.major.reason}>
                    {displayResult.score_breakdown.academic.major.reason}
                  </p>
                )}
              </div>
            </div>

            {/* Projects */}
            <div className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="flex items-center gap-2 font-semibold text-gray-700 mb-3 border-b pb-2">
                <ProjectOutlined className="text-indigo-500" /> Projects
              </h4>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Score</span>
                <span className="text-sm font-bold text-gray-800">
                  {displayResult.score_breakdown.projects?.total?.score} / {displayResult.score_breakdown.projects?.total?.max}
                </span>
              </div>
              <Progress percent={(displayResult.score_breakdown.projects?.total?.max > 0 ? (displayResult.score_breakdown.projects?.total?.score / displayResult.score_breakdown.projects?.total?.max) * 100 : 0)} showInfo={false} strokeColor="#6366f1" trailColor="#c7d2fe" />
              <div className="mt-3 text-xs text-gray-500 space-y-1.5">
                <div className="flex justify-between">
                  <span>AI Relevance:</span>
                  <span className="font-medium text-gray-700">{displayResult.score_breakdown.projects?.relevance?.score}/{displayResult.score_breakdown.projects?.relevance?.max}</span>
                </div>
                <div className="flex justify-between">
                  <span>Complexity:</span>
                  <span className="font-medium text-gray-700">{displayResult.score_breakdown.projects?.complexity?.score}/{displayResult.score_breakdown.projects?.complexity?.max}</span>
                </div>
                {displayResult.score_breakdown.projects?.relevance?.details && displayResult.score_breakdown.projects?.relevance?.details !== "No projects" && (
                  <Tooltip title={displayResult.score_breakdown.projects.relevance.details} overlayClassName="max-w-xs">
                    <p className="text-[10px] italic mt-1 text-indigo-400 cursor-help truncate">View AI Analysis details...</p>
                  </Tooltip>
                )}
              </div>
            </div>

            {/* Experience */}
            <div className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="flex items-center gap-2 font-semibold text-gray-700 mb-3 border-b pb-2">
                <SolutionOutlined className="text-teal-500" /> Work Experience
              </h4>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Score</span>
                <span className="text-sm font-bold text-gray-800">
                  {displayResult.score_breakdown.experience?.score} / {displayResult.score_breakdown.experience?.max}
                </span>
              </div>
              <Progress percent={(displayResult.score_breakdown.experience?.score / displayResult.score_breakdown.experience?.max) * 100} showInfo={false} strokeColor="#14b8a6" trailColor="#99f6e4" />
              {displayResult.score_breakdown.experience?.details && (
                <Tooltip title={displayResult.score_breakdown.experience.details}>
                  <p className="mt-3 text-[10px] text-gray-500 italic line-clamp-2 cursor-help">
                    {displayResult.score_breakdown.experience.details}
                  </p>
                </Tooltip>
              )}
            </div>

            {/* Certifications */}
            <div className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="flex items-center gap-2 font-semibold text-gray-700 mb-3 border-b pb-2">
                <SafetyCertificateOutlined className="text-orange-500" /> Certifications
              </h4>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Score</span>
                <span className="text-sm font-bold text-gray-800">
                  {displayResult.score_breakdown.certifications?.score} / {displayResult.score_breakdown.certifications?.max}
                </span>
              </div>
              <Progress percent={(displayResult.score_breakdown.certifications?.score / displayResult.score_breakdown.certifications?.max) * 100} showInfo={false} strokeColor="#f97316" trailColor="#fed7aa" />
            </div>
          </div>
          
          {displayResult.score_breakdown.metadata?.dynamic_weights_applied && (
            <div className="mt-6 p-4 bg-blue-50/80 border border-blue-100 text-blue-700 text-sm rounded-xl flex items-start gap-3 shadow-sm">
              <InfoCircleOutlined className="mt-0.5 text-lg" />
              <div>
                <strong className="block mb-1">Dynamic Weights Applied</strong> 
                Because the candidate has no projects listed, the 20 project points were automatically redistributed to Skills (+10), Major (+5), and Experience (+5) to ensure a fair evaluation out of 100 points.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
