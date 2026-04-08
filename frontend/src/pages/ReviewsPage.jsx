import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, ShieldCheck, Filter, Search, PlusCircle, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { cn } from '../lib/utils';

const MOCK_REVIEWS = [
    { id: 1, crop: 'Tomato', user: 'Farmer Ramesh', rating: 5, date: '2026-04-01', text: 'Excellent harvest quality this season. The AI predictions helped me time the market perfectly.', verified: true },
    { id: 2, crop: 'Paddy', user: 'Suresh K.', rating: 4, date: '2026-03-28', text: 'Good quality grains, though transport logistics were slightly delayed.', verified: true },
    { id: 3, crop: 'Onion', user: 'Market Trust Co.', rating: 5, date: '2026-04-05', text: 'Consistently high-grade produce. Highly recommend this region for bulk sourcing.', verified: true },
    { id: 4, crop: 'Tomato', user: 'Anita M.', rating: 3, date: '2026-03-25', text: 'Fair pricing, but expected more surge in demand according to the old charts.', verified: false },
    { id: 5, crop: 'Chilli', user: 'Gowda Farms', rating: 5, date: '2026-04-02', text: 'Extremely spicy and well-dried. Perfect for the export market.', verified: true },
];

const ReviewsPage = () => {
    const { t } = useLanguage();
    const [selectedCrop, setSelectedCrop] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    const crops = ['All', ...new Set(MOCK_REVIEWS.map(r => r.crop))];

    const filteredReviews = MOCK_REVIEWS.filter(r => {
        const matchesCrop = selectedCrop === 'All' || r.crop === selectedCrop;
        const matchesSearch = r.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.user.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCrop && matchesSearch;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 space-y-12 min-h-screen">
            {/* Hero Section */}
            <header className="space-y-4">
                <div className="flex items-center gap-3 text-amber-600 font-black uppercase tracking-[0.2em] text-xs">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verified Community Feedback</span>
                </div>
                <h1 className="text-6xl font-black text-zinc-900 tracking-tighter uppercase leading-[0.9]">
                    Market <span className="text-amber-500">Trust</span> <br />
                    & Reviews
                </h1>
                <p className="max-w-2xl text-lg text-zinc-500 font-medium leading-relaxed">
                    Transparency is our core. Browse through verified reviews from farmers, cooperatives, and consumers within the KRIVA ecosystem.
                </p>
            </header>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-6 items-end justify-between bg-zinc-50/50 p-8 rounded-[3rem] border border-zinc-100">
                <div className="flex-1 space-y-4 w-full">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Filter by Crop & Search</label>
                    <div className="flex flex-wrap gap-2">
                        {crops.map(crop => (
                            <button
                                key={crop}
                                onClick={() => setSelectedCrop(crop)}
                                className={cn(
                                    "px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                                    selectedCrop === crop
                                        ? "bg-zinc-950 text-white shadow-xl shadow-zinc-200"
                                        : "bg-white text-zinc-400 border border-zinc-100 hover:bg-zinc-50"
                                )}
                            >
                                {crop}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="w-full md:w-80 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-amber-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search feedback..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-zinc-100 rounded-2xl py-3.5 pl-10 pr-4 text-sm font-bold text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all shadow-inner"
                    />
                </div>
            </div>

            {/* Reviews Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode='popLayout'>
                    {filteredReviews.map((review) => (
                        <motion.div
                            layout
                            key={review.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white p-8 rounded-[2.5rem] border border-zinc-50 shadow-sm hover:shadow-xl transition-all group flex flex-col"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1">
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={cn("w-3.5 h-3.5", i < review.rating ? "fill-amber-400 text-amber-400" : "text-zinc-200")} />
                                        ))}
                                    </div>
                                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">{review.crop}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-zinc-400">{review.date}</p>
                                    {review.verified && (
                                        <div className="flex items-center gap-1 text-[8px] font-black text-emerald-600 uppercase mt-1">
                                            <ShieldCheck className="w-2.5 h-2.5" />
                                            <span>Verified</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <p className="text-zinc-700 font-medium leading-relaxed mb-8 flex-1 italic">
                                "{review.text}"
                            </p>

                            <div className="pt-6 border-t border-zinc-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center font-black text-zinc-400 text-xs">
                                        {review.user.charAt(0)}
                                    </div>
                                    <span className="text-sm font-black text-zinc-900">{review.user}</span>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-zinc-200 group-hover:text-amber-500 transition-colors" />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Post Review Placeholder */}
                <button
                    onClick={() => setIsPosting(true)}
                    className="border-2 border-dashed border-zinc-100 rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-4 text-zinc-400 hover:border-amber-200 hover:bg-amber-50/30 transition-all group"
                >
                    <PlusCircle className="w-12 h-12 stroke-[1.5px] group-hover:scale-110 transition-transform" />
                    <div className="text-center">
                        <p className="font-black uppercase tracking-widest text-xs">Share your experience</p>
                        <p className="text-[10px] font-bold opacity-60">Help the community grow</p>
                    </div>
                </button>
            </div>

            {/* Add Review Modal Placeholder */}
            {isPosting && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={() => setIsPosting(false)} />
                    <div className="relative w-full max-w-lg bg-white rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 fade-in duration-200">
                        <h3 className="text-3xl font-black text-zinc-900 tracking-tighter uppercase mb-2">Post Feedback</h3>
                        <p className="text-zinc-500 text-sm mb-8 font-medium">Your insights help other market participants make better decisions.</p>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-zinc-400 px-1">Select Crop</label>
                                <select className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20">
                                    <option>Tomato</option>
                                    <option>Paddy</option>
                                    <option>Onion</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-zinc-400 px-1">Your Review</label>
                                <textarea
                                    placeholder="Tell us about the quality, demand, or logistics..."
                                    className="w-full h-32 bg-zinc-50 border border-zinc-100 rounded-2xl py-4 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
                                />
                            </div>
                            <button
                                onClick={() => setIsPosting(false)}
                                className="w-full bg-zinc-950 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200"
                            >
                                Submit Review
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewsPage;
