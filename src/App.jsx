// src/App.jsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Box, Container, Center, Spinner, Text } from "@chakra-ui/react";

import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Reservations from "./pages/Reservations.jsx";
import Events from "./pages/Events.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import SignupOwner from "./pages/Admin/SignupOwner.jsx";
import RestaurantDetail from "./pages/RestaurantDetail.jsx";
import Profile from "./pages/Profile.jsx";

// Owner Admin components
import AdminLayout from "./routes/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminReservations from "./pages/Admin/AdminReservations.jsx";
import AdminTables from "./pages/admin/AdminTables.jsx";
import AdminStaff from "./pages/admin/AdminStaff.jsx";
import AdminRestaurant from "./pages/Admin/AdminRestaurant.jsx";
import AdminProfile from "./pages/Admin/AdminProfile.jsx";
import AdminOnboarding from "./pages/Admin/AdminOnboarding.jsx";
import AdminWelcome from "./pages/Admin/AdminWelcome.jsx";
import AdminBilling from "./pages/Admin/AdminBilling.jsx";
import RealtimeToastListener from "./components/RealtimeToastListener.jsx";
import AdminTableLayout from "./pages/Admin/AdminTableLayout.jsx";
import AdminAnalytics from "./pages/Admin/AdminAnalytics.jsx";
import AdminEvents from "./pages/Admin/AdminEvents.jsx";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

// Platform Admin page
import PlatformDashboard from "./pages/platform/PlatformApp.jsx";

import { useAuth } from "./auth/AuthContext.jsx";

function LoadingScreen() {
  return (
    <Center minH="100dvh">
      <Box textAlign="center">
        <Spinner size="lg" />
        <Text mt={3} color="whiteAlpha.700">
          Loading...
        </Text>
      </Box>
    </Center>
  );
}

function RequireAuth({ children }) {
  const { user, initializing } = useAuth();
  if (initializing) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RequireOwner({ children }) {
  const { user, initializing } = useAuth();
  if (initializing) return <LoadingScreen />;
  if (!user || user.role !== "owner") return <Navigate to="/" replace />;
  return children;
}

function RequirePlatformAdmin({ children }) {
  const { user, initializing } = useAuth();
  if (initializing) return <LoadingScreen />;
  if (!user || user.role !== "platform_admin") return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  // ✅ FIX: was userAuth() but the real hook is useAuth()
  const { user, initializing } = useAuth();

  const location = useLocation();
  const hideNavbar =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/sebs-admin");

  return (
    <Box minH="100dvh" bg="neutral.900">
      {!hideNavbar && <Navbar />}

      {/* ✅ Only listen after auth is ready */}
      {!initializing && user && <RealtimeToastListener userId={user.uid} />}

      <Routes>
        {/* ================= PUBLIC PAGES ================= */}
        <Route
          path="/"
          element={
            <Container maxW="6xl" py={8}>
              <Home />
            </Container>
          }
        />
        <Route
          path="/reservations"
          element={
            <Container maxW="6xl" py={8}>
              <Reservations />
            </Container>
          }
        />
        <Route
          path="/events"
          element={
            <Container maxW="6xl" py={8}>
              <Events />
            </Container>
          }
        />
        <Route
          path="/about"
          element={
            <Container maxW="6xl" py={8}>
              <About />
            </Container>
          }
        />
        <Route
          path="/contact"
          element={
            <Container maxW="6xl" py={8}>
              <Contact />
            </Container>
          }
        />
        <Route
          path="/login"
          element={
            <Container maxW="6xl" py={8}>
              <Login />
            </Container>
          }
        />
        <Route
          path="/signup"
          element={
            <Container maxW="6xl" py={8}>
              <Signup />
            </Container>
          }
        />
        <Route
          path="/register-owner"
          element={
            <Container maxW="6xl" py={8}>
              <SignupOwner />
            </Container>
          }
        />
        <Route
          path="/restaurants/:id"
          element={
            <Container maxW="6xl" py={8}>
              <RestaurantDetail />
            </Container>
          }
        />
        <Route
          path="/profile"
          element={
            <Container maxW="6xl" py={8}>
              <RequireAuth>
                <Profile />
              </RequireAuth>
            </Container>
          }
        />

        {/* ================= OWNER ADMIN (/admin) ================= */}
        <Route
          path="/admin/*"
          element={
            <RequireOwner>
              <AdminLayout />
            </RequireOwner>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="reservations" element={<AdminReservations />} />
          <Route path="tables" element={<AdminTables />} />
          <Route path="restaurant" element={<AdminRestaurant />} />
<Route path="table-layout" element={<AdminTableLayout />} />
          <Route path="staff" element={<AdminStaff />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="welcome" element={<AdminWelcome />} />
          <Route path="onboarding" element={<AdminOnboarding />} />
          <Route path="billing" element={<AdminBilling />} />
<Route path="events" element={<AdminEvents />} />
          <Route path="analytics" element={<AdminAnalytics />} />

        </Route>

        {/* ================= PLATFORM ADMIN (/sebs-admin) ================= */}
 <Route
  path="/sebs-admin/*"
  element={
    <RequirePlatformAdmin>
      <PlatformDashboard />
    </RequirePlatformAdmin>
  }
/>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Box>
  );
}
