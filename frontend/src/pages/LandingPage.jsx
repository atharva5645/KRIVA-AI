import React from 'react';
import { HeroSection } from '../components/ui/hero-section';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const normalizeRole = (role = '') => {
    const value = String(role || '').toLowerCase();
    if (value === 'corporate' || value === 'corporate_admin' || value === 'cooperative') return 'cooperative_admin';
    return value;
};

const LandingPage = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const userRole = normalizeRole(user?.role);
    return (
        <div className="flex flex-col min-h-screen bg-zinc-50">
            <HeroSection
                logo={null}
                slogan=""
                title={
                    <>
                        {t('smartDigitalMarket')} <br />
                        <span className="text-emerald-500 text-3xl md:text-5xl lg:text-6xl mt-2 block tracking-tight">{t('marketPriceDemand')}</span>
                    </>
                }
                subtitle={t('landingSubtitle')}
                callToAction={
                    user ? undefined : { text: t('createAccount'), href: "/login" }
                }
                secondaryCallToAction={
                    user ? undefined : { text: t('signIn'), href: "/login" }
                }
                userMessage={
                    user ? { text: `${t('welcome')}, ${user.name || userRole.split('_')[0]}!`, href: `/${userRole === 'farmer' ? 'farmer' : userRole === 'cooperative_admin' ? 'cooperative' : 'marketplace'}` } : undefined
                }
                backgroundImage="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2940&auto=format&fit=crop"
                contactInfo={null}
            />

            <footer className="text-center py-12 text-zinc-400 text-sm font-light border-t border-zinc-200 mt-auto bg-white">
                {t('footerText')}
            </footer>
        </div>
    );
};

export default LandingPage;
