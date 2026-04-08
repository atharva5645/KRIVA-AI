import React from 'react';
import { cn } from "../../lib/utils";
import { motion } from 'framer-motion';

// Icon component for contact details
const InfoIcon = ({ type }) => {
    const icons = {
        website: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-emerald-600">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" x2="22" y1="12" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
        ),
        phone: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-emerald-600">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
        ),
        address: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-emerald-600">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                <circle cx="12" cy="10" r="3"></circle>
            </svg>
        ),
    };
    return <div className="mr-2 flex-shrink-0">{icons[type]}</div>;
};

const HeroSection = React.forwardRef(
    ({ className, logo, slogan, title, subtitle, callToAction, secondaryCallToAction, userMessage, backgroundImage, contactInfo, ...props }, ref) => {

        // Animation variants for the container to orchestrate children animations
        const containerVariants = {
            hidden: { opacity: 0 },
            visible: {
                opacity: 1,
                transition: {
                    staggerChildren: 0.15,
                    delayChildren: 0.2,
                },
            },
        };

        // Animation variants for individual text/UI elements
        const itemVariants = {
            hidden: { y: 20, opacity: 0 },
            visible: {
                y: 0,
                opacity: 1,
                transition: {
                    duration: 0.5,
                    ease: "easeOut",
                },
            },
        };

        return (
            <motion.section
                ref={ref}
                className={cn(
                    "relative flex w-full flex-col overflow-hidden bg-white text-zinc-900 md:flex-row pb-12",
                    className
                )}
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                {...props}
            >
                {/* Left Side: Content */}
                <div className="flex w-full flex-col justify-between p-8 md:w-1/2 md:p-12 lg:w-3/5 lg:p-16 z-10">
                    {/* Top Section: Logo & Main Content */}
                    <div>
                        <motion.header className="mb-12" variants={itemVariants}>
                            {logo && (
                                <div className="flex items-center">
                                    {logo.url && <img src={logo.url} alt={logo.alt} className="mr-3 h-8" />}
                                    <div>
                                        {logo.text && <p className="text-xl font-bold text-zinc-900">{logo.text}</p>}
                                        {slogan && <p className="text-xs tracking-wider text-emerald-600 font-bold uppercase">{slogan}</p>}
                                    </div>
                                </div>
                            )}
                        </motion.header>

                        <motion.main variants={containerVariants}>
                            <motion.h1 className="text-4xl font-bold leading-tight text-zinc-900 md:text-5xl lg:text-6xl" variants={itemVariants}>
                                {title}
                            </motion.h1>
                            <motion.div className="my-8 h-1.5 w-24 bg-emerald-500 rounded-full" variants={itemVariants}></motion.div>
                            <motion.p className="mb-8 max-w-lg text-lg text-zinc-600 font-medium" variants={itemVariants}>
                                {subtitle}
                            </motion.p>
                            <div className="flex flex-wrap gap-4 items-center">
                                {userMessage ? (
                                    <motion.a href={userMessage.href} className="inline-block bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-emerald-700 hover:shadow-lg transition-all" variants={itemVariants}>
                                        {userMessage.text}
                                    </motion.a>
                                ) : (
                                    <>
                                        {callToAction && (
                                            <motion.a href={callToAction.href} className="inline-block bg-zinc-900 text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-zinc-800 hover:shadow-lg transition-all" variants={itemVariants}>
                                                {callToAction.text}
                                            </motion.a>
                                        )}
                                        {secondaryCallToAction && (
                                            <motion.a href={secondaryCallToAction.href} className="inline-block bg-white text-zinc-900 border-2 border-zinc-200 px-8 py-3 rounded-xl font-bold text-sm hover:border-zinc-300 hover:bg-zinc-50 transition-all" variants={itemVariants}>
                                                {secondaryCallToAction.text}
                                            </motion.a>
                                        )}
                                    </>
                                )}
                            </div>
                        </motion.main>
                    </div>

                    {/* Bottom Section: Footer Info */}
                    {contactInfo && <motion.footer className="mt-16 w-full" variants={itemVariants}>
                        <div className="grid grid-cols-1 gap-6 text-sm font-medium text-zinc-500 sm:grid-cols-3">
                            <div className="flex items-center">
                                <InfoIcon type="website" />
                                <span>{contactInfo.website}</span>
                            </div>
                            <div className="flex items-center">
                                <InfoIcon type="phone" />
                                <span>{contactInfo.phone}</span>
                            </div>
                            <div className="flex items-center">
                                <InfoIcon type="address" />
                                <span>{contactInfo.address}</span>
                            </div>
                        </div>
                    </motion.footer>}
                </div>

                {/* Right Side: Image with Clip Path Animation */}
                <motion.div
                    className="w-full min-h-[400px] bg-cover bg-center md:w-1/2 md:min-h-full lg:w-2/5 absolute right-0 top-0 bottom-0"
                    style={{
                        backgroundImage: `url(${backgroundImage})`,
                    }}
                    initial={{ clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' }}
                    animate={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)' }}
                    transition={{ duration: 1.2, ease: "circOut" }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
                </motion.div>
            </motion.section>
        );
    }
);

HeroSection.displayName = "HeroSection";

export { HeroSection };
