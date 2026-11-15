import React from "react";
import { PillColor, PillShape } from "@/types";

interface PillBadgeProps {
  color: PillColor;
  shape: PillShape;
  size?: "lg" | "md" | "sm";
  showLabel?: boolean;
}

export const PillBadge: React.FC<PillBadgeProps> = ({
  color,
  shape,
  size = "lg",
  showLabel = true,
}) => {
  const colorMap: Record<PillColor, { bg: string; border: string; text: string }> = {
    blue: { bg: "bg-blue-500", border: "border-blue-700", text: "text-blue-900" },
    white: { bg: "bg-white", border: "border-slate-400", text: "text-slate-800" },
    red: { bg: "bg-red-500", border: "border-red-700", text: "text-red-900" },
    yellow: { bg: "bg-yellow-400", border: "border-yellow-600", text: "text-amber-950" },
    orange: { bg: "bg-orange-500", border: "border-orange-700", text: "text-orange-950" },
    green: { bg: "bg-emerald-500", border: "border-emerald-700", text: "text-emerald-950" },
    pink: { bg: "bg-pink-400", border: "border-pink-600", text: "text-pink-950" },
    purple: { bg: "bg-purple-500", border: "border-purple-700", text: "text-purple-950" },
  };

  const shapeStyles: Record<PillShape, string> = {
    round: "rounded-full",
    oval: "rounded-[40px] aspect-[1.8/1]",
    capsule: "rounded-full aspect-[2.2/1]",
    square: "rounded-lg aspect-square",
    drop: "rounded-t-full rounded-b-[40%] aspect-[1/1.3]",
  };

  const sizeDimensions = {
    lg: "w-16 h-16 min-w-16",
    md: "w-11 h-11 min-w-11",
    sm: "w-7 h-7 min-w-7",
  };

  const chosenColor = colorMap[color] || colorMap.white;

  return (
    <div className="inline-flex items-center gap-3">
      <div
        className={`inline-flex items-center justify-center border-4 shadow-sm ${chosenColor.bg} ${chosenColor.border} ${shapeStyles[shape]} ${sizeDimensions[size]}`}
        aria-label={`${color} ${shape} pill`}
      >
        {/* Subtle 3D score line across the pill */}
        <div className="w-1/2 h-[2px] bg-black/20 rounded-full" />
      </div>

      {showLabel && (
        <span className="font-bold text-slate-800 text-lg capitalize tracking-wide">
          {color} {shape}
        </span>
      )}
    </div>
  );
};
