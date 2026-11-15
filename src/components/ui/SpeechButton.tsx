"use client";

import React, { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { sound } from "@/lib/audio";

interface SpeechButtonProps {
  textToRead: string;
  label?: string;
  className?: string;
}

export const SpeechButton: React.FC<SpeechButtonProps> = ({
  textToRead,
  label = "Read Aloud",
  className = "",
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleToggle = () => {
    if (isSpeaking) {
      sound.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      sound.speak(textToRead);
      // Automatically reset state after estimated speaking duration
      const wordCount = textToRead.split(" ").length;
      const durationMs = Math.max(3000, (wordCount / 2.2) * 1000);
      setTimeout(() => {
        setIsSpeaking(false);
      }, durationMs);
    }
  };

  return (
    <button
      onClick={handleToggle}
      type="button"
      className={`inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-blue-100 hover:bg-blue-200 border-2 border-blue-400 text-blue-900 font-bold text-lg active:scale-95 transition-all shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-300 ${className}`}
      aria-label={`${label}: ${textToRead}`}
      title="Click to have this read aloud"
    >
      {isSpeaking ? (
        <>
          <VolumeX className="w-6 h-6 text-blue-800 animate-pulse" />
          <span>Stop Voice</span>
        </>
      ) : (
        <>
          <Volume2 className="w-6 h-6 text-blue-800" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
};
