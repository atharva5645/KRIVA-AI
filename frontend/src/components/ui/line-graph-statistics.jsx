import React, { useState, useEffect } from 'react';

const LineGraphStatistics = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('Last 30 days');
    const [hoveredPoint, setHoveredPoint] = useState(null);
    const [animationPhase, setAnimationPhase] = useState(0);
    const [chartVisible, setChartVisible] = useState(false);

    const data = {
        'Last 3 months': {
            dates: ['Jun 1', 'Jun 3', 'Jun 5', 'Jun 7', 'Jun 9', 'Jun 12', 'Jun 15', 'Jun 18', 'Jun 21', 'Jun 24', 'Jun 27', 'Jun 30'],
            mobile: [29, 27, 31, 28, 26, 35, 32, 34, 40, 37, 42, 48],
            desktop: [20, 18, 22, 25, 23, 28, 26, 27, 30, 28, 31, 32],
            peak: 48,
            average: 31,
            growth: '+15%'
        },
        'Last 30 days': {
            dates: ['Jun 1', 'Jun 3', 'Jun 5', 'Jun 7', 'Jun 9', 'Jun 12', 'Jun 15', 'Jun 18', 'Jun 21', 'Jun 24', 'Jun 27', 'Jun 30'],
            mobile: [29, 27, 31, 28, 26, 35, 32, 34, 40, 37, 42, 48],
            desktop: [20, 18, 22, 25, 23, 28, 26, 27, 30, 28, 31, 32],
            peak: 48,
            average: 31,
            growth: '+12%'
        },
        'Last 7 days': {
            dates: ['Jun 24', 'Jun 25', 'Jun 26', 'Jun 27', 'Jun 28', 'Jun 29', 'Jun 30'],
            mobile: [37, 42, 38, 45, 48, 52, 55],
            desktop: [28, 31, 29, 34, 32, 36, 38],
            peak: 55,
            average: 45,
            growth: '+18%'
        }
    };

    const currentData = data[selectedPeriod];
    const maxValue = Math.max(...currentData.mobile, ...currentData.desktop) * 1.1;

    const generateSmoothPath = (values, height = 300, isArea = false) => {
        const width = 800;
        const padding = 60;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        const points = values.map((value, index) => ({
            x: padding + (index / (values.length - 1)) * chartWidth,
            y: padding + (1 - value / maxValue) * chartHeight
        }));

        if (points.length < 2) return '';

        let path = `M ${points[0].x},${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const next = points[i + 1];
            const cp1x = prev.x + (curr.x - prev.x) * 0.5;
            const cp1y = prev.y;
            const cp2x = curr.x - (next ? (next.x - curr.x) * 0.3 : 0);
            const cp2y = curr.y;
            path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${curr.x},${curr.y}`;
        }

        if (isArea) {
            path += ` L ${points[points.length - 1].x},${height - padding} L ${padding},${height - padding} Z`;
        }
        return path;
    };

    useEffect(() => {
        setChartVisible(false);
        setAnimationPhase(0);
        const timers = [
            setTimeout(() => setAnimationPhase(1), 100),
            setTimeout(() => setAnimationPhase(2), 400),
            setTimeout(() => setAnimationPhase(3), 800),
            setTimeout(() => setChartVisible(true), 1200)
        ];
        return () => timers.forEach(clearTimeout);
    }, [selectedPeriod]);

    const periods = [
        { label: 'Last 3 months', size: '2.32 KB', color: 'bg-emerald-500' },
        { label: 'Last 30 days', size: '1.45 KB', color: 'bg-blue-500' },
        { label: 'Last 7 days', size: '0.89 KB', color: 'bg-amber-500' }
    ];

    const metrics = [
        { label: 'Peak Prediction', value: `₹${currentData.peak}/kg`, color: 'border-blue-500' },
        { label: 'Market Average', value: `₹${currentData.average}/kg`, color: 'border-amber-500' },
        { label: 'Market Growth', value: currentData.growth, color: 'border-emerald-500' }
    ];

    return (
        <div className="bg-white/80 p-12">
            <div className="mb-16">
                <h1 className={`text-5xl font-extralight text-zinc-900 mb-4 tracking-tight transition-all duration-1000 ${animationPhase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    Market Growth <span className="font-semibold text-blue-600">Analytics</span>
                </h1>
                <p className={`text-lg text-zinc-500 font-light transition-all duration-1000 delay-200 ${animationPhase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    Daily price fluctuations and growth trends for the selected period.
                </p>
            </div>

            <div className="relative bg-white rounded-3xl overflow-hidden border border-zinc-100 shadow-2xl shadow-zinc-200/40">
                <div className="absolute top-8 left-8 z-10 flex gap-8">
                    <div className={`flex items-center gap-2 transition-all duration-800 delay-300 ${animationPhase >= 2 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                        <div className="w-3 h-3 rounded-full border-2 border-blue-500 bg-blue-50"></div>
                        <span className="text-zinc-600 font-medium text-sm">Real-time</span>
                        <span className="text-zinc-900 font-bold">₹{currentData.mobile[currentData.mobile.length - 1]}</span>
                    </div>
                    <div className={`flex items-center gap-2 transition-all duration-800 delay-400 ${animationPhase >= 2 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                        <div className="w-3 h-3 rounded-full border-2 border-zinc-400 bg-zinc-50"></div>
                        <span className="text-zinc-600 font-medium text-sm">Previous</span>
                        <span className="text-zinc-900 font-bold">₹{currentData.desktop[currentData.desktop.length - 1]}</span>
                    </div>
                </div>

                <div className="absolute top-8 right-8 z-10 flex flex-col gap-2">
                    {periods.map((period, index) => (
                        <button
                            key={period.label}
                            className={`
                  cursor-pointer transition-all duration-700 hover:scale-105 px-4 py-2 rounded-xl text-left min-w-[140px]
                  ${selectedPeriod === period.label ? 'bg-zinc-900 text-white shadow-xl' : 'bg-zinc-50 text-zinc-600 border border-zinc-100'}
                  ${animationPhase >= 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
                `}
                            style={{ transitionDelay: `${500 + index * 150}ms` }}
                            onClick={() => setSelectedPeriod(period.label)}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <div className={`w-2 h-2 rounded-full ${period.color}`}></div>
                                <span className="text-[10px] font-bold opacity-50 uppercase tracking-tighter">Period</span>
                            </div>
                            <div className="text-xs font-semibold">{period.label}</div>
                        </button>
                    ))}
                </div>

                <div className="p-8 pt-20 pb-16">
                    <div className="h-96 relative">
                        <svg className="w-full h-full" viewBox="0 0 800 400">
                            <defs>
                                <linearGradient id="blue-grad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            
                            {/* Grid Lines and Y-Axis Labels */}
                            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                                const yPos = 60 + (340 - 120) * ratio;
                                const value = maxValue * (1 - ratio);
                                return (
                                    <g key={ratio} className={`transition-all duration-1000 delay-500 ${chartVisible ? 'opacity-100' : 'opacity-0'}`}>
                                        <line x1="60" y1={yPos} x2="740" y2={yPos} stroke="#f4f4f5" strokeWidth="1" />
                                        <text x="50" y={yPos} textAnchor="end" alignmentBaseline="middle" className="text-[10px] fill-zinc-400 font-medium">₹{Math.round(value)}</text>
                                    </g>
                                );
                            })}

                            {/* X-Axis Labels */}
                            {currentData.dates.map((date, index) => {
                                // Show fewer labels if too many points to avoid crowding
                                if (currentData.dates.length > 7 && index % 2 !== 0 && index !== currentData.dates.length - 1) return null;
                                const xPos = 60 + (index / (currentData.dates.length - 1)) * 680;
                                return (
                                    <g key={index} className={`transition-all duration-1000 delay-700 ${chartVisible ? 'opacity-100' : 'opacity-0'}`}>
                                        <text x={xPos} y="310" textAnchor="middle" className="text-[10px] fill-zinc-400 font-medium">{date}</text>
                                    </g>
                                );
                            })}

                            <path
                                d={generateSmoothPath(currentData.desktop, 340, true)}
                                fill="rgba(113, 113, 122, 0.03)"
                                className={`transition-all duration-2000 ${chartVisible ? 'opacity-100' : 'opacity-0'}`}
                            />
                            <path
                                d={generateSmoothPath(currentData.mobile, 340, true)}
                                fill="url(#blue-grad)"
                                className={`transition-all duration-2000 ${chartVisible ? 'opacity-100' : 'opacity-0'}`}
                            />
                            <path
                                d={generateSmoothPath(currentData.desktop, 340)}
                                fill="none"
                                stroke="#a1a1aa"
                                strokeWidth="2"
                                strokeDasharray="4 4"
                                className={`transition-all duration-2000 ${chartVisible ? 'opacity-100' : 'opacity-0'}`}
                            />
                            <path
                                d={generateSmoothPath(currentData.mobile, 340)}
                                fill="none"
                                stroke="#3b82f6"
                                strokeWidth="3"
                                className={`transition-all duration-2000 ${chartVisible ? 'opacity-100' : 'opacity-0'}`}
                            />
                        </svg>
                    </div>
                </div>

                <div className="px-8 pb-8 flex justify-between items-center bg-zinc-50/50 py-8 border-t border-zinc-50">
                    <div className="flex gap-4">
                        {metrics.map((metric, index) => (
                            <div
                                key={metric.label}
                                className={`bg-white rounded-2xl border-b-4 ${metric.color} p-5 min-w-[140px] shadow-sm transition-all duration-800 ${animationPhase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                                style={{ transitionDelay: `${1800 + index * 200}ms` }}
                            >
                                <div className="text-xl font-bold text-zinc-900 mb-1">{metric.value}</div>
                                <div className="text-xs text-zinc-400 font-medium uppercase tracking-wider">{metric.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LineGraphStatistics;
