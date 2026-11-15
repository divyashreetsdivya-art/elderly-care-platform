"use client";

import React, { useState } from "react";
import {
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  HeartPulse,
  PlusCircle,
  Search,
  Filter,
  Check,
} from "lucide-react";
import { Resident, DoseLog, FacilityAlert, VitalsLog } from "@/types";
import { PillBadge } from "@/components/ui/PillBadge";
import { Button } from "@/components/ui/Button";
import { sound } from "@/lib/audio";

interface CaretakerPortalProps {
  residents: Resident[];
  doseLogs: DoseLog[];
  alerts: FacilityAlert[];
  vitals: VitalsLog[];
  onVerifyDose: (doseId: string, caretakerName: string) => void;
  onAddVital: (vital: Omit<VitalsLog, "id">) => void;
  onAcknowledgeAlert: (alertId: string) => void;
}

export const CaretakerPortal: React.FC<CaretakerPortalProps> = ({
  residents,
  doseLogs,
  alerts,
  vitals,
  onVerifyDose,
  onAddVital,
  onAcknowledgeAlert,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterWing, setFilterWing] = useState<string>("ALL");
  const [selectedResidentId, setSelectedResidentId] = useState<string>(residents[0]?.id || "");
  const [showVitalsModal, setShowVitalsModal] = useState(false);

  // Vitals Form State
  const [bpSys, setBpSys] = useState("120");
  const [bpDia, setBpDia] = useState("80");
  const [pulse, setPulse] = useState("72");
  const [sugar, setSugar] = useState("110");

  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged);

  const filteredResidents = residents.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.roomNumber.includes(searchQuery);
    const matchesWing = filterWing === "ALL" || r.wing === filterWing;
    return matchesSearch && matchesWing;
  });

  const activeResident = residents.find((r) => r.id === selectedResidentId) || residents[0];
  const activeResidentDoses = doseLogs.filter((d) => d.residentId === activeResident?.id);
  const activeResidentVitals = vitals.filter((v) => v.residentId === activeResident?.id);

  const handleVitalsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeResident) return;

    onAddVital({
      residentId: activeResident.id,
      systolic: parseInt(bpSys, 10),
      diastolic: parseInt(bpDia, 10),
      heartRate: parseInt(pulse, 10),
      bloodSugar: parseInt(sugar, 10),
      recordedAt: "Just now",
      recordedBy: "Nurse Jackson (Staff)",
    });

    sound.playSuccessChime();
    setShowVitalsModal(false);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-12">
      {/* FACILITY STATUS HEADER */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-blue-400 font-bold uppercase tracking-wider text-sm block mb-1">
            Care Facility Dashboard &bull; Shift: Morning / Afternoon
          </span>
          <h1 className="text-3xl sm:text-4xl font-black">
            Resident Medication Pass & Care Roster
          </h1>
          <p className="text-slate-300 text-lg mt-1">
            Monitoring 4 resident wings &bull; 2 Staff on Duty
          </p>
        </div>

        {/* Quick summary stats */}
        <div className="flex gap-4">
          <div className="bg-slate-800 border border-slate-700 px-5 py-3 rounded-2xl text-center">
            <span className="text-slate-400 text-xs uppercase font-bold block">Active Alerts</span>
            <span className={`text-2xl font-black ${unacknowledgedAlerts.length > 0 ? "text-amber-400" : "text-emerald-400"}`}>
              {unacknowledgedAlerts.length}
            </span>
          </div>
          <div className="bg-slate-800 border border-slate-700 px-5 py-3 rounded-2xl text-center">
            <span className="text-slate-400 text-xs uppercase font-bold block">Adherence Today</span>
            <span className="text-2xl font-black text-blue-400">86%</span>
          </div>
        </div>
      </div>

      {/* ACTIVE ESCALATION ALERTS BANNER */}
      {unacknowledgedAlerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-black text-red-800 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-600 animate-bounce" />
            <span>Facility Alerts Requiring Caretaker Attention ({unacknowledgedAlerts.length})</span>
          </h2>
          {unacknowledgedAlerts.map((alt) => (
            <div
              key={alt.id}
              className="bg-red-50 border-2 border-red-300 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-3 py-1 bg-red-700 text-white font-bold text-xs uppercase rounded-full">
                    {alt.type.replace("_", " ")}
                  </span>
                  <span className="font-bold text-slate-900 text-lg">
                    Room {alt.roomNumber} - {alt.residentName}
                  </span>
                  <span className="text-sm text-slate-500 font-medium">({alt.createdAt})</span>
                </div>
                <p className="text-lg text-slate-800 font-medium">{alt.message}</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.playSuccessChime();
                  onAcknowledgeAlert(alt.id);
                }}
                className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-base flex items-center justify-center gap-2 whitespace-nowrap active:scale-95"
              >
                <Check className="w-5 h-5" />
                <span>Mark Addressed</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* SEARCH & RESIDENT ROSTER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Resident List */}
        <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-senior-primary" />
              <span>Residents</span>
            </h2>
            <span className="text-sm font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
              {filteredResidents.length} Patients
            </span>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Search by name or room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:outline-none focus:border-blue-600 font-medium text-base"
            />
          </div>

          {/* Wing Filter */}
          <div className="flex gap-2 text-xs font-bold overflow-x-auto pb-1">
            {["ALL", "Garden View", "North Wing", "South Wing"].map((wing) => (
              <button
                key={wing}
                type="button"
                onClick={() => setFilterWing(wing)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  filterWing === wing
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {wing}
              </button>
            ))}
          </div>

          {/* Resident Cards */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredResidents.map((res) => {
              const resDoses = doseLogs.filter((d) => d.residentId === res.id);
              const pendingCount = resDoses.filter((d) => d.status === "PENDING").length;
              const hasAlert = alerts.some((a) => a.residentId === res.id && !a.acknowledged);

              return (
                <div
                  key={res.id}
                  onClick={() => setSelectedResidentId(res.id)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedResidentId === res.id
                      ? "border-blue-600 bg-blue-50/60 shadow-sm"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{res.avatar}</span>
                      <div>
                        <h3 className="font-extrabold text-lg text-slate-900">
                          {res.name}
                        </h3>
                        <p className="text-sm font-medium text-slate-600">
                          Room {res.roomNumber} &bull; {res.wing}
                        </p>
                      </div>
                    </div>
                    {hasAlert ? (
                      <span className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
                    ) : (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-200 text-slate-800">
                        {pendingCount} Due
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Columns: Resident Details & Medication Pass */}
        <div className="lg:col-span-2 space-y-6">
          {activeResident && (
            <>
              {/* Resident Header Card */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
                  <div className="flex items-center gap-4">
                    <span className="text-5xl">{activeResident.avatar}</span>
                    <div>
                      <h2 className="text-3xl font-black text-slate-950">
                        {activeResident.name}
                      </h2>
                      <p className="text-base font-semibold text-slate-600">
                        Room {activeResident.roomNumber} &bull; Age {activeResident.age} &bull; Allergies:{" "}
                        <span className="text-red-600 font-bold">
                          {activeResident.allergies.join(", ")}
                        </span>
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="standard"
                    onClick={() => setShowVitalsModal(true)}
                    className="flex-shrink-0"
                  >
                    <HeartPulse className="w-5 h-5 text-red-600" />
                    <span>Log Vitals</span>
                  </Button>
                </div>

                {/* Vitals Summary Pill Row */}
                {activeResidentVitals.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                      <span className="text-xs font-bold text-slate-500 block">BP (mmHg)</span>
                      <span className="text-lg font-black text-slate-900">
                        {activeResidentVitals[0].systolic}/{activeResidentVitals[0].diastolic}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                      <span className="text-xs font-bold text-slate-500 block">Heart Rate</span>
                      <span className="text-lg font-black text-slate-900">
                        {activeResidentVitals[0].heartRate} bpm
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                      <span className="text-xs font-bold text-slate-500 block">Blood Sugar</span>
                      <span className="text-lg font-black text-slate-900">
                        {activeResidentVitals[0].bloodSugar || "--"} mg/dL
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                      <span className="text-xs font-bold text-slate-500 block">Recorded</span>
                      <span className="text-xs font-bold text-slate-700 block mt-1">
                        {activeResidentVitals[0].recordedAt}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Today's Medication Pass for Selected Resident */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-slate-900">
                    Medication Pass Timeline
                  </h3>
                  <span className="text-sm font-bold text-slate-500">
                    {activeResidentDoses.length} Prescribed Doses Today
                  </span>
                </div>

                <div className="space-y-4">
                  {activeResidentDoses.map((dose) => (
                    <div
                      key={dose.id}
                      className="p-5 rounded-2xl border-2 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <PillBadge
                          color={dose.medication.pillColor}
                          shape={dose.medication.pillShape}
                          size="md"
                          showLabel={false}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                              {dose.periodName} ({dose.scheduledTime})
                            </span>
                            <span className="text-xs font-bold text-slate-500">
                              Stock: {dose.medication.stockCount} left
                            </span>
                          </div>
                          <h4 className="text-xl font-black text-slate-900 mt-1">
                            {dose.medication.name} - {dose.medication.dosage}
                          </h4>
                          <p className="text-sm font-medium text-slate-600">
                            {dose.medication.instructions}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {dose.status === "TAKEN" ? (
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-sm">
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                              Taken {dose.takenAt}
                            </span>
                            {dose.verifiedBy && (
                              <span className="text-xs text-slate-500 block mt-0.5">
                                Verified: {dose.verifiedBy}
                              </span>
                            )}
                          </div>
                        ) : dose.status === "MISSED" ? (
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-100 text-red-800 font-bold text-sm">
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                              Missed Dose
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                sound.playSuccessChime();
                                onVerifyDose(dose.id, "Nurse Jackson");
                              }}
                              className="text-xs text-blue-600 font-bold block mt-1 hover:underline"
                            >
                              Administer Now
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              sound.playSuccessChime();
                              onVerifyDose(dose.id, "Nurse Jackson");
                            }}
                            className="px-4 py-2.5 bg-senior-primary hover:bg-senior-primaryHover text-white font-bold rounded-xl text-base flex items-center gap-2 shadow-sm active:scale-95 transition-all"
                          >
                            <Check className="w-4 h-4" />
                            <span>Verify Pass</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* LOG VITALS MODAL */}
      {showVitalsModal && activeResident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border-2 border-slate-300 shadow-2xl">
            <h3 className="text-2xl font-black text-slate-900 mb-1">
              Record Patient Vitals
            </h3>
            <p className="text-base font-semibold text-slate-600 mb-6">
              Room {activeResident.roomNumber} - {activeResident.name}
            </p>

            <form onSubmit={handleVitalsSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-1">
                    Systolic (mmHg)
                  </label>
                  <input
                    type="number"
                    value={bpSys}
                    onChange={(e) => setBpSys(e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-slate-300 font-bold text-lg"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-1">
                    Diastolic (mmHg)
                  </label>
                  <input
                    type="number"
                    value={bpDia}
                    onChange={(e) => setBpDia(e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-slate-300 font-bold text-lg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-1">
                    Heart Rate (BPM)
                  </label>
                  <input
                    type="number"
                    value={pulse}
                    onChange={(e) => setPulse(e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-slate-300 font-bold text-lg"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-1">
                    Blood Sugar (mg/dL)
                  </label>
                  <input
                    type="number"
                    value={sugar}
                    onChange={(e) => setSugar(e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-slate-300 font-bold text-lg"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowVitalsModal(false)}
                  className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-senior-primary hover:bg-senior-primaryHover text-white font-bold rounded-xl"
                >
                  Save Vitals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
