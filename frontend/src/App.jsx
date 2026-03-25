import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ScanResult from './pages/ScanResult';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Login from './pages/LoginPage';
import Signup from './pages/SignupPage';
import { NotificationProvider } from './context/NotificationContext';
import NotificationScheduler from './components/logic/NotificationScheduler';
import AdminDashboard from './pages/AdminDashboard';
import SettingsPage from './pages/SettingsPage';
import WorkoutPage from './pages/WorkoutPage';
import SocialPage from './pages/SocialPage';


function App() {
  return (
    <NotificationProvider>
      <Router>
        <div className="app-container">
          {/* Navbar could go here */}
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/scan-result" element={<ScanResult />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/workout" element={<WorkoutPage />} />
            <Route path="/social" element={<SocialPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </div>
      </Router>
      <NotificationScheduler />
    </NotificationProvider>
  );
}

export default App;
