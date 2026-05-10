import React from 'react';
import { Container, Box, CircularProgress, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

// Partials
import ProfileHeader from './partials/ProfileHeader';
import CVUpload from './partials/CVUpload';
import AboutSection from './partials/AboutSection';
import ExperienceSection from './partials/ExperienceSection';
import EducationSection from './partials/EducationSection';
import ProfileCompletionCard from './partials/ProfileSidebar';
import {
    SkillsSection,
    ProjectsSection,
    CertificatesSection,
    AwardsSection
} from './partials/ProfileSections';

// Custom Hooks
import { useProfileData } from './hooks/useProfileData';
import { useProfileModals } from './hooks/useProfileModals';
import { useProfileHandlers } from './hooks/useProfileHandlers';

// Components
import { ProfileModals } from './components/ProfileModals';
import SocialLinkSections from './partials/SocialLinkSections';

export default function Profile() {
    const dispatch = useDispatch();
    const { t } = useTranslation();

    // Check auth state
    const currentUser = useSelector((state) => state.auth.user);
    const authStatus = useSelector((state) => state.auth.status);

    // Custom hooks for data management
    const profileData = useProfileData();
    const modalState = useProfileModals();

    // Handlers
    const handlers = useProfileHandlers({
        ...profileData,
        ...modalState,
        dispatch,
        currentUser,
    });

    // Show loading if no user data yet (after reload)
    if (!currentUser && authStatus === 'loading') {
        return (
            <Box sx={{
                bgcolor: 'background.default',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress size={48} sx={{ mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                        {t("profile.loading_user_info")}
                    </Typography>
                </Box>
            </Box>
        );
    }

    const {
        user,
        cvs,
        about,
        experiences,
        educations,
        skills,
        projects,
        certificates,
        awards,
        showAllExperiences,
        setShowAllExperiences,
        showAllEducations,
        setShowAllEducations,
        completionPercentage,
        openForOpportunities,
        setOpenForOpportunities,
    } = profileData;

    const {
        modals,
        openModal,
        closeModal,
        selectedEducation,
        selectedExperience,
        selectedSkillGroup,
        selectedProject,
        selectedCertificate,
        selectedAward,
        setSelectedEducation,
        setSelectedExperience,
        setSelectedSkillGroup,
        setSelectedProject,
        setSelectedCertificate,
        setSelectedAward,
    } = modalState;

    // Edit handlers that set selected item and open modal
    const handleEditExperience = (exp) => {
        setSelectedExperience(exp);
        openModal('experience');
    };

    const handleEditEducation = (edu) => {
        setSelectedEducation(edu);
        openModal('education');
    };

    const handleEditSkillGroup = () => {
        // For simple array skills we just open the modal with current skills
        setSelectedSkillGroup(null);
        openModal('skills');
    };

    const handleEditProject = (project) => {
        setSelectedProject(project);
        openModal('projects');
    };

    const handleEditCertificate = (cert) => {
        setSelectedCertificate(cert);
        openModal('certificates');
    };

    const handleEditAward = (award) => {
        setSelectedAward(award);
        openModal('awards');
    };

    const sectionVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            <Container maxWidth="xl">
                <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
                    {/* Main Content */}
                    <Box sx={{ flex: 1, maxWidth: 900 }}>
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={sectionVariants}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <ProfileHeader
                                user={user}
                                onEdit={() => openModal('information')}
                            />
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={sectionVariants}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <CVUpload
                                cvs={cvs}
                                onFileChange={handlers.handleCVFileChange}
                                onDelete={handlers.handleDeleteCV}
                                onView={handlers.handleViewCV}
                                onUpdateTitle={handlers.handleUpdateCVTitle}
                                onAutofill={handlers.handleAutofillFromCV}
                            />
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={sectionVariants}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <AboutSection
                                about={about}
                                onEdit={() => openModal('about')}
                            />
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={sectionVariants}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <ExperienceSection
                                experiences={experiences}
                                showAll={showAllExperiences}
                                onToggleShowAll={() => setShowAllExperiences(!showAllExperiences)}
                                onEdit={handleEditExperience}
                                onDelete={handlers.handleDeleteExperience}
                                onAdd={() => { setSelectedExperience(null); openModal('experience'); }}
                            />
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={sectionVariants}
                            transition={{ duration: 0.5, delay: 0.5 }}
                        >
                            <EducationSection
                                educations={educations}
                                showAll={showAllEducations}
                                onToggleShowAll={() => setShowAllEducations(!showAllEducations)}
                                onEdit={handleEditEducation}
                                onDelete={handlers.handleDeleteEducation}
                                onAdd={() => { setSelectedEducation(null); openModal('education'); }}
                            />
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={sectionVariants}
                            transition={{ duration: 0.5, delay: 0.6 }}
                        >
                            <SkillsSection
                                skills={skills}
                                onEdit={handleEditSkillGroup}
                                onDelete={handlers.handleDeleteSkillGroup}
                                onAdd={() => { setSelectedSkillGroup(null); openModal('skills'); }}
                            />
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={sectionVariants}
                            transition={{ duration: 0.5, delay: 0.7 }}
                        >
                            <ProjectsSection
                                projects={projects}
                                onEdit={handleEditProject}
                                onDelete={handlers.handleDeleteProject}
                                onAdd={() => { setSelectedProject(null); openModal('projects'); }}
                            />
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={sectionVariants}
                            transition={{ duration: 0.5, delay: 0.8 }}
                        >
                            <CertificatesSection
                                certificates={certificates}
                                onEdit={handleEditCertificate}
                                onDelete={handlers.handleDeleteCertificate}
                                onAdd={() => { setSelectedCertificate(null); openModal('certificates'); }}
                            />
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={sectionVariants}
                            transition={{ duration: 0.5, delay: 0.5 }}
                        >
                            <SocialLinkSections currentUser={currentUser} handlers={handlers}/>
                        </motion.div>

                        {/* <AwardsSection
                            awards={awards}
                            onEdit={handleEditAward}
                            onDelete={handlers.handleDeleteAward}
                            onAdd={() => { setSelectedAward(null); openModal('awards'); }}
                        /> */}
                    </Box>

                    {/* Right Sidebar - Completion (hidden on small screens) */}
                    <Box
                        component={motion.div}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
                        sx={{ width: 320, minWidth: 0, flexShrink: 0, display: { xs: 'none', md: 'block' }, mt: 0 }}
                    >
                        {/* Open for Opportunities Toggle */}
                        <Box sx={{ width: { xs: '100%', sm: 300 }, position: { xs: 'static', sm: 'sticky' }, top: { sm: 20 }, mb: { xs: 3, sm: 0 } }}>
                            <Box sx={{
                                bgcolor: 'background.paper',
                                p: { xs: 2.5, sm: 4 },
                                borderRadius: 2,
                                border: 1,
                                borderColor: 'divider',
                                mb: 2
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {t("profile.open_for_opportunities")}
                                    </Typography>
                                    <Box
                                        onClick={() => handlers.handleToggleOpenForOpportunities(!openForOpportunities)}
                                        sx={{
                                            width: 50,
                                            height: 28,
                                            borderRadius: 14,
                                            bgcolor: openForOpportunities ? 'primary.main' : 'grey.300',
                                            position: 'relative',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.3s',
                                            '&:hover': {
                                                opacity: 0.9
                                            }
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 22,
                                                height: 22,
                                                borderRadius: '50%',
                                                bgcolor: 'white',
                                                position: 'absolute',
                                                top: 3,
                                                left: openForOpportunities ? 25 : 3,
                                                transition: 'left 0.3s',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                            }}
                                        />
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.4, type: "spring", stiffness: 200 }}
                        >
                            <ProfileCompletionCard
                                completionPercentage={completionPercentage}
                            />
                        </motion.div>
                    </Box>
                </Box>
            </Container>

            {/* All Modals */}
            <ProfileModals
                modals={modals}
                openModal={openModal}
                closeModal={closeModal}
                user={user}
                about={about}
                selectedExperience={selectedExperience}
                selectedEducation={selectedEducation}
                selectedSkillGroup={selectedSkillGroup}
                selectedProject={selectedProject}
                selectedCertificate={selectedCertificate}
                selectedAward={selectedAward}
                skills={skills}
                setSelectedExperience={setSelectedExperience}
                setSelectedEducation={setSelectedEducation}
                setSelectedSkillGroup={setSelectedSkillGroup}
                setSelectedProject={setSelectedProject}
                setSelectedCertificate={setSelectedCertificate}
                setSelectedAward={setSelectedAward}
                handlers={handlers}
            />
        </Box>
    );
}
