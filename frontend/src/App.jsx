import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { DottedSurface } from './components/ui/dotted-surface';
import LandingPage from './pages/LandingPage';
import FarmerDashboard from './pages/FarmerDashboard';
import ConsumerMarketplace from './pages/ConsumerMarketplace';
import HeatmapPage from './pages/HeatmapPage';
import LoginPage from './pages/LoginPage';
import CooperativeDashboard from './pages/CooperativeDashboard';
import NegotiationPage from './pages/NegotiationPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import ReviewsPage from './pages/ReviewsPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import LanguageSwitcher from './components/ui/LanguageSwitcher';
import NotificationBell from './components/NotificationBell';
import { VoiceInput } from './components/ui/voice-input';
import { Mic } from 'lucide-react';
import krivaLogo from './assets/kriva-logo.svg';

const normalizeRole = (role = '') => {
    const value = String(role || '').toLowerCase();
    if (value === 'corporate' || value === 'corporate_admin' || value === 'cooperative') return 'cooperative_admin';
    return value;
};

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading } = useAuth();
    const location = useLocation();
    const { t } = useLanguage();
    if (loading) return <div className="p-20 text-center animate-pulse text-zinc-400 font-light">{t('loadingSecurityContext')}</div>;

    if (!user) {
        const requestedPath = `${location.pathname}${location.search || ''}`;
        const loginQuery = new URLSearchParams();
        if (requiredRole) loginQuery.set('role', requiredRole);
        loginQuery.set('redirect', requestedPath);
        return <Navigate to={`/login?${loginQuery.toString()}`} replace />;
    }

    // Allow any authenticated user to access any dashboard
    return children;
};

const Navigation = () => {
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const [showVoiceAssistant, setShowVoiceAssistant] = React.useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);
    const profileMenuRef = React.useRef(null);

    React.useEffect(() => {
        const handleOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, []);

    const initials = (user?.name || user?.role || 'U')
        .split(' ')
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('');
    const cooperativeEntryHref = normalizeRole(user?.role) === 'cooperative_admin'
        ? '/cooperative'
        : '/login?role=cooperative_admin&redirect=%2Fcooperative';

    const handleGoBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
            return;
        }
        navigate('/');
    };

    return (
        <nav className="relative z-20 border-b border-zinc-100 bg-white/50 backdrop-blur-md px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                {location.pathname !== '/' && (
                    <button
                        onClick={handleGoBack}
                        className="h-9 w-9 rounded-full border border-zinc-200 bg-white text-zinc-700 text-lg font-black flex items-center justify-center hover:bg-zinc-50 transition"
                        aria-label="Go back"
                    >
                        ←
                    </button>
                )}
                <Link to="/" className="inline-flex items-center">
                    <img src={krivaLogo} alt="KRIVA" className="h-9 w-auto" />
                    <span className="ml-2 text-2xl font-black tracking-tight text-zinc-900">KRIVA</span>
                </Link>
            </div>

            <div className="flex gap-8 text-sm font-medium text-zinc-600">
                <Link to="/" className="hover:text-blue-600">{t('home')}</Link>
                <Link to="/heatmap" className="hover:text-red-500">{t('heatmap')}</Link>
                <Link to="/reviews" className="hover:text-amber-600">Reviews</Link>
                {user && <Link to="/orders" className="hover:text-emerald-600">{t('orders')}</Link>}
            </div>

            <div className="flex gap-3 items-center">
                <LanguageSwitcher />
                <button
                    onClick={() => setShowVoiceAssistant(!showVoiceAssistant)}
                    className={`p-2 rounded-full transition-all ${showVoiceAssistant ? 'bg-blue-600 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
                    title={t('voiceAssistant')}
                    aria-label={t('voiceAssistant')}
                >
                    <Mic className="w-5 h-5" />
                </button>

                {user && <NotificationBell />}

                {user ? (
                    <div className="relative" ref={profileMenuRef}>
                        <button
                            onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                            className="h-10 w-10 rounded-full bg-zinc-900 text-white text-sm font-bold flex items-center justify-center shadow-md hover:bg-zinc-800 transition"
                            aria-label="Open profile menu"
                        >
                            {initials || 'U'}
                        </button>

                        <div
                            className={`absolute right-0 mt-3 w-44 origin-top-right rounded-2xl border border-zinc-200 bg-white shadow-xl transition-all duration-200 ${isProfileMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
                        >
                            <Link
                                to="/profile"
                                onClick={() => setIsProfileMenuOpen(false)}
                                className="block px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 rounded-t-2xl"
                            >
                                {t('viewProfile')}
                            </Link>
                            <Link
                                to="/profile?edit=1"
                                onClick={() => setIsProfileMenuOpen(false)}
                                className="block px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                                aria-label={t('editProfile')}
                            >
                                {t('editProfile')}
                            </Link>
                            <button
                                onClick={() => {
                                    setIsProfileMenuOpen(false);
                                    logout();
                                }}
                                className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-b-2xl"
                                aria-label={t('logout')}
                            >
                                {t('logout')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <Link to="/login" className="text-zinc-900 border border-zinc-200 px-6 py-2 rounded-full text-sm font-bold hover:bg-zinc-50 transition shadow-sm hover:shadow-md hover:-translate-y-0.5 transform duration-200">{t('signUp')}</Link>
                        <Link to="/login" className="bg-zinc-900 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-zinc-800 transition shadow-md hover:shadow-lg hover:-translate-y-0.5 transform duration-200">{t('signIn')}</Link>
                    </>
                )}
            </div>

            {showVoiceAssistant && (
                <div className="fixed top-24 right-6 z-[60] animate-in fade-in slide-in-from-top-4 duration-300">
                    <VoiceInput onActionComplete={() => setShowVoiceAssistant(false)} />
                </div>
            )}
        </nav>
    );
};

function App() {
    const theme = 'light';

    return (
        <LanguageProvider>
            <AuthProvider>
                <Router>
                    <div className="min-h-screen relative font-sans">
                        <DottedSurface theme={theme} />
                        <Navigation />
                        <main className="relative z-10">
                            <Routes>
                                <Route path="/" element={<LandingPage />} />
                                <Route
                                    path="/farmer"
                                    element={
                                        <ProtectedRoute requiredRole="farmer">
                                            <FarmerDashboard />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/marketplace"
                                    element={
                                        <ProtectedRoute requiredRole="consumer">
                                            <ConsumerMarketplace />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/cooperative"
                                    element={
                                        <ProtectedRoute requiredRole="cooperative_admin">
                                            <CooperativeDashboard />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route path="/heatmap" element={<HeatmapPage />} />
                                <Route path="/reviews" element={<ReviewsPage />} />
                                <Route path="/login" element={<LoginPage />} />
                                <Route
                                    path="/profile"
                                    element={
                                        <ProtectedRoute>
                                            <ProfilePage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/negotiations"
                                    element={
                                        <ProtectedRoute requiredRole="farmer">
                                            <NegotiationPage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/orders"
                                    element={
                                        <ProtectedRoute>
                                            <OrdersPage />
                                        </ProtectedRoute>
                                    }
                                />
                            </Routes>
                        </main>
                    </div>
                </Router>
            </AuthProvider>
        </LanguageProvider>
    );
}

export default App;
