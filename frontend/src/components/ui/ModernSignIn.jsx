import React, { memo, useState, forwardRef, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView, useMotionTemplate, useMotionValue } from 'framer-motion';
import { Eye, EyeOff, Github, Chrome } from 'lucide-react';
import { cn } from '../../lib/utils';
import krivaLogo from '../../assets/kriva-logo.svg';

// = : Input Component : =
const Input = memo(forwardRef(({ className, type, ...props }, ref) => {
    const radius = 100;
    const [visible, setVisible] = useState(false);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <motion.div
            style={{
                background: useMotionTemplate`
                    radial-gradient(
                        ${visible ? radius + 'px' : '0px'} circle at ${mouseX}px ${mouseY}px,
                        #10b98122,
                        transparent 80%
                    )
                `,
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
            className='group/input rounded-xl p-[2px] transition duration-300'
        >
            <input
                type={type}
                className={cn(
                    `flex h-12 w-full rounded-xl border-none bg-zinc-50 px-4 py-2 text-sm text-zinc-900 transition duration-400 placeholder:text-zinc-400 focus-visible:ring-[2px] focus-visible:ring-emerald-200 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 shadow-sm`,
                    className
                )}
                ref={ref}
                {...props}
            />
        </motion.div>
    );
}));

// = : BoxReveal Component : =
const BoxReveal = memo(({ children, width = 'fit-content', boxColor = '#10b981', duration = 0.5, className }) => {
    const mainControls = useAnimation();
    const slideControls = useAnimation();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (isInView) {
            slideControls.start('visible');
            mainControls.start('visible');
        }
    }, [isInView]);

    return (
        <div ref={ref} style={{ position: 'relative', width, overflow: 'hidden' }} className={className}>
            <motion.div
                variants={{
                    hidden: { opacity: 0, y: 75 },
                    visible: { opacity: 1, y: 0 },
                }}
                initial='hidden'
                animate={mainControls}
                transition={{ duration, delay: 0.25 }}
            >
                {children}
            </motion.div>
            <motion.div
                variants={{ hidden: { left: 0 }, visible: { left: '100%' } }}
                initial='hidden'
                animate={slideControls}
                transition={{ duration, ease: 'easeIn' }}
                style={{
                    position: 'absolute',
                    top: 4,
                    bottom: 4,
                    left: 0,
                    right: 0,
                    zIndex: 20,
                    background: boxColor,
                    borderRadius: 4,
                }}
            />
        </div>
    );
});

// = : OrbitingCircles Component : =
const OrbitingCircles = memo(({ className, children, reverse = false, duration = 20, delay = 0, radius = 50, path = true }) => {
    return (
        <>
            {path && (
                <svg xmlns='http://www.w3.org/2000/svg' version='1.1' className='pointer-events-none absolute inset-0 size-full'>
                    <circle className='stroke-zinc-200 stroke-1' cx='50%' cy='50%' r={radius} fill='none' />
                </svg>
            )}
            <div
                style={{
                    '--duration': duration,
                    '--radius': radius,
                    '--delay': -delay,
                }}
                className={cn(
                    'absolute flex size-full animate-orbit items-center justify-center rounded-full border bg-zinc-100/50 [animation-delay:calc(var(--delay)*1000ms)]',
                    { '[animation-direction:reverse]': reverse },
                    className
                )}
            >
                {children}
            </div>
        </>
    );
});

// = : Main ModernSignIn Component : =
export const ModernSignIn = ({ mode = 'login', onToggleMode, onSubmit, initialRole = 'farmer', errorMessage = '' }) => {
    const [visible, setVisible] = useState(false);
    const [role, setRole] = useState(initialRole);
    const [loginMethod, setLoginMethod] = useState('mobile');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        password: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const payload = {
            name: formData.name,
            password: formData.password,
            role
        };

        if (mode === 'login') {
            if (loginMethod === 'email') {
                payload.email = formData.email.trim().toLowerCase();
            } else {
                payload.mobile = formData.mobile.trim();
            }
            payload.loginMethod = loginMethod;
        } else {
            payload.mobile = formData.mobile.trim();
            payload.email = formData.email.trim().toLowerCase();
        }

        onSubmit({
            ...payload
        });
    };

    const handleSocialAuth = (provider) => {
        if (provider === 'Google') {
            // Mocking a successful Google Sign-In for demo purposes
            // In a real app, this would be the result of a Google GIS popup
            onSubmit({
                isSocial: true,
                email: `google_user_${Math.floor(Math.random() * 1000)}@gmail.com`,
                name: 'Google User',
                role
            });
        } else {
            alert(`${provider} authentication is not configured yet. Please use email/password login.`);
        }
    };

    useEffect(() => {
        setRole(initialRole || 'farmer');
    }, [initialRole]);

    const roles = [
        { id: 'farmer', label: 'Farmer', icon: '🌾' },
        { id: 'consumer', label: 'Consumer', icon: '🛒' },
        { id: 'cooperative_admin', label: 'Cooperative Admin', icon: '🤝' },
    ];

    return (
        <div className="flex min-h-screen bg-white overflow-hidden">
            {/* Left Side: Visuals */}
            <div className="hidden lg:flex flex-1 relative bg-zinc-50 items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-100 via-transparent to-transparent" />
                </div>

                <div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg">
                    <div className="flex items-center gap-3 pointer-events-none">
                        <img src={krivaLogo} alt="KRIVA" className="w-16 h-16" />
                        <span className="text-5xl font-black tracking-tight text-zinc-900">KRIVA</span>
                    </div>

                    {/* Orbiting Icons */}
                    <OrbitingCircles radius={100} duration={20}>
                        <div className="bg-white p-2 rounded-full shadow-sm">
                            <Sprout className="w-6 h-6 text-emerald-500" />
                        </div>
                    </OrbitingCircles>
                    <OrbitingCircles radius={180} duration={25} reverse>
                        <div className="bg-white p-2 rounded-full shadow-sm">
                            <TrendingUp className="w-6 h-6 text-blue-500" />
                        </div>
                    </OrbitingCircles>
                    <OrbitingCircles radius={260} duration={30}>
                        <div className="bg-white p-2 rounded-full shadow-sm">
                            <BadgeIndianRupee className="w-6 h-6 text-amber-500" />
                        </div>
                    </OrbitingCircles>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-16 lg:p-24 bg-white shadow-2xl z-10">
                <div className="w-full max-w-sm space-y-8">
                    <BoxReveal>
                        <h2 className="text-4xl font-bold text-zinc-900 tracking-tight">
                            {mode === 'login' ? 'Welcome back' : 'Join the market'}
                        </h2>
                    </BoxReveal>

                    <BoxReveal duration={0.6}>
                        <p className="text-zinc-500 font-light mt-2">
                            {mode === 'login'
                                ? 'Enter your credentials to access your insights.'
                                : 'Start your journey towards a smarter digital santhe today.'}
                        </p>
                    </BoxReveal>

                    {/* Role Selection */}
                    <div className="space-y-4">
                        <BoxReveal width="100%"><label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Select Identity</label></BoxReveal>
                        <div className="grid grid-cols-3 gap-2 bg-zinc-50 p-1.5 rounded-2xl border border-zinc-100">
                            {roles.map((r) => (
                                <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => setRole(r.id)}
                                    className={cn(
                                        "flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl transition-all duration-300",
                                        role === r.id
                                            ? "bg-white text-emerald-600 shadow-sm border border-emerald-50 ring-2 ring-emerald-50"
                                            : "text-zinc-400 hover:text-zinc-600"
                                    )}
                                >
                                    <span className="text-lg">{r.icon}</span>
                                    <span className="text-[10px] font-bold uppercase truncate w-full text-center">{r.label.split(' ')[0]}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <form className="mt-8 space-y-5" onSubmit={handleFormSubmit}>
                        {errorMessage && (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                {errorMessage}
                            </div>
                        )}
                        {mode === 'login' && (
                            <div className="space-y-2">
                                <BoxReveal width="100%">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Login Method</label>
                                </BoxReveal>
                                <div className="grid grid-cols-2 gap-2 bg-zinc-50 p-1.5 rounded-2xl border border-zinc-100">
                                    <button
                                        type="button"
                                        onClick={() => setLoginMethod('mobile')}
                                        className={cn(
                                            "h-10 rounded-xl text-sm font-semibold transition-all duration-300",
                                            loginMethod === 'mobile'
                                                ? "bg-white text-emerald-600 shadow-sm border border-emerald-50 ring-2 ring-emerald-50"
                                                : "text-zinc-500 hover:text-zinc-700"
                                        )}
                                    >
                                        Mobile Number
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setLoginMethod('email')}
                                        className={cn(
                                            "h-10 rounded-xl text-sm font-semibold transition-all duration-300",
                                            loginMethod === 'email'
                                                ? "bg-white text-emerald-600 shadow-sm border border-emerald-50 ring-2 ring-emerald-50"
                                                : "text-zinc-500 hover:text-zinc-700"
                                        )}
                                    >
                                        Email Address
                                    </button>
                                </div>
                            </div>
                        )}
                        {mode === 'signup' && (
                            <div className="space-y-1.5">
                                <BoxReveal width="100%"><label className="text-sm font-medium text-zinc-700 ml-1">Full Name</label></BoxReveal>
                                <Input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Farmer Jeeva"
                                    required
                                />
                            </div>
                        )}
                        {mode === 'signup' || loginMethod === 'mobile' ? (
                            <div className="space-y-1.5">
                                <BoxReveal width="100%"><label className="text-sm font-medium text-zinc-700 ml-1">Mobile Number</label></BoxReveal>
                                <Input
                                    name="mobile"
                                    type="tel"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    placeholder="e.g. 9876543210"
                                    required
                                />
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                <BoxReveal width="100%"><label className="text-sm font-medium text-zinc-700 ml-1">Email Address</label></BoxReveal>
                                <Input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="e.g. name@example.com"
                                    required
                                />
                            </div>
                        )}
                        <div className="space-y-1.5">
                            <BoxReveal width="100%"><label className="text-sm font-medium text-zinc-700 ml-1">Password</label></BoxReveal>
                            <div className="relative">
                                <Input
                                    name="password"
                                    type={visible ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setVisible(!visible)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                                >
                                    {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full h-12 bg-zinc-900 text-white rounded-xl font-semibold hover:bg-zinc-800 transition shadow-lg shadow-zinc-200"
                        >
                            {mode === 'login' ? 'Sign In as ' : 'Create '}
                            <span className="text-emerald-400">{roles.find(r => r.id === role)?.label.split(' ')[0]}</span>
                        </button>
                    </form>

                    <div className="relative pt-2">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-zinc-100"></span></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-zinc-400 font-medium">Or continue with</span></div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <button
                            type="button"
                            onClick={() => handleSocialAuth('Google')}
                            className="flex items-center justify-center gap-2 h-11 border border-zinc-200 rounded-xl text-sm font-medium hover:bg-zinc-50 transition border-dashed"
                        >
                            <Chrome size={18} className="text-zinc-600" /> Google
                        </button>
                    </div>

                    <p className="text-center text-sm text-zinc-500 pt-6">
                        {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
                        <button
                            onClick={onToggleMode}
                            className="text-emerald-600 font-semibold hover:underline"
                        >
                            {mode === 'login' ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

// Re-using icons from main app
const Sprout = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M7 20h10" /><path d="M10 20c5.5-2.5 8-6.4 8-8.5c0-1.2-1.2-1.2-1.2-1.2c-2.3 0-5.3 2.5-6.8 4.2C7.3 12.5 5 10 3.2 8.3C3.2 8.3 2 8.3 2 9.5c0 2.1 2.5 6 8 8.5z" /><path d="M10 20c-5.5-2.5-8-6.4-8-8.5c0-1.2 1.2-1.2 1.2-1.2c2.3 0 5.3 2.5 6.8 4.2c2.7-2 5-4.5 6.8-6.2c0 0 1.2 0 1.2 1.2c0 2.1-2.5 6-8 8.5z" />
    </svg>
);
const TrendingUp = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
);
const BadgeIndianRupee = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" /><path d="M8 8h8" /><path d="M8 12h8" /><path d="m13 17-5-5h1a4 4 0 0 0 0-8" />
    </svg>
);
