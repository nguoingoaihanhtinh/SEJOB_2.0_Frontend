import { ApplicationStatus } from "../../../../../lib/enums";

export default function StageProgressBar({ currentStage }) {
    const indexStage = {
        [ApplicationStatus.CANCELLED]: 0,
        [ApplicationStatus.APPLIED]: 0,
        [ApplicationStatus.VIEWED]: 1,
        [ApplicationStatus.SHORTLISTED]: 2,
        [ApplicationStatus.INTERVIEW_SCHEDULED]: 3,
        [ApplicationStatus.OFFERED]: 3,
    };

    if (currentStage === ApplicationStatus.HIRED) {
        return (
            <div className="flex gap-1">
                {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="flex-1 h-2 bg-green-500 rounded"/>
                ))}
            </div>
        );
    }

    if (currentStage === ApplicationStatus.REJECTED) {
        return (
            <div className="flex gap-1">
                {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="flex-1 h-2 bg-red-500 rounded"/>
                ))}
            </div>
        );
    }

    return (
        <div className="flex gap-1">
            {Array.from({ length: indexStage[currentStage] }).map((_, idx) => (
                <div key={idx} className="flex-1 h-2 bg-blue-600 rounded" />
            ))}
            {Array.from({ length: 4 - indexStage[currentStage] }).map((_, idx) => (
                <div key={idx} className="flex-1 h-2 bg-gray-200 rounded" />
            ))}
        </div>
    );
}