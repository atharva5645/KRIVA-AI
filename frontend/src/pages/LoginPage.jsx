import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { ModernSignIn } from '../components/ui/ModernSignIn';
import { useAuth } from '../context/AuthContext';

const getDashboardPathByRole = (role) => {
    if (role === 'farmer') return '/farmer';
    if (role === 'cooperative_admin') return '/cooperative';
    return '/marketplace';
};

const normalizeRole = (role = '') => {
    const value = String(role || '').toLowerCase();
    if (value === 'corporate' || value === 'corporate_admin' || value === 'cooperative') return 'cooperative_admin';
    if (value === 'farmer' || value === 'consumer' || value === 'cooperative_admin') return value;
    return 'farmer';
};

const normalizeMobile = (value = '') => String(value).replace(/\D/g, '');
const normalizeEmail = (value = '') => String(value || '').trim().toLowerCase();

const LoginPage = () => {
    const [mode, setMode] = useState('login');
    const [authError, setAuthError] = useState('');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const { login } = useAuth();

    const requestedRole = normalizeRole(searchParams.get('role') || 'farmer');
    const redirectTarget = searchParams.get('redirect');

    const toggleMode = () => {
        setMode(prev => prev === 'login' ? 'signup' : 'login');
        setAuthError('');
    };

    const handleAuth = async (data) => {
        try {
            let endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
            if (data.isSocial) endpoint = '/api/auth/social-login';

            const payload = { ...data };

            if (data.isSocial) {
                // For social login, we just pass email and name
                payload.email = normalizeEmail(data.email);
                payload.name = data.name;
            } else if (mode === 'login') {
                if (data.loginMethod === 'email') {
                    payload.email = normalizeEmail(data.email);
                    delete payload.mobile;
                } else {
                    payload.mobile = normalizeMobile(data.mobile);
                    delete payload.email;
                }
            } else {
                const mobile = normalizeMobile(data.mobile);
                payload.mobile = mobile;
                payload.phone = mobile;
                payload.email = normalizeEmail(data.email) || `${mobile}@mobile.local`;
            }

            const res = await axios.post(endpoint, payload);

            if (res.data.success) {
                setAuthError('');
                const userRole = normalizeRole(res.data.user?.role || data.role);
                const userData = {
                    id: res.data.user?.id,
                    role: userRole,
                    name: res.data.user?.name || data.name || '',
                    email: res.data.user?.email || data.email || '',
                    phone: res.data.user?.phone || data.mobile || data.phone || ''
                };

                // Use global auth context
                login(res.data.token, userData);

                // Always redirect to the user's actual role dashboard
                const destination = getDashboardPathByRole(userRole);
                navigate(destination);
            }
        } catch (err) {
            setAuthError(
                err.response?.data?.error ||
                (err.request ? 'Cannot connect to backend. Start backend server on port 5000.' : err.message) ||
                'Authentication failed'
            );
        }
    };

    return (
        <div className="bg-white">
            <ModernSignIn
                mode={mode}
                onToggleMode={toggleMode}
                onSubmit={handleAuth}
                initialRole={requestedRole}
                errorMessage={authError}
            />
        </div>
    );
};

export default LoginPage;
