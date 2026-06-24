import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Loader2, RotateCcw, Info, AlertTriangle, CheckCircle2, GripVertical } from 'lucide-react';
import { updateCompany, getCompany } from '../../../../modules/services/companyService';
import { useCustomAlert } from '../../../../hooks/useCustomAlert';
import { CustomAlert } from '@/components';

// ─── Scoring Criteria Definitions ───────────────────────────────────────────
const SCORING_CRITERIA = [
    {
        name: 'Required Skills',
        key: 'require_skills',
        max_score: 25,
        description: 'Điểm cho các kỹ năng bắt buộc phù hợp',
        color: '#6366f1',
        icon: '🎯',
    },
    {
        name: 'Nice-to-have Skills',
        key: 'nice_to_have',
        max_score: 10,
        description: 'Điểm cho các kỹ năng tốt-thêm phù hợp',
        color: '#10b981',
        icon: '✨',
    },
    {
        name: 'Skill Depth',
        key: 'skill_depth',
        max_score: 5,
        description: 'Điểm đánh giá mức độ thành thạo kỹ năng',
        color: '#8b5cf6',
        icon: '📊',
    },
    {
        name: 'Major Match',
        key: 'major_match',
        max_score: 10,
        description: 'Điểm cho chuyên ngành phù hợp với yêu cầu',
        color: '#a855f7',
        icon: '🎓',
    },
    {
        name: 'Academic Total',
        key: 'academic_total',
        max_score: 10,
        description: 'Điểm tổng hợp thành tích học thuật',
        color: '#7c3aed',
        icon: '📚',
    },
    {
        name: 'Project Count',
        key: 'project_count',
        max_score: 5,
        description: 'Điểm dựa trên số lượng dự án đã thực hiện',
        color: '#f59e0b',
        icon: '📁',
    },
    {
        name: 'Project Relevance',
        key: 'project_relevance',
        max_score: 10,
        description: 'Điểm cho mức độ liên quan của các dự án',
        color: '#ef4444',
        icon: '🔗',
    },
    {
        name: 'Project Complexity',
        key: 'project_complexity',
        max_score: 5,
        description: 'Điểm đánh giá độ phức tạp của dự án',
        color: '#dc2626',
        icon: '⚙️',
    },
    {
        name: 'Certifications',
        key: 'certifications',
        max_score: 10,
        description: 'Điểm cho các chứng chỉ liên quan',
        color: '#0ea5e9',
        icon: '🏆',
    },
    {
        name: 'Experience',
        key: 'experience',
        max_score: 10,
        description: 'Điểm dựa trên kinh nghiệm làm việc thực tế',
        color: '#22c55e',
        icon: '💼',
    },
];

const DEFAULT_MAX_TOTAL = 100;

// ─── Helper ──────────────────────────────────────────────────────────────────
/**
 * Normalises saved scoring_config to a lookup map { [key]: max_score }
 * Accepts both:
 *   - Array format:  [{name, key, max_score}, ...]
 *   - Object format: {require_skills: 35, ...}  (legacy)
 */
function parseScoringConfig(raw) {
    if (!raw) return null;
    try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (Array.isArray(parsed)) {
            // Convert array → lookup map
            return Object.fromEntries(parsed.map((item) => [item.key, item.max_score]));
        }
        return parsed; // already an object map
    } catch {
        return null;
    }
}

function buildInitialScores(saved) {
    return SCORING_CRITERIA.map((criterion) => ({
        ...criterion,
        enabled: saved ? criterion.key in saved : true,
        max_score: saved?.[criterion.key] ?? criterion.max_score,
    }));
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function TotalScoreBadge({ total }) {
    const isOver = total > DEFAULT_MAX_TOTAL;
    const isExact = total === DEFAULT_MAX_TOTAL;

    return (
        <motion.div
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${isOver
                ? 'bg-red-50 border-red-200 text-red-700'
                : isExact
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-amber-50 border-amber-200 text-amber-700'
                }`}
            animate={{ scale: isOver ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 0.3 }}
        >
            {isOver
                ? <AlertTriangle className="w-4 h-4" />
                : isExact
                    ? <CheckCircle2 className="w-4 h-4" />
                    : <Info className="w-4 h-4" />
            }
            <span>Tổng: {total} / {DEFAULT_MAX_TOTAL}</span>
        </motion.div>
    );
}

function CriterionRow({ item, index, onChange, onToggle }) {
    return (
        <motion.div
            key={item.key}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.25, delay: index * 0.04 }}
            className={`group relative flex items-center gap-4 p-4 rounded-xl border transition-all ${item.enabled
                ? 'bg-white border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300'
                : 'bg-gray-50 border-dashed border-gray-200 opacity-60'
                }`}
        >
            {/* Drag handle placeholder */}
            <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />

            {/* Color dot + icon */}
            <div
                className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                style={{ backgroundColor: `${item.color}18`, border: `2px solid ${item.color}40` }}
            >
                {item.icon}
            </div>

            {/* Name + description */}
            <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm truncate ${item.enabled ? 'text-gray-800' : 'text-gray-400'}`}>
                    {item.name}
                </p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{item.description}</p>
            </div>

            {/* Score input */}
            <div className="flex items-center gap-2 flex-shrink-0">
                <label className="text-xs text-gray-400 hidden sm:block">Max Score</label>
                <div className="relative">
                    <input
                        type="number"
                        min={0}
                        max={DEFAULT_MAX_TOTAL}
                        step={1}
                        value={item.max_score}
                        disabled={!item.enabled}
                        onChange={(e) => onChange(item.key, Number(e.target.value))}
                        className={`w-20 px-3 py-2 text-center text-sm font-bold border rounded-lg focus:outline-none focus:ring-2 transition-all
                            ${item.enabled
                                ? 'border-gray-200 focus:ring-indigo-400 bg-white text-gray-700'
                                : 'border-transparent bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                        style={item.enabled ? { borderColor: `${item.color}60` } : {}}
                    />
                    <span className="absolute -top-2 right-0 text-[10px] text-gray-400">pts</span>
                </div>
            </div>

            {/* Progress bar */}
            <div className="w-24 hidden lg:block">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: item.enabled ? item.color : '#d1d5db' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((item.max_score / DEFAULT_MAX_TOTAL) * 100, 100)}%` }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                    />
                </div>
                <p className="text-[10px] text-gray-400 mt-1 text-right">
                    {((item.max_score / DEFAULT_MAX_TOTAL) * 100).toFixed(0)}%
                </p>
            </div>

            {/* Toggle switch */}
            <motion.button
                type="button"
                onClick={() => onToggle(item.key)}
                whileTap={{ scale: 0.9 }}
                className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${item.enabled ? 'focus:ring-indigo-400' : 'focus:ring-gray-300'
                    }`}
                style={{ backgroundColor: item.enabled ? item.color : '#d1d5db' }}
                title={item.enabled ? 'Tắt tiêu chí này' : 'Bật tiêu chí này'}
            >
                <motion.span
                    className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow"
                    animate={{ x: item.enabled ? 20 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
            </motion.button>
        </motion.div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function ScoringConfigTab({ companyId }) {
    const dispatch = useDispatch();
    const company = useSelector((state) => state.company.company);
    const updateStatus = useSelector((state) => state.company.status);
    const [isUpdating, setIsUpdating] = useState(false);
    const [scores, setScores] = useState(() => buildInitialScores(null));
    const { alertConfig, hideAlert, showSuccess, showError } = useCustomAlert();

    // Load existing config from company
    useEffect(() => {
        if (company?.scoring_config) {
            const parsed = parseScoringConfig(company.scoring_config);
            setScores(buildInitialScores(parsed));
        }
    }, [company]);

    const totalScore = scores.filter((s) => s.enabled).reduce((sum, s) => sum + Number(s.max_score || 0), 0);

    const handleScoreChange = (key, value) => {
        setScores((prev) =>
            prev.map((s) => (s.key === key ? { ...s, max_score: Math.max(0, Math.min(DEFAULT_MAX_TOTAL, value)) } : s))
        );
    };

    const handleToggle = (key) => {
        setScores((prev) =>
            prev.map((s) => (s.key === key ? { ...s, enabled: !s.enabled } : s))
        );
    };

    const handleReset = () => {
        setScores(buildInitialScores(null));
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (!companyId) return;

        setIsUpdating(true);
        try {
            // Build config array: [{name, key, max_score}] — only enabled criteria
            const configArray = scores
                .filter((s) => s.enabled)
                .map((s) => ({
                    name: s.name,
                    key: s.key,
                    max_score: Number(s.max_score),
                }));

            const companyData = {
                scoring_config: configArray,
            };

            await dispatch(updateCompany({ companyId, companyData })).unwrap();
            dispatch(getCompany(companyId));
            showSuccess('Cập nhật cấu hình chấm điểm thành công');
        } catch (error) {
            console.error('Failed to update scoring config:', error);
            showError('Cập nhật cấu hình chấm điểm thất bại');
        } finally {
            setIsUpdating(false);
        }
    };

    const enabledCount = scores.filter((s) => s.enabled).length;

    return (
        <div className="space-y-8 py-8">
            <form onSubmit={handleSubmit}>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-gray-200 pb-6 mb-6"
                >
                    <div>
                        <h4 className="font-bold text-gray-900 mb-1">Cấu hình tiêu chí chấm điểm</h4>
                        <p className="text-gray-500 text-sm leading-relaxed max-w-xl">
                            Bật/tắt và đặt điểm tối đa cho từng tiêu chí. Hệ thống sẽ dùng cấu hình này để xếp hạng
                            ứng viên theo kỹ năng và hồ sơ của họ.
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <TotalScoreBadge total={totalScore} />
                        <p className="text-xs text-gray-400">
                            {enabledCount}/{SCORING_CRITERIA.length} tiêu chí đang bật
                        </p>
                    </div>
                </motion.div>

                {/* Warning when total ≠ 100 */}
                <AnimatePresence>
                    {totalScore !== DEFAULT_MAX_TOTAL && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden mb-4"
                        >
                            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${totalScore > DEFAULT_MAX_TOTAL
                                ? 'bg-red-50 border border-red-200 text-red-700'
                                : 'bg-amber-50 border border-amber-200 text-amber-700'
                                }`}>
                                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                <span>
                                    {totalScore > DEFAULT_MAX_TOTAL
                                        ? `Tổng điểm vượt quá ${DEFAULT_MAX_TOTAL}. Vui lòng điều chỉnh để hệ thống chấm điểm chính xác.`
                                        : `Tổng điểm hiện tại là ${totalScore}/${DEFAULT_MAX_TOTAL}. Bạn có thể lưu nhưng kết quả chấm có thể không đủ 100%.`
                                    }
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Criteria list */}
                <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <AnimatePresence>
                        {scores.map((item, index) => (
                            <CriterionRow
                                key={item.key}
                                item={item}
                                index={index}
                                onChange={handleScoreChange}
                                onToggle={handleToggle}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>

                {/* Quick-set presets */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="mt-6 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200"
                >
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Preset nhanh
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {[
                            {
                                label: 'Cân bằng (mặc định)',
                                config: null, // resets to defaults
                            },
                            {
                                label: 'Ưu tiên kỹ năng',
                                config: {
                                    require_skills: 50, nice_to_have: 15, skill_depth: 10,
                                    major_match: 5, academic_total: 5, project_count: 3,
                                    project_relevance: 7, project_complexity: 3, certifications: 2, experience: 0,
                                },
                            },
                            {
                                label: 'Ưu tiên kinh nghiệm',
                                config: {
                                    require_skills: 25, nice_to_have: 5, skill_depth: 5,
                                    major_match: 5, academic_total: 5, project_count: 5,
                                    project_relevance: 10, project_complexity: 5, certifications: 5, experience: 30,
                                },
                            },
                            {
                                label: 'Fresher / Sinh viên',
                                config: {
                                    require_skills: 30, nice_to_have: 10, skill_depth: 5,
                                    major_match: 15, academic_total: 20, project_count: 5,
                                    project_relevance: 5, project_complexity: 5, certifications: 5, experience: 0,
                                },
                            },
                        ].map((preset) => (
                            <motion.button
                                key={preset.label}
                                type="button"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setScores(buildInitialScores(preset.config))}
                                className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg text-gray-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            >
                                {preset.label}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Footer actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
                    className="flex items-center justify-between pt-6 border-t border-gray-200 mt-8"
                >
                    {/* Reset button */}
                    <motion.button
                        type="button"
                        onClick={handleReset}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Đặt lại mặc định
                    </motion.button>

                    {/* Save button */}
                    <motion.button
                        type="submit"
                        disabled={isUpdating || updateStatus === 'loading'}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isUpdating || updateStatus === 'loading' ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Đang lưu...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                <span>Lưu cấu hình</span>
                            </>
                        )}
                    </motion.button>
                </motion.div>
            </form>

            <CustomAlert {...alertConfig} onClose={hideAlert} />
        </div>
    );
}
