import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import SplashScreen from "./components/splash/SplashScreen";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import WorkspacesPage from "./pages/WorkspacePage";
import WorkspaceDetailsPage from "./pages/WorkspaceDetailsPage";
import KnowledgeHubPage from "./pages/KnowledgeHubPage";
import KnowledgeDetailPage from "./pages/KnowledgeDetailPage";
import AIAssistantPage from "./pages/AIAssistantPage";
import AutomationPage from "./pages/AutomationPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";

import { useAuthStore } from "./stores/useAuthStore";
import { ToastContainer } from "./components/common/ToastContainer";



function App() {
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const authLoading = useAuthStore((state) => state.authLoading);

  useEffect(() => {
    // Restore cookie session immediately on app start.
    restoreSession();
  }, [restoreSession]);

  if (authLoading) {
    return <SplashScreen />;
  }


  return (
    <>
      <ToastContainer />
      <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/workspaces"
        element={
          <ProtectedRoute>
            <AppLayout>
              <WorkspacesPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/workspace/:id"
        element={
          <ProtectedRoute>
            <AppLayout>
              <WorkspaceDetailsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/knowledge"
        element={
          <ProtectedRoute>
            <AppLayout>
              <KnowledgeHubPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/knowledge/:id"
        element={
          <ProtectedRoute>
            <AppLayout>
              <KnowledgeDetailPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/ai"
        element={
          <ProtectedRoute>
            <AppLayout>
              <AIAssistantPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/automation"
        element={
          <ProtectedRoute>
            <AppLayout>
              <AutomationPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AppLayout>
              <SettingsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ProfilePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
    </>
  );
}

export default App;