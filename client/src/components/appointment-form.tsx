import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "./calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { addHours, format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { User, Phone } from "lucide-react";

const appointmentSchema = z.object({
  patientId: z.number({
    required_error: "Please select a patient"
  }),
  dentistId: z.number({
    required_error: "Please select a dentist"
  }),
  clinicId: z.number(),
  startTime: z.date({
    required_error: "Please select appointment time"
  }),
  duration: z.number().min(30).max(180), // Duration in minutes
  status: z.enum(["scheduled", "confirmed", "cancelled", "completed"]),
  notes: z.string().optional(),
  isEmergency: z.boolean().default(false)
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface AppointmentFormProps {
  onSubmit: (data: AppointmentFormData) => void;
  defaultValues?: Partial<AppointmentFormData>;
  availableDentists: Array<{ id: number; name: string }>;
}

export function AppointmentForm({ onSubmit, defaultValues, availableDentists }: AppointmentFormProps) {
  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      status: "scheduled",
      duration: 60,
      isEmergency: false,
      clinicId: 1, // TODO: Get from context
      ...defaultValues
    }
  });

  // Fetch patients list
  const { data: patients } = useQuery({
    queryKey: ["/api/patients"],
  });

  // Get selected patient's details
  const selectedPatientId = form.watch("patientId");
  const selectedPatient = patients?.find((p: any) => p.id === selectedPatientId);

  const handleSubmit = (data: AppointmentFormData) => {
    // Calculate end time based on duration
    const endTime = addHours(data.startTime, data.duration / 60);
    onSubmit({
      ...data,
      endTime
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="patientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Patient</FormLabel>
              <Select onValueChange={(value) => field.onChange(Number(value))}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {patients?.map((patient: any) => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>
                      {patient.firstName} {patient.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Show selected patient's details */}
        {selectedPatient && (
          <Card className="bg-muted">
            <CardContent className="p-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{selectedPatient.phoneNumber}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <FormField
          control={form.control}
          name="startTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Appointment Date & Time</FormLabel>
              <FormControl>
                <Calendar 
                  date={field.value} 
                  onSelect={field.onChange}
                  showTimePicker
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (minutes)</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(parseInt(value))}
                defaultValue={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dentistId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dentist</FormLabel>
              <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select dentist" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableDentists.map((dentist) => (
                    <SelectItem key={dentist.id} value={dentist.id.toString()}>
                      {dentist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Add any special notes or requirements" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isEmergency"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="accent-primary"
                />
              </FormControl>
              <FormLabel className="font-normal">This is an emergency appointment</FormLabel>
            </FormItem>
          )}
        />

        <Button type="submit">Save Appointment</Button>
      </form>
    </Form>
  );
}