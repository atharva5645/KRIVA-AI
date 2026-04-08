import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import {
    Bold,
    Italic,
    Link,
    Heading,
    Quote,
    Highlighter,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Palette,
    Underline,
    Strikethrough,
} from "lucide-react";

const ToolbarButton = ({
    label,
    icon: Icon,
    isActive,
    onClick,
    tooltip,
    showTooltip,
    hideTooltip,
}) => (
    <div
        className="relative"
        onMouseEnter={() => showTooltip(label)}
        onMouseLeave={hideTooltip}
    >
        <button
            className={`h-8 w-8 flex items-center justify-center rounded-md transition-colors duration-200 ${isActive ? "bg-emerald-100 text-emerald-600" : "text-zinc-500"
                } hover:bg-zinc-100 focus:outline-none`}
            aria-label={label}
            onClick={onClick}
        >
            <Icon className="h-4 w-4" />
        </button>
        <AnimatePresence>
            {tooltip === label && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="text-nowrap font-medium absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-zinc-900 text-white text-[10px] rounded-md px-2 py-1 shadow-xl z-[100]"
                >
                    {label}
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

export const Toolbar = () => {
    const [textAlign, setTextAlign] = useState("left");
    const [activeButtons, setActiveButtons] = useState([]);
    const [tooltip, setTooltip] = useState(null);

    const toggleActiveButton = (button) => {
        setActiveButtons((prev) =>
            prev.includes(button)
                ? prev.filter((b) => b !== button)
                : [...prev, button]
        );
    };

    const showTooltip = (label) => setTooltip(label);
    const hideTooltip = () => setTooltip(null);

    return (
        <div className="flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="bg-white rounded-2xl shadow-2xl shadow-emerald-900/5 border border-zinc-100 flex items-center gap-1 p-1.5"
            >
                {/* Text Formatting Section */}
                <ToolbarButton
                    label="Bold"
                    icon={Bold}
                    isActive={activeButtons.includes("bold")}
                    onClick={() => toggleActiveButton("bold")}
                    tooltip={tooltip}
                    showTooltip={showTooltip}
                    hideTooltip={hideTooltip}
                />
                <ToolbarButton
                    label="Italic"
                    icon={Italic}
                    isActive={activeButtons.includes("italic")}
                    onClick={() => toggleActiveButton("italic")}
                    tooltip={tooltip}
                    showTooltip={showTooltip}
                    hideTooltip={hideTooltip}
                />
                <ToolbarButton
                    label="Underline"
                    icon={Underline}
                    isActive={activeButtons.includes("underline")}
                    onClick={() => toggleActiveButton("underline")}
                    tooltip={tooltip}
                    showTooltip={showTooltip}
                    hideTooltip={hideTooltip}
                />
                <ToolbarButton
                    label="Strikethrough"
                    icon={Strikethrough}
                    isActive={activeButtons.includes("strikethrough")}
                    onClick={() => toggleActiveButton("strikethrough")}
                    tooltip={tooltip}
                    showTooltip={showTooltip}
                    hideTooltip={hideTooltip}
                />

                <div className="w-px h-6 bg-zinc-100 mx-1"></div>

                <ToolbarButton
                    label="Link"
                    icon={Link}
                    isActive={activeButtons.includes("link")}
                    onClick={() => toggleActiveButton("link")}
                    tooltip={tooltip}
                    showTooltip={showTooltip}
                    hideTooltip={hideTooltip}
                />
                <ToolbarButton
                    label="Heading"
                    icon={Heading}
                    isActive={activeButtons.includes("heading")}
                    onClick={() => toggleActiveButton("heading")}
                    tooltip={tooltip}
                    showTooltip={showTooltip}
                    hideTooltip={hideTooltip}
                />
                <ToolbarButton
                    label="Quote"
                    icon={Quote}
                    isActive={activeButtons.includes("quote")}
                    onClick={() => toggleActiveButton("quote")}
                    tooltip={tooltip}
                    showTooltip={showTooltip}
                    hideTooltip={hideTooltip}
                />

                <div className="w-px h-6 bg-zinc-100 mx-1"></div>

                {/* Highlight and Color Section */}
                <ToolbarButton
                    label="Highlight"
                    icon={Highlighter}
                    isActive={activeButtons.includes("highlight")}
                    onClick={() => toggleActiveButton("highlight")}
                    tooltip={tooltip}
                    showTooltip={showTooltip}
                    hideTooltip={hideTooltip}
                />
                <ToolbarButton
                    label="Change Color"
                    icon={Palette}
                    isActive={activeButtons.includes("color")}
                    onClick={() => toggleActiveButton("color")}
                    tooltip={tooltip}
                    showTooltip={showTooltip}
                    hideTooltip={hideTooltip}
                />

                <div className="w-px h-6 bg-zinc-100 mx-1"></div>

                {/* Text Alignment Section */}
                <ToolbarButton
                    label="Align Left"
                    icon={AlignLeft}
                    isActive={textAlign === "left"}
                    onClick={() => setTextAlign("left")}
                    tooltip={tooltip}
                    showTooltip={showTooltip}
                    hideTooltip={hideTooltip}
                />
                <ToolbarButton
                    label="Align Center"
                    icon={AlignCenter}
                    isActive={textAlign === "center"}
                    onClick={() => setTextAlign("center")}
                    tooltip={tooltip}
                    showTooltip={showTooltip}
                    hideTooltip={hideTooltip}
                />
                <ToolbarButton
                    label="Align Right"
                    icon={AlignRight}
                    isActive={textAlign === "right"}
                    onClick={() => setTextAlign("right")}
                    tooltip={tooltip}
                    showTooltip={showTooltip}
                    hideTooltip={hideTooltip}
                />
            </motion.div>
        </div>
    );
};
