import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import {
  CompaniesPage,
  CompanyDetailPage,
  AdminDashboard as Dashboard,
  JobsPage,
  SettingsPage,
  StudentDetailPage,
  StudentsPage,
  UsersPage,
  JobDescriptionAdmin as JobDescription,
  ReviewsPage
} from "../pages";
import AdminLayout from "../layouts/AdminLayout";
import PageNotFound from "@/layouts/PageNotFound";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={
        <AdminLayout>
          <Outlet />
        </AdminLayout>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="students/:id" element={<StudentDetailPage />} />
        <Route path="companies" element={<CompaniesPage />} />
        <Route path="companies/:id" element={<CompanyDetailPage />} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="job/:id" element={<JobDescription />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
}