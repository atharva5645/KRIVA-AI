import React from 'react';
import { cn } from "../../lib/utils";
import { Link } from 'react-router-dom';

function BentoGrid({ items = [] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 max-w-7xl mx-auto mb-24 w-full relative z-10 -mt-12">
            {items.map((item, index) => (
                <Link
                    key={index}
                    to={item.href || '#'}
                    className={cn(
                        "group relative p-8 rounded-3xl overflow-hidden transition-all duration-300",
                        "border border-zinc-100 bg-white",
                        "hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-emerald-100",
                        "hover:-translate-y-1 will-change-transform",
                        item.colSpan || "col-span-1",
                        item.colSpan === 2 ? "md:col-span-2" : "",
                    )}
                >
                    <div
                        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[length:4px_4px]" />
                    </div>

                    <div className="relative flex flex-col space-y-4 h-full">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-zinc-50 text-zinc-900 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 shadow-sm border border-zinc-100 group-hover:border-emerald-500 group-hover:scale-110">
                                {item.icon}
                            </div>
                            {item.status && (
                                <span
                                    className={cn(
                                        "text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full",
                                        "bg-emerald-50 text-emerald-600 border border-emerald-100",
                                        "transition-colors duration-300"
                                    )}
                                >
                                    {item.status}
                                </span>
                            )}
                        </div>

                        <div className="space-y-3 flex-1 pt-2">
                            <h3 className="font-bold text-zinc-900 tracking-tight text-xl flex items-center">
                                {item.title}
                            </h3>
                            <p className="text-zinc-500 leading-relaxed text-sm font-medium">
                                {item.description}
                            </p>
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-50">
                            <div className="flex items-center space-x-2">
                                {(item.tags || []).map((tag, i) => (
                                    <span
                                        key={i}
                                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border border-zinc-200 text-zinc-400 bg-zinc-50 transition-all duration-200 group-hover:bg-emerald-50 group-hover:border-emerald-200 group-hover:text-emerald-700"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <span className="text-sm font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300 flex items-center gap-1">
                                {item.cta || "Access Hub"}
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                            </span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}

export { BentoGrid }
