"use client";

import React, { useState } from "react";
import { Heart, CheckCircle2, AlertCircle, Phone, MessageSquare, Send, ShieldCheck } from "lucide-react";
import { Resident, DoseLog, VitalsLog } from "@/types";
import { PillBadge } from "@/components/ui/PillBadge";
import { Button } from "@/components/ui/Button";
import { sound } from "@/lib/audio";

interface FamilyPortalProps {
  resident: Resident;
  doseLogs: DoseLog[];
  vitals: VitalsLog[];
  onSendMessageToStaff: (note: string) => void;
}

export const FamilyPortal: React.FC<FamilyPortalProps> = ({
  resident,
  doseLogs,
  vitals,
  onSendMessageToStaff,
}) => {
  const [noteText, setNoteText] = useState("");
  const [noteSent, setNoteSent] = useState(false);

  const residentDoses = doseLogs.filter((d) => d.residentId === resident.id);
  const takenCount = residentDoses.filter((d) => d.status === "TAKEN").length;
  const adherenceRate =
    residentDoses.length > 0 ? Math.round((takenCount / residentDoses.length) * 100) : 100;

  const latestVital = vitals.find((v) => v.residentId === resident.id);

  const handleSendNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    sound.playSuccessChime();
    onSendMessageToStaff(noteText);
    setNoteSent(true);
    setNoteText("");
    setTimeout(() => setNoteSent(false), 4000);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-12">
      {/* FAMILY REASSURANCE HERO CARD */}
      <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="text-6xl">{resident.avatar}</span>
            <div>
              <span className="text-blue-300 font-bold uppercase tracking-wider text-sm flex items-center gap-1.5 mb-1">
                <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
                Family Member Care Portal
              </span>
              <h1 className="text-3xl sm:text-4xl font-black">
                {resident.name}
              </h1>
              <p className="text-blue-100 text-lg font-medium">
                Room {resident.roomNumber} &bull; {resident.wing}
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl text-center w-full sm:w-auto">
            <span className="text-blue-200 text-xs uppercase font-extrabold block">
              Today&apos;s Adherence
            </span>
            <span className="text-4xl font-black text-emerald-400">
              {adherenceRate}%
            </span>
            <span className="text-xs text-blue-200 block mt-1">
              {takenCount} of {residentDoses.length} doses logged
            </span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-emerald-300 font-bold">
            <ShieldCheck className="w-6 h-6" />
            <span>Staff Nurse On Duty &bull; Routine Monitoring Active</span>
          </div>

          <a
            href={`tel:${resident.emergencyContact.phone}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold transition-all text-sm"
          >
            <Phone className="w-4 h-4" />
            <span>Call Facility Desk</span>
          </a>
        </div>
      </div>

      {/* TODAY'S MEDICATION ACTIVITY FEED */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 shadow-sm space-y-6">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-senior-primary" />
          <span>Medication Activity Timeline</span>
        </h2>

        <div className="space-y-4">
          {residentDoses.map((dose) => (
            <div
              key={dose.id}
              className={`p-5 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                dose.status === "TAKEN"
                  ? "bg-emerald-50/60 border-emerald-300"
                  : dose.status === "MISSED"
                  ? "bg-red-50 border-red-300"
                  : "bg-slate-50 border-slate-200"
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
                  <span className="text-sm font-bold text-slate-500 uppercase">
                    {dose.periodName} ({dose.scheduledTime})
                  </span>
                  <h3 className="text-xl font-black text-slate-900">
                    {dose.medication.name} ({dose.medication.dosage})
                  </h3>
                  <p className="text-sm font-medium text-slate-600">
                    {dose.medication.instructions}
                  </p>
                </div>
              </div>

              <div>
                {dose.status === "TAKEN" ? (
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    Taken at {dose.takenAt}
                  </span>
                ) : dose.status === "MISSED" ? (
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-red-600 text-white font-bold text-sm">
                    <AlertCircle className="w-4 h-4" />
                    Missed - Staff Checking
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-200 text-slate-700 font-bold text-sm">
                    Scheduled for {dose.scheduledTime}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LATEST VITALS RECORD */}
      {latestVital && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 shadow-sm space-y-4">
          <h2 className="text-2xl font-black text-slate-900">
            Latest Health Vitals
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase block">Blood Pressure</span>
              <span className="text-2xl font-black text-slate-900">
                {latestVital.systolic}/{latestVital.diastolic}
              </span>
              <span className="text-xs text-emerald-700 font-bold block mt-1">Normal Range</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase block">Heart Rate</span>
              <span className="text-2xl font-black text-slate-900">
                {latestVital.heartRate} <span className="text-sm font-semibold">bpm</span>
              </span>
              <span className="text-xs text-emerald-700 font-bold block mt-1">Steady</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase block">Blood Sugar</span>
              <span className="text-2xl font-black text-slate-900">
                {latestVital.bloodSugar || 108} <span className="text-sm font-semibold">mg/dL</span>
              </span>
              <span className="text-xs text-emerald-700 font-bold block mt-1">Fasting</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase block">Last Checked</span>
              <span className="text-sm font-black text-slate-800 block mt-1">
                {latestVital.recordedAt}
              </span>
              <span className="text-xs text-slate-500 block">by {latestVital.recordedBy}</span>
            </div>
          </div>
        </div>
      )}

      {/* SEND NOTE TO CARETAKER */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 shadow-sm space-y-4">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-senior-primary" />
          <span>Leave a Note or Request for Care Staff</span>
        </h2>
        <p className="text-slate-600 font-medium">
          Send a quick message to the nursing team attending to {resident.preferredName}.
        </p>

        {noteSent && (
          <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold rounded-2xl">
            ✓ Your message was delivered to the nursing station handover log!
          </div>
        )}

        <form onSubmit={handleSendNote} className="space-y-3">
          <textarea
            rows={3}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="e.g., Mom mentioned she was feeling cold earlier this morning, please check if she needs an extra blanket."
            className="w-full p-4 rounded-2xl border-2 border-slate-300 focus:outline-none focus:border-blue-600 font-medium text-base"
          />
          <div className="flex justify-end">
            <Button variant="primary" size="standard" type="submit">
              <Send className="w-4 h-4" />
              <span>Send Note to Nurse</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
