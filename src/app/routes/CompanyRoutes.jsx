import { Routes, Route, Outlet } from "react-router-dom";
import CompanyLayout from "../layouts/CompanyLayout";
import PageNotFound from "../layouts/PageNotFound";
import ComingSoon from "../layouts/ComingSoon";
import {
    ApplicantDetails,
    CompanyProfile,
    CompanyDashboard as Dashboard,
    CompanySetting,
    PostJob,
    EditJob,
    JobListing,
    CompanyBranches,
    JobDescriptionCompany as JobDescription,
    ContactUs,
    ApplicantList,
} from "../pages";
import { useDispatch, useSelector } from "react-redux";
import { getCompany } from "../modules";
import { use, useEffect } from "react";

export default function CompanyRoutes() {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const { company } = useSelector((state) => state.company);
    const companyId = user?.company.id;

    useEffect(() => {
        if (companyId) {
            if (!company || companyId !== company?.id) {
                dispatch(getCompany(companyId));
            }
        }
    }, [dispatch, companyId, company]);

    return (
        <Routes>
            <Route path="/" element={
                <CompanyLayout>
                    <Outlet />
                </CompanyLayout>
            }>
                <Route index element={<Dashboard />} />
                <Route path="company" element={<CompanySetting />} />
                <Route path="applicants/:id" element={<ApplicantDetails />} />
                <Route path="applicants" element={<ApplicantList />} />
                <Route path="settings" element={<CompanySetting />} />
                <Route path="post-job" element={<PostJob />} />
                <Route path="edit-job/:jobId" element={<EditJob />} />
                <Route path="job-listing" element={<JobListing />} />
                <Route path="job" element={<JobDescription />} />
                <Route path="branches" element={<CompanyBranches />} />
                <Route path="help-center" element={<ContactUs />} />
                <Route path="*" element={<PageNotFound />} />
            </Route>
        </Routes>
    );
}
