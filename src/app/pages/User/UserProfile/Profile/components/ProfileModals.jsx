import React from 'react';
import {
    InformationModal,
    AboutModal,
    ExperienceModal,
    EducationModal,
    LanguagesModal,
    ProjectsModal,
    SkillsModal,
    CertificatesModal,
    AwardsModal,
} from '../../../../../components';

export const ProfileModals = ({
    modals,
    openModal,
    closeModal,
    user,
    skills,
    about,
    selectedExperience,
    selectedEducation,
    selectedSkillGroup,
    selectedProject,
    selectedCertificate,
    selectedAward,
    setSelectedExperience,
    setSelectedEducation,
    setSelectedSkillGroup,
    setSelectedProject,
    setSelectedCertificate,
    setSelectedAward,
    handlers,
}) => {
    return (
        <>
            <InformationModal
                open={modals.information}
                onOpenChange={(open) => open ? openModal('information') : closeModal('information')}
                initialData={user}
                onSave={handlers.handleSaveInformation}
                onAutofill={handlers.handleUploadAndAutofill}
            />

            <AboutModal
                open={modals.about}
                onOpenChange={(open) => open ? openModal('about') : closeModal('about')}
                initialData={about ? { about, content: about } : null}
                onSave={handlers.handleSaveAbout}
            />

            <ExperienceModal
                open={modals.experience}
                onOpenChange={(open) => {
                    if (open) {
                        openModal('experience');
                    } else {
                        closeModal('experience');
                        setSelectedExperience(null);
                    }
                }}
                initialData={selectedExperience ? {
                    jobTitle: selectedExperience.role || selectedExperience.position,
                    company: selectedExperience.company,
                    startMonth: selectedExperience.startMonth || '',
                    startYear: selectedExperience.startYear || '',
                    endMonth: selectedExperience.endMonth || '',
                    endYear: selectedExperience.endYear === 'Present' ? '' : selectedExperience.endYear,
                    isCurrentlyWorking: selectedExperience.isCurrentlyWorking || selectedExperience.is_current || false,
                    description: selectedExperience.description || selectedExperience.content || '',
                } : null}
                onSave={handlers.handleSaveExperience}
            />

            <EducationModal
                open={modals.education}
                onOpenChange={(open) => {
                    if (open) {
                        openModal('education');
                    } else {
                        closeModal('education');
                        setSelectedEducation(null);
                    }
                }}
                initialData={selectedEducation ? (() => {
                    let startMonth = selectedEducation.startMonth || '';
                    let startYear = selectedEducation.startYear || '';
                    let endMonth = selectedEducation.endMonth || '';
                    let endYear = selectedEducation.endYear || '';
                    let isCurrentlyStudying = selectedEducation.isCurrentlyStudying || false;

                    if (selectedEducation.start_date) {
                        const startDate = new Date(selectedEducation.start_date);
                        startMonth = String(startDate.getMonth() + 1).padStart(2, '0');
                        startYear = String(startDate.getFullYear());

                        if (selectedEducation.end_date && selectedEducation.end_date !== null) {
                            const endDate = new Date(selectedEducation.end_date);
                            endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
                            endYear = String(endDate.getFullYear());
                            isCurrentlyStudying = false;
                        } else {
                            // end_date is null means currently studying
                            endMonth = '';
                            endYear = '';
                            isCurrentlyStudying = true;
                        }
                    } else if (selectedEducation.endYear === 'Present') {
                        isCurrentlyStudying = true;
                        endMonth = '';
                        endYear = '';
                    }

                    return {
                        school: selectedEducation.school || selectedEducation.university || '',
                        degree: selectedEducation.degree || '',
                        major: selectedEducation.major || '',
                        startMonth,
                        startYear,
                        endMonth,
                        endYear,
                        isCurrentlyStudying,
                        description: selectedEducation.description || '',
                    };
                })() : null}
                onSave={handlers.handleSaveEducation}
            />

            <SkillsModal
                open={modals.skills}
                onOpenChange={(open) => {
                    if (open) openModal('skills');
                    else { closeModal('skills'); setSelectedSkillGroup(null); }
                }}
                initialData={skills}
                onSave={handlers.handleSaveSkillGroup}
            />

            <LanguagesModal
                open={modals.languages}
                onOpenChange={(open) => open ? openModal('languages') : closeModal('languages')}
                initialData={null}
                onSave={(formData) => {
                    closeModal('languages');
                }}
            />

            <ProjectsModal
                open={modals.projects}
                onOpenChange={(open) => {
                    if (open) {
                        openModal('projects');
                    } else {
                        closeModal('projects');
                        setSelectedProject(null);
                    }
                }}
                initialData={selectedProject ? (() => {
                    let startMonth = selectedProject.startMonth || '';
                    let startYear = selectedProject.startYear || '';
                    let endMonth = selectedProject.endMonth || '';
                    let endYear = selectedProject.endYear || '';
                    let isCurrentlyWorking = selectedProject.isCurrentlyWorking || false;

                    if (selectedProject.start_date) {
                        const startDate = new Date(selectedProject.start_date);
                        startMonth = String(startDate.getMonth() + 1).padStart(2, '0');
                        startYear = String(startDate.getFullYear());

                        if (selectedProject.end_date && selectedProject.end_date !== null) {
                            const endDate = new Date(selectedProject.end_date);
                            endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
                            endYear = String(endDate.getFullYear());
                            isCurrentlyWorking = false;
                        } else {
                            // end_date is null means currently working
                            endMonth = '';
                            endYear = '';
                            isCurrentlyWorking = true;
                        }
                    }

                    return {
                        projectName: selectedProject.name || '',
                        startMonth,
                        startYear,
                        endMonth,
                        endYear,
                        isCurrentlyWorking,
                        description: selectedProject.description || '',
                        websiteLink: selectedProject.websiteLink || selectedProject.website || selectedProject.website_link || '',
                    };
                })() : null}
                onSave={handlers.handleSaveProject}
            />

            <CertificatesModal
                open={modals.certificates}
                onOpenChange={(open) => {
                    if (open) {
                        openModal('certificates');
                    } else {
                        closeModal('certificates');
                        setSelectedCertificate(null);
                    }
                }}
                initialData={selectedCertificate ? (() => {
                    let issueMonth = selectedCertificate.issueMonth || '';
                    let issueYear = selectedCertificate.issueYear || '';

                    if (selectedCertificate.issue_date) {
                        const issueDate = new Date(selectedCertificate.issue_date);
                        issueMonth = String(issueDate.getMonth() + 1).padStart(2, '0');
                        issueYear = String(issueDate.getFullYear());
                    }

                    return {
                        certificateName: selectedCertificate.name || '',
                        organization: selectedCertificate.organization || '',
                        issueMonth,
                        issueYear,
                        certificateUrl: selectedCertificate.certificateUrl || selectedCertificate.certification_url || selectedCertificate.certificate_url || selectedCertificate.url || '',
                        description: selectedCertificate.description || '',
                    };
                })() : null}
                onSave={handlers.handleSaveCertificate}
            />

            <AwardsModal
                open={modals.awards}
                onOpenChange={(open) => {
                    if (open) openModal('awards');
                    else { closeModal('awards'); setSelectedAward(null); }
                }}
                initialData={selectedAward}
                onSave={(formData) => {
                    closeModal('awards');
                }}
            />
        </>
    );
};