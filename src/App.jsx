import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Loader2 } from 'lucide-react'; // 🟢 Import Loader
import Navbar from './components/Navbar'; 
import Home from './pages/Home';
import Notices from './pages/Notices';      
import ClubCorner from './pages/ClubCorner'; 
import Competitions from './pages/Competitions';
import Placements from './pages/Placements';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Login from './pages/Login'; 
import Signup from './pages/Signup'; 
import GlobalCalendar from './pages/GlobalCalendar';

const AppContent = () => {
  const { currentUser, loading } = useAuth();
  const [page, setPage] = useState('home');
  const [isRegistering, setIsRegistering] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // 0. SHOW LOADING SCREEN WHILE CHECKING AUTH
  if (loading) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors">
            <Loader2 size={48} className="text-blue-600 animate-spin mb-4" />
            <h2 className="text-xl font-bold text-gray-700 dark:text-white animate-pulse">Campus Sync</h2>
        </div>
    );
  }

  // 1. IF NOT LOGGED IN -> SHOW LOGIN
  if (!currentUser) {
      if (isRegistering) return <Signup switchToLogin={() => setIsRegistering(false)} />;
      return <Login switchToSignup={() => setIsRegistering(true)} />;
  }

  // 2. DASHBOARD
  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300 font-sans pb-24">
        <div className="w-full">
            {page === 'home' && <Home setPage={setPage} />}
            {page === 'academic' && <Notices setPage={setPage} />}
            {page === 'clubs' && <ClubCorner setPage={setPage} />}
            {page === 'competitions' && <Competitions setPage={setPage} />}
            {page === 'placements' && <Placements setPage={setPage} />}
            {page === 'profile' && <Profile setPage={setPage} />}
            {page === 'admin' && <Admin setPage={setPage} />}
            {page === 'calendar' && <GlobalCalendar setPage={setPage} />}
        </div>
        <Navbar setPage={setPage} theme={theme} toggleTheme={toggleTheme} />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
       <AppContent />
    </AuthProvider>
  );
}

export default App;