import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Clock, BadgeIndianRupee, User, Package, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';

const NegotiationPage = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

    const fetchOffers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/offers/farmer', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOffers(res.data.data);
        } catch (err) {
            console.error("Error fetching offers:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (offerId, action) => {
        try {
            const token = localStorage.getItem('token');
            if (action === 'accept') {
                await axios.post('/api/offers/acceptOffer', { offer_id: offerId }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                // Logic for rejection could be added here
                await axios.query(`UPDATE offers SET status = 'rejected' WHERE offer_id = ${offerId}`);
            }
            fetchOffers();
        } catch (err) {
            console.error(`Error ${action}ing offer:`, err);
        }
    };

    useEffect(() => {
        fetchOffers();
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
            <header>
                <h1 className="text-4xl font-light text-zinc-900">{t('negotiationCenter')} <span className="font-bold text-blue-600">{t('center')}</span></h1>
                <p className="text-zinc-500 mt-2 italic">{t('reviewBids')}</p>
            </header>

            {loading ? (
                <div className="py-20 text-center text-zinc-400 animate-pulse">{t('loadingNegotiations')}</div>
            ) : offers.length === 0 ? (
                <div className="py-20 text-center bg-zinc-50 rounded-[3rem] border border-dashed border-zinc-200">
                    <Clock className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                    <p className="text-zinc-500 font-medium">{t('noActiveOffers')}</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {offers.map((offer) => (
                        <div key={offer.offer_id} className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-200/50 flex flex-col md:flex-row justify-between items-center gap-8 group hover:border-blue-100 transition-all">
                            <div className="flex items-center gap-6 flex-1">
                                <div className="p-4 bg-zinc-50 rounded-3xl group-hover:bg-blue-50 transition-colors">
                                    <Package className="w-8 h-8 text-zinc-900" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-zinc-900 capitalize">{offer.product_name}</h3>
                                    <div className="flex items-center gap-2 text-zinc-400 text-sm mt-1">
                                        <User className="w-3 h-3" />
                                        <span>{t('buyer')}: {offer.buyer_name}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-12 flex-1 justify-center">
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">{t('basePrice')}</p>
                                    <p className="text-lg font-medium text-zinc-500 line-through">₹{offer.base_price}</p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-zinc-200" />
                                <div className="text-center bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">{t('offeredPrice')}</p>
                                    <p className="text-2xl font-black text-blue-600">₹{offer.offered_price}<span className="text-xs ml-0.5">/kg</span></p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto">
                                {offer.status === 'pending' ? (
                                    <>
                                        <button
                                            onClick={() => handleAction(offer.offer_id, 'accept')}
                                            className="flex-1 md:flex-none px-8 py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg hover:shadow-emerald-200 flex items-center gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            {t('accept')}
                                        </button>
                                        <button
                                            onClick={() => handleAction(offer.offer_id, 'reject')}
                                            className="p-4 border border-zinc-100 rounded-2xl text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                        >
                                            <XCircle className="w-6 h-6" />
                                        </button>
                                    </>
                                ) : (
                                    <div className={cn("px-6 py-3 rounded-full text-sm font-bold uppercase tracking-widest",
                                        offer.status === 'accepted' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                                        {offer.status}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NegotiationPage;
