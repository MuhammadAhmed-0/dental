import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { AppointmentForm } from "@/components/appointment-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, User, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const statusColors = {
  scheduled: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-green-100 text-green-800"
};

// Mock data for dentists - replace with API call later
const mockDentists = [
  { id: 1, name: "Dr. Smith" },
  { id: 2, name: "Dr. Johnson" },
  { id: 3, name: "Dr. Williams" }
];

export default function Appointments() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["/api/appointments"],
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/appointments", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setIsCreateOpen(false);
      toast({
        title: "Success",
        description: "Appointment created successfully",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create appointment",
      });
    },
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PATCH", `/api/appointments/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Success",
        description: "Appointment updated successfully",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update appointment",
      });
    },
  });

  const handleCancelAppointment = (id: number) => {
    updateAppointmentMutation.mutate({
      id,
      data: { status: "cancelled" }
    });
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Appointments</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <DialogHeader className="mb-4">
              <DialogTitle>Create New Appointment</DialogTitle>
            </DialogHeader>
            <AppointmentForm
              onSubmit={(data) => createAppointmentMutation.mutate(data)}
              availableDentists={mockDentists}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-1/3 mb-4" />
                <Skeleton className="h-4 w-1/4 mb-2" />
                <Skeleton className="h-4 w-1/5" />
              </CardContent>
            </Card>
          ))
        ) : appointments?.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No appointments found
            </CardContent>
          </Card>
        ) : (
          appointments?.map((appointment: any) => (
            <Card key={appointment.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">
                      Patient #{appointment.patientId} • Dr. {mockDentists.find(d => d.id === appointment.dentistId)?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[appointment.status as keyof typeof statusColors]}>
                      {appointment.status}
                    </Badge>
                    {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to cancel this appointment? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>No, keep it</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleCancelAppointment(appointment.id)}>
                              Yes, cancel it
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(appointment.startTime), 'PPP')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    {format(new Date(appointment.startTime), 'p')} - {format(new Date(appointment.endTime), 'p')}
                  </span>
                </div>
                {appointment.notes && (
                  <p className="mt-4 text-sm text-muted-foreground">{appointment.notes}</p>
                )}
                {appointment.isEmergency && (
                  <Badge variant="destructive" className="mt-4">Emergency</Badge>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}