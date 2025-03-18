import { sendEmail } from './email';
import { format } from 'date-fns';
import type { Appointment } from '@shared/schema';

export type ReminderType = 'appointment_scheduled' | 'appointment_reminder' | 'appointment_cancelled' | 'follow_up';

const reminderTemplates = {
  appointment_scheduled: (appointment: Appointment) => ({
    subject: 'Appointment Confirmation',
    content: `Your appointment has been scheduled for ${format(new Date(appointment.startTime), 'PPP')} at ${format(new Date(appointment.startTime), 'p')}.`
  }),
  appointment_reminder: (appointment: Appointment) => ({
    subject: 'Appointment Reminder',
    content: `This is a reminder for your upcoming appointment on ${format(new Date(appointment.startTime), 'PPP')} at ${format(new Date(appointment.startTime), 'p')}.`
  }),
  appointment_cancelled: (appointment: Appointment) => ({
    subject: 'Appointment Cancellation',
    content: `Your appointment scheduled for ${format(new Date(appointment.startTime), 'PPP')} has been cancelled.`
  }),
  follow_up: (appointment: Appointment) => ({
    subject: 'Follow-up Care',
    content: `Thank you for your recent visit. Please let us know if you have any questions about your treatment.`
  })
};

export async function sendReminder(
  email: string,
  type: ReminderType,
  appointment: Appointment
) {
  const template = reminderTemplates[type](appointment);
  return sendEmail(email, template.subject, template.content);
}

export async function scheduleReminder(
  email: string,
  type: ReminderType,
  appointment: Appointment,
  sendAt: Date
) {
  // For now, we'll just send immediately
  // In production, this would use a job queue
  return sendReminder(email, type, appointment);
}
