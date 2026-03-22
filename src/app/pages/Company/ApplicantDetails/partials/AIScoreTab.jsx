import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { scoreApplication } from '../../../../modules/services/applicationsService';
import { Spin } from 'antd';
import { LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useTranslation } from "react-i18next";

export default function AIScoreTab({ application }) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { scoreResult, isScoring, error } = useSelector((state) => state.applications);

    useEffect(() => {
        // Only dispatch if we don't already have results, or if it belongs to a different app
        if (application?.id) {
            dispatch(scoreApplication(application.id));
        }
    }, [application?.id, dispatch]);

    if (isScoring) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <Spin indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />} />
                <p className="mt-4 text-gray-500 font-medium tracking-wide">AI is analyzing profile vs job requirements...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 text-red-600 rounded-lg">
                {error}
            </div>
        );
    }

    if (!scoreResult) return null;

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-gradient-to-br from-indigo-50 to-blue-100 rounded-2xl shadow-sm border border-blue-200">
                <div className="relative flex items-center justify-center w-28 h-28 rounded-full border-[6px] border-blue-600 bg-white shadow-md">
                    <span className="text-3xl font-black text-blue-700">{scoreResult.score}%</span>
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 mb-2">
                        AI Match Analysis
                    </h3>
                    <p className="text-gray-700 leading-relaxed font-medium">{scoreResult.analysis}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="flex items-center gap-2 text-lg font-bold text-emerald-700 mb-4 border-b pb-2">
                        <CheckCircleOutlined /> Matched Skills
                    </h4>
                    <ul className="space-y-3">
                        {scoreResult.matched_skills?.map((skill, i) => (
                            <li key={i} className="flex items-center gap-3 text-gray-800 font-medium">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
                                {skill}
                            </li>
                        ))}
                        {(!scoreResult.matched_skills || scoreResult.matched_skills.length === 0) && (
                            <li className="text-gray-500 italic">No exact matches found.</li>
                        )}
                    </ul>
                </div>

                <div className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="flex items-center gap-2 text-lg font-bold text-rose-700 mb-4 border-b pb-2">
                        <CloseCircleOutlined /> Missing Requirements
                    </h4>
                    <ul className="space-y-3">
                        {scoreResult.missing_requirements?.map((req, i) => (
                            <li key={i} className="flex items-center gap-3 text-gray-800 font-medium">
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm" />
                                {req}
                            </li>
                        ))}
                        {(!scoreResult.missing_requirements || scoreResult.missing_requirements.length === 0) && (
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
