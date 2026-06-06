import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Save, Loader2, ChevronDown, MapPin } from 'lucide-react';
import { Input, Label, Button } from '../../../../components/ui';
import { LogoUpload } from './logoUpload';
import { TagInput } from './TagInput';
import { RichTextEditor } from './RichTextEditor';
import { ContactInfoSection } from './ContactInfoSection';
import { CompanyTypeSection } from './CompanyTypeSection';
import { useDispatch, useSelector } from 'react-redux';
import { getCompany, updateCompany } from '../../../../modules/services/companyService';
import { uploadMedia, deleteMedia } from '../../../../modules/services/mediaService';
import { getCategories } from '../../../../modules/services/categoriesService';
import { getSkills } from '../../../../modules/services/skillsService';
import { getCompanyTypes } from '../../../../modules/services/companyTypeService';
import { getProvinces } from '../../../../modules/services/addressService';
import { CustomAlert } from "@/components";
import { useCustomAlert } from '../../../../hooks/useCustomAlert';

export function OverviewTab({ company, companyId }) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const MAX_UPLOAD_SIZE = 3 * 1024 * 1024; // 3MB

    useEffect(() => {
        dispatch(getCategories());
        dispatch(getCompanyTypes());
        dispatch(getSkills());
        dispatch(getProvinces(1));
    }, [dispatch]);

    const updateStatus = useSelector((state) => state.company.status);
    const updateError = useSelector((state) => state.company.error);
    const categories = useSelector((state) => state.categories?.categories ?? []);
    const companyTypes = useSelector((state) => state.companyTypes?.companyTypes ?? []);
    const skills = useSelector((state) => state.skills?.skills ?? []);
    const [isUpdating, setIsUpdating] = useState(false);
    const { alertConfig, hideAlert, showSuccess, showError } = useCustomAlert();

    // Company branches state
    const [companyBranches, setCompanyBranches] = useState([]);

    const [formData, setFormData] = useState({
        companyName: '',
        logo: '',
        background: '',
        website: '',
        email: '',
        phone: '',
        employees: '',
        industry: '',
        companyTypes: [],
        techStack: [],
        description: '',
    });

    // Update formData when company data is loaded
    useEffect(() => {
        if (company) {
            setFormData({
                companyName: company.name || '',
                logo: company.logo || '',
                background: company.background || '',
                website: company.website_url || '',
                email: company.email || '',
                phone: company.phone || '',
                employees: company.employee_count || '',
                industry: company.industry || '',
                companyTypes: company.company_types || [],
                techStack: company.tech_stack || [],
                description: company.description || '',
            });

            // Load company branches
            const branches = company.company_branches?.map(branch => ({
                id: branch.id,
                name: branch.name || '',
                address: branch.address || '',
                country_id: branch.country_id || 1,
                province_id: branch.province_id || '',
                ward_id: branch.ward_id || '',
                provinces: branch.provinces,
                wards: branch.wards,
            })) || [];

            setCompanyBranches(branches.length > 0 ? branches : [{ name: '', address: '', country_id: 1, province_id: '', ward_id: '' }]);
        }
    }, [company]);

    const handleInputChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const extractFileNameFromUrl = (url) => {
        if (!url || typeof url !== 'string') return null;
        try {
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('/');
            const fileName = pathParts[pathParts.length - 1];
            return fileName && fileName.startsWith('media_') ? fileName : null;
        } catch {
            return null;
        }
    };

    const normalizeMediaResponse = (result) => {
        const data = result?.data || result;
        return {
            url: data?.url || data?.filepath || null,
            fileName: data?.fileName || data?.filename || null,
        };
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (!companyId) return;

        setIsUpdating(true);

        try {
            let logoUrl = formData.logo;
            // Background no longer used: send empty unless newly uploaded
            let backgroundUrl = null;
            let oldLogoFileName = null;
            let oldBackgroundFileName = null;

            if (formData.logo instanceof File && company?.logo) {
                oldLogoFileName = extractFileNameFromUrl(company.logo);
            }

            if (formData.background instanceof File && company?.background) {
                oldBackgroundFileName = extractFileNameFromUrl(company.background);
            }

            // Upload logo
            if (formData.logo instanceof File) {
                if (formData.logo.size > MAX_UPLOAD_SIZE) {
                    alert('File logo vượt quá 3MB. Vui lòng chọn file nhỏ hơn.');
                    setIsUpdating(false);
                    return;
                }
                const logoFormData = new FormData();
                logoFormData.append('file', formData.logo);
                const logoResult = await dispatch(uploadMedia(logoFormData)).unwrap();
                const { url: uploadedLogoUrl, fileName: uploadedLogoFile } = normalizeMediaResponse(logoResult);

                if (!uploadedLogoUrl) {
                    throw new Error('Upload logo failed: missing url from response');
                }

                logoUrl = uploadedLogoUrl;

                // Delete old logo file if different
                if (oldLogoFileName && uploadedLogoFile && oldLogoFileName !== uploadedLogoFile) {
                    try {
                        await dispatch(deleteMedia(oldLogoFileName)).unwrap();
                    } catch (error) {
                        // Silently fail - don't block the operation
                    }
                }
            }

            // Upload background
            if (formData.background instanceof File) {
                if (formData.background.size > MAX_UPLOAD_SIZE) {
                    alert('File background vượt quá 3MB. Vui lòng chọn file nhỏ hơn.');
                    setIsUpdating(false);
                    return;
                }
                const bgFormData = new FormData();
                bgFormData.append('file', formData.background);
                const bgResult = await dispatch(uploadMedia(bgFormData)).unwrap();
                const { url: uploadedBgUrl, fileName: uploadedBgFile } = normalizeMediaResponse(bgResult);

                if (!uploadedBgUrl) {
                    throw new Error('Upload background failed: missing url from response');
                }

                backgroundUrl = uploadedBgUrl;

                // Delete old background file if different
                if (oldBackgroundFileName && uploadedBgFile && oldBackgroundFileName !== uploadedBgFile) {
                    try {
                        await dispatch(deleteMedia(oldBackgroundFileName)).unwrap();
                    } catch (error) {
                        // Silently fail - don't block the operation
                    }
                }
            }

            // Update company (branches will use separate API)
            const companyData = {
                name: formData.companyName,
                website_url: formData.website,
                email: formData.email,
                phone: formData.phone,
                logo: logoUrl,
                background: backgroundUrl,
                employee_count: formData.employees ? Number(formData.employees) : null,
                industry: formData.industry,
                company_types: Array.isArray(formData.companyTypes)
                    ? formData.companyTypes.map(ct => (typeof ct === 'object' && ct !== null ? ct.id : ct)).filter(Boolean)
                    : [],
                tech_stack: formData.techStack,
                description: formData.description,
            };

            await dispatch(updateCompany({ companyId, companyData })).unwrap();
            dispatch(getCompany(companyId));
            showSuccess("Cập nhật thông tin công ty thành công");
        } catch (error) {
            showError("Cập nhật thông tin công ty thất bại");
        } finally {
            setIsUpdating(false);
        }
    };

    const techStackSuggestions = skills.map(skill => skill.name);

    return (
        <form onSubmit={handleSubmit} className="space-y-8 py-8">
            {/* Basic Information */}
            <motion.section
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            >
                <motion.div
                    className="border-b border-gray-300 pb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <p className="text-lg font-semibold mb-2 text-foreground">{t("companySetting.overview.basicInformation")}</p>
                    <p className="text-normal text-muted-foreground">{t("companySetting.overview.basicInformationDesc")}</p>
                </motion.div>

                {/* Company Logo */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start border-b border-border pb-6"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                >
                    <div>
                        <Label className="text-foreground font-semibold text-lg">{t("companySetting.overview.companyLogo")}</Label>
                        <p className="text-normal text-muted-foreground mt-1">{t("companySetting.overview.companyLogoDesc")}</p>
                    </div>
                    <motion.div
                        className="md:col-span-2"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                    >
                        <LogoUpload
                            currentLogo={company?.logo || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath fill='%2334d399' d='M30,20 L50,30 L50,60 L30,70 L10,60 L10,30 Z'/%3E%3Cpath fill='%2310b981' d='M50,30 L70,20 L90,30 L90,60 L70,70 L50,60 Z'/%3E%3C/svg%3E"}
                            onLogoChange={(file) => handleInputChange('logo', file)}
                        />
                    </motion.div>
                </motion.div>

                {/* Contact Information */}
                <ContactInfoSection
                    email={formData.email}
                    phone={formData.phone}
                    onEmailChange={(value) => handleInputChange('email', value)}
                    onPhoneChange={(value) => handleInputChange('phone', value)}
                />

                {/* Company Details */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start border-b border-border pb-6"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                >
                    <div>
                        <Label className="text-foreground font-semibold text-lg">{t("companySetting.overview.companyDetails")}</Label>
                        <p className="text-normal text-muted-foreground mt-1">{t("companySetting.overview.companyDetailsDesc")}</p>
                    </div>

                    <motion.div
                        className="md:col-span-2 space-y-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.6 }}
                    >
                        {/* Company Name & Website - Same Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Company Name */}
                            <div>
                                <Label htmlFor="companyName" className="text-foreground">
                                    {t("companySetting.overview.companyName")}
                                </Label>
                                <Input
                                    id="companyName"
                                    type="text"
                                    value={formData.companyName || ''}
                                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                                    className="bg-white border-border mt-2"
                                />
                            </div>

                            {/* Website */}
                            <div>
                                <Label htmlFor="website" className="text-foreground">
                                    {t("companySetting.overview.website")}
                                </Label>
                                <Input
                                    id="website"
                                    type="url"
                                    value={formData.website || ''}
                                    onChange={(e) => handleInputChange('website', e.target.value)}
                                    className="bg-white border-border mt-2"
                                />
                            </div>
                        </div>

                        {/* Employee & Industry - Same Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Employee */}
                            <div>
                                <Label htmlFor="employees" className="text-foreground">
                                    {t("companySetting.overview.employee")}
                                </Label>
                                <Input
                                    id="employees"
                                    type="number"
                                    min={1}
                                    step={1}
                                    value={formData.employees || ''}
                                    onChange={(e) => handleInputChange('employees', e.target.value ? Number(e.target.value) : '')}
                                    placeholder={t("companySetting.overview.employeePlaceholder")}
                                    className="bg-white border-border mt-2"
                                />
                            </div>

                            {/* Industry */}
                            <div>
                                <Label htmlFor="industry" className="text-foreground">
                                    {t("companySetting.overview.industry")}
                                </Label>
                                <div className="relative mt-2">
                                    <select
                                        id="industry"
                                        value={formData.industry || ''}
                                        onChange={(e) => handleInputChange('industry', e.target.value)}
                                        className="w-full px-4 py-2 border border-border bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary appearance-none h-10"
                                    >
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.name}>{category.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </motion.section>

            {/* Company Types & Tech Stack */}
            <motion.section
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7, ease: "easeOut" }}
            >
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start border-b border-border pb-6"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.8 }}
                >
                    <div>
                        <p className="text-lg font-semibold text-foreground">{t("companySetting.overview.companyInformation")}</p>
                        <p className="text-normal text-muted-foreground mt-1">{t("companySetting.overview.companyInformationDesc")}</p>
                    </div>

                    <motion.div
                        className="md:col-span-2 space-y-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.9 }}
                    >
                        {/* Company Types */}
                        <div>
                            <CompanyTypeSection
                                companyTypes={formData.companyTypes}
                                onCompanyTypesChange={(types) => setFormData(prev => ({ ...prev, companyTypes: types }))}
                                companyTypeSuggestions={companyTypes.map(ct => ct?.name || '').filter(Boolean)}
                                allCompanyTypes={companyTypes}
                            />
                        </div>

                        {/* Tech Stack */}
                        <div>
                            <TagInput
                                label={t("companySetting.overview.techStack")}
                                tags={formData.techStack}
                                onTagsChange={(tags) => setFormData({ ...formData, techStack: tags })}
                                suggestions={techStackSuggestions}
                                placeholder={t("companySetting.overview.techStackPlaceholder")}
                            />
                        </div>
                    </motion.div>
                </motion.div>
            </motion.section>

            {/* Company Branches - Read Only */}
            <motion.section
                className="border-b border-border pb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.0, ease: "easeOut" }}
            >
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 1.1 }}
                >
                    <p className="text-lg font-semibold mb-2 text-foreground">{t("companySetting.overview.companyBranches")}</p>
                    <p className="text-normal text-muted-foreground mb-6">{t("companySetting.overview.companyBranchesDesc")}</p>
                </motion.div>

                {companyBranches && companyBranches.length > 0 ? (
                    <div className="space-y-4">
                        {companyBranches.map((branch, index) => (
                            <motion.div
                                key={branch.id || index}
                                className="bg-muted/50 border border-border rounded-lg p-6"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: 1.2 + index * 0.1 }}
                                whileHover={{ x: 4, transition: { duration: 0.2 } }}
                            >
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                                    <div className="flex-1">
                                        <h5 className="font-semibold text-foreground mb-2">
                                            {branch.name || `${t("companySetting.overview.branch")} ${index + 1}`}
                                        </h5>
                                        <p className="text-muted-foreground mb-2">
                                            {branch.address}
                                        </p>
                                        <div className="text-sm text-muted-foreground">
                                            {branch.provinces && (
                                                <span>{branch.provinces.name}</span>
                                            )}
                                            {branch.wards && (
                                                <span>, {branch.wards.name}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        className="bg-muted/50 border border-border rounded-lg p-6 text-center text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 1.2 }}
                    >
                        {t("companySetting.overview.noBranches")}
                    </motion.div>
                )}
            </motion.section>

            {/* About Company */}
            <motion.section
                className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start border-b border-border pb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.3, ease: "easeOut" }}
            >
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 1.4 }}
                >
                    <p className="text-lg font-semibold text-foreground">{t("companySetting.overview.aboutCompany")}</p>
                    <p className="text-normal text-muted-foreground mt-1">{t("companySetting.overview.aboutCompanyDesc")}</p>
                </motion.div>
                <motion.div
                    className="md:col-span-2"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 1.5 }}
                >
                    <Label htmlFor="description" className="text-foreground">
                        {t("companySetting.overview.description")}
                    </Label>
                    <div className="mt-2">
                        <RichTextEditor
                            value={formData.description}
                            onChange={(value) => setFormData({ ...formData, description: value })}
                            maxLength={500}
                            placeholder={t("companySetting.overview.descriptionPlaceholder")}
                        />
                    </div>
                </motion.div>
            </motion.section>

            {/* Save Button */}
            <motion.div
                className="flex justify-end mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.6, ease: "easeOut" }}
            >
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Button
                        type="submit"
                        size="lg"
                        disabled={isUpdating || updateStatus === 'loading'}
                        className="cursor-pointer bg-primary hover:bg-primary/90 text-white px-8"
                    >
                        {isUpdating || updateStatus === 'loading' ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                <span>{t("companySetting.overview.saving")}</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5 mr-2" />
                                <span>{t("companySetting.overview.saveChanges")}</span>
                            </>
                        )}
                    </Button>
                </motion.div>
            </motion.div>

            {/* Error Message */}
            {updateError && updateStatus === 'failed' && (
                <motion.div
                    className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mt-4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <p className="font-medium">{t("companySetting.overview.errorUpdating")}</p>
                    <p className="text-sm">{updateError}</p>
                </motion.div>
            )}
            <CustomAlert {...alertConfig} onClose={hideAlert} />
        </form>
    );
}