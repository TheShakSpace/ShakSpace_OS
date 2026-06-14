import { useEffect, useState } from "react";
import SplashScreen from "./components/splash/SplashScreen";
import AppLayout from "./components/layout/AppLayout";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4000); // 4 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {loading ? <SplashScreen /> : <AppLayout />}
    </>
  );
}

export default App;