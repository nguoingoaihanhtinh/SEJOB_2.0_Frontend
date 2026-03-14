import { createExperience, updateExperience, deleteExperience } from '../../../../../modules/services/experiencesService';
import { createEducation, updateEducation, deleteEducation } from '../../../../../modules/services/educationsService';
import { createProject, updateProject, deleteProject } from '../../../../../modules/services/projectsService';
import { createCertificate, updateCertificate, deleteCertificate } from '../../../../../modules/services/certificateService';
import { createCv, updateCv, deleteCv, getCvsByStudentId } from '../../../../../modules/services/cvService';
import { uploadMedia, deleteMedia } from '../../../../../modules/services/mediaService';
import { updateUser } from '../../../../../modules/services/userService';
import { getMe } from '../../../../../modules/services/authService';
import {
    transformEducationToAPI,
    transformProjectToAPI,
    transformCertificateToAPI,
    validateEducationForm,
    validateProjectForm,
    validateCertificateForm,
    mapGenderToBackend,
} from './utils';
import api from "../../../../../modules/AxiosInstance";
import _ from 'lodash';


export const useProfileHandlers = ({
    setUser,
    cvs,
    setCvs,
    setAbout,
    setExperiences,
    setSkills,
    setProjects,
    setCertificates,
    setAwards,
    closeModal,
    setSelectedExperience,
    setSelectedEducation,
    setSelectedSkillGroup,
    setSelectedProject,
    setSelectedCertificate,
    setSelectedAward,
    selectedExperience,
    selectedEducation,
    selectedSkillGroup,
    selectedProject,
    selectedCertificate,
    dispatch,
    currentUser,
    setOpenForOpportunities,
}) => {
    // Helpers
    const getStudentInfo = () => {
        return Array.isArray(currentUser?.student_info)
            ? currentUser.student_info[0]
            : currentUser?.student_info || null;
    };

    // Ensure nullable fields are converted to safe defaults before sending to API
    // Only send fields that have valid values to avoid backend validation errors
    const sanitizeStudentInfo = (studentInfo = {}) => {
        const sanitized = {};

        if (studentInfo?.phone_number) {
            sanitized.phone_number = studentInfo.phone_number;
        }

        if (studentInfo?.date_of_birth) {
            sanitized.date_of_birth = studentInfo.date_of_birth;
        }

        if (studentInfo?.gender && ['Male', 'Female', 'Other'].includes(studentInfo.gender)) {
            sanitized.gender = studentInfo.gender;
        }
        if (studentInfo?.location) {
            sanitized.location = studentInfo.location;
        }

        if (Array.isArray(studentInfo?.skills) && studentInfo.skills.length > 0) {
            sanitized.skills = studentInfo.skills;
        }

        if (typeof studentInfo?.open_for_opportunities === 'boolean') {
            sanitized.open_for_opportunities = studentInfo.open_for_opportunities;
        }

        if (studentInfo?.about !== undefined && studentInfo?.about !== null) {
            sanitized.about = studentInfo.about;
        }

        if (Array.isArray(studentInfo?.desired_positions) && studentInfo.desired_positions.length > 0) {
            sanitized.desired_positions = studentInfo.desired_positions;
        }

        const fieldsToInclude = ['id', 'student_id', 'user_id', 'experiences', 'educations', 'projects', 'certifications', 'cv'];
        fieldsToInclude.forEach(field => {
            if (studentInfo?.[field] !== undefined && studentInfo[field] !== null) {
                sanitized[field] = studentInfo[field];
            }
        });

        return sanitized;
    };

    // CV Handlers
    const handleCVFileChange = async (file, cvId = null) => {
        try {
            if (!file) {
                alert('Vui lòng chọn file');
                return;
            }

            if (file.type !== 'application/pdf') {
                alert('Vui lòng chọn file PDF');
                return;
            }

            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                alert('File quá lớn. Vui lòng chọn file nhỏ hơn 5MB');
                return;
            }

            // Lưu filepath cũ trước khi upload (nếu đang update CV)
            let oldFileName = null;
            if (cvId) {
                const cvToUpdate = cvs.find(cv =>
                    cv.cvid === cvId || cv.id === cvId || cv.cv_id === cvId
                );
                if (cvToUpdate?.filepath) {
                    oldFileName = extractFileNameFromUrl(cvToUpdate.filepath);
                }
            }

            // Upload file mới
            const formData = new FormData();
            formData.append('file', file);
            const uploadResult = await dispatch(uploadMedia(formData)).unwrap();

            if (!uploadResult?.url || !uploadResult?.fileName) {
                throw new Error('Upload file thất bại: Không nhận được URL từ server');
            }

            const studentInfo = getStudentInfo();
            const studentId = studentInfo?.id || studentInfo?.student_id;

            if (!studentId) {
                throw new Error('Không tìm thấy thông tin sinh viên');
            }

            const cvData = {
                studentid: studentId,
                title: file.name.replace('.pdf', '') || 'CV',
                filepath: uploadResult.url,
            };

            // Update hoặc create CV
            if (cvId) {
                await dispatch(updateCv({ id: cvId, cvData })).unwrap();
            } else {
                await dispatch(createCv(cvData)).unwrap();
            }

            // Xóa file cũ nếu có và khác file mới
            if (oldFileName && uploadResult.fileName && oldFileName !== uploadResult.fileName) {
                try {
                    await dispatch(deleteMedia(oldFileName)).unwrap();
                    console.log('Đã xóa file CV cũ:', oldFileName);
                } catch (fileError) {
                    console.warn('Không thể xóa file CV cũ (file có thể đã bị xóa trước đó):', fileError);
                    // Không throw error để không ảnh hưởng đến flow chính
                }
            }

            // Refresh danh sách CV
            await dispatch(getCvsByStudentId({ studentId })).unwrap();
        } catch (error) {
            console.error('Error uploading CV:', error);
            const errorMessage = error?.message || error?.payload || 'Có lỗi xảy ra khi upload CV';
            alert(errorMessage);
        }
    };

    const extractFileNameFromUrl = (url) => {
        if (!url || typeof url !== 'string') return null;
        try {
            // Nếu là URL đầy đủ, parse bằng URL object
            if (url.startsWith('http://') || url.startsWith('https://')) {
                const urlObj = new URL(url);
                const pathParts = urlObj.pathname.split('/');
                const fileName = pathParts[pathParts.length - 1];
                // Loại bỏ query params và hash nếu có
                return fileName.split('?')[0].split('#')[0];
            } else {
                // Nếu là relative path hoặc fileName
                const pathParts = url.split('/');
                const fileName = pathParts[pathParts.length - 1];
                return fileName.split('?')[0].split('#')[0];
            }
        } catch {
            // Fallback: nếu không parse được URL, lấy phần cuối cùng
            const parts = url.split('/');
            return parts[parts.length - 1]?.split('?')[0]?.split('#')[0] || null;
        }
    };

    const handleDeleteCV = async (cvId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa CV này?')) return;

        try {
            const cvToDelete = cvs.find(cv =>
                cv.cvid === cvId || cv.id === cvId || cv.cv_id === cvId
            );

            // Lưu filepath trước khi xóa CV
            const filepathToDelete = cvToDelete?.filepath;

            // Xóa CV record trước
            await dispatch(deleteCv(cvId)).unwrap();

            // Sau khi xóa CV thành công, xóa file media
            if (filepathToDelete) {
                try {
                    // Extract fileName từ URL hoặc filepath
                    const fileName = extractFileNameFromUrl(filepathToDelete);

                    // Chỉ xóa nếu fileName hợp lệ và bắt đầu bằng 'media_'
                    if (fileName && fileName.startsWith('media_')) {
                        await dispatch(deleteMedia(fileName)).unwrap();
                        console.log('Đã xóa file media:', fileName);
                    } else {
                        console.warn('File name không hợp lệ hoặc không phải media file:', fileName);
                    }
                } catch (fileError) {
                    console.warn('Không thể xóa file media (file có thể đã bị xóa trước đó):', fileError);
                    // Không throw error để không ảnh hưởng đến flow chính
                }
            }

            // Refresh danh sách CV
            const studentInfo = getStudentInfo();
            const studentId = studentInfo?.id || studentInfo?.student_id;
            if (studentId) {
                await dispatch(getCvsByStudentId({ studentId })).unwrap();
            }
        } catch (error) {
            console.error('Error deleting CV:', error);
            alert(error?.message || 'Có lỗi xảy ra khi xóa CV');
        }
    };

    const handleViewCV = (cv) => {
        if (cv?.filepath) {
            window.open(cv.filepath, '_blank');
        } else if (cv?.file) {
            const fileURL = URL.createObjectURL(cv.file);
            window.open(fileURL, '_blank');
        }
    };

    const handleUpdateCVTitle = async (cvId, newTitle) => {
        if (!newTitle?.trim()) {
            alert('Tên CV không được để trống');
            return;
        }

        try {
            await dispatch(updateCv({
                id: cvId,
                cvData: { title: newTitle.trim() }
            })).unwrap();

            const studentInfo = getStudentInfo();
            const studentId = studentInfo?.id || studentInfo?.student_id;

            if (studentId) {
                await dispatch(getCvsByStudentId({ studentId })).unwrap();
            }
        } catch (error) {
            console.error('Error updating CV title:', error);
            alert(error?.message || 'Có lỗi xảy ra khi cập nhật tên CV');
            throw error;
        }
    };

    // Information Handlers
    const handleSaveInformation = async (formData) => {
        try {
            if (!currentUser?.user_id) {
                alert('Không tìm thấy người dùng. Vui lòng đăng nhập lại.');
                return;
            }

            // Map gender from Vietnamese to English
            const mappedGender = formData.gender ? mapGenderToBackend(formData.gender) : undefined;

            // Process phone_number: send undefined if empty, otherwise send trimmed string
            const phoneNumber = formData.phone?.trim() || undefined;

            // Process date_of_birth: send undefined if empty, otherwise send the date string
            const dateOfBirth = formData.dateOfBirth?.trim() || undefined;

            // Process desired_positions: send array, undefined if empty
            const desiredPositions = Array.isArray(formData.title) && formData.title.length > 0
                ? formData.title.map(t => t.trim()).filter(t => t !== '')
                : undefined;

            // Process location: send undefined if empty, otherwise send trimmed string
            const location = formData.province?.trim() || undefined;

            const studentInfo = sanitizeStudentInfo(getStudentInfo() || {});
            const userData = {
                userId: currentUser.user_id,
                userData: {
                    first_name: formData.first_name || '',
                    last_name: formData.last_name || '',
                    student_info: {
                        ...studentInfo,
                        phone_number: phoneNumber,
                        date_of_birth: dateOfBirth,
                        gender: mappedGender,
                        desired_positions: desiredPositions,
                        location: location,
                    },
                },
            };

            await dispatch(updateUser(userData)).unwrap();
            await dispatch(getMe()).unwrap();
            closeModal('information');
        } catch (error) {
            console.error('Error saving information:', error);
            alert(error?.message || 'Có lỗi xảy ra khi lưu thông tin');
        }
    };

    const handleSaveAbout = async (formData) => {
        try {
            if (!currentUser?.user_id) {
                alert('Không tìm thấy người dùng. Vui lòng đăng nhập lại.');
                return;
            }

            const studentInfo = sanitizeStudentInfo(getStudentInfo() || {});
            const aboutText = formData.about || formData.content || '';
            const userData = {
                userId: currentUser.user_id,
                userData: {
                    student_info: {
                        ...studentInfo,
                        about: aboutText,
                    },
                },
            };

            await dispatch(updateUser(userData)).unwrap();
            await dispatch(getMe()).unwrap();
            closeModal('about');
        } catch (error) {
            console.error('Error saving about:', error);
            alert(error?.message || 'Có lỗi xảy ra khi lưu giới thiệu');
        }
    };

    // Experience Handlers
    const handleSaveExperience = async (formData) => {
        try {
            const studentInfo = getStudentInfo();
            const studentId = studentInfo?.id || studentInfo?.student_id;
            if (!studentId) {
                alert('Vui lòng đăng nhập lại.');
                return;
            }

            const position = (formData.jobTitle || formData.role || '').trim();
            const startMonth = String(formData.startMonth || '').padStart(2, '0');
            const startDate = `${formData.startYear}-${startMonth}-01`;
            let endDate = null;
            if (!formData.isCurrentlyWorking && formData.endYear && formData.endMonth) {
                const endMonth = String(formData.endMonth).padStart(2, '0');
                endDate = `${formData.endYear}-${endMonth}-01`;
            }

            const experienceData = {
                position: position,
                title: position,
                student_id: studentId,
                company: formData.company?.trim() || '',
                location: formData.location?.trim() || '',
                start_date: startDate,
                end_date: endDate,
                is_current: formData.isCurrentlyWorking || false,
                description: formData.description || '',
            };

            if (selectedExperience?.id) {
                await dispatch(updateExperience({ id: selectedExperience.id, experienceData })).unwrap();
            } else {
                await dispatch(createExperience(experienceData)).unwrap();
            }

            await dispatch(getMe()).unwrap();
            setSelectedExperience(null);
            closeModal('experience');
        } catch (error) {
            console.error('Error saving experience:', error);
            alert(error?.message || 'Có lỗi xảy ra khi lưu kinh nghiệm làm việc');
        }
    };

    const handleDeleteExperience = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa thông tin công việc này?')) return;
        try {
            await dispatch(deleteExperience(id)).unwrap();
            await dispatch(getMe()).unwrap();
        } catch (error) {
            console.error('Error deleting experience:', error);
            alert(error?.message || 'Có lỗi xảy ra khi xóa kinh nghiệm');
        }
    };

    // Education Handlers
    const handleSaveEducation = async (formData) => {
        try {
            const validation = validateEducationForm(formData);
            if (!validation.valid) {
                alert(validation.message);
                return;
            }

            const transformedData = transformEducationToAPI(formData);

            if (selectedEducation?.id) {
                await dispatch(updateEducation({ id: selectedEducation.id, educationData: transformedData })).unwrap();
            } else {
                await dispatch(createEducation(transformedData)).unwrap();
            }

            await dispatch(getMe()).unwrap();
            setSelectedEducation(null);
            closeModal('education');
        } catch (error) {
            console.error('Error saving education:', error);
            alert(error?.message || 'Có lỗi xảy ra khi lưu thông tin học vấn');
        }
    };

    const handleDeleteEducation = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa thông tin học vấn này?')) return;
        try {
            await dispatch(deleteEducation(id)).unwrap();
            await dispatch(getMe()).unwrap();
        } catch (error) {
            console.error('Error deleting education:', error);
            alert(error?.message || 'Có lỗi xảy ra khi xóa thông tin học vấn');
        }
    };

    // Skills
    const handleSkills = async (skillsArray = [], { closeAfterSave = true } = {}) => {
        setSkills(skillsArray);

        if (!currentUser?.user_id) {
            alert('Không tìm thấy người dùng. Vui lòng đăng nhập lại.');
            return;
        }

        try {
            const studentInfo = sanitizeStudentInfo(getStudentInfo() || {});
            const userData = {
                userId: currentUser.user_id,
                userData: {
                    student_info: {
                        ...(studentInfo || {}),
                        skills: skillsArray,
                    },
                },
            };

            await dispatch(updateUser(userData)).unwrap();
            await dispatch(getMe()).unwrap();
        } catch (error) {
            console.error('Error updating skills:', error);
            alert(error?.message || 'Có lỗi xảy ra khi cập nhật kỹ năng');
            setSkills(getStudentInfo()?.skills || []);
        } finally {
            if (closeAfterSave) {
                setSelectedSkillGroup(null);
                closeModal('skills');
            }
        }
    };

    const handleSaveSkillGroup = async (skillsArray = []) => {
        await handleSkills(skillsArray, { closeAfterSave: true });
    };

    const handleDeleteSkillGroup = async (skillToDelete) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa kỹ năng này?')) return;
        const nextSkills = (getStudentInfo()?.skills || []).filter((s) => s !== skillToDelete);
        await handleSkills(nextSkills, { closeAfterSave: false });
    };

    // Projects
    const handleSaveProject = async (formData) => {
        try {
            // Basic validation - formData đã được validate trong modal rồi
            if (!formData?.projectName || !formData?.startYear || !formData?.startMonth) {
                alert('Vui lòng điền đầy đủ thông tin bắt buộc');
                return;
            }

            // Ensure websiteLink is included - check all possible field names
            const websiteLinkValue = formData?.websiteLink || formData?.website || formData?.website_link || '';

            const dataToTransform = {
                projectName: formData.projectName || '',
                isCurrentlyWorking: formData.isCurrentlyWorking || false,
                startMonth: formData.startMonth || '',
                startYear: formData.startYear || '',
                endMonth: formData.endMonth || '',
                endYear: formData.endYear || '',
                description: formData.description || '',
                websiteLink: websiteLinkValue,
            };

            const transformedData = transformProjectToAPI(dataToTransform);

            if (selectedProject?.id) {
                await dispatch(updateProject({ id: selectedProject.id, projectData: transformedData })).unwrap();
            } else {
                await dispatch(createProject(transformedData)).unwrap();
            }

            await dispatch(getMe()).unwrap();
            setSelectedProject(null);
            closeModal('projects');
        } catch (error) {
            console.error('Error saving project:', error);
            alert(error?.message || 'Có lỗi xảy ra khi lưu thông tin dự án');
        }
    };

    const handleDeleteProject = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa dự án này?')) return;
        try {
            await dispatch(deleteProject(id)).unwrap();
            await dispatch(getMe()).unwrap();
        } catch (error) {
            console.error('Error deleting project:', error);
            alert(error?.message || 'Có lỗi xảy ra khi xóa dự án');
        }
    };

    // Certificates
    const handleSaveCertificate = async (formData) => {
        try {
            const validation = validateCertificateForm(formData);
            if (!validation.valid) {
                alert(validation.message);
                return;
            }

            const transformedData = transformCertificateToAPI(formData);

            if (selectedCertificate?.id) {
                await dispatch(updateCertificate({ id: selectedCertificate.id, certificateData: transformedData })).unwrap();
            } else {
                await dispatch(createCertificate(transformedData)).unwrap();
            }

            await dispatch(getMe()).unwrap();
            setSelectedCertificate(null);
            closeModal('certificates');
        } catch (error) {
            console.error('Error saving certificate:', error);
            alert(error?.message || 'Có lỗi xảy ra khi lưu chứng chỉ');
        }
    };

    const handleDeleteCertificate = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa chứng chỉ này?')) return;
        try {
            await dispatch(deleteCertificate(id)).unwrap();
            await dispatch(getMe()).unwrap();
        } catch (error) {
            console.error('Error deleting certificate:', error);
            alert(error?.message || 'Có lỗi xảy ra khi xóa chứng chỉ');
        }
    };

    // Awards
    const handleDeleteAward = (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa giải thưởng này?')) {
            setAwards((prev) => prev.filter((award) => award.id !== id));
        }
    };


    // Open for Opportunities
    const handleToggleOpenForOpportunities = async (newValue) => {
        setOpenForOpportunities(newValue);
        try {
            if (!currentUser?.user_id) {
                alert('Không tìm thấy người dùng. Vui lòng đăng nhập lại.');
                return;
            }
            const currentStudentInfo = sanitizeStudentInfo(getStudentInfo() || {});
            const userData = {
                userId: currentUser.user_id,
                userData: {
                    student_info: {
                        ...currentStudentInfo,
                        open_for_opportunities: newValue,
                    },
                },
            };
            await dispatch(updateUser(userData)).unwrap();
            await dispatch(getMe()).unwrap();
        } catch (error) {
            console.error('Error updating open for opportunities:', error);
            alert(error?.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
            setOpenForOpportunities(getStudentInfo()?.open_for_opportunities === true);
        }
    }

    const handleGetSocialLinks = async (userId) => {
        try {
            const data = await api.get(`/api/social-links`);
            return _.get(data, 'data');
        } catch (error) {
            console.error('Error getting social links:', error);
            alert(error?.message || 'Có lỗi xảy ra khi lấy thông tin mạng xã hội');
            return [];
        }
    }

    const handleUpdateSocialLink = async (userId, socialLinkData) => {
        try {
            const data = await api.put(`/api/social-links/${userId}`, socialLinkData);
            return _.get(data, 'data');
        } catch (error) {
            console.error('Error updating social link:', error);
            alert(error?.message || 'Có lỗi xảy ra khi cập nhật thông tin mạng xã hội');
            return null;
        }
    }

    const handleDeleteSocialLink = async (userId, { platform }) => {
        try {
            const data = await api.delete(`/api/social-links/${userId}?platform=${platform}`);
            return _.get(data, 'data');
        } catch (error) {
            console.error('Error deleting social link:', error);
            alert(error?.message || 'Có lỗi xảy ra khi xóa thông tin mạng xã hội');
            return null;
        }
    }

    const handleCreateSocialLink = async (userId, socialLinkData) => {
        try {
            const data = await api.post(`/api/social-links/${userId}`, socialLinkData);
            return _.get(data, 'data');
        } catch (error) {
            console.error('Error creating social link:', error);
            alert(error?.message || 'Có lỗi xảy ra khi tạo thông tin mạng xã hội');
            return null;
        }
    }

    return {
        handleCVFileChange,
        handleDeleteCV,
        handleViewCV,
        handleUpdateCVTitle,
        handleSaveInformation,
        handleSaveAbout,
        handleSaveExperience,
        handleDeleteExperience,
        handleSaveEducation,
        handleDeleteEducation,
        handleSaveSkillGroup,
        handleDeleteSkillGroup,
        handleSaveProject,
        handleDeleteProject,
        handleSaveCertificate,
        handleDeleteCertificate,
        handleDeleteAward,
        handleToggleOpenForOpportunities,
        handleGetSocialLinks,
        handleUpdateSocialLink,
        handleDeleteSocialLink,
        handleCreateSocialLink
    };
};