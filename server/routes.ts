import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertAppointmentSchema, 
  insertPatientSchema,
  insertDentistScheduleSchema,
  insertWaitlistSchema,
  insertTreatmentRecordSchema // Added import
} from "@shared/schema";
import { z } from "zod";

// 30 days
const SESSION_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(session({
    secret: process.env.SESSION_SECRET || 'development_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: SESSION_MAX_AGE
    }
  }));

  // Analytics Routes
  app.get("/api/analytics/metrics", async (req, res) => {
    try {
      const appointments = await storage.getAppointmentsByClinic(1); // TODO: Get from session
      const today = new Date();
      const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));

      const metrics = {
        totalAppointments: appointments.length,
        completedAppointments: appointments.filter(apt => apt.status === "completed").length,
        cancelledAppointments: appointments.filter(apt => apt.status === "cancelled").length,
        noShowRate: Math.round(
          (appointments.filter(apt => apt.status === "cancelled").length / appointments.length) * 100
        ),
        averageAppointmentsPerDay: Math.round(appointments.length / 30)
      };

      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  app.get("/api/analytics/appointments-by-day", async (req, res) => {
    try {
      const appointments = await storage.getAppointmentsByClinic(1); // TODO: Get from session
      const appointmentsByDay = appointments.reduce((acc: any, apt) => {
        const date = new Date(apt.startTime).toISOString().split('T')[0];
        if (!acc[date]) acc[date] = 0;
        acc[date]++;
        return acc;
      }, {});

      const result = Object.entries(appointmentsByDay).map(([date, count]) => ({
        date,
        count
      }));

      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointment statistics" });
    }
  });

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string()
    });

    try {
      console.log("Login attempt:", req.body);
      const { email, password } = schema.parse(req.body);
      const user = await storage.getUserByEmail(email);
      console.log("Found user:", user);

      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      res.json(user);
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ message: "Failed to logout" });
      } else {
        res.json({ message: "Logged out" });
      }
    });
  });

  // Appointments
  app.get("/api/appointments", async (req, res) => {
    const clinicId = Number(req.query.clinicId);
    const appointments = await storage.getAppointmentsByClinic(clinicId);
    res.json(appointments);
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const appointment = insertAppointmentSchema.parse(req.body);
      const created = await storage.createAppointment(appointment);
      res.json(created);
    } catch (error) {
      res.status(400).json({ message: "Invalid appointment data" });
    }
  });

  app.patch("/api/appointments/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const appointment = await storage.updateAppointment(id, req.body);
      res.json(appointment);
    } catch (error) {
      res.status(400).json({ message: "Failed to update appointment" });
    }
  });

  // Dentist Schedule Routes
  app.get("/api/dentist-schedules/:dentistId", async (req, res) => {
    try {
      const dentistId = Number(req.params.dentistId);
      const schedules = await storage.getDentistSchedulesByDentist(dentistId);
      res.json(schedules);
    } catch (error) {
      res.status(400).json({ message: "Failed to fetch dentist schedules" });
    }
  });

  app.post("/api/dentist-schedules", async (req, res) => {
    try {
      const schedule = insertDentistScheduleSchema.parse(req.body);
      const created = await storage.createDentistSchedule(schedule);
      res.json(created);
    } catch (error) {
      res.status(400).json({ message: "Invalid schedule data" });
    }
  });

  app.patch("/api/dentist-schedules/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const schedule = await storage.updateDentistSchedule(id, req.body);
      res.json(schedule);
    } catch (error) {
      res.status(400).json({ message: "Failed to update schedule" });
    }
  });

  // Available Slots
  app.get("/api/available-slots", async (req, res) => {
    try {
      const dentistId = Number(req.query.dentistId);
      const date = new Date(req.query.date as string);
      const slots = await storage.getAvailableSlots(dentistId, date);
      res.json(slots);
    } catch (error) {
      res.status(400).json({ message: "Failed to fetch available slots" });
    }
  });

  // Waitlist Routes
  app.get("/api/waitlist", async (req, res) => {
    try {
      const clinicId = Number(req.query.clinicId);
      const entries = await storage.getWaitlistByClinic(clinicId);
      res.json(entries);
    } catch (error) {
      res.status(400).json({ message: "Failed to fetch waitlist" });
    }
  });

  app.post("/api/waitlist", async (req, res) => {
    try {
      const entry = insertWaitlistSchema.parse(req.body);
      const created = await storage.createWaitlistEntry(entry);
      res.json(created);
    } catch (error) {
      res.status(400).json({ message: "Invalid waitlist entry data" });
    }
  });

  app.patch("/api/waitlist/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const entry = await storage.updateWaitlistEntry(id, req.body);
      res.json(entry);
    } catch (error) {
      res.status(400).json({ message: "Failed to update waitlist entry" });
    }
  });

  // Patients
  app.get("/api/patients", async (req, res) => {
    const clinicId = Number(req.query.clinicId);
    const patients = await storage.getPatientsByClinic(clinicId);
    res.json(patients);
  });

  app.post("/api/patients", async (req, res) => {
    try {
      const patient = insertPatientSchema.parse(req.body);
      const created = await storage.createPatient(patient);
      res.json(created);
    } catch (error) {
      res.status(400).json({ message: "Invalid patient data" });
    }
  });

  // Treatment Records Routes
  app.get("/api/treatments/:patientId", async (req, res) => {
    try {
      const patientId = Number(req.params.patientId);
      const treatments = await storage.getTreatmentsByPatient(patientId);
      res.json(treatments);
    } catch (error) {
      res.status(400).json({ message: "Failed to fetch treatment records" });
    }
  });

  app.post("/api/treatments", async (req, res) => {
    try {
      const treatment = insertTreatmentRecordSchema.parse(req.body);
      const created = await storage.createTreatmentRecord(treatment);
      res.json(created);
    } catch (error) {
      res.status(400).json({ message: "Invalid treatment record data" });
    }
  });

  // File Upload Route
  app.post("/api/upload", async (req, res) => {
    try {
      if (!req.files || !req.files.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const file = req.files.file;
      const patientId = Number(req.body.patientId);

      // In a real app, this would upload to cloud storage
      // For now, we'll just return a mock URL
      const fileUrl = `/uploads/${file.name}`;

      res.json({
        url: fileUrl,
        name: file.name,
        type: file.mimetype,
        size: file.size
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  return createServer(app);
}