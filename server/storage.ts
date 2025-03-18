import { 
  users, clinics, appointments, patients, dentistSchedules, waitlist,
  type User, type Clinic, type Appointment, type Patient, type DentistSchedule, type Waitlist,
  type InsertUser, type InsertClinic, type InsertAppointment, type InsertPatient,
  type InsertDentistSchedule, type InsertWaitlist,
  type TreatmentRecord, type InsertTreatmentRecord
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Clinics
  getClinic(id: number): Promise<Clinic | undefined>;
  createClinic(clinic: InsertClinic): Promise<Clinic>;

  // Dentist Schedules
  getDentistSchedule(id: number): Promise<DentistSchedule | undefined>;
  getDentistSchedulesByDentist(dentistId: number): Promise<DentistSchedule[]>;
  createDentistSchedule(schedule: InsertDentistSchedule): Promise<DentistSchedule>;
  updateDentistSchedule(id: number, schedule: Partial<DentistSchedule>): Promise<DentistSchedule>;

  // Appointments
  getAppointment(id: number): Promise<Appointment | undefined>;
  getAppointmentsByClinic(clinicId: number): Promise<Appointment[]>;
  getAppointmentsByPatient(patientId: number): Promise<Appointment[]>;
  getAppointmentsByDentist(dentistId: number): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<Appointment>): Promise<Appointment>;
  getAvailableSlots(dentistId: number, date: Date): Promise<Date[]>;

  // Waitlist
  getWaitlistEntry(id: number): Promise<Waitlist | undefined>;
  getWaitlistByClinic(clinicId: number): Promise<Waitlist[]>;
  createWaitlistEntry(entry: InsertWaitlist): Promise<Waitlist>;
  updateWaitlistEntry(id: number, entry: Partial<Waitlist>): Promise<Waitlist>;

  // Patients
  getPatient(id: number): Promise<Patient | undefined>;
  getPatientsByClinic(clinicId: number): Promise<Patient[]>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: number, patient: Partial<Patient>): Promise<Patient>;

  // Treatment Records
  getTreatmentsByPatient(patientId: number): Promise<TreatmentRecord[]>;
  createTreatmentRecord(treatment: InsertTreatmentRecord): Promise<TreatmentRecord>;
  updateTreatmentRecord(id: number, treatment: Partial<TreatmentRecord>): Promise<TreatmentRecord>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private clinics: Map<number, Clinic>;
  private appointments: Map<number, Appointment>;
  private patients: Map<number, Patient>;
  private dentistSchedules: Map<number, DentistSchedule>;
  private waitlist: Map<number, Waitlist>;
  private treatmentRecords: Map<number, TreatmentRecord>;
  private currentIds: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.clinics = new Map();
    this.appointments = new Map();
    this.patients = new Map();
    this.dentistSchedules = new Map();
    this.waitlist = new Map();
    this.treatmentRecords = new Map();
    this.currentIds = {
      users: 1,
      clinics: 1,
      appointments: 1,
      patients: 1,
      dentistSchedules: 1,
      waitlist: 1,
      treatmentRecords: 1
    };

    // Add initial test data synchronously
    this.initializeTestData();
    console.log("Test data initialized:", Array.from(this.users.values()));
  }

  private createUserSync(insertUser: InsertUser): User {
    const id = this.currentIds.users++;
    const user = { ...insertUser, id } as User;
    this.users.set(id, user);
    return user;
  }

  private createClinicSync(insertClinic: InsertClinic): Clinic {
    const id = this.currentIds.clinics++;
    const clinic = { ...insertClinic, id } as Clinic;
    this.clinics.set(id, clinic);
    return clinic;
  }

  private createPatientSync(insertPatient: InsertPatient): Patient {
    const id = this.currentIds.patients++;
    const patient = {
      ...insertPatient,
      id,
      medicalHistory: insertPatient.medicalHistory || null,
      emergencyContact: insertPatient.emergencyContact || null,
      lastVisit: insertPatient.lastVisit || null
    } as Patient;
    this.patients.set(id, patient);
    return patient;
  }

  private createAppointmentSync(insertAppointment: InsertAppointment): Appointment {
    const id = this.currentIds.appointments++;
    const appointment = { 
      ...insertAppointment, 
      id,
      notes: insertAppointment.notes || null 
    } as Appointment;
    this.appointments.set(id, appointment);
    return appointment;
  }

  private createDentistScheduleSync(insertDentistSchedule: InsertDentistSchedule): DentistSchedule {
    const id = this.currentIds.dentistSchedules++;
    const dentistSchedule = { ...insertDentistSchedule, id } as DentistSchedule;
    this.dentistSchedules.set(id, dentistSchedule);
    return dentistSchedule;
  }

  private createWaitlistEntrySync(insertWaitlist: InsertWaitlist): Waitlist {
    const id = this.currentIds.waitlist++;
    const waitlistEntry = { ...insertWaitlist, id } as Waitlist;
    this.waitlist.set(id, waitlistEntry);
    return waitlistEntry;
  }


  private initializeTestData() {
    // Create a test clinic
    const clinic = this.createClinicSync({
      name: "Main Street Dental",
      address: "123 Main St",
      phone: "555-0123"
    });

    // Create test users
    const admin = this.createUserSync({
      email: "admin@test.com",
      password: "password123",
      name: "Admin User",
      role: "admin",
      clinicId: clinic.id
    });

    const dentist = this.createUserSync({
      email: "dentist@test.com",
      password: "password123",
      name: "Dr. Smith",
      role: "dentist",
      clinicId: clinic.id
    });

    const patient = this.createUserSync({
      email: "patient@test.com",
      password: "password123",
      name: "John Doe",
      role: "patient",
      clinicId: clinic.id
    });

    // Create a test patient record
    this.createPatientSync({
      userId: patient.id,
      dateOfBirth: new Date("1990-01-01"),
      medicalHistory: "No significant medical history",
      emergencyContact: "Jane Doe - 555-0124",
      lastVisit: new Date("2024-01-01")
    });

    // Create some test appointments
    this.createAppointmentSync({
      patientId: patient.id,
      dentistId: dentist.id,
      clinicId: clinic.id,
      startTime: new Date("2024-03-20T10:00:00"),
      endTime: new Date("2024-03-20T11:00:00"),
      status: "scheduled",
      notes: "Regular checkup"
    });

    // Create test dentist schedules
    this.createDentistScheduleSync({
      dentistId: dentist.id,
      dayOfWeek: 1, // Monday
      startTime: "09:00",
      endTime: "17:00",
      isAvailable: true
    });

    //Create test waitlist entries
    this.createWaitlistEntrySync({
      patientId: patient.id,
      clinicId: clinic.id,
      reason: "Checkup",
      dateAdded: new Date()
    })
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return this.createUserSync(insertUser);
  }

  // Clinics
  async getClinic(id: number): Promise<Clinic | undefined> {
    return this.clinics.get(id);
  }

  async createClinic(insertClinic: InsertClinic): Promise<Clinic> {
    return this.createClinicSync(insertClinic);
  }

  // Dentist Schedules
  async getDentistSchedule(id: number): Promise<DentistSchedule | undefined> {
    return this.dentistSchedules.get(id);
  }

  async getDentistSchedulesByDentist(dentistId: number): Promise<DentistSchedule[]> {
    return Array.from(this.dentistSchedules.values())
      .filter(schedule => schedule.dentistId === dentistId);
  }

  async createDentistSchedule(schedule: InsertDentistSchedule): Promise<DentistSchedule> {
    const id = this.currentIds.dentistSchedules++;
    const newSchedule = { ...schedule, id } as DentistSchedule;
    this.dentistSchedules.set(id, newSchedule);
    return newSchedule;
  }

  async updateDentistSchedule(id: number, updateData: Partial<DentistSchedule>): Promise<DentistSchedule> {
    const existing = this.dentistSchedules.get(id);
    if (!existing) throw new Error("Schedule not found");
    const updated = { ...existing, ...updateData } as DentistSchedule;
    this.dentistSchedules.set(id, updated);
    return updated;
  }

  // Appointments
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async getAppointmentsByClinic(clinicId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values())
      .filter(apt => apt.clinicId === clinicId);
  }

  async getAppointmentsByPatient(patientId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values())
      .filter(apt => apt.patientId === patientId);
  }

  async getAppointmentsByDentist(dentistId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values())
      .filter(apt => apt.dentistId === dentistId);
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    return this.createAppointmentSync(insertAppointment);
  }

  async updateAppointment(id: number, updateData: Partial<Appointment>): Promise<Appointment> {
    const existing = this.appointments.get(id);
    if (!existing) throw new Error("Appointment not found");
    const updated = { ...existing, ...updateData } as Appointment;
    this.appointments.set(id, updated);
    return updated;
  }

  // Waitlist
  async getWaitlistEntry(id: number): Promise<Waitlist | undefined> {
    return this.waitlist.get(id);
  }

  async getWaitlistByClinic(clinicId: number): Promise<Waitlist[]> {
    return Array.from(this.waitlist.values())
      .filter(entry => {
        const patient = this.patients.get(entry.patientId);
        const user = patient ? this.users.get(patient.userId) : undefined;
        return user && user.clinicId === clinicId;
      });
  }

  async createWaitlistEntry(entry: InsertWaitlist): Promise<Waitlist> {
    return this.createWaitlistEntrySync(entry);
  }

  async updateWaitlistEntry(id: number, updateData: Partial<Waitlist>): Promise<Waitlist> {
    const existing = this.waitlist.get(id);
    if (!existing) throw new Error("Waitlist entry not found");
    const updated = { ...existing, ...updateData } as Waitlist;
    this.waitlist.set(id, updated);
    return updated;
  }

  // Helper method to check available slots
  async getAvailableSlots(dentistId: number, date: Date): Promise<Date[]> {
    const dayOfWeek = date.getDay();
    const schedule = Array.from(this.dentistSchedules.values())
      .find(s => s.dentistId === dentistId && s.dayOfWeek === dayOfWeek);

    if (!schedule || !schedule.isAvailable) return [];

    const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
    const [endHour, endMinute] = schedule.endTime.split(':').map(Number);

    const slots: Date[] = [];
    const slotDuration = 30; // 30-minute slots

    const startDate = new Date(date);
    startDate.setHours(startHour, startMinute, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(endHour, endMinute, 0, 0);

    const existingAppointments = Array.from(this.appointments.values())
      .filter(apt => 
        apt.dentistId === dentistId &&
        apt.status !== 'cancelled' &&
        new Date(apt.startTime).toDateString() === date.toDateString()
      );

    let currentSlot = startDate;
    while (currentSlot < endDate) {
      const slotEnd = new Date(currentSlot);
      slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);

      const isSlotAvailable = !existingAppointments.some(apt => {
        const aptStart = new Date(apt.startTime);
        const aptEnd = new Date(apt.endTime);
        return currentSlot < aptEnd && slotEnd > aptStart;
      });

      if (isSlotAvailable) {
        slots.push(new Date(currentSlot));
      }

      currentSlot = slotEnd;
    }

    return slots;
  }

  // Patients
  async getPatient(id: number): Promise<Patient | undefined> {
    return this.patients.get(id);
  }

  async getPatientsByClinic(clinicId: number): Promise<Patient[]> {
    return Array.from(this.patients.values())
      .filter(patient => {
        const user = this.users.get(patient.userId);
        return user && user.clinicId === clinicId;
      });
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    return this.createPatientSync(insertPatient);
  }

  async updatePatient(id: number, updateData: Partial<Patient>): Promise<Patient> {
    const existing = this.patients.get(id);
    if (!existing) throw new Error("Patient not found");
    const updated = { ...existing, ...updateData } as Patient;
    this.patients.set(id, updated);
    return updated;
  }

  // Treatment Records
  async getTreatmentsByPatient(patientId: number): Promise<TreatmentRecord[]> {
    return Array.from(this.treatmentRecords.values())
      .filter(record => record.patientId === patientId);
  }

  async createTreatmentRecord(insertTreatment: InsertTreatmentRecord): Promise<TreatmentRecord> {
    const id = this.currentIds.treatmentRecords++;
    const treatment = { ...insertTreatment, id } as TreatmentRecord;
    this.treatmentRecords.set(id, treatment);
    return treatment;
  }

  async updateTreatmentRecord(id: number, updateData: Partial<TreatmentRecord>): Promise<TreatmentRecord> {
    const existing = this.treatmentRecords.get(id);
    if (!existing) throw new Error("Treatment record not found");
    const updated = { ...existing, ...updateData } as TreatmentRecord;
    this.treatmentRecords.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();