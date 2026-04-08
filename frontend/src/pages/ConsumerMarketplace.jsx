import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, Search, Filter, Tag, X, TrendingUp, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const OfferModal = ({ product, onClose }) => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [offerPrice, setOfferPrice] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState({ type: null, message: '' }); // 'success' or 'error'


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            setStatus({ type: 'error', message: 'You must be signed in to make an offer.' });
            return;
        }

        setSubmitting(true);
        setStatus({ type: null, message: '' });

        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/offers/makeOffer', {
                product_id: product.product_id,
                offered_price: parseFloat(offerPrice)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setStatus({ type: 'success', message: `Your offer for ₹${offerPrice}/kg has been submitted successfully!` });
            setTimeout(() => onClose(), 2500);
        } catch (err) {
            console.error("Offer submission error:", err);
            setStatus({
                type: 'error',
                message: err.response?.data?.error || 'Failed to submit offer. Please try again.'
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-8 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-zinc-900">{t('makeAnOffer').split(' ')[0]} <span className="text-blue-600">{t('offer')}</span></h2>
                        <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                            <X className="w-5 h-5 text-zinc-400" />
                        </button>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-zinc-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-zinc-900">{product.name}</h3>
                            <p className="text-xs text-zinc-500">{t('basePrice')}: ₹{product.base_price}/kg</p>
                        </div>
                    </div>

                    <div className="space-y-4 p-5 bg-zinc-50 rounded-3xl border border-zinc-100">
                        <div className="flex items-center gap-2 text-zinc-500 font-bold text-xs uppercase tracking-wider">
                            <TrendingUp className="w-4 h-4" />
                            <span>{t('marketTrends')}</span>
                        </div>

                        <div className="space-y-2 text-sm text-zinc-600">
                            <div className="flex justify-between items-center">
                                <p>{t('currentState')}</p>
                                <span className="font-bold text-zinc-900 border-b border-zinc-200">{t('stable')}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <p>{t('demandStatus')}</p>
                                <span className="font-bold text-zinc-900 border-b border-zinc-200">{t('balanced')}</span>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">{t('yourPricePerKg')}</label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <input
                                    type="number"
                                    required
                                    value={offerPrice}
                                    onChange={(e) => setOfferPrice(e.target.value)}
                                    className="w-full pl-10 pr-4 py-4 rounded-2xl bg-zinc-50 border border-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-lg font-semibold"
                                    placeholder="0.00"
                                    disabled={submitting || status.type === 'success'}
                                />
                            </div>
                        </div>

                        {status.type && (
                            <div className={`p-4 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                                }`}>
                                {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" /> : <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />}
                                <p className="text-sm font-medium leading-tight">{status.message}</p>
                            </div>
                        )}

                        <button
                            disabled={submitting || status.type === 'success'}
                            className="w-full bg-zinc-900 text-white font-bold py-4 rounded-2xl hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                        >
                            {submitting ? t('processing') : status.type === 'success' ? t('offerSubmitted') : t('submitSecureOffer')}
                            {!submitting && status.type !== 'success' && <TrendingUp className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const ConsumerMarketplace = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const location = useLocation();
    const { t } = useLanguage();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const search = queryParams.get('search');
        if (search) {
            setSearchTerm(search);
        }
    }, [location.search]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get('/api/products');
                setProducts(res.data.data);
                setFilteredProducts(res.data.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching products:", err);
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        const results = products.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.farmer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.region.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredProducts(results);
    }, [searchTerm, products]);

    // Mock image mapping
    const getProductImage = (name) => {
        const n = name.toLowerCase();
        if (n.includes('tomato')) return 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=600&auto=format&fit=crop';
        if (n.includes('onion')) return 'https://images.unsplash.com/photo-1620574387735-3624d75b2dbc?q=80&w=600&auto=format&fit=crop';
        if (n.includes('chilli')) return 'https://images.unsplash.com/photo-1588252303782-cb80119f702e?q=80&w=600&auto=format&fit=crop';
        if (n.includes('carrot')) return 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=600&auto=format&fit=crop';
        if (n.includes('paddy') || n.includes('rice')) return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop';
        return 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop'; // General veg
    };

    if (loading) return <div className="p-12 text-center text-zinc-400 animate-pulse">{t('analyzingMarket')}</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-extralight text-zinc-900 tracking-tight">{t('directMarket')} <span className="font-semibold text-blue-600">{t('market')}</span></h1>
                    <p className="text-zinc-500 font-light">{t('freshProduce')}</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80 flex items-center gap-2 bg-zinc-50 border border-zinc-100 rounded-2xl px-3 py-1 focus-within:ring-2 focus-within:ring-blue-100 transition-all shadow-sm">
                        <Search className="w-4 h-4 text-zinc-400 shrink-0" />
                        <input
                            className="w-full bg-transparent py-1.5 text-sm focus:outline-none"
                            placeholder={t('searchOrganic')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="bg-white p-2.5 rounded-2xl border border-zinc-100 shadow-sm hover:bg-zinc-50 transition-colors"><Filter className="w-4 h-4 text-zinc-600" /></button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((p) => (
                    <div key={p.product_id} className="group bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm hover:shadow-2xl hover:shadow-zinc-200/50 transition-all duration-500 overflow-hidden flex flex-col">
                        <div className="h-56 bg-zinc-50 relative overflow-hidden">
                            <img
                                src={getProductImage(p.name)}
                                alt={p.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-zinc-900 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest leading-none shadow-sm flex items-center gap-1.5">
                                <CheckCircle2 className="w-3 h-3 text-blue-600" />
                                {t('qualityGuaranteed')}
                            </div>
                        </div>
                        <div className="p-8 flex-1 space-y-6">
                            <div>
                                <h3 className="text-2xl font-bold text-zinc-900 mb-1">{p.name}</h3>
                                <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium">
                                    <Tag className="w-3 h-3 text-blue-500" />
                                    <span>{t('farmer')}: <span className="text-zinc-600 font-bold">{p.farmer}</span></span>
                                    <span className="mx-1">•</span>
                                    <span>{p.region}</span>
                                </div>
                            </div>

                            <div className="flex items-end justify-between bg-zinc-50 p-4 rounded-2xl border border-zinc-100/50">
                                <div>
                                    <span className="text-zinc-400 text-[10px] block font-bold uppercase tracking-tighter mb-1">{t('marketPrice')}</span>
                                    <span className="text-2xl font-black text-zinc-900">₹{p.base_price}<span className="text-sm font-medium text-zinc-400">/kg</span></span>
                                </div>
                                <div className="text-right">
                                    <span className="text-zinc-400 text-[10px] block font-bold uppercase tracking-tighter mb-1">{t('availability')}</span>
                                    <span className="text-sm font-bold text-zinc-900 px-3 py-1 bg-white rounded-lg shadow-sm border border-zinc-100">{p.quantity} kg</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedProduct(p)}
                                className="w-full bg-zinc-900 text-white font-bold py-4 rounded-2xl hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 hover:-translate-y-1 transform"
                            >
                                {t('makeAnOffer')}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-24 space-y-4">
                    <ShoppingBag className="w-16 h-16 text-zinc-200 mx-auto" />
                    <p className="text-zinc-500 text-lg">{t('noProductsFound')}</p>
                    <button onClick={() => setSearchTerm('')} className="text-blue-600 font-bold text-sm hover:underline">{t('clearAllFilters')}</button>
                </div>
            )}

            {selectedProduct && (
                <OfferModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}
        </div>
    );
};

export default ConsumerMarketplace;

