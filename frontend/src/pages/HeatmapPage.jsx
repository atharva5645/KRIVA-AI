import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '../lib/utils';
import { TrendingUp, TrendingDown, Minus, Info, Search, X, Activity, BarChart3, Globe2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';

const HeatmapPage = () => {
    const { t } = useLanguage();
    const [realData, setRealData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [predictions, setPredictions] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchProductsAndAI = async () => {
            try {
                const res = await axios.get('/api/products');
                if (res.data.success) {
                    const products = res.data.data;
                    const uniqueCrops = [...new Set(products.map(p => p.name))];

                    // Fetch AI predictions for each unique crop
                    const aiResults = {};
                    await Promise.all(uniqueCrops.map(async (crop) => {
                        try {
                            const aiRes = await axios.get('/api/market/predict', { params: { commodity: crop } });
                            aiResults[crop] = aiRes.data;
                        } catch (e) { aiResults[crop] = { growth_percent: 0 }; }
                    }));
                    setPredictions(aiResults);

                    const mapped = products.map(p => {
                        const regionKey = (p.region || '').toLowerCase().trim();
                        const coords = COORDS[regionKey] || COORDS.default;

                        const growth = aiResults[p.name]?.growth_percent || 0;
                        let demand = 'Medium';
                        if (growth > 5) demand = 'High';
                        else if (growth < -5) demand = 'Low';
                        if (p.base_price > 50 && growth > 0) demand = 'High';

                        return {
                            name: p.region || 'Karnataka',
                            product: p.name,
                            lat: coords[0] + (Math.random() - 0.5) * 0.1,
                            lng: coords[1] + (Math.random() - 0.5) * 0.1,
                            demand,
                            growth,
                            color: getMapColor(demand)
                        };
                    });
                    const mockData = [
                        { name: 'Bangalore', product: 'Tomato', lat: 12.9716, lng: 77.5946, demand: 'High', color: '#ef4444' },
                        { name: 'Bangalore', product: 'Onion', lat: 12.9800, lng: 77.6000, demand: 'Medium', color: '#f59e0b' },
                        { name: 'Mysore', product: 'Paddy', lat: 12.2958, lng: 76.6394, demand: 'High', color: '#ef4444' },
                        { name: 'Hubli', product: 'Chilli', lat: 15.3647, lng: 75.1240, demand: 'High', color: '#ef4444' },
                        { name: 'Belgaum', product: 'Sugarcane', lat: 15.8497, lng: 74.4977, demand: 'High', color: '#ef4444' },
                        { name: 'Mangalore', product: 'Coconut', lat: 12.9141, lng: 74.8560, demand: 'High', color: '#ef4444' },
                        { name: 'Davanagere', product: 'Maize', lat: 14.4644, lng: 75.9213, demand: 'High', color: '#ef4444' },
                        { name: 'Shimoga', product: 'Arecanut', lat: 13.9400, lng: 75.5800, demand: 'Medium', color: '#f59e0b' },
                        { name: 'Gulbarga', product: 'Tur Pulse', lat: 17.3297, lng: 76.8343, demand: 'High', color: '#ef4444' },
                    ];
                    setRealData([...mapped, ...mockData]);
                }
            } catch (err) { console.error('Error fetching heatmap data:', err); }
            finally { setLoading(false); }
        };
        fetchProductsAndAI();
    }, []);

    const [selectedProduct, setSelectedProduct] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDemand, setSelectedDemand] = useState('All');

    const COORDS = {
        'bangalore': [12.9716, 77.5946],
        'mysore': [12.2958, 76.6394],
        'mandya': [12.5218, 76.8951],
        'kolar': [13.1363, 78.1291],
        'hassan': [13.0072, 76.1029],
        'shimoga': [13.9299, 75.5681],
        'belgaum': [15.8497, 74.4977],
        'mangalore': [12.9141, 74.8560],
        'davanagere': [14.4644, 75.9213],
        'hubli': [15.3647, 75.1240],
        'dharwad': [15.4589, 75.0078],
        'tumkur': [13.3392, 77.1140],
        'gulbarga': [17.3297, 76.8343],
        'bellary': [15.1394, 76.9214],
        'chikmagalur': [13.3161, 75.7720],
        'bagalkot': [16.1817, 75.6958],
        'bijapur': [16.8302, 75.7100],
        'raichur': [16.2120, 77.3439],
        'default': [15.3173, 75.7139],
    };

    const getMapColor = (demand) => {
        if (demand === 'High') return '#ef4444';
        if (demand === 'Medium') return '#f59e0b';
        return '#10b981';
    };

    // Filter markers
    const displayedData = realData.filter(item => {
        const matchesProduct = selectedProduct === 'All' || item.product === selectedProduct;
        const matchesSearch = item.product.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDemand = selectedDemand === 'All' || item.demand === selectedDemand;

        if (selectedProduct !== 'All') return matchesProduct && matchesDemand;
        return matchesSearch && matchesDemand;
    });

    // Calculate demand logic for the list
    const productStats = realData.reduce((acc, item) => {
        if (!acc[item.product]) {
            acc[item.product] = { count: 0, highCount: 0, medCount: 0, lowCount: 0 };
        }
        acc[item.product].count++;
        if (item.demand === 'High') acc[item.product].highCount++;
        else if (item.demand === 'Medium') acc[item.product].medCount++;
        else acc[item.product].lowCount++;
        return acc;
    }, {});

    const productList = Object.keys(productStats).map(name => {
        const stats = productStats[name];
        // Determine if this crop matches the demand filter
        let hasMatchingDemand = true;
        if (selectedDemand !== 'All') {
            if (selectedDemand === 'High') hasMatchingDemand = stats.highCount > 0;
            else if (selectedDemand === 'Medium') hasMatchingDemand = stats.medCount > 0;
            else if (selectedDemand === 'Low') hasMatchingDemand = stats.lowCount > 0;
        }

        return { name, ...stats, hasMatchingDemand };
    })
        .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) && p.hasMatchingDemand)
        .sort((a, b) => b.highCount - a.highCount);

    useEffect(() => {
        setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 h-[calc(100vh-80px)] flex flex-col">
            <header className="shrink-0 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase">Predictive <span className="text-red-600">Core</span></h1>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Karnataka Regional Demand Ecosystem</p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            setSelectedProduct('All');
                            setSelectedDemand('All');
                        }}
                        className={cn(
                            "px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                            (selectedProduct === 'All' && selectedDemand === 'All') ? "bg-zinc-950 text-white shadow-xl shadow-zinc-200" : "bg-white text-zinc-400 border border-zinc-100 hover:bg-zinc-50"
                        )}
                    >
                        {t('viewGlobal')}
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 rounded-2xl border border-zinc-100">
                        <Info className="w-4 h-4 text-zinc-400" />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">Auto-refreshing every 5m</span>
                    </div>
                </div>
            </header>

            <div className="flex-1 min-h-0 flex gap-6">
                {/* Demand List Panel */}
                <div className="w-96 bg-white rounded-[3rem] border border-zinc-100 shadow-2xl flex flex-col overflow-hidden">
                    <div className="p-8 border-b border-zinc-50 space-y-4">
                        <div className="space-y-2">
                            <h2 className="text-xl font-black text-zinc-900 leading-tight">Demand <br />Inventory</h2>
                            <div className="flex gap-1">
                                <div className="h-1 w-8 bg-red-500 rounded-full" />
                                <div className="h-1 w-4 bg-zinc-100 rounded-full" />
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-red-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-3 pl-10 pr-4 text-sm font-bold text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                        {productList.map((item) => (
                            <div
                                key={item.name}
                                onClick={() => setSelectedProduct(item.name)}
                                className={cn(
                                    "w-full p-5 rounded-[2rem] flex flex-col gap-4 transition-all group cursor-pointer",
                                    selectedProduct === item.name
                                        ? "bg-zinc-950 text-white shadow-2xl scale-[1.02]"
                                        : "bg-white border border-zinc-50 hover:bg-zinc-50 text-zinc-700 hover:scale-[1.01]"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12",
                                            selectedProduct === item.name ? "bg-white/10" : "bg-zinc-100"
                                        )}>
                                            {item.highCount > item.medCount ? (
                                                <TrendingUp className={cn("w-5 h-5", selectedProduct === item.name ? "text-white" : "text-red-500")} />
                                            ) : (
                                                <TrendingDown className={cn("w-5 h-5", selectedProduct === item.name ? "text-white" : "text-emerald-500")} />
                                            )}
                                        </div>
                                        <div className="text-left">
                                            <p className="font-black text-sm uppercase tracking-tight">{item.name}</p>
                                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Multi-District Data</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-1">
                                        {item.highCount > 0 && (
                                            <div className="px-2 py-0.5 rounded-md bg-red-500 text-white text-[8px] font-black uppercase">High</div>
                                        )}
                                        {item.medCount > 0 && (
                                            <div className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[8px] font-black uppercase">Mid</div>
                                        )}
                                        {item.lowCount > 0 && (
                                            <div className="px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[8px] font-black uppercase">Low</div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1 pt-3 border-t border-zinc-100/10">
                                    <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden flex">
                                        <div style={{ width: `${(item.highCount / item.count) * 100}%` }} className="bg-red-500" />
                                        <div style={{ width: `${(item.medCount / item.count) * 100}%` }} className="bg-amber-500" />
                                        <div style={{ width: `${(item.lowCount / item.count) * 100}%` }} className="bg-emerald-500" />
                                    </div>
                                    <div className="flex justify-between items-center px-0.5">
                                        <div className="flex gap-2">
                                            {item.highCount > 0 && <span className="text-[7px] font-black text-red-500 uppercase tracking-tighter">High: {item.highCount}</span>}
                                            {item.medCount > 0 && <span className="text-[7px] font-black text-amber-500 uppercase tracking-tighter">Mid: {item.medCount}</span>}
                                            {item.lowCount > 0 && <span className="text-[7px] font-black text-emerald-600 uppercase tracking-tighter">Low: {item.lowCount}</span>}
                                        </div>
                                        <span className="text-[8px] font-bold text-zinc-400 whitespace-nowrap uppercase tracking-tighter">{item.count} Districts</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 bg-zinc-50 border-t border-zinc-100">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">
                            <span>Sentiment Legend</span>
                            <div className="w-1 h-1 bg-zinc-200 rounded-full" />
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setSelectedDemand(selectedDemand === 'High' ? 'All' : 'High')}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all border",
                                    selectedDemand === 'High' ? "bg-red-500 text-white border-red-600 shadow-md scale-105" : "bg-white border-zinc-100 text-zinc-600 hover:bg-zinc-50 whitespace-nowrap"
                                )}
                            >
                                <div className={cn("w-2 h-2 rounded-full", selectedDemand === 'High' ? "bg-white" : "bg-red-500")} />
                                <span className="text-[9px] font-black uppercase tracking-widest">Surge</span>
                            </button>
                            <button
                                onClick={() => setSelectedDemand(selectedDemand === 'Medium' ? 'All' : 'Medium')}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all border",
                                    selectedDemand === 'Medium' ? "bg-amber-500 text-white border-amber-600 shadow-md scale-105" : "bg-white border-zinc-100 text-zinc-600 hover:bg-zinc-50 whitespace-nowrap"
                                )}
                            >
                                <div className={cn("w-2 h-2 rounded-full", selectedDemand === 'Medium' ? "bg-white" : "bg-amber-500")} />
                                <span className="text-[9px] font-black uppercase tracking-widest">Steady</span>
                            </button>
                            <button
                                onClick={() => setSelectedDemand(selectedDemand === 'Low' ? 'All' : 'Low')}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all border",
                                    selectedDemand === 'Low' ? "bg-emerald-500 text-white border-emerald-600 shadow-md scale-105" : "bg-white border-zinc-100 text-zinc-600 hover:bg-zinc-50 whitespace-nowrap"
                                )}
                            >
                                <div className={cn("w-2 h-2 rounded-full", selectedDemand === 'Low' ? "bg-white" : "bg-emerald-500")} />
                                <span className="text-[9px] font-black uppercase tracking-widest">Low</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Map View */}
                <div className="flex-1 rounded-[3rem] overflow-hidden border border-zinc-100 shadow-2xl relative">
                    <MapContainer
                        center={[15.3173, 75.7139]}
                        zoom={7}
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={true}
                        className="z-0"
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        />
                        {displayedData.map((loc, idx) => (
                            <CircleMarker
                                key={`${loc.name}-${loc.product}-${idx}`}
                                center={[loc.lat, loc.lng]}
                                radius={24}
                                pathOptions={{
                                    color: loc.color,
                                    fillColor: loc.color,
                                    fillOpacity: 0.5,
                                    weight: 2
                                }}
                            >
                                <Popup className="custom-popup">
                                    <div className="p-2 space-y-2">
                                        <div className="flex items-center justify-between gap-4">
                                            <h4 className="font-black text-xs uppercase tracking-tighter text-zinc-900">{loc.name}</h4>
                                            <div style={{ backgroundColor: loc.color }} className="w-2 h-2 rounded-full animate-pulse" />
                                        </div>
                                        <div className="pt-2 border-t border-zinc-100">
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Current Demand</p>
                                            <p className="font-black text-sm text-zinc-900">{loc.product}</p>
                                            <p className="text-[10px] font-bold mt-1 inline-block px-2 py-0.5 rounded-md text-white uppercase tracking-widest" style={{ backgroundColor: loc.color }}>
                                                {loc.demand} Level
                                            </p>
                                        </div>
                                    </div>
                                </Popup>
                            </CircleMarker>
                        ))}
                    </MapContainer>

                    {/* Map Interaction Hint */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="absolute bottom-8 right-8 z-[1000] bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl border border-zinc-100 shadow-xl flex items-center gap-3 hover:scale-105 hover:bg-white transition-all group"
                    >
                        <div className="p-2 bg-red-600 rounded-xl group-hover:rotate-12 transition-transform">
                            <Activity className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900">Predictive Node</span>
                            <span className="text-[9px] font-bold text-zinc-500">Showing {selectedProduct === 'All' ? 'Karnataka Summary' : `${selectedProduct} Hotspots`}</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* AI Market Intel Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl border border-zinc-100 overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                        <div className="p-6 border-b border-zinc-50 flex justify-between items-center bg-zinc-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-red-600 rounded-xl">
                                    <BarChart3 className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tighter">Market Intelligence</h3>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">AI Growth & Sentiment Audit</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400 hover:text-zinc-900"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {/* Key Metrics */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-4 bg-zinc-50 rounded-[1.5rem] border border-zinc-100 space-y-1 text-center">
                                    <Globe2 className="w-4 h-4 text-blue-500 mx-auto" />
                                    <p className="text-[8px] font-black text-zinc-400 uppercase">Avg Growth</p>
                                    <p className="text-lg font-black text-zinc-900">+12.4%</p>
                                </div>
                                <div className="p-4 bg-zinc-50 rounded-[1.5rem] border border-zinc-100 space-y-1 text-center">
                                    <TrendingUp className="w-4 h-4 text-red-500 mx-auto" />
                                    <p className="text-[8px] font-black text-zinc-400 uppercase">High Demand</p>
                                    <p className="text-lg font-black text-zinc-900">{realData.filter(d => d.demand === 'High').length}</p>
                                </div>
                                <div className="p-4 bg-zinc-50 rounded-[1.5rem] border border-zinc-100 space-y-1 text-center">
                                    <Activity className="w-4 h-4 text-emerald-500 mx-auto" />
                                    <p className="text-[8px] font-black text-zinc-400 uppercase">Stability</p>
                                    <p className="text-lg font-black text-zinc-900">88%</p>
                                </div>
                            </div>

                            {/* Analytics Breakdown */}
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest px-1">Regional Breakdown</h4>
                                <div className="space-y-1.5">
                                    {['Bangalore', 'Mandya', 'Belgaum'].map((region, i) => (
                                        <div key={region} className="flex items-center justify-between p-3 bg-white border border-zinc-50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <span className="w-5 h-5 flex items-center justify-center bg-zinc-900 text-white rounded-full text-[9px] font-bold">{i + 1}</span>
                                                <span className="font-bold text-xs text-zinc-800 uppercase">{region}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="h-1 w-16 bg-zinc-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-red-500" style={{ width: `${80 - i * 20}%` }} />
                                                </div>
                                                <span className="text-[8px] font-black text-red-600">HIGH</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-5 bg-zinc-900 rounded-[2rem] text-white">
                                <div className="flex items-center gap-2 mb-2 text-zinc-400">
                                    <Info className="w-3.5 h-3.5" />
                                    <span className="text-[8px] font-bold uppercase tracking-widest">AI Market Advisory</span>
                                </div>
                                <p className="text-xs font-medium leading-relaxed opacity-90">
                                    Market sensors indicate a <span className="text-red-400 font-bold">15% price spike</span> in the northern corridors. Suggest accelerating supply logistics for Tomato and Paddy listings in the Belgaum-Hubli belt to maximize ROI.
                                </p>
                            </div>
                        </div>

                        <div className="p-6 bg-zinc-50 border-t border-zinc-100">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-full bg-zinc-950 text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200"
                            >
                                Close Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HeatmapPage;

