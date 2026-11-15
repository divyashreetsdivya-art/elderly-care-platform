import React from "react";
import { sound } from "@/lib/audio";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "success" | "warning" | "danger" | "outline" | "ghost";
  size?: "elder" | "standard" | "sm";
  playChime?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "elder",
  playChime = false,
  className = "",
  onClick,
  children,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (playChime) {
      sound.playSuccessChime();
    }
    if (onClick) {
      onClick(e);
    }
  };

  const baseStyles =
    "font-bold rounded-2xl transition-all duration-150 flex items-center justify-center gap-3 focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

  const sizeStyles = {
    elder: "min-h-[68px] px-8 text-xl sm:text-2xl tracking-wide shadow-md",
    standard: "min-h-[50px] px-5 text-lg shadow-sm",
    sm: "min-h-[40px] px-4 text-base",
  };

  const variantStyles = {
    primary:
      "bg-senior-primary hover:bg-senior-primaryHover text-white focus:ring-blue-400 border-2 border-blue-800 shadow-blue-900/20",
    success:
      "bg-senior-success hover:bg-senior-successHover text-white focus:ring-green-400 border-2 border-green-800 shadow-green-900/20",
    warning:
      "bg-senior-warning hover:bg-senior-warningHover text-white focus:ring-amber-400 border-2 border-amber-800 shadow-amber-900/20",
    danger:
      "bg-senior-alert hover:bg-senior-alertHover text-white focus:ring-red-400 border-2 border-red-800 shadow-red-900/20",
    outline:
      "bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 focus:ring-slate-400",
    ghost:
      "bg-transparent hover:bg-slate-100 text-slate-700 border-2 border-transparent focus:ring-slate-300",
  };

  return (
    <button
      onClick={handleClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
