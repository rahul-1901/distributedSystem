import { Routes, Route } from "react-router-dom";
import React from "react";
import GuestRoute from "./GuestRoute";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

import MainLayout from "../layouts/MainLayouts";
import StudentLayout from "../layouts/StudentLayout";
import AdminLayout from "../layouts/AdminLayout";

import Home from "../pages/Home";

import Admin from "../pages/Admin/Admin.jsx";
import Login from "../pages/Student/Login.jsx";
import NotFoundPage from "../pages/NotFound";
import Dashboard from "../pages/Student/Dashboard.jsx";
import Signup from "../pages/Student/Signup.jsx";
import ResetPassword from "../pages/Student/ResetPassword.jsx";
import AllHackathons from "../pages/Student/AllHackathons.jsx";
import HackathonDetails from "../pages/Hackathon.jsx";
import { RegistrationForm } from "../hackathon/RegistrationForm.jsx";
import TeamDetails from "../pages/TeamDetails.jsx";
import ForgotPassword from "../pages/Student/forgotPassword.jsx";

import Studenthome from "../pages/Student/Studenthome.jsx";

import Adminhome from "../pages/Admin/Adminhome.jsx";
import AdminLogin from "../pages/Admin/AdminLogin.jsx";
import AdminSignup from "../pages/Admin/AdminSignup.jsx";
import AdminProfile from "../pages/Admin/AdminProfile.jsx";

import HackathonUsersPage from "../admin/userlist.jsx";
import UserSubmissionDetailPage from "../admin/usersubmission.jsx";

import ParticipantPoliciesPage from "../pages/Participation.jsx";
import OrganizerPlaybookPage from "../pages/Organiser.jsx";
import LegalSupportPage from "../pages/TermsCond.jsx";
import CreateHackathonPage from "../pages/Admin/CreateHackathonPage.jsx";

function AppRoutes() {
  return (
    <Routes>
      {/* ================= PUBLIC ROUTES ================= */}

      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />

        <Route path="/hackathons" element={<AllHackathons />} />

        <Route path="/hackathon/:slug" element={<HackathonDetails />} />

        <Route
          path="/participation-policies"
          element={<ParticipantPoliciesPage />}
        />

        <Route path="/organizer-ruleBook" element={<OrganizerPlaybookPage />} />

        <Route path="/terms-and-condition" element={<LegalSupportPage />} />
      </Route>

      {/* ================= GUEST / AUTH ROUTES ================= */}

      <Route element={<GuestRoute />}>
        <Route path="/account/login" element={<Login />} />

        <Route path="/account/signup" element={<Signup />} />
      </Route>

      <Route path="/account/forgot-password" element={<ForgotPassword />} />

      <Route path="/account/reset-password" element={<ResetPassword />} />

      {/* ================= STUDENT ROUTES ================= */}

      <Route element={<ProtectedRoute />}>
        <Route element={<StudentLayout />}>
          <Route path="/studenthome" element={<Studenthome />} />

          <Route path="/dashboard" element={<Dashboard />} />

          <Route
            path="/hackathon/RegistrationForm/:slug"
            element={<RegistrationForm />}
          />

          <Route
            path="/hackathon/:slug/team/:teamId"
            element={<TeamDetails />}
          />

          <Route
            path="/hackathon/:slug/submission/:id"
            element={<UserSubmissionDetailPage />}
          />
        </Route>
      </Route>

      {/* ================= ADMIN AUTH ROUTES ================= */}

      <Route path="/adminlogin" element={<AdminLogin />} />

      <Route path="/admin/signup" element={<AdminSignup />} />

      {/* ================= ADMIN ROUTES ================= */}

      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/adminhome" element={<Adminhome />} />

          <Route path="/admin" element={<AdminProfile />} />

          <Route path="/createHackathon" element={<CreateHackathonPage />} />

          <Route
            path="/admin/:slug/usersubmissions"
            element={<HackathonUsersPage />}
          />

          <Route path="/hacksprintTeraBaap" element={<Admin />} />
        </Route>
      </Route>

      {/* ================= 404 ================= */}

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
