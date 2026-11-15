export type UserRole = "senior" | "caretaker" | "family";

export type PillShape = "round" | "oval" | "capsule" | "square" | "drop";
export type PillColor = "blue" | "white" | "red" | "yellow" | "orange" | "green" | "pink" | "purple";

export type FoodCondition = "before_meal" | "with_meal" | "after_meal" | "empty_stomach" | "anytime";

export type DoseStatus = "PENDING" | "TAKEN" | "SNOOZED" | "MISSED" | "SKIPPED";

export interface Medication {
  id: string;
  name: string;
  genericName?: string;
  dosage: string;
  form: string; // e.g. "Tablet", "Capsule", "Drops"
  pillColor: PillColor;
  pillShape: PillShape;
  foodCondition: FoodCondition;
  instructions: string;
  prescribedFor: string;
  stockCount: number;
}

export interface DoseSchedule {
  id: string;
  medicationId: string;
  medication: Medication;
  scheduledTime: string; // "08:00", "13:00", "20:00"
  periodName: "Morning" | "Noon" | "Evening" | "Bedtime";
}

export interface DoseLog {
  id: string;
  scheduleId: string;
  residentId: string;
  medication: Medication;
  scheduledTime: string;
  periodName: "Morning" | "Noon" | "Evening" | "Bedtime";
  status: DoseStatus;
  takenAt?: string;
  snoozedUntil?: string;
  verifiedBy?: string;
  notes?: string;
}

export interface Resident {
  id: string;
  name: string;
  preferredName: string;
  roomNumber: string;
  wing: "North Wing" | "South Wing" | "Garden View";
  avatar: string;
  age: number;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  allergies: string[];
  medicalNotes: string;
}

export interface VitalsLog {
  id: string;
  residentId: string;
  systolic: number;
  diastolic: number;
  heartRate: number;
  bloodSugar?: number;
  temperature?: number;
  recordedAt: string;
  recordedBy: string;
}

export interface FacilityAlert {
  id: string;
  residentId: string;
  residentName: string;
  roomNumber: string;
  type: "MISSED_DOSE" | "EMERGENCY_SOS" | "LOW_STOCK" | "ABNORMAL_VITAL";
  severity: "critical" | "warning" | "info";
  message: string;
  createdAt: string;
  acknowledged: boolean;
}
