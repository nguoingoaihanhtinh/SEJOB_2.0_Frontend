import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Loader2, Plus, Trash2 } from 'lucide-react';
import { updateCompany } from '../../../../modules/services/companyService';
import { useCustomAlert } from '../../../../hooks/useCustomAlert';
import { CustomAlert } from "@/components";

export function SocialLinksTab({ companyId }) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const company = useSelector((state) => state.company.company);
    const updateStatus = useSelector((state) => state.company.status);
    const updateError = useSelector((state) => state.company.error);
    const [isUpdating, setIsUpdating] = useState(false);
    const { alertConfig, hideAlert, showSuccess, showError } = useCustomAlert();

    // Đổi từ object sang array để dễ thêm/xóa
    const [socialLinks, setSocialLinks] = useState([]);

    // Danh sách gợi ý các platform phổ biến
    const popularPlatforms = [
        'Instagram',
        'Twitter',
        'Facebook',
        'LinkedIn',
        'YouTube',
        'TikTok',
        'GitHub',
        'Website',
        'Blog',
        'Discord',
        'Telegram',
    ];

    useEffect(() => {
        if (company?.socials) {
            // Convert object sang array format
            const linksArray = Object.entries(company.socials)
                .filter(([_, url]) => url) // Chỉ lấy những link có giá trị
                .map(([platform, url]) => ({
                    id: Date.now() + Math.random(), // unique id
                    platform: platform.charAt(0).toUpperCase() + platform.slice(1),
                    url: url,
                }));

            setSocialLinks(linksArray.length > 0 ? linksArray : []);
        }
    }, [company]);

    const handleAddLink = () => {
        const newLink = {
            id: Date.now() + Math.random(),
            platform: '',
            url: '',
        };
        setSocialLinks([...socialLinks, newLink]);
    };

    const handleRemoveLink = (id) => {
        setSocialLinks(socialLinks.filter((link) => link.id !== id));
    };

    const handleLinkChange = (id, field, value) => {
        setSocialLinks(
            socialLinks.map((link) =>
                link.id === id ? { ...link, [field]: value } : link
            )
        );
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (!companyId) return;

        setIsUpdating(true);

        try {
            // Convert array về object format để lưu vào database
            const socialsObject = {};
            socialLinks.forEach((link) => {
                if (link.platform && link.url) {
                    const platformKey = link.platform.toLowerCase();
                    socialsObject[platformKey] = link.url;
                }
            });

            const companyData = { socials: socialsObject };
            await dispatch(updateCompany({ companyId, companyData })).unwrap();
            showSuccess("Update social links successfully");
        } catch (error) {
            console.error('Failed to update social links:', error);
            showError("Failed to update social links");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="space-y-8 py-8">
            {/* CSS để ẩn mũi tên dropdown của datalist */}
            <style>{`
                input[list]::-webkit-calendar-picker-indicator {
                    display: none !important;
                }
            `}</style>

            {/* Basic Information */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <form onSubmit={handleSubmit}>
                    <motion.h4
                        className="mb-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                    >
                        {t('companySetting.socialLinks.basicInformation')}
                    </motion.h4>
                    <motion.p
                        className="text-gray-500 mb-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                    >
                        {t('companySetting.socialLinks.basicInformationDesc')}
                    </motion.p>

                    <motion.div
                        className="space-y-4 max-w-3xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                    >
                        {/* Hiển thị danh sách các link */}
                        <AnimatePresence>
                            {socialLinks.map((link, index) => (
                                <motion.div
                                    key={link.id}
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
                                    className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                                >
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Platform Name */}
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                                Platform
                                            </label>
                                            <input
                                                type="text"
                                                list={`platforms-${link.id}`}
                                                value={link.platform}
                                                onChange={(e) =>
                                                    handleLinkChange(link.id, 'platform', e.target.value)
                                                }
                                                placeholder="e.g., Instagram, LinkedIn, Website..."
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                            />
                                            <datalist id={`platforms-${link.id}`}>
                                                {popularPlatforms.map((platform) => (
                                                    <option key={platform} value={platform} />
                                                ))}
                                            </datalist>
                                        </div>

                                        {/* URL */}
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                                URL
                                            </label>
                                            <input
                                                type="url"
                                                value={link.url}
                                                onChange={(e) =>
                                                    handleLinkChange(link.id, 'url', e.target.value)
                                                }
                                                placeholder="https://..."
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    {/* Delete Button */}
                                    <motion.button
                                        type="button"
                                        onClick={() => handleRemoveLink(link.id)}
                                        className="mt-8 p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Remove link"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </motion.button>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Empty State */}
                        <AnimatePresence>
                            {socialLinks.length === 0 && (
                                <motion.div
                                    className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <p className="text-gray-500 mb-4">
                                        Chưa có social link nào. Hãy thêm link đầu tiên!
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Add New Link Button */}
                        <motion.button
                            type="button"
                            onClick={handleAddLink}
                            className="cursor-pointer w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                            whileHover={{ scale: 1.02, borderColor: "#2563eb" }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.4 }}
                        >
                            <Plus className="w-5 h-5" />
                            <span className="font-medium">Add Social Link</span>
                        </motion.button>
                    </motion.div>

                    {/* Error Message */}
                    {updateError && updateStatus === 'failed' && (
                        <motion.div
                            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-3xl mt-6"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <p className="font-medium">
                                {t('companySetting.socialLinks.errorUpdating')}
                            </p>
                            <p className="text-sm">{updateError}</p>
                        </motion.div>
                    )}

                    {/* Save Button */}
                    <motion.div
                        className="flex cursor-pointer justify-end pt-6 border-t border-gray-200 mt-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
                    >
                        <motion.button
                            type="submit"
                            disabled={isUpdating || updateStatus === 'loading'}
                            className="px-6 cursor-pointer py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {isUpdating || updateStatus === 'loading' ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>{t('companySetting.socialLinks.saving')}</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>{t('companySetting.socialLinks.saveChanges')}</span>
                                </>
                            )}
                        </motion.button>
                    </motion.div>
                </form>
            </motion.section>
            <CustomAlert {...alertConfig} onClose={hideAlert} />
        </div>
    );
}
