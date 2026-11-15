"use client";

import React, { useState } from "react";
import { UserRole, Resident, DoseLog, FacilityAlert, VitalsLog } from "@/types";
import {
  MOCK_RESIDENTS,
  INITIAL_DOSE_LOGS,
  INITIAL_ALERTS,
  INITIAL_VITALS,
} from "@/lib/mockData";
import { SeniorPortal } from "@/components/senior/SeniorPortal";
import { CaretakerPortal } from "@/components/caretaker/CaretakerPortal";
import { FamilyPortal } from "@/components/family/FamilyPortal";
import { sound } from "@/lib/audio";
import {
  Heart,
  Users,
  Shield,
  Volume2,
  Building2,
  ZoomIn,
} from "lucide-react";

export default function Home() {
  const [role, setRole] = useState<UserRole>("senior");
  const [residents] = useState<Resident[]>(MOCK_RESIDENTS);
  const [activeResidentIndex, setActiveResidentIndex] = useState(0);
  const [doseLogs, setDoseLogs] = useState<DoseLog[]>(INITIAL_DOSE_LOGS);
  const [alerts, setAlerts] = useState<FacilityAlert[]>(INITIAL_ALERTS);
  const [vitals, setVitals] = useState<VitalsLog[]>(INITIAL_VITALS);
  const [isLargeText, setIsLargeText] = useState(false);

  const currentResident = residents[activeResidentIndex] || residents[0];

  // Actions
  const handleTakeDose = (doseId: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setDoseLogs((prev) =>
      prev.map((d) => (d.id === doseId ? { ...d, status: "TAKEN", takenAt: timeStr } : d))
    );
  };

  const handleSnoozeDose = (doseId: string) => {
    setDoseLogs((prev) =>
      prev.map((d) => (d.id === doseId ? { ...d, status: "SNOOZED" } : d))
    );
  };

  const handleVerifyDose = (doseId: string, caretakerName: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setDoseLogs((prev) =>
      prev.map((d) =>
        d.id === doseId
          ? { ...d, status: "TAKEN", takenAt: timeStr, verifiedBy: caretakerName }
          : d
      )
    );
  };

  const handleTriggerSOS = (reason: string) => {
    const newAlert: FacilityAlert = {
      id: `sos-${Date.now()}`,
      residentId: currentResident.id,
      residentName: currentResident.name,
      roomNumber: currentResident.roomNumber,
      type: "EMERGENCY_SOS",
      severity: "critical",
      message: reason,
      createdAt: "Just now",
      acknowledged: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  const handleAddVital = (vital: Omit<VitalsLog, "id">) => {
    const newVital: VitalsLog = {
      ...vital,
      id: `vit-${Date.now()}`,
    };
    setVitals((prev) => [newVital, ...prev]);
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
  };

  const handleSendMessageToStaff = (note: string) => {
    const newAlert: FacilityAlert = {
      id: `msg-${Date.now()}`,
      residentId: currentResident.id,
      residentName: currentResident.name,
      roomNumber: currentResident.roomNumber,
      type: "MISSED_DOSE", // info category
      severity: "info",
      message: `Family Note from ${currentResident.emergencyContact.name}: "${note}"`,
      createdAt: "Just now",
      acknowledged: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  return (
    <div className={`min-h-screen ${isLargeText ? "text-xl" : "text-base"}`}>
      {/* PERSISTENT TOP NAVIGATION & ROLE SWITCHER */}
      <header className="sticky top-0 z-40 bg-white border-b-2 border-slate-200 shadow-sm backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Facility Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-senior-primary flex items-center justify-center text-white shadow-sm">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                GoldenCare
                <span className="text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md">
                  Facility System
                </span>
              </span>
              <p className="text-xs font-semibold text-slate-500">
                St. Jude Senior Living Community &bull; PWA Ready
              </p>
            </div>
          </div>

          {/* Role Switcher Pills */}
          <nav
            aria-label="User role switcher"
            className="flex items-center p-1.5 bg-slate-100 rounded-2xl border border-slate-300 gap-1.5"
          >
            <button
              type="button"
              onClick={() => {
                setRole("senior");
                sound.playReminderChime();
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all text-sm sm:text-base ${
                role === "senior"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-700 hover:text-slate-950"
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>Senior Resident</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole("caretaker");
                sound.playReminderChime();
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all text-sm sm:text-base ${
                role === "caretaker"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-700 hover:text-slate-950"
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Caretaker / Nurse</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole("family");
                sound.playReminderChime();
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all text-sm sm:text-base ${
                role === "family"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-700 hover:text-slate-950"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Family Portal</span>
            </button>
          </nav>

          {/* Accessibility & Sound Controls */}
          <div className="flex items-center gap-2">
            {role !== "caretaker" && (
              <select
                aria-label="Select active resident"
                value={activeResidentIndex}
                onChange={(e) => setActiveResidentIndex(Number(e.target.value))}
                className="bg-white border-2 border-slate-300 text-slate-800 font-bold py-2 px-3 rounded-xl text-sm focus:outline-none focus:border-blue-600"
              >
                {residents.map((r, i) => (
                  <option key={r.id} value={i}>
                    {r.preferredName} (Room {r.roomNumber})
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={() => setIsLargeText(!isLargeText)}
              title="Toggle Large Text"
              className={`p-2.5 rounded-xl border-2 transition-all flex items-center gap-1.5 font-bold text-xs ${
                isLargeText
                  ? "bg-blue-100 border-blue-500 text-blue-900"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <ZoomIn className="w-4 h-4" />
              <span className="hidden sm:inline">Giant Font</span>
            </button>

            <button
              type="button"
              onClick={() => sound.playReminderChime()}
              title="Test Sound Chime"
              className="p-2.5 rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
              aria-label="Test Sound"
            >
              <Volume2 className="w-4 h-4 text-blue-700" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {role === "senior" && (
          <SeniorPortal
            resident={currentResident}
            doseLogs={doseLogs.filter((d) => d.residentId === currentResident.id)}
            onTakeDose={handleTakeDose}
            onSnoozeDose={handleSnoozeDose}
            onTriggerSOS={handleTriggerSOS}
          />
        )}

        {role === "caretaker" && (
          <CaretakerPortal
            residents={residents}
            doseLogs={doseLogs}
            alerts={alerts}
            vitals={vitals}
            onVerifyDose={handleVerifyDose}
            onAddVital={handleAddVital}
            onAcknowledgeAlert={handleAcknowledgeAlert}
          />
        )}

        {role === "family" && (
          <FamilyPortal
            resident={currentResident}
            doseLogs={doseLogs}
            vitals={vitals}
            onSendMessageToStaff={handleSendMessageToStaff}
          />
        )}
      </main>
    </div>
  );
}
