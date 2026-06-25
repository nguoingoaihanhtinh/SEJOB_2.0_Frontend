// src/app/pages/Company/PostJob/PostJob.jsx

import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FileText, Briefcase, Gift, ArrowLeft, Heart, Plane, Video, Home, Coffee, Zap, Scale } from "lucide-react";
import Step1JobInfo from "./partials/Step1JobInfo";
import Step2JobDescription from "./partials/Step2JobDescription";
import Step3PerksBenefit from "./partials/Step3PerksBenefit";
import Step4ScoringWeights from "./partials/Step4ScoringWeights";
import { getCategories } from "../../../modules/services/categoriesService";
import { getEmploymentTypes } from "../../../modules/services/employmentTypeService";
import { getSkills } from "../../../modules/services/skillsService";
import { getLevels } from "../../../modules/services/levelsService";
import { createJob, updateJob } from "../../../modules/services/jobsService";
import { useNavigate } from "react-router-dom";
import { CustomAlert, FuzzyText } from "../../../components";
import { getCompanyBranches } from "../../../modules/services/companyBranchesService";
import { useCustomAlert } from "../../../hooks/useCustomAlert";

export default function PostJob({ isEditing = false, job = null, jobId = null }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { alertConfig, hideAlert, showSuccess, showError } = useCustomAlert();
  const categories = useSelector((state) => state.categories?.categories ?? []);
  const apiEmploymentTypes = useSelector((state) => state.employmentTypes?.employmentTypes ?? []);
  const apiSkills = useSelector((state) => state.skills?.skills ?? []);
  const levels = useSelector((state) => state.levels?.levels ?? []);
  const apiCompanyBranches = useSelector((state) => state.companyBranches?.branches ?? []);
  const currentUser = useSelector((state) => state.auth.user);
  const authStatus = useSelector((state) => state.auth.status);
  const companyId = currentUser?.company?.id;

  useEffect(() => {
    if (companyId && categories.length === 0) dispatch(getCategories({ hasPagination: false }));
    if (companyId && apiEmploymentTypes.length === 0) dispatch(getEmploymentTypes({ hasPagination: false }));
    if (companyId && apiSkills.length === 0) dispatch(getSkills({ hasPagination: false }));
    if (companyId && levels.length === 0) dispatch(getLevels({ hasPagination: false }));
    if (companyId && apiCompanyBranches.length === 0) {
      dispatch(getCompanyBranches({ companyId: companyId }));
    }
  }, [dispatch]);

  const [currentStep, setCurrentStep] = useState(1);
  const [jobTitle, setJobTitle] = useState("");
  const [employmentTypes, setEmploymentTypes] = useState([]);
  const [salaryRange, setSalaryRange] = useState([5000, 22000]);
  const [salaryCurrency, setSalaryCurrency] = useState("VND");
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [jobDescription, setJobDescription] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [whoYouAre, setWhoYouAre] = useState("");
  const [niceToHaves, setNiceToHaves] = useState("");
  const [benefits, setBenefits] = useState([]);
  const [companyBranchId, setCompanyBranchId] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [jobDeadline, setJobDeadline] = useState();
  const [employmentTypeIds, setEmploymentTypeIds] = useState([]);
  const [skillIds, setSkillIds] = useState([]);
  const [skillsSelect, setSkillsSelect] = useState([]);
  const [categoryIds, setCategoryIds] = useState([]);
  const [levelIds, setLevelIds] = useState([]);
  const [scoringWeights, setScoringWeights] = useState(null);
  const [useCustomWeights, setUseCustomWeights] = useState(false);

  // Ref to track if form has been populated (for edit mode)
  const hasPopulatedRef = useRef(false);

  useEffect(() => {
    console.log(benefits);
    console.log(apiCompanyBranches);
  }, [benefits, apiCompanyBranches]);

  // Populate form when editing and all API data is loaded
  useEffect(() => {
    if (
      isEditing &&
      job &&
      !hasPopulatedRef.current &&
      categories.length > 0 &&
      apiEmploymentTypes.length > 0 &&
      apiSkills.length > 0 &&
      levels.length > 0 &&
      apiCompanyBranches.length > 0
    ) {
      hasPopulatedRef.current = true;
      if (job.title) setJobTitle(job.title);
      if (job.description) setJobDescription(job.description);
      if (job.responsibilities) {
        const resp = Array.isArray(job.responsibilities) ? job.responsibilities.join("\n") : job.responsibilities;
        setResponsibilities(resp);
      }
      if (job.requirement) {
        let req = "";
        if (Array.isArray(job.requirement)) {
          req = job.requirement.join("\n");
        } else if (typeof job.requirement === "string") {
          req = job.requirement.replace(/<br\s*\/?>/gi, "\n").trim();
        }
        if (req) setWhoYouAre(req);
      }
      if (job.nice_to_haves) {
        let nth = "";
        if (Array.isArray(job.nice_to_haves)) {
          nth = job.nice_to_haves.join("\n");
        } else if (typeof job.nice_to_haves === "string") {
          nth = job.nice_to_haves.replace(/<br\s*\/?>/gi, "\n").trim();
        }
        if (nth) setNiceToHaves(nth);
      }
      const salaryFrom = job.salary_from ?? job.salary?.from;
      const salaryTo = job.salary_to ?? job.salary?.to;
      const salaryCurr = job.salary_currency || job.salary?.currency || "USD";
      if (salaryFrom !== undefined && salaryTo !== undefined) {
        setSalaryRange([salaryFrom, salaryTo]);
      }
      if (salaryCurr) setSalaryCurrency(salaryCurr);
      if (job.benefit && Array.isArray(job.benefit)) {
        const formattedBenefits = job.benefit.map((b, index) => ({
          id: b.id || `benefit-${index}`,
          icon: b.icon || "Gift",
          title: b.title || "",
          description: b.description || "",
          isEditing: false,
        }));
        setBenefits(formattedBenefits);
      }
      if (job.quantity) setQuantity(String(job.quantity));
      if (job.job_deadline) setJobDeadline(job.job_deadline);
      else if (job.deadline) setJobDeadline(job.deadline);
      if (job.company_branches_id) {
        setCompanyBranchId(
          Array.isArray(job.company_branches_id) ? job.company_branches_id : [job.company_branches_id]
        );
      } else if (job.company_branches && Array.isArray(job.company_branches) && job.company_branches.length > 0) {
        const branchIds = job.company_branches.map((b) => b.id).filter(Boolean);
        if (branchIds.length > 0) setCompanyBranchId(branchIds);
        else setCompanyBranchId([]);
      } else {
        setCompanyBranchId([]);
      }

      const employmentTypesData = job.employment_types || job.workingTime || [];
      if (Array.isArray(employmentTypesData) && employmentTypesData.length > 0 && apiEmploymentTypes.length > 0) {
        const empTypeNames = employmentTypesData.map((et) => {
          if (typeof et === "object" && et.name) return et.name;
          if (typeof et === "string") {
            const found = apiEmploymentTypes.find((e) => e.name.toLowerCase() === et.toLowerCase());
            return found ? found.name : et;
          }
          return et;
        });
        setEmploymentTypes(empTypeNames);
        const empTypeIds = employmentTypesData
          .map((et) => {
            if (typeof et === "object" && et.id) return et.id;
            const etName = typeof et === "string" ? et : et.name || "";
            const found = apiEmploymentTypes.find((e) => e.name.toLowerCase() === etName.toLowerCase());
            return found?.id;
          })
          .filter(Boolean);
        setEmploymentTypeIds(empTypeIds);
      }

      const jobSkills = job.skills || job.required_skills || [];
      if (Array.isArray(jobSkills) && jobSkills.length > 0) {
        const skillNames = jobSkills.map((skill) => (typeof skill === "string" ? skill : skill.name || skill));
        setSkills(skillNames);
        setSkillsSelect(
          jobSkills.map((skill) => {
            if (typeof skill === "object" && skill.id) return { id: skill.id, name: skill.name || "" };
          })
        );
        const skillIdList = jobSkills
          .map((skill) => {
            if (typeof skill === "object" && skill.id) return skill.id;
            const found = apiSkills.find((s) => s.name === (typeof skill === "string" ? skill : skill.name));
            return found?.id;
          })
          .filter(Boolean);
        setSkillIds(skillIdList);
      }

      // Categories - Multiple
      if (job.categories && Array.isArray(job.categories) && job.categories.length > 0) {
        const categoryNames = job.categories.map((cat) => (typeof cat === "string" ? cat : cat.name || cat));
        setSelectedCategories(categoryNames);
        const catIds = job.categories
          .map((cat) => {
            if (typeof cat === "object" && cat.id) return cat.id;
            const categoryName = typeof cat === "string" ? cat : cat.name;
            return categories.find((c) => c.name === categoryName)?.id;
          })
          .filter(Boolean);
        setCategoryIds(catIds);
      }

      // Levels - Multiple
      if (job.levels && Array.isArray(job.levels) && job.levels.length > 0) {
        const levelNames = job.levels.map((lvl) => (typeof lvl === "string" ? lvl : lvl.name || lvl));
        setSelectedLevels(levelNames);
        const lvlIds = job.levels
          .map((lvl) => {
            if (typeof lvl === "object" && lvl.id) return lvl.id;
            const levelName = typeof lvl === "string" ? lvl : lvl.name;
            return levels.find((l) => l.name === levelName)?.id;
          })
          .filter(Boolean);
        setLevelIds(lvlIds);
      }
    }
  }, [isEditing, job, categories, apiEmploymentTypes, apiSkills, levels, apiCompanyBranches]);

  const steps = [
    { number: 1, title: t("postJob.jobInformation"), icon: FileText },
    { number: 2, title: t("postJob.jobDescription"), icon: Briefcase },
    { number: 3, title: t("postJob.perksBenefit"), icon: Gift },
    { number: 4, title: t("postJob.scoringWeights") || "Scoring Weights", icon: Scale },
  ];

  const employmentOptions =
    apiEmploymentTypes.length > 0
      ? apiEmploymentTypes.map((et) => et.name)
      : ["Full-Time", "Part-Time", "Remote", "Internship", "Contract"];

  const toggleEmploymentType = (type) => {
    setEmploymentTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
    const et = apiEmploymentTypes.find((e) => e.name.toLowerCase() === type.toLowerCase());
    if (et) {
      setEmploymentTypeIds((prev) => (prev.includes(et.id) ? prev.filter((id) => id !== et.id) : [...prev, et.id]));
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      const skillName = newSkill.trim();
      setSkills([...skills, skillName]);
      const skillObj = apiSkills.find((s) => s.name === skillName);
      if (skillObj) {
        setSkillIds((prev) => [...prev, skillObj.id]);
      }
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
    setSkillsSelect(skillsSelect.filter((s) => s.name !== skillToRemove));
    const skillObj = apiSkills.find((s) => s.name === skillToRemove);
    if (skillObj) {
      setSkillIds((prev) => prev.filter((id) => id !== skillObj.id));
    }
  };

  const handleCategorySelect = (categoryName) => {
    setSelectedCategories((prev) => {
      const newCategories = prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName];

      // Update category IDs
      const newCategoryIds = newCategories
        .map((name) => {
          const cat = categories.find((c) => c.name.toLowerCase() === name.toLowerCase());
          return cat?.id;
        })
        .filter(Boolean);
      setCategoryIds(newCategoryIds);

      return newCategories;
    });
  };

  const handleLevelSelect = (levelName) => {
    setSelectedLevels((prev) => {
      const newLevels = prev.includes(levelName) ? prev.filter((l) => l !== levelName) : [...prev, levelName];

      // Update level IDs
      const newLevelIds = newLevels
        .map((name) => {
          const lvl = levels.find((l) => l.name.toLowerCase() === name.toLowerCase());
          return lvl?.id;
        })
        .filter(Boolean);
      setLevelIds(newLevelIds);

      return newLevels;
    });
  };

  const addSkillFromApi = (skillName) => {
    if (!skills.map((s) => s.toLowerCase()).includes(skillName.toLowerCase())) {
      const skillObj = apiSkills.find((s) => s.name.toLowerCase() === skillName.toLowerCase()) || {
        id: null,
        name: skillName,
      };
      if (skillObj.id) {
        setSkillIds((prev) => [...prev, skillObj.id]);
      }
      setSkills((prev) => [...prev, skillObj.name]);
      setSkillsSelect((prev) => [...prev, { id: skillObj.id, name: skillObj.name }]);
    }
  };

  useEffect(() => {
    console.log("Skill IDs updated:", skillIds);
    console.log("Skills Select updated:", skillsSelect);
  }, [skillIds, skillsSelect]);

  const removeBenefit = (benefitId) => {
    setBenefits(benefits.filter((benefit) => benefit.id !== benefitId));
  };

  const addBenefit = () => {
    const newBenefit = {
      id: Date.now().toString(),
      icon: "Gift",
      title: "",
      description: "",
      isEditing: true,
    };
    setBenefits([...benefits, newBenefit]);
  };

  const getBenefitIcon = (iconName) => {
    const icons = { Heart, Plane, Video, Home, Coffee, Zap, Gift };
    return icons[iconName] || Gift;
  };

  const handleSubmit = async () => {
    if (!companyId) {
      console.error("Cannot post job: user is not associated with a company");
      return;
    }

    // Validation
    if (categoryIds.length === 0) {
      showError("Please select at least one category");
      return;
    }
    if (levelIds.length === 0) {
      showError("Please select at least one level");
      return;
    }
    if (employmentTypeIds.length === 0) {
      showError("Please select at least one employment type");
      return;
    }
    if (skillsSelect.length === 0) {
      showError("Please add at least one skill");
      return;
    }

    const payload = {
      company_id: companyId,
      title: jobTitle,
      description: jobDescription,
      responsibilities: responsibilities ? [responsibilities] : [],
      requirement: whoYouAre ? [whoYouAre] : [],
      nice_to_haves: niceToHaves ? [niceToHaves] : [],
      benefit: benefits.map((b) => ({ icon: b.icon, title: b.title, description: b.description })),
      salary_from: salaryRange[0],
      salary_to: salaryRange[1],
      salary_currency: salaryCurrency,
      salary_text: `${salaryRange[0]} - ${salaryRange[1]} ${salaryCurrency}`,
      category_ids: categoryIds,
      level_ids: levelIds,
      required_skill_ids: skillIds,
      required_skills: skillsSelect,
      employment_type_ids: employmentTypeIds,
      company_branches_id: companyBranchId[0],
      company_branches_ids: companyBranchId,
      quantity: quantity ? parseInt(quantity) : null,
      job_deadline: jobDeadline || null,
      status: "Approved",
      scoring_weights: useCustomWeights && scoringWeights ? scoringWeights : null,
    };

    console.log("Payload before submit:", payload);

    try {
      await dispatch(createJob(payload)).unwrap();
      showSuccess("Job posted successfully!");
      if (skillsSelect.some((s) => s.id === null)) {
        dispatch(getSkills({ hasPagination: false }));
      }
      nav("/job-listing", { replace: true });
    } catch (err) {
      console.error("Failed to create job:", err);
      showError("Failed to create job: " + (err?.message || err || "Unknown error"));
    }
  };

  const handleUpdate = async () => {
    if (!companyId) {
      console.error("Cannot update job: user is not associated with a company");
      return;
    }

    if (!jobId && !job) {
      console.error("Cannot update job: jobId or job is required");
      showError("Job ID is required for update");
      return;
    }

    const targetJobId = jobId || job?.job_id || job?.id;
    if (!targetJobId) {
      console.error("Cannot update job: job ID not found");
      showError("Job ID not found");
      return;
    }

    // Validation
    if (categoryIds.length === 0) {
      showError("Please select at least one category");
      return;
    }
    if (levelIds.length === 0) {
      showError("Please select at least one level");
      return;
    }
    if (employmentTypeIds.length === 0) {
      showError("Please select at least one employment type");
      return;
    }
    if (skillsSelect.length === 0) {
      showError("Please add at least one skill");
      return;
    }

    const payload = {
      company_id: companyId,
      company_branches_id: Array.isArray(companyBranchId) ? companyBranchId[0] : companyBranchId,
      company_branches_ids: Array.isArray(companyBranchId)
        ? companyBranchId
        : companyBranchId
        ? [companyBranchId]
        : null,
      title: jobTitle,
      description: jobDescription,
      responsibilities: responsibilities ? responsibilities.split("\n").filter((line) => line.trim()) : [],
      requirement: whoYouAre ? whoYouAre.split("\n").filter((line) => line.trim()) : [],
      nice_to_haves: niceToHaves ? niceToHaves.split("\n").filter((line) => line.trim()) : [],
      benefit: benefits.map((b) => ({ icon: b.icon, title: b.title, description: b.description })),
      salary_from: salaryRange[0],
      salary_to: salaryRange[1],
      salary_currency: salaryCurrency,
      salary_text: `${salaryRange[0]} - ${salaryRange[1]} ${salaryCurrency}`,
      category_ids: categoryIds,
      level_ids: levelIds,
      required_skill_ids: skillIds,
      required_skills: skillsSelect,
      employment_type_ids: employmentTypeIds,
      quantity: quantity ? parseInt(quantity) : null,
      job_deadline: jobDeadline || null,
      status: job?.status && job.status !== "Closed" ? job.status : "Pending",
      scoring_weights: useCustomWeights && scoringWeights ? scoringWeights : null,
    };

    try {
      await dispatch(updateJob({ jobId: targetJobId, jobData: payload })).unwrap();
      showSuccess("Job updated successfully!");
      if (skillsSelect.some((s) => s.id === null)) {
        dispatch(getSkills({ hasPagination: false }));
      }
      nav("/job-listing", { replace: true });
    } catch (err) {
      console.error("Failed to update job:", err);
      showError("Failed to update job: " + (err?.message || err || "Unknown error"));
    }
  };

  if (authStatus === "loading") {
    return <div>{t("postJob.loadingCompanyProfile")}</div>;
  }

  if (!currentUser || !currentUser.company) {
    return (
      <motion.div
        className="flex h-full items-center justify-center gap-6 text-center px-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <FuzzyText color="black" fontSize={32} baseIntensity={0.1} hoverIntensity={0.3}>
          {t("postJob.companyProfileNotFound")}
        </FuzzyText>
      </motion.div>
    );
  }

  const nav = useNavigate();

  return (
    <div className="bg-background p-4 lg:p-6 2xl:p-8 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="h-10 w-10 cursor-pointer" onClick={() => nav(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h4 className="font-bold text-foreground">{t("postJob.postAJob")}</h4>
      </div>
      <div className="flex gap-4">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          return (
            <div
              key={step.number}
              className={`flex-1 flex items-center gap-3 p-4 rounded-lg transition-colors cursor-pointer ${
                isActive
                  ? "bg-primary/10 border-2 border-primary"
                  : isCompleted
                  ? "bg-primary/5 border-2 border-primary/30"
                  : "bg-input border-2 border-border"
              }`}
              onClick={() => {
                setCurrentStep(step.number);
              }}
            >
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : isCompleted
                    ? "bg-primary/20 text-primary"
                    : "bg-input text-muted-foreground border border-border"
                }`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                  {t("postJob.step", { number: step.number })}/4
                </p>
                <p className={`font-semibold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                  {step.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="bg-card rounded-lg px-6">
        {currentStep === 1 && (
          <Step1JobInfo
            jobTitle={jobTitle}
            setJobTitle={setJobTitle}
            employmentTypes={employmentTypes}
            employmentOptions={employmentOptions}
            toggleEmploymentType={toggleEmploymentType}
            salaryRange={salaryRange}
            setSalaryRange={setSalaryRange}
            salaryCurrency={salaryCurrency}
            setSalaryCurrency={setSalaryCurrency}
            selectedCategories={selectedCategories}
            handleCategorySelect={handleCategorySelect}
            categories={categories}
            companyBranches={apiCompanyBranches}
            companyBranchId={companyBranchId}
            setCompanyBranchId={setCompanyBranchId}
            levels={levels}
            selectedLevels={selectedLevels}
            handleLevelSelect={handleLevelSelect}
            skills={skills}
            newSkill={newSkill}
            setNewSkill={setNewSkill}
            addSkill={addSkill}
            removeSkill={removeSkill}
            apiSkills={apiSkills}
            onSkillSelect={addSkillFromApi}
            quantity={quantity}
            setQuantity={setQuantity}
            jobDeadline={jobDeadline}
            setJobDeadline={setJobDeadline}
          />
        )}
        {currentStep === 2 && (
          <Step2JobDescription
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            responsibilities={responsibilities}
            setResponsibilities={setResponsibilities}
            whoYouAre={whoYouAre}
            setWhoYouAre={setWhoYouAre}
            niceToHaves={niceToHaves}
            setNiceToHaves={setNiceToHaves}
          />
        )}
        {currentStep === 3 && (
          <Step3PerksBenefit
            benefits={benefits}
            addBenefit={addBenefit}
            removeBenefit={removeBenefit}
            setBenefits={setBenefits}
            getBenefitIcon={getBenefitIcon}
          />
        )}
        {currentStep === 4 && (
          <Step4ScoringWeights
            scoringWeights={scoringWeights}
            setScoringWeights={setScoringWeights}
            useCustomWeights={useCustomWeights}
            setUseCustomWeights={setUseCustomWeights}
          />
        )}
        <div className="flex justify-between mt-8">
          {currentStep > 1 && (
            <Button variant="outline" size="lg" onClick={() => setCurrentStep(currentStep - 1)} className="px-8">
              {t("postJob.previous")}
            </Button>
          )}
          {currentStep < 4 ? (
            <Button
              size="lg"
              onClick={() => setCurrentStep(currentStep + 1)}
              className="bg-primary hover:bg-primary/90 text-white px-8 ml-auto"
            >
              {t("postJob.nextStep")}
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={isEditing ? handleUpdate : handleSubmit}
              className="bg-primary hover:bg-primary/90 text-white px-8 ml-auto"
            >
              {isEditing ? "Update Job" : t("postJob.postJob")}
            </Button>
          )}
        </div>
      </div>
      <CustomAlert {...alertConfig} onClose={hideAlert} />
    </div>
  );
}
