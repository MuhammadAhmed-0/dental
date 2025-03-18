import { pgTable, text, serial, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ["admin", "dentist", "staff", "patient"] }).notNull(),
  clinicId: integer("clinic_id"),
});

export const clinics = pgTable("clinics", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
});

export const dentistSchedules = pgTable("dentist_schedules", {
  id: serial("id").primaryKey(),
  dentistId: integer("dentist_id").notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 for Sunday-Saturday
  startTime: text("start_time").notNull(), // Format: "HH:mm"
  endTime: text("end_time").notNull(), // Format: "HH:mm"
  isAvailable: boolean("is_available").notNull().default(true),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  dentistId: integer("dentist_id").notNull(),
  clinicId: integer("clinic_id").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: text("status", { enum: ["scheduled", "confirmed", "cancelled", "completed"] }).notNull(),
  notes: text("notes"),
  isEmergency: boolean("is_emergency").default(false),
  isRecurring: boolean("is_recurring").default(false),
  recurringInterval: integer("recurring_interval"), // Days between recurring appointments
  recurringEndDate: timestamp("recurring_end_date"),
});

export const waitlist = pgTable("waitlist", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  preferredDentistId: integer("preferred_dentist_id"),
  requestedDate: timestamp("requested_date").notNull(),
  notes: text("notes"),
  status: text("status", { enum: ["pending", "fulfilled", "cancelled"] }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: timestamp("date_of_birth").notNull(),
  gender: text("gender"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  phoneNumber: text("phone_number"),
  email: text("email"),
  medicalHistory: text("medical_history"),
  allergies: text("allergies"),
  currentMedications: text("current_medications"),
  emergencyContact: text("emergency_contact"),
  insuranceProvider: text("insurance_provider"),
  insuranceNumber: text("insurance_number"),
  lastVisit: timestamp("last_visit"),
  preferredDentist: integer("preferred_dentist_id"),
  notes: text("notes")
});

export const treatmentRecords = pgTable("treatment_records", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  dentistId: integer("dentist_id").notNull(),
  date: timestamp("date").notNull(),
  diagnosis: text("diagnosis").notNull(),
  treatment: text("treatment").notNull(),
  notes: text("notes"),
  followUpNeeded: boolean("follow_up_needed").default(false),
  followUpDate: timestamp("follow_up_date"),
  attachments: jsonb("attachments").default([]), // Array of file URLs/metadata
  cost: integer("cost"),
  insuranceCovered: integer("insurance_covered"),
  status: text("status", { enum: ["planned", "in-progress", "completed", "cancelled"] }).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  name: true,
  role: true,
  clinicId: true,
});

export const insertClinicSchema = createInsertSchema(clinics);
export const insertDentistScheduleSchema = createInsertSchema(dentistSchedules);
export const insertAppointmentSchema = createInsertSchema(appointments);
export const insertWaitlistSchema = createInsertSchema(waitlist);
export const insertPatientSchema = createInsertSchema(patients).extend({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
  }),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required")
});

export const insertTreatmentRecordSchema = createInsertSchema(treatmentRecords);

export type User = typeof users.$inferSelect;
export type Clinic = typeof clinics.$inferSelect;
export type DentistSchedule = typeof dentistSchedules.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type Waitlist = typeof waitlist.$inferSelect;
export type Patient = typeof patients.$inferSelect;
export type TreatmentRecord = typeof treatmentRecords.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertClinic = z.infer<typeof insertClinicSchema>;
export type InsertDentistSchedule = z.infer<typeof insertDentistScheduleSchema>;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type InsertWaitlist = z.infer<typeof insertWaitlistSchema>;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type InsertTreatmentRecord = z.infer<typeof insertTreatmentRecordSchema>;