"use client";

import React, { useState } from "react";
import { CheckCircle2, Clock, Calendar, Sparkles, Smile, Meh, Frown, Utensils } from "lucide-react";
import { Resident, DoseLog } from "@/types";
import { PillBadge } from "@/components/ui/PillBadge";
import { SpeechButton } from "@/components/ui/SpeechButton";
import { SOSButton } from "@/components/ui/SOSButton";
import { Button } from "@/components/ui/Button";
import { sound } from "@/lib/audio";

interface SeniorPortalProps {
  resident: Resident;
  doseLogs: DoseLog[];
  onTakeDose: (doseId: string) => void;
  onSnoozeDose: (doseId: string) => void;
  onTriggerSOS: (reason: string) => void;
}

export const SeniorPortal: React.FC<SeniorPortalProps> = ({
  resident,
  doseLogs,
  onTakeDose,
  onSnoozeDose,
  onTriggerSOS,
}) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [successAnimation, setSuccessAnimation] = useState(false);

  // Find the next due or pending dose
  const nextDose = doseLogs.find((d) => d.status === "PENDING" || d.status === "SNOOZED");
  const completedDoses = doseLogs.filter((d) => d.status === "TAKEN");

  const handleTakePill = (doseId: string) => {
    sound.playSuccessChime();
    setSuccessAnimation(true);
    onTakeDose(doseId);
    sound.speak("Good job! You have logged this medication.");
    setTimeout(() => setSuccessAnimation(false), 3000);
  };

  const handleSnoozePill = (doseId: string) => {
    sound.playReminderChime();
    onSnoozeDose(doseId);
    sound.speak("We will remind you again in 15 minutes.");
  };

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
    sound.playReminderChime();
    sound.speak(`Thank you, ${resident.preferredName}. We noted that you feel ${mood}.`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12 animate-fade-in">
      {/* Friendly Header with Large Clock & Date */}
      <header className="bg-white p-6 sm:p-8 rounded-3xl border-4 border-slate-200 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xl font-bold text-slate-500 flex items-center gap-2 mb-1">
              <Calendar className="w-6 h-6 text-senior-primary" />
              Room {resident.roomNumber} &bull; {resident.wing}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Good Morning, {resident.preferredName} {resident.avatar}
            </h1>
          </div>
          <div className="bg-blue-50 px-5 py-3 rounded-2xl border-2 border-blue-200 text-center w-full sm:w-auto">
            <span className="text-sm font-bold text-blue-900 uppercase tracking-widest block">
              Today&apos;s Status
            </span>
            <span className="text-2xl font-black text-senior-primary">
              {completedDoses.length} of {doseLogs.length} Taken
            </span>
          </div>
        </div>
      </header>

      {/* SUCCESS BANNER */}
      {successAnimation && (
        <div className="p-6 bg-emerald-600 text-white rounded-3xl text-center shadow-xl border-4 border-emerald-800 animate-bounce">
          <div className="flex items-center justify-center gap-3 text-3xl font-black mb-1">
            <Sparkles className="w-8 h-8 text-yellow-300" />
            <span>Pill Logged Successfully!</span>
            <Sparkles className="w-8 h-8 text-yellow-300" />
          </div>
          <p className="text-xl text-emerald-100 font-semibold">
            Thank you, {resident.preferredName}. Your caregiver has been notified.
          </p>
        </div>
      )}

      {/* HERO SECTION: RIGHT NOW FOCUS CARD */}
      <section aria-labelledby="current-dose-title">
        <h2 id="current-dose-title" className="text-2xl font-black text-slate-800 mb-3 flex items-center gap-3">
          <Clock className="w-7 h-7 text-senior-primary" />
          <span>Medication Due Right Now</span>
        </h2>

        {nextDose ? (
          <div className="bg-white rounded-3xl border-4 border-blue-600 p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-600 text-white font-extrabold text-lg px-6 py-2 rounded-bl-2xl">
              Due at {nextDose.scheduledTime}
            </div>

            <div className="mt-4 sm:mt-2 space-y-6">
              {/* Medication Visual & Name */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-200 pb-6">
                <div>
                  <span className="text-lg font-bold text-blue-700 tracking-wide uppercase">
                    {nextDose.periodName} Dose
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-black text-slate-950 mt-1">
                    {nextDose.medication.name} ({nextDose.medication.dosage})
                  </h3>
                  <p className="text-xl text-slate-600 font-medium mt-1">
                    For: <strong className="text-slate-900">{nextDose.medication.prescribedFor}</strong>
                  </p>
                </div>

                {/* Pill depiction with shape and color */}
                <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-300 flex flex-col items-center">
                  <span className="text-sm font-bold text-slate-600 uppercase mb-2">What it looks like:</span>
                  <PillBadge
                    color={nextDose.medication.pillColor}
                    shape={nextDose.medication.pillShape}
                    size="lg"
                    showLabel
                  />
                </div>
              </div>

              {/* Clear Plain-Language Instructions */}
              <div className="bg-amber-50 p-5 rounded-2xl border-2 border-amber-300 flex items-start gap-4">
                <Utensils className="w-8 h-8 text-amber-800 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h4 className="text-xl font-black text-amber-950 mb-1">How to take this:</h4>
                  <p className="text-2xl text-slate-900 font-bold leading-relaxed">
                    {nextDose.medication.instructions}
                  </p>
                </div>
              </div>

              {/* Read Aloud Button */}
              <div className="flex justify-end">
                <SpeechButton
                  textToRead={`It is time for your ${nextDose.periodName} medicine: ${nextDose.medication.name}, ${nextDose.medication.dosage}. ${nextDose.medication.instructions}`}
                  label="Listen to Instructions"
                />
              </div>

              {/* GIANT ACTION BUTTONS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <Button
                  variant="success"
                  size="elder"
                  onClick={() => handleTakePill(nextDose.id)}
                  className="w-full"
                >
                  <CheckCircle2 className="w-8 h-8 text-white" />
                  <span>I TOOK THIS PILL</span>
                </Button>

                <Button
                  variant="warning"
                  size="elder"
                  onClick={() => handleSnoozePill(nextDose.id)}
                  className="w-full"
                >
                  <Clock className="w-7 h-7 text-white" />
                  <span>REMIND ME IN 15 MIN</span>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 rounded-3xl border-4 border-emerald-500 p-8 text-center shadow-md">
            <CheckCircle2 className="w-20 h-20 text-emerald-600 mx-auto mb-3" />
            <h3 className="text-3xl font-black text-emerald-950 mb-2">
              All Caught Up For Now!
            </h3>
            <p className="text-2xl text-emerald-900 font-semibold">
              You have taken all scheduled medications up to this time. Wonderful job!
            </p>
          </div>
        )}
      </section>

      {/* TODAY'S MEDICINE TIMELINE / CHECKLIST */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border-4 border-slate-200 shadow-md">
        <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
          <Calendar className="w-7 h-7 text-senior-primary" />
          <span>Today&apos;s Medication Schedule</span>
        </h2>

        <div className="space-y-4">
          {doseLogs.map((dose) => {
            const isTaken = dose.status === "TAKEN";
            const isPending = dose.status === "PENDING" || dose.status === "SNOOZED";

            return (
              <div
                key={dose.id}
                className={`p-5 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  isTaken
                    ? "bg-emerald-50/70 border-emerald-300"
                    : isPending
                    ? "bg-slate-50 border-slate-300"
                    : "bg-red-50 border-red-300"
                }`}
              >
                <div className="flex items-center gap-4">
                  <PillBadge
                    color={dose.medication.pillColor}
                    shape={dose.medication.pillShape}
                    size="md"
                    showLabel={false}
                  />
                  <div>
                    <span className="text-base font-bold text-slate-600 block">
                      {dose.periodName} ({dose.scheduledTime})
                    </span>
                    <h4 className="text-2xl font-black text-slate-900">
                      {dose.medication.name} &bull; {dose.medication.dosage}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isTaken ? (
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-extrabold text-lg">
                      <CheckCircle2 className="w-5 h-5" />
                      Taken at {dose.takenAt}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-200 text-slate-800 font-bold text-lg">
                      <Clock className="w-5 h-5 text-slate-600" />
                      Scheduled
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* QUICK DAILY MOOD & WELLBEING CHECK */}
      <section className="bg-slate-100 p-6 sm:p-8 rounded-3xl border-2 border-slate-300">
        <h2 className="text-2xl font-black text-slate-900 mb-2">
          How are you feeling right now, {resident.preferredName}?
        </h2>
        <p className="text-lg text-slate-600 font-medium mb-6">
          Tap an icon below so your caretaker knows how your day is going.
        </p>

        <div className="grid grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => handleMoodSelect("Great")}
            className={`p-5 rounded-2xl border-4 font-black text-xl flex flex-col items-center gap-2 transition-all active:scale-95 ${
              selectedMood === "Great"
                ? "bg-emerald-600 border-emerald-800 text-white shadow-lg"
                : "bg-white border-slate-300 text-slate-800 hover:bg-slate-50"
            }`}
          >
            <Smile className="w-12 h-12 text-yellow-500" />
            <span>Feeling Good</span>
          </button>

          <button
            type="button"
            onClick={() => handleMoodSelect("Okay")}
            className={`p-5 rounded-2xl border-4 font-black text-xl flex flex-col items-center gap-2 transition-all active:scale-95 ${
              selectedMood === "Okay"
                ? "bg-blue-600 border-blue-800 text-white shadow-lg"
                : "bg-white border-slate-300 text-slate-800 hover:bg-slate-50"
            }`}
          >
            <Meh className="w-12 h-12 text-blue-500" />
            <span>Just Okay</span>
          </button>

          <button
            type="button"
            onClick={() => handleMoodSelect("Unwell")}
            className={`p-5 rounded-2xl border-4 font-black text-xl flex flex-col items-center gap-2 transition-all active:scale-95 ${
              selectedMood === "Unwell"
                ? "bg-amber-600 border-amber-800 text-white shadow-lg"
                : "bg-white border-slate-300 text-slate-800 hover:bg-slate-50"
            }`}
          >
            <Frown className="w-12 h-12 text-amber-500" />
            <span>In Pain / Unwell</span>
          </button>
        </div>
      </section>

      {/* ONE-TOUCH EMERGENCY SOS */}
      <section className="pt-4">
        <SOSButton
          residentName={resident.name}
          roomNumber={resident.roomNumber}
          onTriggerSOS={onTriggerSOS}
        />
      </section>
    </div>
  );
};
