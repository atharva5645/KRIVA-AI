import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Share2, Users, FileText, Activity } from 'lucide-react';

const CooperativeDashboard = () => {
    const [stats, setStats] = useState({
        totalFarmers: 12,
        activeOrders: 4,
        totalVolume: '2,400 kg',
    });

    return (
        <div className="min-h-screen bg-zinc-50 pt-24 pb-12 px-6">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Cooperative Hub</h1>
                        <p className="text-zinc-500 mt-1">Manage farmers, overview market activity, and coordinate logistics.</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex items-center gap-4">
                        <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl"><Users size={24} /></div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500">Registered Farmers</p>
                            <h3 className="text-2xl font-bold text-zinc-900">{stats.totalFarmers}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex items-center gap-4">
                        <div className="bg-blue-50 text-blue-600 p-3 rounded-xl"><Activity size={24} /></div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500">Active Negotiations</p>
                            <h3 className="text-2xl font-bold text-zinc-900">{stats.activeOrders}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex items-center gap-4">
                        <div className="bg-amber-50 text-amber-600 p-3 rounded-xl"><FileText size={24} /></div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500">Monthly Volume Managed</p>
                            <h3 className="text-2xl font-bold text-zinc-900">{stats.totalVolume}</h3>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-8 min-h-[400px] flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                        <Share2 className="text-zinc-400" size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900">Cooperative Network Analytics</h3>
                    <p className="text-zinc-500 text-sm max-w-sm mt-2">
                        Advanced analytics and logistical coordination tools for the cooperative administration will appear here.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CooperativeDashboard;
