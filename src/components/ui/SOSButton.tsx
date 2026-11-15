"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, PhoneCall, X } from "lucide-react";
import { sound } from "@/lib/audio";

interface SOSButtonProps {
  residentName: string;
  roomNumber: string;
  onTriggerSOS: (reason: string) => void;
}

export const SOSButton: React.FC<SOSButtonProps> = ({
  residentName,
  roomNumber,
  onTriggerSOS,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [dispatched, setDispatched] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      handleFinalDispatch();
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleOpenPrompt = () => {
    setIsOpen(true);
    setDispatched(false);
    setCountdown(3);
    sound.playAlertAlarm();
  };

  const handleCancel = () => {
    setIsOpen(false);
    setCountdown(null);
  };

  const handleFinalDispatch = () => {
    setCountdown(null);
    setDispatched(true);
    sound.playAlertAlarm();
    onTriggerSOS(`Emergency Help requested by ${residentName} in Room ${roomNumber}`);
    sound.speak("Emergency alert sent to staff and family. Help is coming.");
  };

  return (
    <>
      {/* Persistent SOS Trigger */}
      <button
        type="button"
        onClick={handleOpenPrompt}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-2xl py-5 px-6 rounded-3xl shadow-lg border-4 border-red-800 flex items-center justify-center gap-4 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-red-400"
        aria-label="Emergency Help Button"
      >
        <AlertTriangle className="w-9 h-9 animate-bounce text-yellow-300" />
        <span>EMERGENCY HELP (SOS)</span>
      </button>

      {/* High-visibility Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center border-4 border-red-600 shadow-2xl">
            {!dispatched ? (
              <>
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-300">
                  <PhoneCall className="w-10 h-10 text-red-600 animate-pulse" />
                </div>

                <h2 className="text-3xl font-black text-slate-900 mb-2">
                  Calling Facility Staff
                </h2>
                <p className="text-xl text-slate-700 mb-6 font-medium">
                  Room <strong className="text-red-700 font-bold">{roomNumber}</strong> ({residentName})
                </p>

                <div className="my-6 p-4 bg-amber-50 rounded-2xl border-2 border-amber-300">
                  <span className="text-xl font-bold text-amber-900 block mb-1">
                    Alerting in:
                  </span>
                  <span className="text-5xl font-black text-red-600">
                    {countdown}s
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={handleCancel}
                    type="button"
                    className="min-h-[64px] bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xl rounded-2xl flex items-center justify-center gap-2 border-2 border-slate-400"
                  >
                    <X className="w-6 h-6" />
                    <span>Cancel (Mistake)</span>
                  </button>
                  <button
                    onClick={handleFinalDispatch}
                    type="button"
                    className="min-h-[64px] bg-red-600 hover:bg-red-700 text-white font-extrabold text-xl rounded-2xl border-2 border-red-900"
                  >
                    Send Immediately
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-400">
                  <AlertTriangle className="w-10 h-10 text-green-700" />
                </div>
                <h2 className="text-3xl font-black text-green-800 mb-3">
                  Help Is On The Way!
                </h2>
                <p className="text-2xl text-slate-800 mb-6 font-semibold">
                  The on-duty nurse and your emergency contact have been notified.
                </p>
                <button
                  onClick={() => setIsOpen(false)}
                  type="button"
                  className="w-full min-h-[64px] bg-green-700 hover:bg-green-800 text-white font-bold text-2xl rounded-2xl"
                >
                  Close Window
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
