import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import SplashScreen from "./components/splash/SplashScreen";
import AppLayout from "./components/layout/AppLayout";

import DashboardPage from "./pages/DashboardPage";
import WorkspacesPage from "./pages/WorkspacePage";
import KnowledgeHubPage from "./pages/KnowledgeHubPage";
import AIAssistantPage from "./pages/AIAssistantPage";
import AutomationPage from "./pages/AutomationPage";
import SettingsPage from "./pages/SettingsPage";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <Routes>
      <Route path="/" element={<AppLayout><DashboardPage /></AppLayout>} />
      <Route path="/workspaces" element={<AppLayout><WorkspacesPage /></AppLayout>} />
      <Route path="/knowledge" element={<AppLayout><KnowledgeHubPage /></AppLayout>} />
      <Route path="/ai" element={<AppLayout><AIAssistantPage /></AppLayout>} />
      <Route path="/automation" element={<AppLayout><AutomationPage /></AppLayout>} />
      <Route path="/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
    </Routes>
  );
}

export default App;