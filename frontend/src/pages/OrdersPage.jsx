import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Truck, CheckCircle, Clock, BadgeIndianRupee, User, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';

const OrdersPage = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const isFarmer = user?.role === 'farmer';

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const endpoint = isFarmer ? '/api/orders/sales-history' : '/api/orders/my-orders';
            const res = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data.data);
        } catch (err) {
            console.error("Error fetching orders:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [isFarmer]);

    const getStatusStyles = (status) => {
        switch (status) {
            case 'completed': return 'bg-emerald-100 text-emerald-700';
            case 'pending': return 'bg-amber-100 text-amber-700';
            case 'shipped': return 'bg-blue-100 text-blue-700';
            default: return 'bg-zinc-100 text-zinc-700';
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
            <header>
                <h1 className="text-4xl font-light text-zinc-900">
                    {isFarmer ? `${t('salesHistory')} ` : `${t('myOrders')} `}
                    <span className="font-bold text-emerald-600">{t('history')}</span>
                </h1>
                <p className="text-zinc-500 mt-2 italic">
                    {isFarmer ? t('trackSales') : t('monitorPurchases')}
                </p>
            </header>

            {loading ? (
                <div className="py-20 text-center text-zinc-400 animate-pulse">{t('retrievingOrders')}</div>
            ) : orders.length === 0 ? (
                <div className="py-20 text-center bg-zinc-50 rounded-[3rem] border border-dashed border-zinc-200">
                    <Package className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                    <p className="text-zinc-500 font-medium">{t('noRecords')}</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {orders.map((order) => (
                        <div key={order.order_id} className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-200/50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 group hover:border-emerald-100 transition-all">
                            <div className="flex items-center gap-6 flex-1">
                                <div className="p-5 bg-zinc-50 rounded-3xl group-hover:bg-emerald-50 transition-colors">
                                    <Package className="w-8 h-8 text-zinc-900" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-2xl font-bold text-zinc-900 capitalize">{order.product_name}</h3>
                                        <div className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", getStatusStyles(order.status))}>
                                            {order.status}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-zinc-400 text-sm">
                                        <div className="flex items-center gap-1.5">
                                            <User className="w-3.5 h-3.5" />
                                            <span>{isFarmer ? `${t('buyer')}: ${order.buyer_name}` : `${t('farmer')}: ${order.farmer_name}`}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-3.5 h-3.5" />
                                            <span>{order.region}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>{new Date(order.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 lg:gap-12 w-full lg:w-auto border-t lg:border-t-0 lg:border-l border-zinc-100 pt-6 lg:pt-0 lg:pl-12">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t('transactionValue')}</p>
                                    <p className="text-2xl font-black text-zinc-900">₹{order.final_price}<span className="text-xs ml-0.5 text-zinc-400">{t('total')}</span></p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t('quantity')}</p>
                                    <p className="text-xl font-bold text-zinc-700">{order.quantity} kg</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {order.status === 'pending' ? (
                                        <div className="bg-amber-50 text-amber-600 p-3 rounded-2xl border border-amber-100 flex items-center gap-2 text-sm font-bold">
                                            <Clock className="w-4 h-4" />
                                            {t('awaitingLogistics')}
                                        </div>
                                    ) : (
                                        <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl border border-emerald-100 flex items-center gap-2 text-sm font-bold">
                                            <CheckCircle className="w-4 h-4" />
                                            {t('fulfillmentComplete')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrdersPage;
